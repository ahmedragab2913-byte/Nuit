<?php

namespace App\Imports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;

class ProductsImport implements ToModel, WithHeadingRow, SkipsOnError
{
    use SkipsErrors;

    public function model(array $row): ?Product
    {
        // ✅ تجاهل الـ variants (السطور اللي has_variants فاضية)
        // الـ parent بس اللي عنده has_variants = "Yes"
        $isParent = strtolower(trim($row['has_variants'] ?? '')) === 'yes';
        if (!$isParent) return null;

        // ✅ تجاهل السطور اللي مفيهاش اسم
        $name = trim($row['name_en'] ?? $row['name_ar'] ?? '');
        if (empty($name)) return null;

        // ✅ تنظيف الـ HTML من الـ description
        $descriptionEn = strip_tags($row['description_en'] ?? '');
        $descriptionAr = strip_tags($row['description_ar'] ?? '');

        // ✅ استخراج أول صورة من الـ images field
        // الصورة بتيجي بالشكل ده: [https://...], [https://...]
        $imagesRaw = $row['images'] ?? '';
        preg_match('/https?:\/\/[^\]]+/', $imagesRaw, $matches);
        $image = $matches[0] ?? null;

        // ✅ استخراج الـ categories
        $categoriesRaw = $row['categories_en'] ?? '';
        preg_match_all('/\[([^\]]+)\]/', $categoriesRaw, $catMatches);
        $category = $catMatches[1][0] ?? 'General';

        // ✅ استخراج الـ size من option1
        $size = trim($row['option1_value_en'] ?? '100ml');

        return new Product([
            'name'           => strtoupper(trim($name)),
            'name_ar'        => trim($row['name_ar'] ?? ''),
            'tagline'        => trim($row['short_description_en'] ?? ''),
            'description'    => $descriptionEn,
            'description_ar' => $descriptionAr,
            'price'          => (float) ($row['price'] ?? 0),
            'sale_price'     => !empty($row['sale_price']) ? (float) $row['sale_price'] : null,
            'cost'           => !empty($row['cost'])       ? (float) $row['cost']       : null,
            'sku'            => trim($row['sku'] ?? ''),
            'stock'          => (int) ($row['quantity'] ?? 0),
            'sales'           => !empty($row['sale']) ? (float) $row['sale'] : null,
            'size'           => $size ?: '100ml',
            'category'       => $category,
            'categories_ar'  => $row['categories_ar'] ?? null,
            'keywords'       => $row['keywords'] ?? null,
            'weight'         => $row['weight'] ?? null,
            'weight_unit'    => $row['weight_unit'] ?? 'kg',
            'image'          => $image,
            'featured'       => false,
            'published'      => strtolower(trim($row['published'] ?? 'yes')) === 'yes',
            'has_variants'   => true,
            'notes'          => [], // الـ Excel مش فيه notes
        ]);
    }
}