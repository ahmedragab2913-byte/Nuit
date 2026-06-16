<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingRateController extends Controller
{
    /**
     * جلب كل المحافظات بأسعارها عشان تتعرض في جدول الداش بورد
     */
    public function index(): JsonResponse
    {
        $rates = ShippingRate::orderBy('city_name', 'asc')->get();
        return response()->json($rates, 200);
    }

    /**
     * ➕ إضافة محافظة جديدة وسعر الشحن الخاص بها
     */
    public function store(Request $request): JsonResponse
{
    // 👇 عدلنا اسم الجدول هنا لـ shipping_rates بالـ Underscore
    $data = $request->validate([
        'city_name' => 'required|string|max:255|unique:shipping_rates,city_name', 
        'rate' => 'required|numeric|min:0',
    ]);

    $shippingRate = ShippingRate::create([
        'city_name' => $data['city_name'],
        'rate' => $data['rate']
    ]);

    return response()->json($shippingRate, 201);
}

    /**
     * تحديث سعر شحن محافظة معينة من لوحة التحكم
     */
    public function update(Request $request, $id): JsonResponse
    {
        $shippingRate = ShippingRate::find($id);

        if (!$shippingRate) {
            return response()->json([
                'status' => 'error',
                'message' => 'City not found'
            ], 404);
        }

        // عمل validation للتأكد إن السعر مبعوت صح ورقم
        $data = $request->validate([
            'rate' => 'required|numeric|min:0',
        ]);

        $shippingRate->update([
            'rate' => $data['rate']
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Shipping rate for {$shippingRate->city_name} updated successfully",
            'data' => $shippingRate
        ], 200);
    }
}