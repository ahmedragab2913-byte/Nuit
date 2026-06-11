<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->latest()->get();
        return response()->json([
            'status' => 'success',
            'data'   => $addresses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'country'    => 'required|string|max:100',
            'city'       => 'required|string|max:100',
            'street'     => 'required|string|max:255',
            'building'   => 'required|string|max:100',
            'floor'      => 'nullable|string|max:50',
            'apartment'  => 'nullable|string|max:50',
            'is_default' => 'boolean',
        ]);

        $user = $request->user();

        // If this is default or the user has no addresses yet, set it default
        $hasNoAddress = $user->addresses()->count() === 0;
        if ($hasNoAddress || ($request->has('is_default') && $request->input('is_default'))) {
            $user->addresses()->update(['is_default' => false]);
            $data['is_default'] = true;
        } else {
            $data['is_default'] = false;
        }

        $address = $user->addresses()->create($data);

        return response()->json([
            'status' => 'success',
            'data'   => $address,
        ], 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized.',
            ], 403);
        }

        $data = $request->validate([
            'country'    => 'sometimes|required|string|max:100',
            'city'       => 'sometimes|required|string|max:100',
            'street'     => 'sometimes|required|string|max:255',
            'building'   => 'sometimes|required|string|max:100',
            'floor'      => 'nullable|string|max:50',
            'apartment'  => 'nullable|string|max:50',
            'is_default' => 'boolean',
        ]);

        if (isset($data['is_default']) && $data['is_default']) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address->update($data);

        return response()->json([
            'status' => 'success',
            'data'   => $address,
        ]);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized.',
            ], 403);
        }

        $wasDefault = $address->is_default;
        $address->delete(); // Soft delete

        // If we deleted the default address, set another one as default
        if ($wasDefault) {
            $nextAddress = $request->user()->addresses()->first();
            if ($nextAddress) {
                $nextAddress->update(['is_default' => true]);
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Address deleted successfully.',
        ]);
    }

    public function setDefault(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized.',
            ], 403);
        }

        $request->user()->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json([
            'status' => 'success',
            'data'   => $address,
        ]);
    }
}
