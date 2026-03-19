<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Client;      // <--- IMPORTANTE: Esto le dice dónde está el modelo
use Carbon\Carbon;          // <--- IMPORTANTE: Esto le dice qué es Carbon (fechas)

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Client::create([
            'name' => 'Juan Carlos Solar',
            'username' => 'JSOLAR',
            'password_acc' => 'VIRTUAL123',
            'screens' => 2,
            'platform' => 'Duplex',
            'mac' => '14:87:91:20:47:59',
            'key' => '16863',
            'payment_date' => Carbon::parse('2026-05-18'),
            'due_date' => Carbon::parse('2026-06-18'),
        ]);

        Client::create([
            'name' => 'Christopher Andaur',
            'username' => '8886657123',
            'password_acc' => '4082899750',
            'screens' => 0,
            'platform' => 'Duplex',
            'mac' => '15:70:40:83:89:ff',
            'due_date' => Carbon::parse('2026-03-05'),
        ]);
    }
}
