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
        return response()->json(
            Announcement::active()->get(['id', 'text'])
        );
    }

    /**
     * ADMIN — list all announcements (active + inactive).
     */
    public function index()
    {
        return response()->json(
            Announcement::orderByDesc('priority')->get()
        );
    }

    /**
     * ADMIN — create a new announcement.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'text'      => 'required|string|max:500',
            'is_active' => 'boolean',
            'priority'  => 'integer',
        ]);

        $announcement = Announcement::create($data);

        return response()->json($announcement, 201);
    }

    /**
     * ADMIN — update an existing announcement.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'text'      => 'sometimes|required|string|max:500',
            'is_active' => 'boolean',
            'priority'  => 'integer',
        ]);

        $announcement->update($data);

        return response()->json($announcement);
    }

    /**
     * ADMIN — delete an announcement.
     */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json(null, 204);
    }
}
