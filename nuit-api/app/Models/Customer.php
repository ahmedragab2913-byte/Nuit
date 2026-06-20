<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'address', 'status',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Total spent
    public function getTotalSpentAttribute(): float
    {
        return $this->orders()->where('status', 'delivered')->sum('total');
    }

    // Dynamic customer status based on order counts
    public function getStatusAttribute(): string
    {
        // Use orders_count if available to prevent N+1 queries
        $ordersCount = array_key_exists('orders_count', $this->attributes) 
            ? (int) $this->attributes['orders_count'] 
            : ($this->relationLoaded('orders') ? $this->orders->count() : $this->orders()->count());

        if ($ordersCount === 0) {
            return 'new';
        } elseif ($ordersCount >= 1 && $ordersCount <= 3) {
            return 'regular';
        } else {
            return 'vip';
        }
    }
}