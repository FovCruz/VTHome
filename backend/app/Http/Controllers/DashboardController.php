<?php

namespace App\Http\Controllers; 
use App\Models\Client;
use App\Models\Payment;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            // Capturamos el mes del request o usamos el actual
            $month = $request->query('month', Carbon::now()->month);
            $year = Carbon::now()->year;

            // Definimos el rango del mes seleccionado
            $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();

            // 1. Ingresos del mes seleccionado
            $income = (int) Payment::whereBetween('payment_date', [$startDate, $endDate])->sum('amount');

            // 2. Ingresos del mes anterior para la tendencia
            $lastMonthStart = $startDate->copy()->subMonth();
            $lastMonthEnd = $lastMonthStart->copy()->endOfMonth();
            $prevIncome = (int) Payment::whereBetween('payment_date', [$lastMonthStart, $lastMonthEnd])->sum('amount');
            
            $trend = 'equal';
            if ($income > $prevIncome) $trend = 'up';
            elseif ($income < $prevIncome) $trend = 'down';

            // 3. Clientes Activos y Vencidos (Estado Actual)
            $activeCount = Client::where('due_date', '>=', Carbon::now())->count();
            $expiredCount = Client::where('due_date', '<', Carbon::now())->count();

            // 4. Clientes que vencen en 3 días o menos (Alertas)
            $urgentes = Client::whereBetween('due_date', [Carbon::now(), Carbon::now()->addDays(3)])
                              ->orderBy('due_date', 'asc')
                              ->get();

            // 5. Datos para el gráfico (Días completos del mes)
            $daysInMonth = $startDate->daysInMonth;
            $salesData = Payment::whereBetween('payment_date', [$startDate, $endDate])
                ->select(DB::raw('DATE(payment_date) as date'), DB::raw('SUM(amount) as total'))
                ->groupBy('date')
                ->get()
                ->pluck('total', 'date'); // Convertimos a [ '2026-03-22' => 5000 ]

            $dailySales = [];

            for ($i = 1; $i <= $daysInMonth; $i++) {
                $currentDate = $startDate->copy()->addDays($i - 1)->format('Y-m-d');
                $label = $startDate->copy()->addDays($i - 1)->format('d/m');
                
                $dailySales[] = [
                    'date' => $label,
                    'total' => $salesData->get($currentDate, 0) // Si no hay venta, ponemos 0
                ];
            }

            return response()->json([
                'income' => $income,
                'trend' => $trend,
                'clients' => ['active' => $activeCount, 'expired' => $expiredCount],
                'urgentes' => $urgentes,
                'dailySales' => $dailySales,
                'inventory' => 0 
            ]);

        } catch (\Exception $e) {
            // Esto nos dirá el error real en la consola de red del navegador
            return response()->json([
                'error' => 'Error interno en el servidor',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}