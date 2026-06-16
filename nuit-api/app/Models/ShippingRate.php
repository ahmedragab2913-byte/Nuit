<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingRate extends Model
{
    /**
     * الحقول المسموح بكتابتها وتعديلها داخل قاعدة البيانات دفعة واحدة (Mass Assignment)
     */
    protected $fillable = ['city_name', 'rate'];

    /**
     * اختياري: عمل Casting لسعر الشحن عشان يرجع دايماً كـ Float (رقم عشري) 
     * بدل ما يرجع كـ String من قاعدة البيانات، وده بيريحك جداً في حسابات الفرونت إند والباك إيند.
     */
    protected $casts = [
        'rate' => 'float',
    ];
}