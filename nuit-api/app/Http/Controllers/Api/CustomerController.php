<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function index(): JsonResponse
    {
        $customers = Customer::withCount('orders')
            ->get()
            ->map(fn($c) => [
                'id'      => $c->id,
                'name'    => $c->name,
                'email'   => $c->email,
                'orders'  => $c->orders_count,
                'spent'   => $c->total_spent,
                'joined'  => $c->created_at->format('M Y'),
                'status'  => $c->status,
            ]);

        return response()->json($customers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => 'required|string',
            'email'   => 'required|email|unique:customers',
            'phone'   => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $customer = Customer::create($data);
        return response()->json($customer, 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        return response()->json($customer->load('orders'));
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $customer->update($request->validate([
            'name'    => 'sometimes|string',
            'email'   => 'sometimes|email|unique:customers,email,' . $customer->id,
            'phone'   => 'nullable|string',
            'address' => 'nullable|string',
            'status'  => 'sometimes|in:new,regular,vip',
        ]));

        return response()->json($customer);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();
        return response()->json(['message' => 'Customer deleted']);
    }
}