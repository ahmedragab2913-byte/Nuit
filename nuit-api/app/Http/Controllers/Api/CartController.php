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
    /**
     * Shared response builder — avoids re-querying Cart::firstOrCreate
     * in every method that already holds the $cart instance.
     */
    private function buildCartResponse(Cart $cart): JsonResponse
    {
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

    public function getCart(Request $request): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        return $this->buildCartResponse($cart);
    }

    public function syncCart(Request $request): JsonResponse
    {
        // 1. Normalize flat array payloads into { items: [...] }
        if ($request->isJson() && ! $request->has('items') && is_array($request->json()->all())) {
            $request->merge(['items' => $request->json()->all()]);
        } elseif (! $request->has('items') && is_array($request->all())) {
            $request->merge(['items' => $request->all()]);
        }

        // 2. Validation
        $request->validate([
            'items'              => 'present|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity'   => 'required_with:items|integer|min:1',
        ]);

        $cart  = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $items = $request->input('items', []);

        // 3. Collect incoming product IDs for the prune step
        $incomingProductIds = collect($items)->pluck('product_id')->all();

        // 🗑️ 4. DELETE items no longer present in the client cart
        //    This is the critical fix: clearCart sends items=[] which means
        //    incomingProductIds=[] → all DB items get deleted.
        CartItem::where('cart_id', $cart->id)
            ->whereNotIn('product_id', $incomingProductIds)
            ->delete();

        // ✅ 5. Upsert remaining items
        foreach ($items as $item) {
            CartItem::updateOrCreate(
                ['cart_id' => $cart->id, 'product_id' => $item['product_id']],
                ['quantity' => $item['quantity']]
            );
        }

        // 6. Return the unified, updated cart
        return $this->buildCartResponse($cart);
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

        return $this->buildCartResponse($cart);
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

        return $this->buildCartResponse($cart);
    }

    public function removeFromCart(Request $request, int $productId): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        CartItem::where('cart_id', $cart->id)->where('product_id', $productId)->delete();

        return $this->buildCartResponse($cart);
    }
}