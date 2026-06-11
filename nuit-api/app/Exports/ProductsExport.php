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
            'name'        => $p->name,
            'tagline'     => $p->tagline ?? "null",
            'price'       => $p->price,
            'size'        => $p->size,
            'category'    => $p->category,
            'notes'       => is_array($p->notes) ? implode(',', $p->notes) : $p->notes,
            'description' => $p->description,
            'image'       => $p->image,
            'featured'    => $p->featured ? 'true' : 'false',
            'stock'       => $p->stock,
            'sales'       => $p->sales ?? 0,
            'published'   => $p->published ? 'true' : 'false',
        ]);
    }

    public function headings(): array
    {
        return ['name','tagline','price','size','category','notes','description','image','featured','stock','sales','published'];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}