import prisma from "./src/lib/prisma";

type ProductStatus = "PUBLISHED" | "DRAFT";

interface SeedProduct {
  title: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  sku: string;
  image: string;
  tags: string[];
  status: ProductStatus;
}

const products: SeedProduct[] = [
  // =========================================================
  // CLOTHING — 10
  // =========================================================

  {
    title: "Premium Oversized Hoodie",
    slug: "demo-premium-oversized-hoodie",
    description:
      "Soft heavyweight oversized hoodie designed for comfortable everyday streetwear styling.",
    category: "Clothing",
    brand: "Urban Edit",
    price: 2999,
    discountPrice: 2199,
    stock: 28,
    sku: "DEMO-CLOTHING-001",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
    tags: ["hoodie", "clothing", "streetwear", "winter"],
    status: "PUBLISHED",
  },

  {
    title: "Classic Denim Jacket",
    slug: "demo-classic-denim-jacket",
    description:
      "Timeless denim jacket with a versatile silhouette designed for effortless layering.",
    category: "Clothing",
    brand: "Blue District",
    price: 3999,
    discountPrice: 2999,
    stock: 17,
    sku: "DEMO-CLOTHING-002",
    image:
      "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d",
    tags: ["denim", "jacket", "fashion", "casual"],
    status: "PUBLISHED",
  },

  {
    title: "Essential Cotton T-Shirt",
    slug: "demo-essential-cotton-tshirt",
    description:
      "Breathable everyday cotton T-shirt with a clean minimal fit.",
    category: "Clothing",
    brand: "Minimal Wear",
    price: 1499,
    discountPrice: 999,
    stock: 42,
    sku: "DEMO-CLOTHING-003",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    tags: ["tshirt", "cotton", "casual", "basics"],
    status: "PUBLISHED",
  },

  {
    title: "Relaxed Linen Shirt",
    slug: "demo-relaxed-linen-shirt",
    description:
      "Lightweight linen shirt created for breathable comfort and refined casual outfits.",
    category: "Clothing",
    brand: "North & Loom",
    price: 2599,
    discountPrice: 2099,
    stock: 21,
    sku: "DEMO-CLOTHING-004",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10",
    tags: ["shirt", "linen", "summer", "casual"],
    status: "PUBLISHED",
  },

  {
    title: "Everyday Zip Jacket",
    slug: "demo-everyday-zip-jacket",
    description:
      "Clean lightweight zip jacket suitable for transitional weather and everyday layering.",
    category: "Clothing",
    brand: "Urban Edit",
    price: 3499,
    discountPrice: 2699,
    stock: 15,
    sku: "DEMO-CLOTHING-005",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5",
    tags: ["jacket", "outerwear", "casual", "fashion"],
    status: "PUBLISHED",
  },

  {
    title: "Tailored Casual Blazer",
    slug: "demo-tailored-casual-blazer",
    description:
      "Modern tailored blazer combining structured styling with comfortable everyday wear.",
    category: "Clothing",
    brand: "Atelier North",
    price: 5499,
    discountPrice: 3999,
    stock: 11,
    sku: "DEMO-CLOTHING-006",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
    tags: ["blazer", "formal", "fashion", "premium"],
    status: "PUBLISHED",
  },

  {
    title: "Comfort Jogger Pants",
    slug: "demo-comfort-jogger-pants",
    description:
      "Relaxed joggers with a streamlined fit designed for travel, lounging and casual outfits.",
    category: "Clothing",
    brand: "Motion",
    price: 2199,
    discountPrice: 1599,
    stock: 36,
    sku: "DEMO-CLOTHING-007",
    image:
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8",
    tags: ["joggers", "pants", "casual", "comfort"],
    status: "PUBLISHED",
  },

  {
    title: "Classic Knit Sweater",
    slug: "demo-classic-knit-sweater",
    description:
      "Warm knit sweater featuring a timeless design for everyday winter layering.",
    category: "Clothing",
    brand: "North & Loom",
    price: 3299,
    discountPrice: 2399,
    stock: 19,
    sku: "DEMO-CLOTHING-008",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27",
    tags: ["sweater", "knitwear", "winter", "clothing"],
    status: "PUBLISHED",
  },

  {
    title: "Relaxed Everyday Sweatshirt",
    slug: "demo-relaxed-everyday-sweatshirt",
    description:
      "Soft relaxed sweatshirt built for comfortable everyday outfits and effortless layering.",
    category: "Clothing",
    brand: "Minimal Wear",
    price: 2499,
    discountPrice: 1749,
    stock: 27,
    sku: "DEMO-CLOTHING-009",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990",
    tags: ["sweatshirt", "casual", "streetwear", "comfort"],
    status: "PUBLISHED",
  },

  {
    title: "Premium Everyday Shirt",
    slug: "demo-premium-everyday-shirt",
    description:
      "Refined everyday shirt featuring a versatile silhouette for casual and smart-casual styling.",
    category: "Clothing",
    brand: "Atelier North",
    price: 2799,
    discountPrice: 1999,
    stock: 23,
    sku: "DEMO-CLOTHING-010",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
    tags: ["shirt", "premium", "casual", "fashion"],
    status: "PUBLISHED",
  },

  // =========================================================
  // SHOES — 10
  // =========================================================

  {
    title: "Nike Air Max 270",
    slug: "demo-nike-air-max-270",
    description:
      "Lightweight lifestyle sneakers featuring responsive cushioning and a modern streetwear silhouette.",
    category: "Shoes",
    brand: "Nike",
    price: 12999,
    discountPrice: 9999,
    stock: 18,
    sku: "DEMO-SHOE-001",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    tags: ["nike", "sneakers", "shoes", "sports"],
    status: "PUBLISHED",
  },

  {
    title: "Urban Runner Sneakers",
    slug: "demo-urban-runner-sneakers",
    description:
      "Versatile everyday sneakers with cushioned construction and contemporary styling.",
    category: "Shoes",
    brand: "Stride",
    price: 4999,
    discountPrice: 3499,
    stock: 26,
    sku: "DEMO-SHOE-002",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    tags: ["sneakers", "running", "shoes", "casual"],
    status: "PUBLISHED",
  },

  {
    title: "Classic White Sneakers",
    slug: "demo-classic-white-sneakers",
    description:
      "Minimal white sneakers designed to pair effortlessly with everyday outfits.",
    category: "Shoes",
    brand: "Mono",
    price: 3999,
    discountPrice: 2999,
    stock: 31,
    sku: "DEMO-SHOE-003",
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
    tags: ["white", "sneakers", "minimal", "casual"],
    status: "PUBLISHED",
  },

  {
    title: "Performance Running Shoes",
    slug: "demo-performance-running-shoes",
    description:
      "Responsive running shoes engineered for lightweight comfort during daily training.",
    category: "Shoes",
    brand: "Velocity",
    price: 6999,
    discountPrice: 4999,
    stock: 22,
    sku: "DEMO-SHOE-004",
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5",
    tags: ["running", "sports", "training", "shoes"],
    status: "PUBLISHED",
  },

  {
    title: "Premium Leather Boots",
    slug: "demo-premium-leather-boots",
    description:
      "Structured boots with premium-inspired styling for elevated everyday outfits.",
    category: "Shoes",
    brand: "Heritage",
    price: 7999,
    discountPrice: 5799,
    stock: 13,
    sku: "DEMO-SHOE-005",
    image:
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0",
    tags: ["boots", "leather", "premium", "winter"],
    status: "PUBLISHED",
  },

  {
    title: "Street High-Top Sneakers",
    slug: "demo-street-high-top-sneakers",
    description:
      "High-top sneakers combining streetwear styling with comfortable everyday construction.",
    category: "Shoes",
    brand: "District",
    price: 5499,
    discountPrice: 3899,
    stock: 20,
    sku: "DEMO-SHOE-006",
    image:
      "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3",
    tags: ["high-top", "sneakers", "streetwear", "shoes"],
    status: "PUBLISHED",
  },

  {
    title: "Everyday Canvas Sneakers",
    slug: "demo-everyday-canvas-sneakers",
    description:
      "Lightweight canvas sneakers created for relaxed everyday styling.",
    category: "Shoes",
    brand: "Canvas Co.",
    price: 2999,
    discountPrice: 2199,
    stock: 34,
    sku: "DEMO-SHOE-007",
    image:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
    tags: ["canvas", "sneakers", "casual", "shoes"],
    status: "PUBLISHED",
  },

  {
    title: "Trail Adventure Shoes",
    slug: "demo-trail-adventure-shoes",
    description:
      "Durable adventure shoes designed for outdoor walks and active weekend travel.",
    category: "Shoes",
    brand: "Terrain",
    price: 6499,
    discountPrice: 4599,
    stock: 16,
    sku: "DEMO-SHOE-008",
    image:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2",
    tags: ["trail", "outdoor", "sports", "shoes"],
    status: "PUBLISHED",
  },

  {
    title: "Minimal Everyday Trainers",
    slug: "demo-minimal-everyday-trainers",
    description:
      "Clean low-profile trainers designed for everyday comfort and versatile styling.",
    category: "Shoes",
    brand: "Mono",
    price: 4499,
    discountPrice: 3199,
    stock: 25,
    sku: "DEMO-SHOE-009",
    image:
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f",
    tags: ["trainers", "minimal", "casual", "shoes"],
    status: "PUBLISHED",
  },

  {
    title: "Premium Sport Sneakers",
    slug: "demo-premium-sport-sneakers",
    description:
      "Modern sport-inspired sneakers offering lightweight everyday comfort.",
    category: "Shoes",
    brand: "Velocity",
    price: 7499,
    discountPrice: 5199,
    stock: 14,
    sku: "DEMO-SHOE-010",
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
    tags: ["sport", "sneakers", "premium", "shoes"],
    status: "PUBLISHED",
  },

  // =========================================================
  // ELECTRONICS — 10
  // =========================================================

  {
    title: "Wireless Noise Cancelling Headphones",
    slug: "demo-wireless-noise-cancelling-headphones",
    description:
      "Comfortable wireless headphones designed for immersive everyday listening.",
    category: "Electronics",
    brand: "SoundCore",
    price: 8999,
    discountPrice: 6499,
    stock: 12,
    sku: "DEMO-ELECTRONICS-001",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    tags: ["headphones", "audio", "wireless", "electronics"],
    status: "PUBLISHED",
  },

  {
    title: "Premium Smart Watch",
    slug: "demo-premium-smart-watch",
    description:
      "Modern smartwatch designed for everyday activity tracking, notifications and lifestyle use.",
    category: "Electronics",
    brand: "Pulse",
    price: 12999,
    discountPrice: 8999,
    stock: 18,
    sku: "DEMO-ELECTRONICS-002",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    tags: ["smartwatch", "wearable", "technology", "electronics"],
    status: "PUBLISHED",
  },

  {
    title: "Compact Wireless Speaker",
    slug: "demo-compact-wireless-speaker",
    description:
      "Portable wireless speaker with a compact design for music at home or on the go.",
    category: "Electronics",
    brand: "Wave",
    price: 4999,
    discountPrice: 3499,
    stock: 29,
    sku: "DEMO-ELECTRONICS-003",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
    tags: ["speaker", "bluetooth", "audio", "portable"],
    status: "PUBLISHED",
  },

  {
    title: "Professional Mirrorless Camera",
    slug: "demo-professional-mirrorless-camera",
    description:
      "Compact mirrorless camera designed for photography enthusiasts and content creators.",
    category: "Electronics",
    brand: "Optix",
    price: 74999,
    discountPrice: 67999,
    stock: 7,
    sku: "DEMO-ELECTRONICS-004",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    tags: ["camera", "photography", "creator", "electronics"],
    status: "PUBLISHED",
  },

  {
    title: "Ultra Slim Laptop",
    slug: "demo-ultra-slim-laptop",
    description:
      "Portable slim laptop designed for productivity, study and everyday creative work.",
    category: "Electronics",
    brand: "NovaTech",
    price: 69999,
    discountPrice: 61999,
    stock: 9,
    sku: "DEMO-ELECTRONICS-005",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    tags: ["laptop", "computer", "technology", "productivity"],
    status: "PUBLISHED",
  },

  {
    title: "True Wireless Earbuds",
    slug: "demo-true-wireless-earbuds",
    description:
      "Compact wireless earbuds built for music, calls and everyday commuting.",
    category: "Electronics",
    brand: "SoundCore",
    price: 5999,
    discountPrice: 3999,
    stock: 38,
    sku: "DEMO-ELECTRONICS-006",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1",
    tags: ["earbuds", "wireless", "audio", "electronics"],
    status: "PUBLISHED",
  },

  {
    title: "Portable Gaming Controller",
    slug: "demo-portable-gaming-controller",
    description:
      "Ergonomic gaming controller designed for responsive and comfortable gameplay.",
    category: "Electronics",
    brand: "Nexus",
    price: 4499,
    discountPrice: 3299,
    stock: 21,
    sku: "DEMO-ELECTRONICS-007",
    image:
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48",
    tags: ["gaming", "controller", "technology", "electronics"],
    status: "PUBLISHED",
  },

  {
    title: "Mechanical Wireless Keyboard",
    slug: "demo-mechanical-wireless-keyboard",
    description:
      "Compact mechanical keyboard designed for productive workspaces and gaming setups.",
    category: "Electronics",
    brand: "KeyLab",
    price: 7499,
    discountPrice: 5499,
    stock: 16,
    sku: "DEMO-ELECTRONICS-008",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    tags: ["keyboard", "mechanical", "computer", "electronics"],
    status: "PUBLISHED",
  },

  {
    title: "Minimal Wireless Mouse",
    slug: "demo-minimal-wireless-mouse",
    description:
      "Ergonomic wireless mouse with a clean design for modern desktop setups.",
    category: "Electronics",
    brand: "KeyLab",
    price: 2999,
    discountPrice: 2199,
    stock: 44,
    sku: "DEMO-ELECTRONICS-009",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
    tags: ["mouse", "wireless", "computer", "accessories"],
    status: "PUBLISHED",
  },

  {
    title: "Portable Power Bank",
    slug: "demo-portable-power-bank",
    description:
      "Compact high-capacity portable charger designed for travel and everyday use.",
    category: "Electronics",
    brand: "Volt",
    price: 3499,
    discountPrice: 2499,
    stock: 47,
    sku: "DEMO-ELECTRONICS-010",
    image:
      "https://images.unsplash.com/photo-1609592806596-b43bada2f2ed",
    tags: ["powerbank", "charging", "mobile", "electronics"],
    status: "PUBLISHED",
  },

  // =========================================================
  // BEAUTY — 10
  // =========================================================

  {
    title: "Hydrating Skincare Essentials",
    slug: "demo-hydrating-skincare-essentials",
    description:
      "Hydrating skincare essentials designed to complement a simple everyday beauty routine.",
    category: "Beauty",
    brand: "Glow",
    price: 1999,
    discountPrice: 1499,
    stock: 31,
    sku: "DEMO-BEAUTY-001",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
    tags: ["skincare", "beauty", "hydrating", "care"],
    status: "PUBLISHED",
  },

  {
    title: "Vitamin C Face Serum",
    slug: "demo-vitamin-c-face-serum",
    description:
      "Lightweight face serum designed for a bright and refreshed-looking skincare routine.",
    category: "Beauty",
    brand: "Lumina",
    price: 1299,
    discountPrice: 899,
    stock: 52,
    sku: "DEMO-BEAUTY-002",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
    tags: ["serum", "skincare", "vitamin-c", "beauty"],
    status: "PUBLISHED",
  },

  {
    title: "Daily Moisturizing Cream",
    slug: "demo-daily-moisturizing-cream",
    description:
      "Everyday moisturizing cream with a smooth lightweight texture for daily skincare.",
    category: "Beauty",
    brand: "Pure Skin",
    price: 999,
    discountPrice: 749,
    stock: 46,
    sku: "DEMO-BEAUTY-003",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b",
    tags: ["moisturizer", "skincare", "beauty", "daily-care"],
    status: "PUBLISHED",
  },

  {
    title: "Luxury Eau de Parfum",
    slug: "demo-luxury-eau-de-parfum",
    description:
      "Elegant fragrance presented in a refined bottle for a premium everyday scent collection.",
    category: "Beauty",
    brand: "Maison Aura",
    price: 4999,
    discountPrice: 3799,
    stock: 18,
    sku: "DEMO-BEAUTY-004",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601",
    tags: ["perfume", "fragrance", "luxury", "beauty"],
    status: "PUBLISHED",
  },

  {
    title: "Matte Lip Colour",
    slug: "demo-matte-lip-colour",
    description:
      "Rich matte lip colour created for comfortable everyday and occasion wear.",
    category: "Beauty",
    brand: "Velvet",
    price: 899,
    discountPrice: 649,
    stock: 63,
    sku: "DEMO-BEAUTY-005",
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa",
    tags: ["lipstick", "makeup", "beauty", "matte"],
    status: "PUBLISHED",
  },

  {
    title: "Essential Makeup Brush Set",
    slug: "demo-essential-makeup-brush-set",
    description:
      "Versatile brush collection designed for everyday face and eye makeup application.",
    category: "Beauty",
    brand: "Studio",
    price: 1999,
    discountPrice: 1399,
    stock: 35,
    sku: "DEMO-BEAUTY-006",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    tags: ["makeup", "brushes", "beauty", "cosmetics"],
    status: "PUBLISHED",
  },

  {
    title: "Gentle Facial Cleanser",
    slug: "demo-gentle-facial-cleanser",
    description:
      "Gentle daily cleanser created to fit easily into morning and evening skincare routines.",
    category: "Beauty",
    brand: "Pure Skin",
    price: 799,
    discountPrice: 599,
    stock: 58,
    sku: "DEMO-BEAUTY-007",
    image:
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8",
    tags: ["cleanser", "skincare", "face", "beauty"],
    status: "PUBLISHED",
  },

  {
    title: "Nourishing Body Lotion",
    slug: "demo-nourishing-body-lotion",
    description:
      "Smooth body lotion designed for everyday moisturizing and a comfortable skin feel.",
    category: "Beauty",
    brand: "Glow",
    price: 1099,
    discountPrice: 799,
    stock: 41,
    sku: "DEMO-BEAUTY-008",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b",
    tags: ["bodycare", "lotion", "beauty", "skincare"],
    status: "PUBLISHED",
  },

  {
    title: "Premium Beauty Collection",
    slug: "demo-premium-beauty-collection",
    description:
      "Curated beauty collection designed to elevate a modern everyday self-care routine.",
    category: "Beauty",
    brand: "Lumina",
    price: 3499,
    discountPrice: 2499,
    stock: 22,
    sku: "DEMO-BEAUTY-009",
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908",
    tags: ["beauty", "skincare", "collection", "premium"],
    status: "PUBLISHED",
  },

  {
    title: "Everyday Skincare Set",
    slug: "demo-everyday-skincare-set",
    description:
      "Simple skincare set combining everyday essentials for a convenient daily routine.",
    category: "Beauty",
    brand: "Pure Skin",
    price: 2799,
    discountPrice: 1999,
    stock: 26,
    sku: "DEMO-BEAUTY-010",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a",
    tags: ["skincare", "set", "beauty", "self-care"],
    status: "PUBLISHED",
  },

  // =========================================================
  // DRAFT TEST PRODUCT
  // This must NOT appear in the public storefront.
  // =========================================================

  {
    title: "Unreleased Prototype Sneakers",
    slug: "demo-unreleased-prototype-sneakers",
    description:
      "Internal demo record used to verify that draft products never appear in public product APIs.",
    category: "Shoes",
    brand: "Demo Lab",
    price: 9999,
    discountPrice: 6999,
    stock: 10,
    sku: "DEMO-DRAFT-001",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    tags: ["demo", "draft", "internal"],
    status: "DRAFT",
  },
];

// =========================================================
// SEED
// =========================================================

async function main() {
  console.log("\n🌱 Starting storefront seed...\n");

  // ---------------------------------------------------------
  // 1. Find existing seller
  // ---------------------------------------------------------

  const seller = await prisma.sellers.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!seller) {
    throw new Error(
      "No seller exists in the database. Create a seller account before running the product seed."
    );
  }

  console.log(
    `Seller: ${seller.shopName ?? seller.name} (${seller.email})`
  );

  console.log(`Seller ID: ${seller.id}\n`);

  // ---------------------------------------------------------
  // 2. Remove ONLY previous DEMO seed products
  //
  // This fixes Product_sku_key conflicts caused by the
  // previous 5-product seed.
  //
  // Real seller-created products are NOT deleted.
  // ---------------------------------------------------------

  console.log("Cleaning previous demo catalog...");

  const removedDemoProducts =
    await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: "DEMO-",
        },
      },
    });

  console.log(
    `Removed ${removedDemoProducts.count} previous demo products.\n`
  );

  // ---------------------------------------------------------
  // 3. Create the fresh demo catalog
  // ---------------------------------------------------------

  let created = 0;

  const categoryCounts: Record<string, number> = {
    Clothing: 0,
    Shoes: 0,
    Electronics: 0,
    Beauty: 0,
  };

  for (const product of products) {
    try {
      await prisma.product.create({
        data: {
          sellerId: seller.id,

          title: product.title,
          slug: product.slug,

          description: product.description,

          category: product.category,
          brand: product.brand,

          price: product.price,
          discountPrice: product.discountPrice,

          stock: product.stock,
          sku: product.sku,

          images: [
            {
              url: product.image,
              publicId: product.slug,
            },
          ],

          tags: product.tags,

          status: product.status,
        },
      });

      created += 1;

      if (product.status === "PUBLISHED") {
        categoryCounts[product.category] =
          (categoryCounts[product.category] ?? 0) + 1;
      }

      console.log(
        `✓ [${product.status}] [${product.category}] ${product.title}`
      );
    } catch (error) {
      console.error(
        `\n❌ Failed while creating: ${product.title}`
      );

      console.error(`SKU: ${product.sku}`);
      console.error(`Slug: ${product.slug}`);

      throw error;
    }
  }

  // ---------------------------------------------------------
  // 4. Verify database results
  // ---------------------------------------------------------

  const seededPublishedCount =
    await prisma.product.count({
      where: {
        sku: {
          startsWith: "DEMO-",
        },

        status: "PUBLISHED",
      },
    });

  const seededDraftCount =
    await prisma.product.count({
      where: {
        sku: {
          startsWith: "DEMO-",
        },

        status: "DRAFT",
      },
    });

  const allPublishedProducts =
    await prisma.product.count({
      where: {
        status: "PUBLISHED",
      },
    });

  // ---------------------------------------------------------
  // 5. Summary
  // ---------------------------------------------------------

  console.log("\n========================================");
  console.log("          STOREFRONT SEED COMPLETE");
  console.log("========================================");

  console.log(`Created records     : ${created}`);
  console.log("");

  console.log("Seeded categories:");
  console.log(
    `  Clothing          : ${categoryCounts.Clothing}`
  );
  console.log(
    `  Shoes             : ${categoryCounts.Shoes}`
  );
  console.log(
    `  Electronics       : ${categoryCounts.Electronics}`
  );
  console.log(
    `  Beauty            : ${categoryCounts.Beauty}`
  );

  console.log("");

  console.log(
    `Seeded published    : ${seededPublishedCount}`
  );

  console.log(
    `Seeded drafts       : ${seededDraftCount}`
  );

  console.log(
    `All DB published    : ${allPublishedProducts}`
  );

  console.log("========================================");

  if (seededPublishedCount !== 40) {
    console.warn(
      `\n⚠ Expected 40 seeded published products, found ${seededPublishedCount}.`
    );
  }

  if (seededDraftCount !== 1) {
    console.warn(
      `⚠ Expected 1 seeded draft product, found ${seededDraftCount}.`
    );
  }

  if (
    seededPublishedCount === 40 &&
    seededDraftCount === 1
  ) {
    console.log(
      "\n✅ Database verification successful."
    );

    console.log(
      "✅ 40 published demo products are ready."
    );

    console.log(
      "✅ 1 draft product exists for API security testing."
    );

    console.log(
      "✅ Existing non-DEMO products were preserved."
    );
  }

  console.log("");
}

// =========================================================
// RUN
// =========================================================

main()
  .catch((error) => {
    console.error("\n========================================");
    console.error("              SEED FAILED");
    console.error("========================================");

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });