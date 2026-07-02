<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Cart;
use App\Models\CartItem;

class AuthController extends Controller
{
    /**
     * Handle user login and return API Token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $user = Auth::user();
        
        // 🔑 توليد التوكن للفرونت إند مع تحديد الصلاحية
        $token = $user->createToken('auth_token', ['customer'])->plainTextToken;

        if ($request->has('cart_items') && is_array($request->input('cart_items'))) {
            try {
                $this->mergeGuestCart($user, $request->input('cart_items'));
            } catch (\Exception $e) {}
        }

        return response()->json([
            'status' => 'success',
            'token'  => $token,
            'user'   => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
            ]
        ]);
    }

    /**
     * Handle user registration and return API Token.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'required|string|unique:users,phone',
            'password' => 'required|string|min:6',
        ]);

        try {
            // Create user first without role (role is not in $fillable)
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'phone'    => $data['phone'],
                'password' => Hash::make($data['password']),
            ]);

            // Set role explicitly — never trust client input for this field
            $user->role = 'customer';
            $user->save();

            // 🛒 Eagerly create the cart for the user
            Cart::firstOrCreate(['user_id' => $user->id]);

            // 🔑 توليد التوكن فوراً بعد التسجيل مع تحديد الصلاحية
            $token = $user->createToken('auth_token', ['customer'])->plainTextToken;

            if ($request->has('cart_items') && is_array($request->input('cart_items'))) {
                try {
                    $this->mergeGuestCart($user, $request->input('cart_items'));
                } catch (\Exception $e) {}
            }

            return response()->json([
                'status' => 'success',
                'token'  => $token,
                'user'   => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role'  => $user->role,
                ]
            ], 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Register Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Registration failed.'], 500);
        }
    }

    /**
     * Handle authentication and registration via Google.
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $idToken = $request->input('token');

        // Verify ID Token with Google API tokeninfo endpoint
        try {
            $response = \Illuminate\Support\Facades\Http::get("https://oauth2.googleapis.com/tokeninfo", [
                'id_token' => $idToken,
            ]);

            if ($response->failed()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid Google token.',
                ], 401);
            }

            $payload = $response->json();

            // Security check: Verify that the audience matches our Client ID
            $clientId = env('GOOGLE_CLIENT_ID');
            if (isset($payload['aud']) && $payload['aud'] !== $clientId) {
                \Illuminate\Support\Facades\Log::warning('Google Login client ID mismatch.', [
                    'expected' => $clientId,
                    'received' => $payload['aud'] ?? null
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token audience mismatch. Access denied.',
                ], 401);
            }

            $email = $payload['email'] ?? null;
            $googleId = $payload['sub'] ?? null;
            $name = $payload['name'] ?? null;

            if (!$email || !$googleId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Required user info missing from Google token.',
                ], 400);
            }

            // Find user by google_id or email
            $user = User::where('google_id', $googleId)->first();

            if (!$user) {
                $user = User::where('email', $email)->first();

                if ($user) {
                    // Link google account to existing user email
                    $user->google_id = $googleId;
                    $user->save();
                } else {
                    // Register a new customer user
                    $user = User::create([
                        'name' => $name ?? 'Google User',
                        'email' => $email,
                        'google_id' => $googleId,
                        'phone' => null,
                        'password' => Hash::make(\Illuminate\Support\Str::random(24)),
                    ]);

                    $user->role = 'customer';
                    $user->save();

                    // Create cart for user
                    Cart::firstOrCreate(['user_id' => $user->id]);
                }
            }

            // Generate token
            $token = $user->createToken('auth_token', ['customer'])->plainTextToken;

            // Merge guest cart if requested
            if ($request->has('cart_items') && is_array($request->input('cart_items'))) {
                try {
                    $this->mergeGuestCart($user, $request->input('cart_items'));
                } catch (\Exception $e) {}
            }

            return response()->json([
                'status' => 'success',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                ]
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Google Login Error: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
            ]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Google authentication failed.',
            ], 500);
        }
    }

    /**
     * Handle admin login and return API Token with role validation.
     */
    public function adminLogin(Request $request): JsonResponse
    {
        // 1. التحقق من البيانات المدخلة
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // 2. محاولة تسجيل الدخول
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $user = Auth::user();

        // 🛡️ فحص أمني (QA Touch): تأكد إن اللي بيدخل ده أدمن فعلاً مش زبون عادي!
        if ($user->role !== 'admin') {
            Auth::logout(); // اقطع الجلسة فوراً
            return response()->json([
                'status'  => 'error',
                'message' => 'Access denied. You do not have admin privileges.',
            ], 403); // 403 Forbidden
        }

        // 🔑 توليد التوكن الخاص بالأدمن مع تحديد صلاحية admin
        $token = $user->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token'  => $token,
            'user'   => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
            ]
        ]);
    }

    /**
     * Log the user out (Revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        // مسح التوكن الحالي اللي المستخدم داخل بيه
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Logged out successfully.'
        ]);
    }

    /**
     * Get the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'status' => 'success',
            'user'   => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
            ]
        ]);
    }

    /**
     * Update profile (only name).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user->update(['name' => $data['name']]);

        return response()->json([
            'status' => 'success',
            'user'   => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
            ]
        ]);
    }

    /**
     * Merge guest cart logic.
     */
    private function mergeGuestCart(User $user, array $guestItems): void
    {
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        foreach ($guestItems as $item) {
            if (!isset($item['product_id']) || !isset($item['quantity'])) {
                continue;
            }

            $productId = $item['product_id'];
            $quantity = intval($item['quantity']);

            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $productId)
                ->first();

            if ($cartItem) {
                $cartItem->increment('quantity', $quantity);
            } else {
                CartItem::create([
                    'cart_id'    => $cart->id,
                    'product_id' => $productId,
                    'quantity'   => $quantity,
                ]);
            }
        }
    }
}