<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProductsExport implements FromCollection, WithHeadings, WithStyles
{
    public function collection()
    {
        return Product::all()->map(fn($p) => [
            // 🌟 أسماء المفاتيح هنا لازم تطابق الـ Headings اللي تحت بالظبط
            'has_variants'        => $p->has_variants ? 'Yes' : 'No', // عشان يعدي من شرط الـ $isParent
            'name_en'             => $p->name,
            'name_ar'             => $p->name_ar ?? '',
            'short_description_en'=> $p->tagline ?? '',
            'description_en'      => $p->description, // لو فيه HTML سيبه، الـ Import كدة كدة بيعمل strip_tags
            'description_ar'      => $p->description_ar ?? '',
            'price'               => $p->price,
            'sale_price'          => $p->sale_price ?? '',
            'cost'                => $p->cost ?? '',
            'sku'                 => $p->sku ?? '',
            'quantity'            => $p->stock, // الـ Import بيقراها quantity
            'sale'                => $p->sales ?? 0, // الـ Import بيقراها sale
            'option1_value_en'    => $p->size ?? '100ml', // الـ Import بيقرا الـ size من هنا
            'categories_en'       => $p->category ? "[{$p->category}]" : '[General]', // بنرجعها جوه أقواس عشان الـ Regex بتاع الـ Import
            'categories_ar'       => $p->categories_ar ?? '',
            'keywords'            => $p->keywords ?? '',
            'weight'              => $p->weight ?? '',
            'weight_unit'         => $p->weight_unit ?? 'kg',
            'images'              => $p->image ? "[{$p->image}]" : '', // بنرجعها جوه أقواس عشان الـ Regex يلقط الرابط
            'published'           => $p->published ? 'yes' : 'no', // الـ Import بيعمل تشيك على 'yes'
        ]);
    }

    /**
     * 🌟 العناوين (Headings) مأخوذة بالملّي من الـ Slugs اللي الـ Import بيدور عليها في الـ $row
     */
    public function headings(): array
    {
        return [
            'has_variants',
            'name_en',
            'name_ar',
            'short_description_en',
            'description_en',
            'description_ar',
            'price',
            'sale_price',
            'cost',
            'sku',
            'quantity',
            'sale',
            'option1_value_en',
            'categories_en',
            'categories_ar',
            'keywords',
            'weight',
            'weight_unit',
            'images',
            'published'
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}