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
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            
            // 🏷️ كود الخصم الفريد (مؤمن ومحمي بـ Index للبحث السريع)
            $table->string('code')->unique(); 
            
            // ⚙️ نوع الخصم: إما نسبة مئوية (%) أو قيمة مالية ثابتة (EGP)
            $table->enum('type', ['percentage', 'fixed']); 
            
            // 💰 قيمة الخصم نفسه
            $table->decimal('value', 8, 2); 
            
            // 🛒 الحد الأدنى لقيمة السلة عشان الكود يشتغل (مثلاً: لازم يشتري بـ 1500 ج عشان ياخد الخصم)
            $table->decimal('min_order_amount', 8, 2)->default(0.00); 
            
            // 🛑 الحد الأقصى لقيمة الخصم (مهم جداً لو النوع Percentage عشان تحمي البزنس لو العميل اشترى بمبلغ ضخم)
            $table->decimal('max_discount_amount', 8, 2)->nullable(); 
            
            // 👥 ليميت الاستخدام الإجمالي للكود (مثال: أول 100 مستخدم فقط)
            $table->integer('usage_limit')->nullable(); 
            
            // 👤 ليميت الاستخدام لكل عميل منفرد (عشان العميل ميفضلش يضرب نفس الكود كذا مرة)
            $table->integer('user_usage_limit')->default(1); 
            
            // 📈 عداد بيحسب كم مرة الكود استخدم فعلياً في أوردرات ناجحة
            $table->integer('used_count')->default(0); 
            
            // ⏳ تاريخ ووقت انتهاء صلاحية الكود أوتوماتيكياً
            $table->timestamp('expires_at')->nullable(); 
            
            // 🟢 مفتاح تحكم يدوي (Active/Inactive) عشان لو عايز تقفل الكود فوراً من الداش بورد لأي سبب
            $table->boolean('is_active')->default(true); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promo_codes');
    }
};