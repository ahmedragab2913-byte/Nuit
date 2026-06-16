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
    Schema::create('shipping_rates', function (Blueprint $table) {
        $table->id();
        $table->string('city_name')->unique(); // اسم المحافظة/المدينة (ومعمول فريد منعاً للتكرار)
        $table->decimal('rate', 8, 2);        // سعر الشحن (بيشيل أرقام عشرية بدقة عالية)
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_rates');
    }
};
