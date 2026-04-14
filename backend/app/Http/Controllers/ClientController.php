<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ClientController extends Controller
{
    public function index()
    {
        // MEJORA DE RENDIMIENTO: Cargamos la relación del producto de una vez (Eager Loading)
        // Esto evita que el sistema se ponga lento al listar muchos clientes.
        return Client::with('product')->orderBy('due_date', 'asc')->get();
    }

    public function store(Request $request)
    {
        // 1. VALIDACIÓN DE STOCK
        if ($request->filled('product_id')) {
            $product = Product::find($request->product_id);
            if (!$product || $product->stock <= 0) {
                return response()->json(['error' => 'No hay stock disponible'], 422);
            }
        }

        // 2. LÓGICA DE FECHAS
        $paymentDate = Carbon::parse($request->input('payment_date', Carbon::now()));
        $months = (int)$request->input('months', 1);

        // 3. CREACIÓN DEL CLIENTE
        $client = new Client($request->all());
        $client->payment_date = $paymentDate;
        $client->due_date = $paymentDate->copy()->addMonths($months);
        $client->save();

        // 4. REGISTRO DEL PAGO (Sincronización Corregida)
        Payment::create([
            'client_id'  => $client->id,
            'product_id' => $request->product_id,
            // AQUÍ ESTÁ EL CAMBIO: Buscamos 'income' que es lo que manda el front
            'amount'     => $request->input('income', $request->input('amount', 0)), 
            'months'     => $months,
            'payment_date' => $paymentDate,
        ]);

        // 5. ACTUALIZACIÓN DE STOCK
        if (isset($product)) {
            $product->decrement('stock');
        }

        return response()->json($client, 201);
    }

    public function renew(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        $productId = $request->input('product_id');
        
        if ($productId) {
            $product = Product::find($productId);
            if (!$product || $product->stock <= 0) {
                return response()->json(['error' => 'Stock insuficiente para renovar'], 422);
            }
            $product->decrement('stock');
            if ($product->stock <= 0) $product->update(['status' => 'Agotado']);
        }

        $months = $request->input('months', 1);
        
        // Si el cliente aún no vence, sumamos meses a su fecha de vencimiento actual.
        // Si ya venció, empezamos a contar desde la fecha de hoy.
        $startDate = ($client->due_date && $client->due_date > now()) 
            ? Carbon::parse($client->due_date) 
            : Carbon::now();

        $client->due_date = $startDate->addMonths($months);
        $client->payment_date = Carbon::now(); // Fecha del último pago (Hoy)
        $client->income += $request->input('amount');
        $client->save();

        // Registro del historial de pago
        Payment::create([
            'client_id' => $client->id,
            'product_id' => $productId,
            'amount' => $request->input('amount'),
            'months' => $months,
            'payment_date' => Carbon::now(), // Renovación ocurre en tiempo real
        ]);

        return response()->json(['message' => 'Renovado con éxito']);
    }

    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        
        // Si cambias el producto en la edición, devolvemos stock al viejo y quitamos al nuevo.
        if ($request->filled('product_id') && $request->product_id != $client->product_id) {
            if ($client->product_id) {
                $oldProduct = Product::find($client->product_id);
                if ($oldProduct) $oldProduct->increment('stock');
            }
            
            $newProduct = Product::find($request->product_id);
            if ($newProduct && $newProduct->stock > 0) {
                $newProduct->decrement('stock');
            } else {
                return response()->json(['error' => 'No hay stock para el nuevo producto'], 422);
            }
        }

        $client->update($request->all());

        // OPCIONAL: Si editas la fecha de alta del cliente, 
        // podrías querer que el primer pago también se mueva.
        if ($request->has('payment_date')) {
            $firstPayment = Payment::where('client_id', $client->id)->orderBy('created_at', 'asc')->first();
            if ($firstPayment) {
                $firstPayment->update(['payment_date' => $request->payment_date]);
            }
        }

        return response()->json($client);
    }

    public function destroy($id)
    {
        Client::destroy($id);
        return response()->json(['message' => 'Eliminado']);
    }

    public function paymentsHistory()
    {
        // Cargamos client y product para que el Dashboard sepa qué producto se vendió y su costo.
        return Payment::with(['client:id,name', 'product:id,name,cost'])
            ->orderBy('payment_date', 'desc')
            ->get();
    }
}