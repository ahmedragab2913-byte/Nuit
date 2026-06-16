<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    /**
     * Display a listing of the promo codes (Admin).
     */
    public function index(): JsonResponse
    {
        $promoCodes = PromoCode::latest()->get();
        return response()->json($promoCodes);
    }

    /**
     * Store a newly created promo code in storage (Admin).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'                => 'required|string|unique:promo_codes,code',
            'type'                => 'required|in:percentage,fixed',
            'value'               => 'required|numeric|min:1',
            'min_order_amount'    => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit'         => 'nullable|integer|min:1',
            'user_usage_limit'    => 'required|integer|min:1',
            'expires_at'          => 'nullable|date',
            'is_active'           => 'boolean',
        ]);

        // Default min_order_amount to 0 if not provided
        if (!isset($validated['min_order_amount'])) {
            $validated['min_order_amount'] = 0.00;
        }

        $promoCode = PromoCode::create($validated);
        return response()->json([
            'status'  => 'success',
            'message' => 'Promo code created successfully',
            'data'    => $promoCode,
        ], 201);
    }

    /**
     * Toggle the status of the promo code (Admin).
     */
    public function toggleStatus(Request $request, PromoCode $promoCode): JsonResponse
    {
        $promoCode->update([
            'is_active' => $request->input('is_active', !$promoCode->is_active),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Status updated successfully',
            'data'    => $promoCode,
        ]);
    }

    /**
     * Remove the promo code from storage (Admin).
     */
    public function destroy(PromoCode $promoCode): JsonResponse
    {
        $promoCode->delete();
        return response()->json([
            'status'  => 'success',
            'message' => 'Promo code deleted successfully',
        ]);
    }

    /**
     * Validate a promo code and calculate discount for storefront (Client).
     */
    public function validatePromo(Request $request): JsonResponse
    {
        $request->validate([
            'code'     => 'required|string',
            'subtotal' => 'required|numeric|min:0', // bag total before shipping
        ]);

        $promo = PromoCode::where('code', $request->code)->first();

        if (!$promo || !$promo->is_active) {
            return response()->json(['message' => 'Invalid or inactive promo code.'], 422);
        }

        // 1. Expiry date check
        if ($promo->expires_at && $promo->expires_at->isPast()) {
            return response()->json(['message' => 'This promo code has expired.'], 422);
        }

        // 2. Global usage limit check
        if ($promo->usage_limit !== null && $promo->used_count >= $promo->usage_limit) {
            return response()->json(['message' => 'This promo code has reached its usage limit.'], 422);
        }

        // 3. Minimum order amount check
        if ($request->subtotal < $promo->min_order_amount) {
            return response()->json([
                'message' => "The minimum order amount for this code is EGP " . number_format($promo->min_order_amount, 2) . ".",
            ], 422);
        }

        // 4. User usage limit check (verified from orders table)
        $userId = auth()->id();
        $userUsageCount = Order::where('user_id', $userId)
            ->where('promo_code_id', $promo->id)
            ->count();

        if ($userUsageCount >= $promo->user_usage_limit) {
            return response()->json(['message' => 'You have reached the usage limit for this promo code.'], 422);
        }

        // Calculate discount amount
        $discount = 0.00;
        if ($promo->type === 'percentage') {
            $discount = ($promo->value / 100) * $request->subtotal;
            if ($promo->max_discount_amount && $discount > $promo->max_discount_amount) {
                $discount = (float) $promo->max_discount_amount;
            }
        } else {
            $discount = (float) $promo->value;
        }

        // Ensure discount doesn't exceed subtotal itself
        if ($discount > $request->subtotal) {
            $discount = (float) $request->subtotal;
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Promo code applied successfully.',
            'data'    => [
                'id'              => $promo->id,
                'code'            => $promo->code,
                'type'            => $promo->type,
                'discount_amount' => $discount,
            ],
        ]);
    }
}
