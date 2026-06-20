<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function getWishlist(Request $request): JsonResponse
    {
        $items = Wishlist::where('user_id', $request->user()->id)
            ->with('product')
            ->get()
            ->map(function ($item) {
                $product = $item->product;
                if ($product) {
                    // Lowercase the category to prevent case-sensitivity bugs
                    $product->category = $product->category ? strtolower($product->category) : null;
                }
                return $product;
            })
            ->filter()
            ->values();

        return response()->json([
            'status' => 'success',
            'data'   => $items,
        ]);
    }

    public function syncWishlist(Request $request): JsonResponse
    {
        // Accept payload either as raw flat array or as wrapping 'items' object
        if ($request->isJson() && ! $request->has('items') && is_array($request->json()->all())) {
            $request->merge(['items' => $request->json()->all()]);
        } elseif (! $request->has('items') && is_array($request->all())) {
            $request->merge(['items' => $request->all()]);
        }

        $request->validate([
            'items'   => 'present|array',
            'items.*' => 'integer|exists:products,id',
        ]);

        $userId = $request->user()->id;
        $incomingProductIds = $request->input('items', []);

        // Delete items that are no longer in the payload
        Wishlist::where('user_id', $userId)
            ->whereNotIn('product_id', $incomingProductIds)
            ->delete();

        // Add new items
        foreach ($incomingProductIds as $productId) {
            Wishlist::firstOrCreate([
                'user_id'    => $userId,
                'product_id' => $productId,
            ]);
        }

        return $this->getWishlist($request);
    }
}
