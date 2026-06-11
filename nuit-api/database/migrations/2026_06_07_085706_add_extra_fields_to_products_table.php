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
    Schema::table('products', function (Blueprint $table) {
        $table->string('sku')->nullable()->unique();
        $table->string('barcode')->nullable();
        $table->string('name_ar')->nullable();
        $table->text('description_ar')->nullable();
        $table->text('short_description_en')->nullable();
        $table->text('short_description_ar')->nullable();
        $table->decimal('sale_price', 8, 2)->nullable();
        $table->decimal('cost', 8, 2)->nullable();
        $table->string('weight')->nullable();
        $table->string('weight_unit')->nullable()->default('kg');
        $table->string('categories_en')->nullable();
        $table->string('categories_ar')->nullable();
        $table->string('keywords')->nullable();
        $table->boolean('published')->default(true);
        $table->boolean('has_variants')->default(false);
        $table->json('options')->nullable();   // option1,2,3
        $table->json('images_data')->nullable(); // extra images
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            //
        });
    }
};
