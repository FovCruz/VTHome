<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');              // CLIENTE
            $table->string('username');          // USUARIO
            $table->string('password_acc');      // PASS
            $table->integer('screens')->default(1); // PANTALLAS
            $table->string('platform');          // PLATAFORMA
            $table->string('mac')->nullable();   // MAC
            $table->string('key')->nullable();   // KEY
            
            // Datos financieros
            $table->integer('income')->default(0); // INGRESO
            $table->integer('cost')->default(0);   // COSTO
            $table->integer('profit')->default(0); // GANADO
            
            // Fechas de control (Lógica de negocio)
            $table->date('payment_date')->nullable(); // Fecha Pago
            $table->date('due_date')->nullable();         // Fecha Término (Vencimiento)
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
