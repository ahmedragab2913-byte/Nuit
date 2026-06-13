<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\CartController;

Route::prefix('v1')->group(function () {

    // --- 1. Public Auth Routes ---
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin/login', [AuthController::class, 'adminLogin']);
    Route::post('/register', [AuthController::class, 'register']);

    // --- 2. Public Storefront Routes (متاحة للجميع - بدون قيود) ---
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
    Route::get('/products/best-sellers', [ProductController::class, 'getBestSellers']);
    
    // تم نقل الفئات وتفاصيل المنتج لهنا عشان تظهر للعميل العادي
    Route::get('/products/categories', function () {
        return response()->json(
            \App\Models\Product::distinct()->pluck('category')->filter()->values()
        );
    });
    Route::get('/products/{product}', [ProductController::class, 'show']);
    
    Route::get('/announcements', [AnnouncementController::class, 'active']);

    // --- 3. Protected Routes (Registered Users: Customers) ---
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);

        // Client Address Management
        Route::get('/addresses', [AddressController::class, 'index']);
        Route::post('/addresses', [AddressController::class, 'store']);
        Route::put('/addresses/{address}', [AddressController::class, 'update']);
        Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
        Route::patch('/addresses/{address}/default', [AddressController::class, 'setDefault']);

        // Client Cart Management
        Route::get('/cart', [CartController::class, 'getCart']);
        Route::post('/cart/sync', [CartController::class, 'syncCart']);
        Route::post('/cart/add', [CartController::class, 'addToCart']);
        Route::post('/cart/update-qty', [CartController::class, 'updateQty']);
        Route::delete('/cart/remove/{productId}', [CartController::class, 'removeFromCart']);

        // Client Checkout and Order History
        Route::post('/checkout', [OrderController::class, 'store']);
        Route::get('/my-orders', [OrderController::class, 'myOrders']);
    });

    // --- 4. Protected Admin Routes (Requires Sanctum auth & Admin role) ---
    Route::middleware(['auth:sanctum', 'is_admin'])->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // Orders Management
        Route::apiResource('orders', OrderController::class);
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);

        // Customers Management
        Route::apiResource('customers', CustomerController::class);

        // Announcements Management
        Route::get('/announcements/all', [AnnouncementController::class, 'index']);
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
        Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);

        // Admin Product Operations
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::post('/products/import', [ProductController::class, 'import']);
        Route::get('/products/export', [ProductController::class, 'export']);
        Route::get('/products/template', [ProductController::class, 'template']);
    });

});