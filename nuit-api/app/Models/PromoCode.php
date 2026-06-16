<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    protected $fillable = [
    'code', 'type', 'value', 'min_order_amount', 'max_discount_amount',
    'usage_limit', 'user_usage_limit', 'used_count', 'expires_at', 'is_active'
];

protected $casts = [
    'is_active' => 'boolean',
    'expires_at' => 'datetime',
];
}
