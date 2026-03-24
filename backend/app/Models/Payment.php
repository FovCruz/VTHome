<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'client_id', 
        'amount', 
        'months', 
        'payment_date'
    ];

    // ESTA FUNCIÓN ES VITAL: Es la que usa el with('client')
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}