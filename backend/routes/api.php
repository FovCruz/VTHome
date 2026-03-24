<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;  
use App\Http\Controllers\ConfigController;

// Listar y Crear clientes
Route::get('/clients', [ClientController::class, 'index']);
Route::post('/clients', [ClientController::class, 'store']);
Route::put('/clients/renew/{id}', [ClientController::class, 'renew']); // Renovar suscripción (pago)
Route::put('/clients/{id}', [ClientController::class, 'update']); // Editar detalles del cliente (MAC, notas, etc.)
Route::delete('/clients/{id}', [ClientController::class, 'destroy']);  // Eliminar un cliente

// Rutas de Configuración
Route::post('/config/reset-client/{id}', [ConfigController::class, 'resetClient']);
Route::post('/config/reset-all-clients', [ConfigController::class, 'resetAllClients']);
Route::post('/config/reset-inventory', [ConfigController::class, 'resetInventory']); 
Route::post('/config/nuclear', [ConfigController::class, 'nuclearReset']);


Route::get('/payments-history', [ClientController::class, 'paymentsHistory']);
Route::get('/dashboard-stats', [DashboardController::class, 'getStats']);

// Rutas de Inventario
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
