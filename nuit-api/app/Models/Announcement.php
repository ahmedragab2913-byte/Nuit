<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'text',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'priority'  => 'integer',
    ];

    /**
     * Scope: only active announcements, ordered by priority descending.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderByDesc('priority');
    }
}