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
     * Handle user login and establish a stateful session.
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

        // تم إيقاف الـ session()->regenerate() لتفادي تعارض الـ CSRF والكوكيز بين السيرفرات المتعددة
        $user = Auth::user();

        // دمج سلة المشتريات للزائر إن وجدت
        if ($request->has('cart_items') && is_array($request->input('cart_items'))) {
            try {
                $this->mergeGuestCart($user, $request->input('cart_items'));
            } catch (\Exception $e) {
                // تجنب توقف عملية تسجيل الدخول إذا واجهت جداول السلة أي مشكلة
            }
        }

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
     * Handle admin login (exclusive check for role == admin).
     */
    public function adminLogin(Request $request): JsonResponse
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

        // تم إيقاف الـ session()->regenerate() هنا أيضاً للاستقرار ومنع تضارب الـ 500
        $user = Auth::user();

        if (!$user->isAdmin()) {
            Auth::guard('web')->logout();
            return response()->json([
                'status'  => 'error',
                'message' => 'Forbidden. Admin access required.',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'user'   => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ]
        ]);
    }

    /**
     * Handle user registration.
     */
    /**
     * Handle user registration with detailed logging.
     */
    public function register(Request $request): JsonResponse
    {
        // 1. الـ Validation
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'required|string|unique:users,phone',
            'password' => 'required|string|min:6',
        ]);

        try {
            // 2. إنشاء المستخدم في الداتا بيز
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'phone'    => $data['phone'],
                'password' => Hash::make($data['password']),
                'role'     => 'customer',
            ]);

            // 3. تسجيل الدخول ومحاولة دمج السلة
            try {
                Auth::login($user);

                if ($request->has('cart_items') && is_array($request->input('cart_items'))) {
                    $this->mergeGuestCart($user, $request->input('cart_items'));
                }
            } catch (\Exception $sessionException) {
                // لو السلة أو السشن ضربوا، بنرمي Warning في الـ Log بس الـ Register بيكمل
                \Illuminate\Support\Facades\Log::warning('Registration session/cart warning: ' . $sessionException->getMessage());
            }

            // الرد الناجح في حال اكتمال الحفظ بسلام
            return response()->json([
                'status' => 'success',
                'user'   => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role'  => $user->role,
                ]
            ], 201);

        } catch (\Exception $e) {
            // 4. هنا السحر! لو أي حاجة ضربت في الداتا بيز أو الكود الأساسي، هيسجل الخطأ بالتفصيل في Railway Logs
            \Illuminate\Support\Facades\Log::error('Registration Failed Error: ' . $e->getMessage(), [
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'input' => $request->except(['password']) // بنسجل كل الـ Inputs ما عدا الباسورد للأمان
            ]);

            // بنرجع الـ Error للـ Frontend عشان تشوفه في الـ Network Tab صريح
            return response()->json([
                'status'  => 'error',
                'message' => 'Registration failed internal error.',
                'error'   => $e->getMessage() 
            ], 500);
        }
    }

    /**
     * Log the user out (invalidate session).
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        
        try {
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
        } catch (\Exception $e) {
            // تجاوز الأخطاء المتوقعة من الجلسات في بيئات الـ API المنفصلة
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Logged out successfully.'
        ]);
    }

    /**
     * Get the authenticated user with details.
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
     * Update user profile editable fields (only name).
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