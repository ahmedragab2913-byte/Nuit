<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * PUBLIC — return only active announcements for the storefront bar.
     */
    public function active()
    {
        // جلب الإعلانات النشطة مع الألوان والترتيب، وتضمين is_active لتأمين الفرونت إند
        $announcements = Announcement::active()
            ->orderByDesc('priority')
            ->get(['id', 'text', 'is_active', 'background_color', 'text_color']);

        return response()->json([
            'status' => 'success',
            'data'   => $announcements
        ], 200);
    }

    /**
     * ADMIN — list all announcements (active + inactive).
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data'   => Announcement::orderByDesc('priority')->get()
        ], 200);
    }

    /**
     * ADMIN — create a new announcement.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'text'             => 'required|string|max:500',
            'is_active'        => 'boolean',
            'priority'         => 'integer',
            'background_color' => 'sometimes|string|max:7',
            'text_color'       => 'sometimes|string|max:7',
        ]);

        $announcement = Announcement::create($data);

        return response()->json([
            'status' => 'success',
            'data'   => $announcement
        ], 201);
    }

    /**
     * ADMIN — update an existing announcement.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'text'             => 'sometimes|required|string|max:500',
            'is_active'        => 'boolean',
            'priority'         => 'integer',
            'background_color' => 'sometimes|string|max:7',
            'text_color'       => 'sometimes|string|max:7',
        ]);

        $announcement->update($data);

        return response()->json([
            'status' => 'success',
            'data'   => $announcement
        ], 200);
    }

    /**
     * ADMIN — delete an announcement.
     */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Announcement deleted successfully'
        ], 200); // تغيير لـ 200 مع رسالة نجاح واضحة بدلاً من 204 الفاضية لتسهيل الـ Debugging
    }
}