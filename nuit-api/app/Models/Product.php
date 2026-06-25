<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * الحقول المسموح بحفظها جماعياً (Mass Assignment)
     */
    protected $fillable = [
        // ─── Core fields ───────────────────────────────
        'name',
        'name_ar',
        'tagline',
        'description',
        'description_ar',
        'short_description_en',
        'short_description_ar',

        // ─── Pricing ───────────────────────────────────
        'price',
        'sale_price',
        // NOTE: 'cost' intentionally excluded — internal business data, never expose via API.

        // ─── Inventory ─────────────────────────────────
        'sku',
        'barcode',
        'stock',
        'size',
        'weight',
        'weight_unit',

        // ─── Classification ────────────────────────────
        'category',
        'categories_ar',
        'keywords',
        'published',
        'featured',
        'has_variants',

        // ─── Notes & Images ────────────────────────────
        'notes',
        'image',
        'options',
    ];

    /**
     * عمل Cast للحقول التي تحتاج إلى صيغ معينة عند الحفظ أو الاسترجاع
     */
    protected $casts = [
        'price'        => 'float',
        'sale_price'   => 'float',
        'cost'         => 'float',
        'stock'        => 'integer',
        'published'    => 'boolean',
        'featured'     => 'boolean',
        'has_variants' => 'boolean',
        'notes'        => 'array',
        'options'      => 'array',
    ];
}