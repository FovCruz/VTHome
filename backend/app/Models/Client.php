<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'username',
        'password_acc',
        'screens',
        'platform',
        'due_date',
        'payment_date', // AGREGAR ESTO
        'income',       // AGREGAR ESTO
        'mac_address',
        'mac_key',
        'notes'
    ];

    // Esto es para que Laravel trate las fechas como objetos Carbon
    protected $casts = [
        'due_date' => 'date',
        'payment_date' => 'date',
    ];
}