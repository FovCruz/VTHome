<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // Importante para la relación

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
        'payment_date',
        'income',
        'mac_address',
        'mac_key',
        'notes'
    ];

    protected $casts = [
        'due_date' => 'date',
        'payment_date' => 'date',
    ];

    /**
     * Relación: Un cliente tiene muchos pagos registrados.
     * Esto permite que en el Historial de Pagos podamos ver a quién pertenece cada monto.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}