<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ConfigController extends Controller
{
    // 1. Resetear un cliente específico (Devuelve stock y borra historial)
    public function resetClient($id)
    {
        $client = Client::findOrFail($id);
        
        // DEVOLVER STOCK AL INVENTARIO ANTES DE RESETEAR
        if ($client->product_id) {
            $product = Product::find($client->product_id);
            if ($product) {
                $product->increment('stock');
                $product->update(['status' => 'Disponible']); // Por si estaba agotado
            }
        }

        // Eliminamos sus pagos asociados
        Payment::where('client_id', $id)->delete();
        
        // Devolvemos el cliente a estado inicial
        $client->update([
            'due_date' => null,
            'payment_date' => null,
            'income' => 0,
            'product_id' => null,
            'platform' => 'Sin Servicio',
            'notes' => null
        ]);
        
        return response()->json(['message' => "Registro de cliente actualizado correctamente."]);
    }

    // 2. Resetear TODOS los clientes
    public function resetAllClients()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0;');
        Payment::truncate(); 
        Client::truncate();  
        DB::statement('SET FOREIGN_KEY_CHECKS = 1;');
        
        return response()->json(['message' => 'Todos los clientes y pagos han sido eliminados']);
    }

    // 3. NUEVO: Resetear Inventario
    public function resetInventory()
    {
        // Primero, desenlazamos los productos de los clientes para no romper la app
        Client::query()->update(['product_id' => null, 'platform' => 'Sin Servicio (Inventario Borrado)']);
        
        DB::statement('SET FOREIGN_KEY_CHECKS = 0;');
        Product::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS = 1;');

        return response()->json(['message' => 'El inventario ha sido vaciado completamente.']);
    }

    // 4. NUCLEAR: ELIMINAR TODO
    public function nuclearReset(Request $request)
    {
        // Validación estricta de mayúsculas
        if ($request->confirm_text !== 'ELIMINAR TODO') {
            return response()->json(['error' => 'Texto de confirmación incorrecto'], 422);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS = 0;');
        Payment::truncate();
        Client::truncate();
        Product::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS = 1;');

        return response()->json(['message' => 'La base de datos ha sido vaciada por completo']);
    }

    //calculador para graficas en el dashboard
 /*    public function getDashboardStats(Request $request) {
        $month = $request->query('month', date('n'));
        $year = date('Y');

        // 1. Obtener pagos del mes seleccionado con sus productos
        $payments = \App\Models\Payment::with('product', 'client')
                    ->whereMonth('payment_date', $month)
                    ->whereYear('payment_date', $year)
                    ->get();

        // 2. Calcular Totales
        $totalCash = $payments->sum('amount');
        $realProfit = $payments->reduce(function ($carry, $payment) {
            $cost = $payment->product ? $payment->product->cost : 0;
            return $carry + ($payment->amount - $cost);
        }, 0);

        // 3. Stock Crítico (Solo productos con stock <= 5)
        $lowStock = \App\Models\Product::where('stock', '<=', 5)
                    ->select('name', 'stock')
                    ->get();

        // 4. Datos para Gráfico de Líneas (Ventas diarias)
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $lineData = [];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $dayTotal = $payments->filter(fn($p) => date('j', strtotime($p->payment_date)) == $i)->sum('amount');
            $lineData[] = ['day' => $i, 'total' => $dayTotal];
        }

        // 5. Histórico 6 Meses
        $barData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthTotal = \App\Models\Payment::whereMonth('payment_date', $date->month)
                        ->whereYear('payment_date', $date->year)
                        ->sum('amount');
            $barData[] = ['name' => $date->format('M'), 'total' => $monthTotal];
        }

        return response()->json([
            'totalCash' => $totalCash,
            'realProfit' => $realProfit,
            'lowStock' => $lowStock,
            'lineData' => $lineData,
            'barData' => $barData,
            'pieData' => $payments->groupBy('product.name')->map(fn($group, $key) => [
                'name' => $key ?: 'Otros',
                'value' => $group->count()
            ])->values()
        ]);
    } */
}