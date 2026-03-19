<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;

Route::get('/clients', [ClientController::class, 'index']);
Route::post('/clients/{id}/renew', [ClientController::class, 'renew']);
Route::post('/clients', [ClientController::class, 'store']);