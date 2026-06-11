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

    // Public Auth routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin/login', [AuthController::class, 'adminLogin']);
    Route::post('/register', [AuthController::class, 'register']);

    // Public Storefront routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
    Route::get('/announcements', [AnnouncementController::class, 'active']);

    // Protected routes for Registered Users (Customers & Admins)
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

        // Client Cart Management (DB Persistence)
        Route::get('/cart', [CartController::class, 'getCart']);
        Route::post('/cart/sync', [CartController::class, 'syncCart']);
        Route::post('/cart/add', [CartController::class, 'addToCart']);
        Route::post('/cart/update-qty', [CartController::class, 'updateQty']);
        Route::delete('/cart/remove/{productId}', [CartController::class, 'removeFromCart']);

        // Client Checkout and Order History
        Route::post('/checkout', [OrderController::class, 'store']);
        Route::get('/my-orders', [OrderController::class, 'myOrders']);
    });

    // Protected admin routes (Requires Sanctum auth & Admin role)
    Route::middleware(['auth:sanctum', 'is_admin'])->group(function () {
        // Dashboard Stats
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

        // Product modifications & Admin operations
        Route::post('/products', [ProductController::class, 'store']);
        Route::get('/products/categories', function () {
    return response()->json(
        \App\Models\Product::distinct()
            ->pluck('category')
            ->filter()
            ->values()
    );
});
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::post('/products/import', [ProductController::class, 'import']);
        Route::get('/products/export', [ProductController::class, 'export']);
        Route::get('/products/template', [ProductController::class, 'template']);
        Route::get('/products/{product}', [ProductController::class, 'show']);
        
    });

});
