<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB; // IMPORTANTE: Para que no de Error 500

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            $month = $request->query('month', Carbon::now()->month);
            $year = Carbon::now()->year;
            $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();

            // 1. Obtener pagos con relación al producto
            // Asegúrate que en tu modelo Payment exista: public function product() { return $this->belongsTo(Product::class); }
            $payments = Payment::with('product')
                ->whereBetween('payment_date', [$startDate, $endDate])
                ->get();

            $totalCash = (int) $payments->sum('amount');

            // 2. Ingreso Real (Venta - Costo)
            $realProfit = $payments->reduce(function ($carry, $payment) {
                $cost = ($payment->product) ? $payment->product->cost : 0;
                return $carry + ($payment->amount - $cost);
            }, 0);

            // 3. STOCK BAJO: Aquí está la conversación real
            // Comparamos stock actual contra el min_stock de la tabla productos
            $lowStock = Product::whereColumn('stock', '<=', 'min_stock')
                ->select('name', 'stock', 'min_stock')
                ->get();

            // 4. Gráfico de Líneas (Ventas Diarias)
            $daysInMonth = $startDate->daysInMonth;
            $salesByDate = $payments->groupBy(function($p) {
                return Carbon::parse($p->payment_date)->format('Y-m-d');
            })->map->sum('amount');

            $lineData = [];
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $dateStr = $startDate->copy()->addDays($i - 1)->format('Y-m-d');
                $lineData[] = [
                    'day' => $i,
                    'total' => $salesByDate->get($dateStr, 0)
                ];
            }

            return response()->json([
                'realProfit' => (int)$realProfit,
                'totalCash' => $totalCash,
                'lowStock' => $lowStock,
                'lineData' => $lineData,
                'pieData' => $payments->groupBy('product.name')->map(fn($g, $key) => [
                    'name' => $key ?: 'Varios',
                    'value' => $g->count()
                ])->values(),
                'barData' => $this->getSixMonthHistory()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en Dashboard',
                'message' => $e->getMessage() // Esto te dirá qué falta si vuelve a dar 500
            ], 500);
        }
    }

    private function getSixMonthHistory() {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $total = Payment::whereMonth('payment_date', $date->month)
                ->whereYear('payment_date', $date->year)
                ->sum('amount');
            $data[] = [
                'name' => $date->translatedFormat('M'),
                'total' => (int)$total
            ];
        }
        return $data;
    }
}