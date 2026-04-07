<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refuelings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->decimal('fuel_quantity', 8, 2)->comment('Količina goriva v litrih');
            $table->decimal('fuel_cost', 10, 2)->comment('Strošek goriva v EUR');
            $table->date('refueling_date');
            $table->decimal('odometer_reading', 10, 1)->comment('Stanje števca v km');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refuelings');
    }
};
