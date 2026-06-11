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
        $request->validate([
            'items'              => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        // Clear existing items in DB
        CartItem::where('cart_id', $cart->id)->delete();

        // Save incoming items
        foreach ($request->input('items') as $item) {
            CartItem::create([
                'cart_id'    => $cart->id,
                'product_id' => $item['product_id'],
                'quantity'   => $item['quantity'],
            ]);
        }

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
