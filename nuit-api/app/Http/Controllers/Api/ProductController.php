<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Imports\ProductsImport;
use App\Exports\ProductsExport;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
public function index(Request $request): JsonResponse
{
    $perPage  = $request->get('per_page', 12);
    $category = $request->get('category');
    $search   = $request->get('search'); // 🌟 1. استلام قيمة البحث من الـ Request

    $query = Product::orderBy('id', 'desc');

    // 🌟 2. الفلترة بالبحث على قاعدة البيانات كلها قبل الـ Pagination
    if ($search && trim($search) !== '') {
        $query->where(function($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
              ->orWhere('name_ar', 'LIKE', "%{$search}%") // عشان لو بحث بالاسم العربي
              ->orWhere('tagline', 'LIKE', "%{$search}%")
              ->orWhere('description', 'LIKE', "%{$search}%");
        });
    }

    // ✅ Filter by category if provided
    if ($category && $category !== 'All') {
        $query->where('category', $category);
    }

    // الـ Pagination هنا هيتم على النتيجة المتفلترة بالكامل
    $products = $query->paginate($perPage);

    return response()->json([
        'data' => collect($products->items())->map(fn($p) => [
            'id'          => $p->id,
            'name'        => $p->name,
            'name_ar'     => $p->name_ar, // تأكد من وجوده في الـ Mapping لو محتاجه
            'tagline'     => $p->tagline,
            'price'       => (float) $p->price,
            'size'        => $p->size,
            'category'    => $p->category,
            'notes'       => $p->notes,
            'description' => $p->description,
            'image'       => $p->image,
            'featured'    => (bool) $p->featured,
            'stock'       => $p->stock,
            'published'   => (bool) $p->published,
            'sku'         => $p->sku,
        ]),
        'current_page' => $products->currentPage(),
        'last_page'    => $products->lastPage(),
        'total'        => $products->total(),
        'per_page'     => $products->perPage(),
    ]);
}

    public function show(Product $product): JsonResponse
{
    return response()->json([
        'id'          => $product->id,
        'name'        => $product->name,
        'tagline'     => $product->tagline,
        'price'       => (float) $product->price,
        'size'        => $product->size,
        'category'    => $product->category,
        'notes'       => $product->notes,
        'description' => $product->description,
        'image'       => $product->image,
        'featured'    => (bool) $product->featured,
        
        // ✅ تأكيد تحويل الـ stock لرقم صحيح عشان الـ React يقرأ الـ 0 صح
        'stock'       => (int) $product->stock, 
        
        'sales'       => $product->sales ?? 0,
        'published'   => (bool) $product->published,
        'sku'         => $product->sku,
    ]);
}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string',
            'tagline'     => 'nullable|string|max:255',
            'price'       => 'required|numeric',
            'size'        => 'sometimes|string',
            'category'    => 'sometimes|string',
            'notes'       => 'nullable|array',
            'description' => 'sometimes|string',
            'image'       => 'nullable|string',
            'featured'    => 'boolean',
            'stock'       => 'integer',
        ]);

        $product = Product::create($data);
        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|string',
            'tagline'     => 'nullable|string|max:255',
            'price'       => 'sometimes|numeric',
            'size'        => 'sometimes|string',
            'category'    => 'sometimes|string',
            'notes'       => 'nullable|array',
            'description' => 'sometimes|string',
            'image'       => 'nullable|string',
            'featured'    => 'boolean',
            'stock'       => 'integer',
            'published'   => 'boolean',
        ]);

        $product->update($data);
        return response()->json($product);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    public function import(Request $request): JsonResponse
    {
        if (!$request->hasFile('file')) {
            return response()->json([
                'status'  => 'error',
                'message' => 'يرجى اختيار ملف CSV أو Excel لرفعه.',
            ], 400);
        }

        try {
            Excel::import(new ProductsImport, $request->file('file'));
            return response()->json([
                'status'  => 'success',
                'message' => 'تم استيراد المنتجات وحفظها في قاعدة البيانات بنجاح!',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'        => 'failed',
                'message'       => 'فشلت عملية الاستيراد.',
                'error_details' => $e->getMessage(),
                'file'          => $e->getFile(),
                'line'          => $e->getLine(),
            ], 500);
        }
    }

    public function export(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        return Excel::download(new ProductsExport, 'nuit-products-' . now()->format('Y-m-d') . '.xlsx');
    }

    public function template(): \Symfony\Component\HttpFoundation\BinaryFileResponse
{
    $data = collect([[
        'EXAMPLE', 
        'The Example Tagline', 
        120, // رقم حقيقي (Numeric)
        '100ml',
        'General', 
        'Oud,Rose,Amber', 
        'Product description',
        'https://image-url.com/photo.jpg', 
        false, // Boolean حقيقي مش 'false' كـ string
        50, // رقم حقيقي (Integer)
    ]]);

    return Excel::download(
        new class($data) implements
            \Maatwebsite\Excel\Concerns\FromCollection,
            \Maatwebsite\Excel\Concerns\WithHeadings {
            public function __construct(private $data) {}
            public function collection() { return $this->data; }
            public function headings(): array {
                return ['name','tagline','price','size','category','notes','description','image','featured','stock'];
            }
        },
        'nuit-import-template.xlsx'
    );
}
public function newArrivals(): JsonResponse
{
    $products = Product::orderBy('created_at', 'desc')
        ->take(8)
        ->get()
        ->map(fn($p) => [
            'id'          => $p->id,
            'name'        => $p->name,
            'tagline'     => $p->tagline,
            'price'       => (float) $p->price,
            'size'        => $p->size,
            'category'    => $p->category,
            'notes'       => $p->notes,
            'description' => $p->description,
            'image'       => $p->image,
            'featured'    => (bool) $p->featured,
            'stock'       => $p->stock,
            'published'   => (bool) $p->published,
        ]);

    return response()->json($products);
}
public function getStorefrontProducts(Request $request)
{
    // هنعرض 12 عطر في الصفحة مثلاً
    $perPage = 12; 

    $products = Product::where('is_active', true)
                       ->orderBy('id', 'desc')
                       ->paginate($perPage);

    // الـ paginate تلقائياً بترجع current_page و last_page و data
    return response()->json($products);
}
}