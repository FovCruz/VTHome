<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            // 0. Capturamos mes y año de forma segura.
            $month = (int) $request->query('month', Carbon::now()->month);
            $year = 2026; 

            $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
            $endOfMonth = $startOfMonth->copy()->endOfMonth();

            // 1. Buscamos los pagos del mes
            $payments = Payment::with('product')
                ->whereBetween('payment_date', [
                    $startOfMonth->format('Y-m-d 00:00:00'),
                    $endOfMonth->format('Y-m-d 23:59:59')
                ])
                ->get();

            $totalCash = (int) $payments->sum('amount');

            // 2. Ingreso Real
            $realProfit = $payments->reduce(function ($carry, $payment) {
                $cost = ($payment->product) ? $payment->product->cost : 0;
                return $carry + ($payment->amount - $cost);
            }, 0);

            // 3. Stock Bajo
            $lowStock = Product::whereColumn('stock', '<=', 'min_stock')
                ->select('name', 'stock', 'min_stock')
                ->get();


            // En DashboardController.php, busca la parte del gráfico de líneas y cámbiala por esta:

            $salesByDay = $payments->groupBy(function($p) {
                // Usamos parse directo y forzamos el formato día para evitar fallos de zona horaria
                return (int) Carbon::parse($p->payment_date)->format('j'); 
            })->map(fn($group) => $group->sum('amount'));

            $daysInMonth = $startOfMonth->daysInMonth;
            $lineData = [];

            for ($i = 1; $i <= $daysInMonth; $i++) {
                $lineData[] = [
                    'day' => $i,
                    'total' => (int) ($salesByDay[$i] ?? 0) // Acceso directo al número del día
                ];
            }


            return response()->json([
                'realProfit' => $realProfit,
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
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    private function getSixMonthHistory() {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            // Aseguramos que la comparativa histórica también funcione perfectamente
            $total = Payment::whereBetween('payment_date', [
                $date->copy()->startOfMonth()->format('Y-m-d 00:00:00'),
                $date->copy()->endOfMonth()->format('Y-m-d 23:59:59')
            ])->sum('amount');
            
            $data[] = [
                'name' => $date->translatedFormat('M'),
                'total' => (int)$total
            ];
        }
        return $data;
    }
}