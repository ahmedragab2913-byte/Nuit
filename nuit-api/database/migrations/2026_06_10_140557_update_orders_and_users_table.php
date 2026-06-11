<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Update users table: add phone column
        if (!Schema::hasColumn('users', 'phone')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('phone')->nullable()->after('email');
            });
        }

        // 2. Update orders table
        Schema::table('orders', function (Blueprint $table) {
            // Add user_id referencing users table
            $table->foreignId('user_id')->nullable()->after('customer_id')->constrained()->nullOnDelete();
            
            // Add order_number column
            $table->string('order_number')->nullable()->change(); // set it nullable on change or add
            // Let's add columns safely
            $table->string('payment_method')->default('cash_on_delivery')->after('total');
            $table->string('payment_status')->default('pending')->after('payment_method');
            
            // Financial breakdown
            $table->decimal('subtotal', 10, 2)->default(0.00)->after('total');
            $table->decimal('shipping_cost', 10, 2)->default(0.00)->after('subtotal');
            $table->decimal('discount_amount', 10, 2)->default(0.00)->after('shipping_cost');
            $table->decimal('grand_total', 10, 2)->default(0.00)->after('discount_amount');
            
            // Shipping Address snapshot
            $table->json('shipping_address')->nullable()->after('items');
        });

        // Let's update order status column enum values. We can change the column type to string or enum.
        // Changing enum is database driver dependent; using string is safer and fully supports our status values.
        Schema::table('orders', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('phone');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn([
                'payment_method',
                'payment_status',
                'subtotal',
                'shipping_cost',
                'discount_amount',
                'grand_total',
                'shipping_address'
            ]);
        });
    }
};
