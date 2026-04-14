<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'client_id', 
        'product_id', // <--- AGREGA ESTO (Faltaba en tu código)
        'amount', 
        'months', 
        'payment_date'
    ];

    // Esto obliga a Laravel a tratar el campo como fecha de Carbon
    protected $casts = [
        'payment_date' => 'datetime',
    ];

    public function client(): BelongsTo {
        return $this->belongsTo(Client::class);
    }

    public function product(): BelongsTo {
        return $this->belongsTo(Product::class);
    }
}