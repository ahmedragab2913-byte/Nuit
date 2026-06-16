<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Admin Endpoint: List all orders.
     */
    public function index(): JsonResponse
    {
        $orders = Order::with('customer')
            ->latest()
            ->get()
            ->map(fn($o) => [
                'id'             => $o->id,
                'order_number'   => $o->order_number ?? ('#NU-' . str_pad($o->id, 4, '0', STR_PAD_LEFT)),
                'customer'       => $o->customer->name  ?? ($o->user->name ?? 'Unknown'),
                'email'          => $o->customer->email ?? ($o->user->email ?? ''),
                'phone'          => $o->customer->phone ?? ($o->user->phone ?? ''),
                'products'       => $o->items ? collect($o->items)->map(fn($i) => ($i['name'] ?? 'Product') . ' × ' . ($i['qty'] ?? 1))->join(', ') : '',
                'total'          => $o->grand_total > 0 ? $o->grand_total : $o->total,
                'status'         => $o->status,
                'payment_method' => $o->payment_method ?? 'cash_on_delivery',
                'payment_status' => $o->payment_status ?? 'pending',
                'date'           => $o->created_at->format('M d, Y'),
                'address'        => is_array($o->shipping_address) ? implode(', ', array_filter([
                                        $o->shipping_address['apartment'] ?? '',
                                        $o->shipping_address['floor'] ?? '',
                                        $o->shipping_address['building'] ?? '',
                                        $o->shipping_address['street'] ?? '',
                                        $o->shipping_address['city'] ?? '',
                                        $o->shipping_address['country'] ?? '',
                                    ])) : ($o->customer->address ?? ''),
            ]);

        return response()->json($orders);
    }

    /**
     * Client Endpoint: List my personal orders.
     */
    public function myOrders(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn($o) => [
                'id'             => $o->id,
                'order_number'   => $o->order_number ?? ('#ORD-' . $o->id),
                'date'           => $o->created_at->format('M d, Y'),
                'items'          => is_array($o->items) ? $o->items : [],
                'subtotal'       => (float) $o->subtotal,
                'shipping_cost'  => (float) $o->shipping_cost,
                'discount_amount'=> (float) $o->discount_amount,
                'grand_total'    => (float) $o->grand_total,
                'status'         => $o->status,
                'payment_method' => $o->payment_method,
                'payment_status' => $o->payment_status,
                'address'        => $o->shipping_address,
            ]);

        return response()->json([
            'status' => 'success',
            'data'   => $orders,
        ]);
    }

    /**
     * Client Checkout: Create a new order.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'address_id'         => 'required|exists:addresses,id,deleted_at,NULL',
            'payment_method'     => 'required|in:cash_on_delivery,card,paypal,stripe',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'promo_code'         => 'nullable|string',
        ]);

        $addressId = $request->input('address_id');
        $paymentMethod = $request->input('payment_method');
        $requestedItems = $request->input('items');

        // Check if address belongs to user
        $address = Address::where('id', $addressId)->where('user_id', $user->id)->first();
        if (!$address) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid address selected.',
            ], 422);
        }

        // Run entire checkout within a DB Transaction with Lock to prevent race conditions
        try {
            $order = DB::transaction(function () use ($user, $address, $paymentMethod, $requestedItems, $request) {
                $subtotal = 0.00;
                $itemsSnapshot = [];
                $orderItemsToCreate = [];

                foreach ($requestedItems as $item) {
                    $productId = $item['product_id'];
                    $qty = intval($item['quantity']);

                    // Pessimistic Lock on Product to secure stock read and update
                    $product = Product::where('id', $productId)->lockForUpdate()->first();

                    if (!$product) {
                        throw new \Exception("Product not found.");
                    }

                    // Check stock
                    if ($product->stock < $qty) {
                        throw new \Exception("Insufficient stock for product: {$product->name}. Available: {$product->stock} , Requested:  {$qty}");
                    }

                    // Deduct stock and update sales count
                    $product->decrement('stock', $qty);
                    $product->increment('sales', $qty);

                    // Calculations (Backend Truth)
                    $price = (float) $product->price;
                    $itemTotal = $price * $qty;
                    $subtotal += $itemTotal;

                    // Add to item snapshots
                    $itemsSnapshot[] = [
                        'product_id' => $product->id,
                        'name'       => $product->name,
                        'image'      => $product->image,
                        'qty'        => $qty,
                        'price'      => $price,
                    ];

                    $orderItemsToCreate[] = [
                        'product_id'    => $product->id,
                        'product_name'  => $product->name,
                        'product_image' => $product->image,
                        'price'         => $price,
                        'quantity'      => $qty,
                    ];
                }

                // Check shipping rules: Subtotal >= 1500 EGP gets free shipping, else 50 EGP
                $shippingCost = $subtotal >= 1500 ? 0.00 : 50.00;

                // 🎫 Promo Code Discount logic
                $discountAmount = 0.00;
                $promoCodeId = null;

                if ($request->filled('promo_code')) {
                    $promo = \App\Models\PromoCode::where('code', $request->input('promo_code'))
                        ->where('is_active', true)
                        ->lockForUpdate()
                        ->first();

                    if (!$promo) {
                        throw new \Exception("Invalid or inactive promo code.");
                    }

                    if ($promo->expires_at && $promo->expires_at->isPast()) {
                        throw new \Exception("This promo code has expired.");
                    }

                    if ($promo->usage_limit !== null && $promo->used_count >= $promo->usage_limit) {
                        throw new \Exception("This promo code has reached its usage limit.");
                    }

                    if ($subtotal < $promo->min_order_amount) {
                        throw new \Exception("Minimum order amount of EGP " . number_format($promo->min_order_amount, 2) . " not met for this promo code.");
                    }

                    // Count usage by user
                    $userUsageCount = Order::where('user_id', $user->id)
                        ->where('promo_code_id', $promo->id)
                        ->count();

                    if ($userUsageCount >= $promo->user_usage_limit) {
                        throw new \Exception("You have reached the usage limit for this promo code.");
                    }

                    // Calculate discount
                    if ($promo->type === 'percentage') {
                        $discountAmount = ($promo->value / 100) * $subtotal;
                        if ($promo->max_discount_amount && $discountAmount > $promo->max_discount_amount) {
                            $discountAmount = (float) $promo->max_discount_amount;
                        }
                    } else {
                        $discountAmount = (float) $promo->value;
                    }

                    if ($discountAmount > $subtotal) {
                        $discountAmount = $subtotal;
                    }

                    $promoCodeId = $promo->id;
                    $promo->increment('used_count');
                }

                $grandTotal = $subtotal + $shippingCost - $discountAmount;
                if ($grandTotal < 0) {
                    $grandTotal = 0.00;
                }

                // Sync or create client as Customer record in DB if not exists
                $customer = Customer::where('email', $user->email)->first();
                if (!$customer) {
                    $customer = Customer::create([
                        'name'    => $user->name,
                        'email'   => $user->email,
                        'phone'   => $user->phone,
                        'status'  => 'new',
                        'address' => "{$address->building}, {$address->street}, {$address->city}, {$address->country}",
                    ]);
                }

                // Address snapshot
                $addressSnapshot = [
                    'country'   => $address->country,
                    'city'      => $address->city,
                    'street'    => $address->street,
                    'building'  => $address->building,
                    'floor'     => $address->floor,
                    'apartment' => $address->apartment,
                ];

                // Create Order record
                $orderNumber = 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));

                $order = Order::create([
                    'order_number'     => $orderNumber,
                    'customer_id'      => $customer->id,
                    'user_id'          => $user->id,
                    'promo_code_id'    => $promoCodeId,
                    'total'            => $grandTotal, // backward compatibility
                    'subtotal'         => $subtotal,
                    'shipping_cost'    => $shippingCost,
                    'discount_amount'  => $discountAmount,
                    'grand_total'      => $grandTotal,
                    'status'           => 'pending',
                    'payment_method'   => $paymentMethod,
                    'payment_status'   => 'pending',
                    'items'            => $itemsSnapshot, // backward compatibility
                    'shipping_address' => $addressSnapshot,
                ]);

                // Create OrderItem snapshots in order_items table
                foreach ($orderItemsToCreate as $oi) {
                    $oi['order_id'] = $order->id;
                    OrderItem::create($oi);
                }

                // Clear client cart in Database upon successful checkout
                $cart = Cart::where('user_id', $user->id)->first();
                if ($cart) {
                    CartItem::where('cart_id', $cart->id)->delete();
                }

                return $order;
            });

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'order_id'          => $order->id,
                    'order_number'      => $order->order_number,
                    'subtotal'          => $order->subtotal,
                    'shipping_cost'     => $order->shipping_cost,
                    'discount_amount'   => $order->discount_amount,
                    'promo_code'        => $order->promoCode ? $order->promoCode->code : null,
                    'grand_total'       => $order->grand_total,
                    'customer_name'     => $user->name,
                    'items'             => $order->items,
                    'shipping_address'  => $order->shipping_address,
                    'estimated_days'    => '3-5',
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Admin: Update order status.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,shipped,delivered,cancelled',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        // If cancelled, restore stock and decrement sales counts
        if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
            foreach ($order->orderItems as $item) {
                if ($item->product_id) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    Product::where('id', $item->product_id)->decrement('sales', $item->quantity);
                }
            }
        }

        // If un-cancelled (moved back to active status), deduct stock again
        if ($oldStatus === 'cancelled' && $newStatus !== 'cancelled') {
            foreach ($order->orderItems as $item) {
                if ($item->product_id) {
                    Product::where('id', $item->product_id)->decrement('stock', $item->quantity);
                    Product::where('id', $item->product_id)->increment('sales', $item->quantity);
                }
            }
        }

        $order->update(['status' => $newStatus]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Status updated successfully.',
            'data'    => $order,
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['customer', 'orderItems']));
    }

    /**
     * Admin: Update order payment details.
     */
    public function update(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status'         => 'sometimes|in:pending,confirmed,preparing,shipped,delivered,cancelled',
            'payment_status' => 'sometimes|in:pending,paid,failed',
        ]);

        $order->update($data);
        return response()->json($order);
    }

    /**
     * Admin: Delete order record.
     */
    public function destroy(Order $order): JsonResponse
    {
        if ($order->status !== 'cancelled') {
            foreach ($order->orderItems as $item) {
                if ($item->product_id) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    Product::where('id', $item->product_id)->decrement('sales', $item->quantity);
                }
            }
        }

        $order->delete();
        return response()->json([
            'status'  => 'success',
            'message' => 'Order deleted successfully.',
        ]);
    }
}