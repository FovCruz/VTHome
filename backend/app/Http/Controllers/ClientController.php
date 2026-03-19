<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ClientController extends Controller
{
    // Listar todos los clientes (Para tu Dashboard)
    public function index()
    {
        return Client::all();
    }

    // Registrar un pago y calcular nueva fecha
    public function renew(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        
        // Obtenemos los meses del plan (ej: 1, 3, 6, 12)
        $months = $request->input('months');
        $amount = $request->input('amount');

        // LÓGICA: Si la cuenta ya venció, empezamos a contar desde HOY.
        // Si aún tiene días, sumamos los meses a su fecha de término actual.
        $startDate = ($client->due_date && $client->due_date > now()) 
            ? Carbon::parse($client->due_date) 
            : now();

        $client->due_date = $startDate->addMonths($months);
        $client->payment_date = now(); // Registramos que pagó hoy
        $client->income += $amount;    // Acumulamos el ingreso
        
        $client->save();

        return response()->json([
            'message' => 'Suscripción renovada con éxito',
            'new_due_date' => $client->due_date->format('Y-m-d')
        ]);
    }

    //guardar un cliente nuevo.
    public function store(Request $request)
        {
            $validated = $request->validate([
                'name' => 'required|string',
                'username' => 'required|string|unique:clients',
                'password_acc' => 'required|string',
                'screens' => 'required|integer',
                'platform' => 'required|string',
                'months' => 'required|integer',
                'income' => 'required|integer', // <-- Agregamos esto
            ]);

            $client = new Client($validated);
            
            $client->payment_date = now();
            $client->due_date = now()->addMonths($request->input('months'));
            $client->income = $request->input('income'); // <-- Guardamos el primer pago
            
            $client->save();

            return response()->json($client, 201);
        }
}