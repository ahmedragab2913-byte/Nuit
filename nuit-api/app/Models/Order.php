<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'customer_id',
        'user_id',
        'total',
        'status',
        'items',
        'payment_method',
        'payment_status',
        'subtotal',
        'shipping_cost',
        'discount_amount',
        'grand_total',
        'shipping_address',
    ];

    protected $casts = [
        'items' => 'array',
        'shipping_address' => 'array',
        'total' => 'float',
        'subtotal' => 'float',
        'shipping_cost' => 'float',
        'discount_amount' => 'float',
        'grand_total' => 'float',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}