<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // امسح القديم قبل الـ seed لتجنب التكرار
        Product::truncate();

        $products = [
            [
                'name'        => 'MINUIT',
                'tagline'     => 'The Mystery of Midnight',
                'price'       => 120.00,
                'size'        => '100ml',
                'category'    => 'Eternel',
                'notes'       => ['Blackberry', 'Incense', 'Patchouli', 'Dark Amber'], // ✅ array مباشرة
                'description' => 'An intense, mysterious fragrance capturing the essence of midnight. Rich black fruit notes blend seamlessly with deep incense and warm amber for an unforgettable evening presence.',
                'image'       => 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=750&fit=crop',
                'featured'    => true,
            ],
            [
                'name'        => 'SOIRÉE',
                'tagline'     => 'Elegant Evening Luxury',
                'price'       => 135.00,
                'size'        => '100ml',
                'category'    => 'Eternel',
                'notes'       => ['Saffron', 'Jasmine', 'Amberwood', 'Cedar'],
                'description' => 'The ultimate expression of sophistication. A sophisticated blend of rare saffron and fresh jasmine, resting on a rich base of amberwood and cedar.',
                'image'       => 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=750&fit=crop',
                'featured'    => true,
            ],
            [
                'name'        => 'LUMIÈRE',
                'tagline'     => 'Radiant Dawn Essence',
                'price'       => 110.00,
                'size'        => '100ml',
                'category'    => 'Éclat',
                'notes'       => ['Bergamot', 'Orange Blossom', 'White Musk'],
                'description' => 'Bright, fresh, and uplifting. Lumière opens with vibrant citrus notes that transition into a delicate heart of orange blossom, anchored by clean white musk.',
                'image'       => 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=750&fit=crop',
                'featured'    => true,
            ],
            [
                'name'        => 'NIGHTFALL',
                'tagline'     => 'Bold Masculine Edge',
                'price'       => 125.00,
                'size'        => '100ml',
                'category'    => 'Intense',
                'notes'       => ['Leather', 'Tobacco', 'Vanilla', 'Spices'],
                'description' => 'A powerful and charismatic scent. Warm leather and rich tobacco are balanced by a smooth touch of vanilla and exotic spices, perfect for the modern gentleman.',
                'image'       => 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=750&fit=crop',
                'featured'    => false,
            ],
            [
                'name'        => 'RÊVE',
                'tagline'     => 'A Sweet Dreamscape',
                'price'       => 115.00,
                'size'        => '100ml',
                'category'    => 'Éclat',
                'notes'       => ['Pear', 'Vanilla Bean', 'Praline', 'Sandalwood'],
                'description' => 'An enchanting, gourmand fragrance that feels like a dream. Sweet pear and creamy vanilla mix with rich praline, creating a warm, comforting aura.',
                'image'       => 'https://images.unsplash.com/photo-1590736969596-532d17cf98f4?w=600&h=750&fit=crop',
                'featured'    => false,
            ],
            [
                'name'        => 'ÉCLIPSE',
                'tagline'     => 'Where Light Meets Dark',
                'price'       => 140.00,
                'size'        => '100ml',
                'category'    => 'Intense',
                'notes'       => ['Oud', 'Rose', 'Raspberry', 'Gaiac Wood'],
                'description' => 'A complex contrast of elements. Precious oud and deep crimson rose are brightened by a hint of raspberry, creating a striking and luxurious balance.',
                'image'       => 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=750&fit=crop',
                'featured'    => false,
            ],
            [
                'name'        => 'CRÉPUSCULE',
                'tagline'     => 'The Magic of Twilight',
                'price'       => 130.00,
                'size'        => '100ml',
                'category'    => 'Eternel',
                'notes'       => ['Lavender', 'Iris', 'Tonka Bean', 'Suede'],
                'description' => 'Capturing the serene beauty of twilight. Smooth lavender and powdery iris blend gracefully with sweet tonka bean and a soft suede base.',
                'image'       => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=750&fit=crop',
                'featured'    => false,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}