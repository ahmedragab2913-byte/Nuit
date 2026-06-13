<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function getCart(Request $request): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        
        $items = CartItem::where('cart_id', $cart->id)
            ->with('product')
            ->get()
            ->map(fn($item) => [
                'id'       => $item->id,
                'quantity' => $item->quantity,
                'product'  => $item->product,
            ]);

        return response()->json([
            'status' => 'success',
            'data'   => $items,
        ]);
    }

    public function syncCart(Request $request): JsonResponse
    {
        // 1. غلق ثغرة المصفوفة المفرودة لو مبعوتة مباشرة
        if ($request->isJson() && ! $request->has('items') && is_array($request->json()->all())) {
            $request->merge(['items' => $request->json()->all()]);
        } elseif (! $request->has('items') && is_array($request->all())) {
            $request->merge(['items' => $request->all()]);
        }

        // 2. تعديل الـ Validation: الـ items مسموح تكون مصفوفة فاضية (sometimes)
        $request->validate([
            'items'              => 'present|array', 
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity'   => 'required_with:items|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        // 3. مسح العناصر الحالية دائماً لتحديث الحالة
        CartItem::where('cart_id', $cart->id)->delete();

        // 4. حفظ العناصر الجديدة فقط لو الـ array مش فاضية
        $items = $request->input('items', []);
        if (!empty($items)) {
            foreach ($items as $item) {
                CartItem::create([
                    'cart_id'    => $cart->id,
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                ]);
            }
        }

        // 5. إرجاع السلة المحدثة (حتى لو فاضية) بـ status 200 نجاح
        return $this->getCart($request);
    }

    public function addToCart(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $data['product_id'])
            ->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $data['quantity']);
        } else {
            CartItem::create([
                'cart_id'    => $cart->id,
                'product_id' => $data['product_id'],
                'quantity'   => $data['quantity'],
            ]);
        }

        return $this->getCart($request);
    }

    public function updateQty(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:0',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $data['product_id'])
            ->first();

        if ($cartItem) {
            if ($data['quantity'] <= 0) {
                $cartItem->delete();
            } else {
                $cartItem->update(['quantity' => $data['quantity']]);
            }
        }

        return $this->getCart($request);
    }

    public function removeFromCart(Request $request, $productId): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        CartItem::where('cart_id', $cart->id)->where('product_id', $productId)->delete();

        return $this->getCart($request);
    }
}
