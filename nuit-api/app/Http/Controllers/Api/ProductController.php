<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Imports\ProductsImport;
use App\Exports\ProductsExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str; // 💡 تم الإضافة لحل مشكلة UUID
use Illuminate\Support\Facades\Http; // 💡 تم الإضافة لجلب روابط الإكسيل
use Illuminate\Support\Facades\Log; // 💡 تم الإضافة لتسجيل أخطاء التحميل

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage  = min((int) $request->get('per_page', 12), 100); // Hard cap prevents DoS via large page requests
        $category = $request->get('category');
        $search   = $request->get('search'); 

        $query = Product::orderBy('id', 'desc');

        if ($search && trim($search) !== '') {
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('name_ar', 'LIKE', "%{$search}%") 
                  ->orWhere('tagline', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        if ($category && $category !== 'All') {
            $query->where('category', $category);
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'data' => collect($products->items())->map(fn($p) => [
                'id'             => $p->id,
                'name'           => $p->name,
                'name_ar'        => $p->name_ar, 
                'tagline'        => $p->tagline,
                'price'          => (float) $p->price,
                'size'           => $p->size,
                'category'       => $p->category,
                'notes'          => $p->notes,
                'description'    => $p->description,
                'description_ar' => $p->description_ar,
                'image'          => $p->image,
                'featured'       => (bool) $p->featured,
                'stock'          => $p->stock,
                'published'      => (bool) $p->published,
                'sku'            => $p->sku,
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
            'id'             => $product->id,
            'name'           => $product->name,
            'name_ar'        => $product->name_ar,
            'tagline'        => $product->tagline,
            'price'          => (float) $product->price,
            'size'           => $product->size,
            'category'       => $product->category,
            'notes'          => $product->notes,
            'description'    => $product->description,
            'description_ar' => $product->description_ar,
            'image'          => $product->image,
            'featured'       => (bool) $product->featured,
            'stock'          => (int) $product->stock, 
            'sales'          => $product->sales ?? 0,
            'published'      => (bool) $product->published,
            'sku'            => $product->sku,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'           => 'required|string',
            'name_ar'        => 'nullable|string',
            'tagline'        => 'nullable|string|max:255',
            'price'          => 'required|numeric',
            'size'           => 'sometimes|string',
            'category'       => 'sometimes|string',
            'notes'          => 'nullable|array',
            'description'    => 'sometimes|string',
            'description_ar' => 'nullable|string',
            'image'          => 'nullable', 
            'featured'       => 'boolean',
            'stock'          => 'integer',
        ]);

        $data['id'] = (string) Str::uuid();
        $imagePath = null;

        // 📂 الحالة الأولى: إذا كانت الصورة ملف مرفوع من الجهاز
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = $file->guessExtension() ?? 'jpg';
            $filename = Str::uuid() . '.' . $extension;
            
            $file->move(public_path('uploads/products'), $filename);
            $imagePath = '/uploads/products/' . $filename;
        } 
        // 🔗 الحالة الثانية: إذا كانت الصورة رابط خارجي (من شيت إكسيل)
        elseif ($request->has('image') && is_string($request->input('image')) && filter_var($request->input('image'), FILTER_VALIDATE_URL)) {
            $url = $request->input('image');
            try {
                $response = Http::get($url);
                if ($response->successful()) {
                    $contentType = $response->header('Content-Type');
                    $extension = 'jpg'; 

                    if (str_contains($contentType, 'image/png')) $extension = 'png';
                    elseif (str_contains($contentType, 'image/jpeg')) $extension = 'jpeg';
                    elseif (str_contains($contentType, 'image/webp')) $extension = 'webp';
                    elseif (str_contains($contentType, 'image/gif')) $extension = 'gif';

                    $filename = Str::uuid() . '.' . $extension;
                    $destinationPath = public_path('uploads/products');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }

                    file_put_contents($destinationPath . '/' . $filename, $response->body());
                    $imagePath = '/uploads/products/' . $filename;
                }
            } catch (\Exception $e) {
                Log::error("Failed to download product image from URL: " . $url . " Error: " . $e->getMessage());
            }
        }

        $data['image'] = $imagePath;

        $product = Product::create($data);

        // Return explicit field whitelist — never expose internal fields (cost, barcode, etc.)
        return response()->json([
            'id'             => $product->id,
            'name'           => $product->name,
            'name_ar'        => $product->name_ar,
            'tagline'        => $product->tagline,
            'price'          => (float) $product->price,
            'sale_price'     => $product->sale_price ? (float) $product->sale_price : null,
            'size'           => $product->size,
            'category'       => $product->category,
            'notes'          => $product->notes,
            'description'    => $product->description,
            'description_ar' => $product->description_ar,
            'image'          => $product->image,
            'featured'       => (bool) $product->featured,
            'stock'          => (int) $product->stock,
            'published'      => (bool) $product->published,
            'sku'            => $product->sku,
            'created_at'     => $product->created_at,
        ], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'name'           => 'sometimes|string',
            'name_ar'        => 'nullable|string',
            'tagline'        => 'nullable|string|max:255',
            'price'          => 'sometimes|numeric',
            'size'           => 'sometimes|string',
            'category'       => 'sometimes|string',
            'notes'          => 'nullable|array',
            'description'    => 'sometimes|string',
            'description_ar' => 'nullable|string',
            'image'          => 'nullable', // تم تعديله ليقبل التحديث بالملف أو الرابط
            'featured'       => 'boolean',
            'stock'          => 'integer',
            'published'      => 'boolean',
        ]);

        $imagePath = $product->image; // الحفاظ على الصورة القديمة كافتراضي

        // معالجة تحديث الصورة إذا تم رفع ملف جديد
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = $file->guessExtension() ?? 'jpg';
            $filename = Str::uuid() . '.' . $extension;
            
            $file->move(public_path('uploads/products'), $filename);
            $imagePath = '/uploads/products/' . $filename;
        } 
        // معالجة تحديث الصورة إذا أُرسل رابط جديد مخصص
        elseif ($request->has('image') && is_string($request->input('image')) && filter_var($request->input('image'), FILTER_VALIDATE_URL)) {
            $url = $request->input('image');
            try {
                $response = Http::get($url);
                if ($response->successful()) {
                    $contentType = $response->header('Content-Type');
                    $extension = 'jpg';

                    if (str_contains($contentType, 'image/png')) $extension = 'png';
                    elseif (str_contains($contentType, 'image/jpeg')) $extension = 'jpeg';
                    elseif (str_contains($contentType, 'image/webp')) $extension = 'webp';

                    $filename = Str::uuid() . '.' . $extension;
                    $destinationPath = public_path('uploads/products');
                    file_put_contents($destinationPath . '/' . $filename, $response->body());
                    $imagePath = '/uploads/products/' . $filename;
                }
            } catch (\Exception $e) {
                Log::error("Failed to update product image from URL: " . $url . " Error: " . $e->getMessage());
            }
        }

        $data['image'] = $imagePath;
        $product->update($data);

        // Return explicit field whitelist — never expose internal fields (cost, barcode, etc.)
        return response()->json([
            'id'             => $product->id,
            'name'           => $product->name,
            'name_ar'        => $product->name_ar,
            'tagline'        => $product->tagline,
            'price'          => (float) $product->price,
            'sale_price'     => $product->sale_price ? (float) $product->sale_price : null,
            'size'           => $product->size,
            'category'       => $product->category,
            'notes'          => $product->notes,
            'description'    => $product->description,
            'description_ar' => $product->description_ar,
            'image'          => $product->image,
            'featured'       => (bool) $product->featured,
            'stock'          => (int) $product->stock,
            'published'      => (bool) $product->published,
            'sku'            => $product->sku,
            'updated_at'     => $product->updated_at,
        ]);
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
            // Log full details server-side; never expose file paths or stack info to clients
            Log::error('Product import failed', [
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ]);
            return response()->json([
                'status'  => 'failed',
                'message' => 'Import failed. Please check the file format and try again.',
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
            120, 
            '100ml',
            'General', 
            'Oud,Rose,Amber', 
            'Product description',
            'https://image-url.com/photo.jpg', 
            false, 
            50, 
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
                'id'             => $p->id,
                'name'           => $p->name,
                'name_ar'        => $p->name_ar,
                'tagline'        => $p->tagline,
                'price'          => (float) $p->price,
                'size'           => $p->size,
                'category'       => $p->category,
                'notes'          => $p->notes,
                'description'    => $p->description,
                'description_ar' => $p->description_ar,
                'image'          => $p->image,
                'featured'       => (bool) $p->featured,
                'stock'          => $p->stock,
                'published'      => (bool) $p->published,
            ]);

        return response()->json($products);
    }

    public function getStorefrontProducts(Request $request)
    {
        $perPage = 12; 
        $products = Product::where('is_active', true)
                           ->orderBy('id', 'desc')
                           ->paginate($perPage);

        return response()->json($products);
    }

    public function getBestSellers(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 8);

        $products = Product::query()
            ->orderByDesc('sales')
            ->orderByDesc('id')
            ->paginate($perPage);

        // Map to explicit field whitelist — raw paginator items expose all DB columns including 'cost'
        return response()->json([
            'status' => 'success',
            'data' => collect($products->items())->map(fn($p) => [
                'id'             => $p->id,
                'name'           => $p->name,
                'name_ar'        => $p->name_ar,
                'tagline'        => $p->tagline,
                'price'          => (float) $p->price,
                'sale_price'     => $p->sale_price ? (float) $p->sale_price : null,
                'size'           => $p->size,
                'category'       => $p->category,
                'notes'          => $p->notes,
                'description'    => $p->description,
                'description_ar' => $p->description_ar,
                'image'          => $p->image,
                'featured'       => (bool) $p->featured,
                'stock'          => (int) $p->stock,
                'published'      => (bool) $p->published,
                'sku'            => $p->sku,
            ]),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
                'has_more'     => $products->hasMorePages(),
            ]
        ]);
    }
}