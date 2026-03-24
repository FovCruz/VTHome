<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Payment;
use App\Models\Product; // Importante para el inventario
use Illuminate\Http\Request;
use Carbon\Carbon;

class ClientController extends Controller
{
    public function index()
    {
        return Client::orderBy('due_date', 'asc')->get();
    }

    public function store(Request $request)
    {
        // Validar Stock antes de crear
        if ($request->filled('product_id')) {
            $product = Product::find($request->product_id);
            if (!$product || $product->stock <= 0) {
                return response()->json(['error' => 'No hay stock disponible para ' . ($product->name ?? 'este producto')], 422);
            }
        }

        $client = new Client($request->all());
        $paymentDate = Carbon::parse($request->input('payment_date', now()));
        $client->payment_date = $paymentDate;
        $client->due_date = $paymentDate->copy()->addMonths($request->input('months', 1));
        $client->save();

        if ($request->filled('product_id')) {
            $product->decrement('stock');
            if ($product->stock <= 0) $product->update(['status' => 'Agotado']);
        }

        return response()->json($client, 201);
    }

    public function renew(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        $productId = $request->input('product_id');
        
        // VALIDACIÓN DE STOCK
        if ($productId) {
            $product = Product::find($productId);
            if (!$product || $product->stock <= 0) {
                return response()->json(['error' => 'Stock insuficiente para renovar'], 422);
            }
            $product->decrement('stock');
            if ($product->stock <= 0) $product->update(['status' => 'Agotado']);
        }

        $months = $request->input('months', 1);
        $startDate = ($client->due_date && $client->due_date > now()) ? Carbon::parse($client->due_date) : now();

        $client->due_date = $startDate->addMonths($months);
        $client->payment_date = now();
        $client->income += $request->input('amount');
        $client->save();

        Payment::create([
            'client_id' => $client->id,
            'amount' => $request->input('amount'),
            'months' => $months,
            'payment_date' => now(),
        ]);

        return response()->json(['message' => 'Renovado con éxito']);
    }

    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        
        // LÓGICA DE REVERSIÓN DE STOCK SI CAMBIA EL PRODUCTO O SI SE EDITA
        // Si el usuario cambia la plataforma/producto manualmente en la edición
        if ($request->filled('product_id') && $request->product_id != $client->product_id) {
            // 1. Devolver el stock del producto anterior (si existía)
            if ($client->product_id) {
                $oldProduct = Product::find($client->product_id);
                if ($oldProduct) $oldProduct->increment('stock');
            }
            
            // 2. Restar stock del nuevo producto
            $newProduct = Product::find($request->product_id);
            if ($newProduct && $newProduct->stock > 0) {
                $newProduct->decrement('stock');
            } else {
                return response()->json(['error' => 'No hay stock para el nuevo producto seleccionado'], 422);
            }
        }

        $client->update($request->all());
        return response()->json($client);
    }

    public function destroy($id)
    {
        Client::destroy($id);
        return response()->json(['message' => 'Eliminado']);
    }

    public function paymentsHistory()
    {
        return Payment::with('client:id,name')->orderBy('payment_date', 'desc')->get();
    }
}