<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'revenue'   => Order::where('status', 'delivered')->sum('total'),
            'orders'    => Order::count(),
            'products'  => Product::count(),
            'customers' => Customer::count(),

            'top_products' => Product::orderBy('sales', 'desc')
                ->take(5)
                ->get(['id', 'name', 'price', 'image', 'sales']),

            'recent_orders' => Order::with('customer')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($o) => [
                    'id'       => '#NU-' . str_pad($o->id, 4, '0', STR_PAD_LEFT),
                    'customer' => $o->customer->name ?? 'Unknown',
                    'total'    => $o->total,
                    'status'   => $o->status,
                    'date'     => $o->created_at->format('M d, Y'),
                ]),

            'revenue_chart' => Order::selectRaw('MONTH(created_at) as month, SUM(total) as total')
                ->whereYear('created_at', now()->year)
                ->where('status', 'delivered')
                ->groupBy('month')
                ->orderBy('month')
                ->get(),

            'category_stats' => (function () {
                $total = Product::count();
                if ($total === 0) {
                    return ['women_pct' => 0, 'men_pct' => 0, 'unisex_pct' => 0];
                }
                $women  = Product::where('category', 'Women Perfumes')->count();
                $men    = Product::where('category', 'Men Perfumes')->count();
                $unisex = Product::where('category', 'Unisex')->count();
                return [
                    'women_pct'  => round(($women  / $total) * 100),
                    'men_pct'    => round(($men    / $total) * 100),
                    'unisex_pct' => round(($unisex / $total) * 100),
                ];
            })(),
        ]);
    }
}