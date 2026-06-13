<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('text'); // نص الإعلان المكتوب
            $table->boolean('is_active')->default(true); // تحديد الإعلان النشط حالياً
            $table->string('background_color')->default('#000000'); // اللون الافتراضي أسود فخم
            $table->string('text_color')->default('#ffffff'); // لون النص الافتراضي أبيض
            $table->integer('priority')->default(0); // أو الترتيب اللي تحبه
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};