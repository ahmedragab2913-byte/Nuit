<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * 🌟 الدالة المطلوبة للـ Route الحالي (/announcements/active)
     * بتجيب الإعلانات النشطة وتثبت الألوان للـ Frontend عشان تعدي من الـ Filter بأمان
     */
    public function active(): JsonResponse
    {
        $announcements = Announcement::where('is_active', 1)
            ->orderBy('priority', 'desc')
            ->get();

        $customAnnouncements = $announcements->map(fn($announcement) => [
            'id'               => $announcement->id,
            'text'             => $announcement->text,
            'is_active'        => (bool) $announcement->is_active, // راجعة true صريحة للـ React
            'priority'         => (int) $announcement->priority,
            'background_color' => '#000000', // البار أسود ثابت
            'text_color'       => '#ffffff', // الكلام أبيض ثابت
        ]);

        return response()->json($customAnnouncements, 200);
    }

    /**
     * جلب جميع الإعلانات (لو محتاجها في لوحة التحكم مثلاً)
     */
    public function index(): JsonResponse
    {
        $announcements = Announcement::orderBy('priority', 'desc')->get();

        $customAnnouncements = $announcements->map(fn($announcement) => [
            'id'               => $announcement->id,
            'text'             => $announcement->text,
            'is_active'        => (bool) $announcement->is_active,
            'priority'         => (int) $announcement->priority,
            'background_color' => '#000000',
            'text_color'       => '#ffffff',
        ]);

        return response()->json($customAnnouncements, 200);
    }

    /**
     * حفظ إعلان جديد
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'text'      => 'required|string',
            'is_active' => 'boolean',
            'priority'  => 'integer',
        ]);

        $announcement = Announcement::create($data);

        return response()->json([
            'status' => 'success',
            'data'   => $announcement
        ], 201);
    }

    /**
     * عرض إعلان واحد بالتفصيل
     */
    public function show($id): JsonResponse
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Announcement not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'               => $announcement->id,
                'text'             => $announcement->text,
                'is_active'        => (bool) $announcement->is_active,
                'priority'         => (int) $announcement->priority,
                'background_color' => '#000000',
                'text_color'       => '#ffffff',
            ]
        ], 200);
    }

    /**
     * تحديث إعلان حالي
     */
    public function update(Request $request, $id): JsonResponse
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Announcement not found'
            ], 404);
        }

        $data = $request->validate([
            'text'      => 'sometimes|string',
            'is_active' => 'boolean',
            'priority'  => 'integer',
        ]);

        $announcement->update($data);

        return response()->json([
            'status' => 'success',
            'data'   => $announcement
        ], 200);
    }

    /**
     * حذف إعلان
     */
    public function destroy($id): JsonResponse
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Announcement not found'
            ], 404);
        }

        $announcement->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Announcement deleted successfully'
        ], 200);
    }
}