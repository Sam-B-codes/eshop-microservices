import type { Prisma, ProductStatus } from "@prisma/client";

import { NotFoundError, ValidationError } from "@org/error-handler";

import prisma from "@org/prisma";

import {
  sendProductPublishedEvent,
  sendProductViewedEvent,
} from "./product-event.service";

export interface CreateProductDTO {
  title: string;
  description: string;
  category: string;
  brand?: string;

  price: number;
  discountPrice?: number | null;

  stock: number;
  sku?: string;

  status: "DRAFT" | "PUBLISHED";

  images: {
    url: string;
    publicId: string;
  }[];

  tags: string[];
  sellerId: string;
}

export interface PublicProductQuery {
  page: number;
  limit: number;

  search?: string;
  category?: string;
  brand?: string;

  minPrice?: number;
  maxPrice?: number;

  availability?: "IN_STOCK" | "OUT_OF_STOCK";

  sort?: "newest" | "price-low" | "price-high";
}

interface SellerProductQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  category?: string;
}

const generateSlug = (title: string) => {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Date.now()
  );
};

const normalizeDiscountPrice = (
  price: number,
  discountPrice?: number | null,
): number | null => {
  if (
    discountPrice !== null &&
    discountPrice !== undefined &&
    Number.isFinite(discountPrice) &&
    discountPrice >= 0 &&
    discountPrice < price
  ) {
    return discountPrice;
  }

  return null;
};

const calculateSalePrice = (
  price: number,
  discountPrice?: number | null,
): number => {
  return normalizeDiscountPrice(price, discountPrice) ?? price;
};

const calculateDiscountPercentage = (price: number, salePrice: number) => {
  if (price <= 0 || salePrice < 0 || salePrice >= price) {
    return 0;
  }

  return Math.round(((price - salePrice) / price) * 100);
};

const PRODUCT_STATUSES: ProductStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "OUT_OF_STOCK",
  "ARCHIVED",
];

const isProductStatus = (value: string): value is ProductStatus => {
  return PRODUCT_STATUSES.includes(value as ProductStatus);
};

// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProduct = async (data: CreateProductDTO) => {
  const normalizedDiscountPrice = normalizeDiscountPrice(
    data.price,
    data.discountPrice,
  );

  const salePrice = calculateSalePrice(data.price, normalizedDiscountPrice);

  const product =
  await prisma.product.create({
    data: {
      sellerId: data.sellerId,
      title: data.title,
      slug: generateSlug(data.title),
      description: data.description,
      category: data.category,
      brand: data.brand,
      price: data.price,

      discountPrice: normalizedDiscountPrice,

      salePrice,
      stock: data.stock,
      sku: data.sku,
      images: data.images,
      tags: data.tags,
      status: data.status,
    },
  });

  if (
  product.status ===
  "PUBLISHED"
) {
  await sendProductPublishedEvent(
    product
  );
}

return product;
};

// ======================================================
// SELLER PRODUCTS
// ======================================================

export const getSellerProducts = async (
  sellerId: string,
  query: SellerProductQuery,
) => {
  const safePage = Math.max(Math.floor(query.page), 1);

  const safeLimit = Math.min(Math.max(Math.floor(query.limit), 1), 50);

  const where: Prisma.ProductWhereInput = {
    sellerId,
  };

  const search = query.search?.trim();

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        brand: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.status && isProductStatus(query.status)) {
    where.status = query.status;
  }

  const category = query.category?.trim();

  if (category) {
    where.category = category;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,

      skip: (safePage - 1) * safeLimit,

      take: safeLimit,

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.product.count({
      where,
    }),
  ]);

  return {
    products,
    total,
    page: safePage,
    limit: safeLimit,

    pages: Math.ceil(total / safeLimit),
  };
};

// ======================================================
// PUBLIC PRODUCT FILTER METADATA
// ======================================================

export const getPublicProductFilters = async () => {
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
    },

    select: {
      category: true,
      brand: true,
      salePrice: true,
      stock: true,
    },
  });

  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ].sort();

  const brands = [
    ...new Set(
      products
        .map((product) => product.brand)
        .filter((value): value is string => Boolean(value?.trim())),
    ),
  ].sort();

  const effectivePrices = products.map((product) => product.salePrice);

  const minPrice =
    effectivePrices.length > 0 ? Math.floor(Math.min(...effectivePrices)) : 0;

  const maxPrice =
    effectivePrices.length > 0 ? Math.ceil(Math.max(...effectivePrices)) : 0;

  return {
    categories,
    brands,

    priceRange: {
      min: minPrice,
      max: maxPrice,
    },

    availability: {
      inStock: products.filter((product) => product.stock > 0).length,

      outOfStock: products.filter((product) => product.stock <= 0).length,
    },
  };
};

// ======================================================
// PUBLIC CUSTOMER PRODUCTS
// ======================================================

export const getPublicProducts = async (query: PublicProductQuery) => {
  const {
    page,
    limit,
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    availability,
    sort,
  } = query;

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
  };

  const cleanSearch = search?.trim();

  if (cleanSearch) {
    where.OR = [
      {
        title: {
          contains: cleanSearch,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: cleanSearch,
          mode: "insensitive",
        },
      },
      {
        brand: {
          contains: cleanSearch,
          mode: "insensitive",
        },
      },
      {
        category: {
          contains: cleanSearch,
          mode: "insensitive",
        },
      },
    ];
  }

  const cleanCategory = category?.trim();

  if (cleanCategory) {
    where.category = {
      equals: cleanCategory,
      mode: "insensitive",
    };
  }

  const cleanBrand = brand?.trim();

  if (cleanBrand) {
    where.brand = {
      equals: cleanBrand,
      mode: "insensitive",
    };
  }

  if (availability === "IN_STOCK") {
    where.stock = {
      gt: 0,
    };
  }

  if (availability === "OUT_OF_STOCK") {
    where.stock = {
      lte: 0,
    };
  }

  const hasMinPrice =
    typeof minPrice === "number" && Number.isFinite(minPrice) && minPrice >= 0;

  const hasMaxPrice =
    typeof maxPrice === "number" && Number.isFinite(maxPrice) && maxPrice >= 0;

  if (hasMinPrice || hasMaxPrice) {
    const salePriceFilter: Prisma.FloatFilter = {};

    if (hasMinPrice) {
      salePriceFilter.gte = minPrice;
    }

    if (hasMaxPrice) {
      salePriceFilter.lte = maxPrice;
    }

    where.salePrice = salePriceFilter;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = {
    createdAt: "desc",
  };

  if (sort === "price-low") {
    orderBy = {
      salePrice: "asc",
    };
  } else if (sort === "price-high") {
    orderBy = {
      salePrice: "desc",
    };
  }

  const safePage = Math.max(Math.floor(page), 1);

  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 50);

  const skip = (safePage - 1) * safeLimit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy,

      select: {
        id: true,
        sellerId: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        brand: true,
        price: true,
        discountPrice: true,

        // Required by customer UI, cart consistency,
        // sorting and filtering.
        salePrice: true,

        stock: true,
        images: true,
        tags: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.product.count({
      where,
    }),
  ]);

  const customerProducts = products.map((product) => {
    const hasDiscount = product.salePrice < product.price;

    return {
      ...product,

      available: product.stock > 0,

      availability:
        product.stock > 0 ? ("IN_STOCK" as const) : ("OUT_OF_STOCK" as const),

      hasDiscount,

      discountPercentage: calculateDiscountPercentage(
        product.price,
        product.salePrice,
      ),
    };
  });

  return {
    products: customerProducts,

    pagination: {
      total,
      page: safePage,
      limit: safeLimit,

      pages: Math.ceil(total / safeLimit),
    },
  };
};

// ======================================================
// GET ONE PUBLIC PRODUCT BY SLUG
// ======================================================

// ======================================================
// GET ONE PUBLIC PRODUCT BY SLUG
// ======================================================

export const getPublicProductBySlug = async (
  slug: string
) => {
  const cleanSlug =
    slug.trim();

  if (!cleanSlug) {
    throw new NotFoundError(
      "Product not found"
    );
  }

  const product =
    await prisma.product.findFirst({
      where: {
        slug:
          cleanSlug,

        status:
          "PUBLISHED",
      },

      select: {
        id: true,
        sellerId: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        brand: true,
        price: true,
        discountPrice: true,
        salePrice: true,
        stock: true,
        images: true,
        tags: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  if (!product) {
    throw new NotFoundError(
      "Product not found"
    );
  }

  await sendProductViewedEvent(
    product
  );

  const hasDiscount =
    product.salePrice <
    product.price;

  return {
    ...product,

    available:
      product.stock > 0,

    availability:
      product.stock > 0
        ? ("IN_STOCK" as const)
        : ("OUT_OF_STOCK" as const),

    hasDiscount,

    discountPercentage:
      calculateDiscountPercentage(
        product.price,
        product.salePrice
      ),
  };
};

// ======================================================
// PUBLIC PRODUCT CATEGORIES
// ======================================================

export const getPublicProductCategories = async () => {
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
    },

    select: {
      category: true,
    },

    distinct: ["category"],

    orderBy: {
      category: "asc",
    },
  });

  return products.map((product) => product.category).filter(Boolean);
};

// ======================================================
// GET ONE SELLER PRODUCT
// ======================================================

export const getProductById = async (sellerId: string, id: string) => {
  return prisma.product.findFirst({
    where: {
      id,
      sellerId,
    },
  });
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProduct = async (
  sellerId: string,
  id: string,
  data: Partial<CreateProductDTO>,
) => {
  const product = await prisma.product.findFirst({
    where: {
      id,
      sellerId,
    },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const finalPrice = data.price !== undefined ? data.price : product.price;

  if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
    throw new ValidationError("Price must be greater than zero");
  }

  const requestedDiscountPrice =
    data.discountPrice !== undefined
      ? data.discountPrice
      : product.discountPrice;

  /*
   * If the seller explicitly submits an invalid discount,
   * reject it. When only the regular price changes and an
   * old discount becomes invalid, remove the old discount.
   */
  if (
    data.discountPrice !== undefined &&
    data.discountPrice !== null &&
    (!Number.isFinite(data.discountPrice) ||
      data.discountPrice < 0 ||
      data.discountPrice >= finalPrice)
  ) {
    throw new ValidationError(
      "Discount price must be non-negative and lower than the regular price",
    );
  }

  const finalDiscountPrice = normalizeDiscountPrice(
    finalPrice,
    requestedDiscountPrice,
  );

  const salePrice = calculateSalePrice(finalPrice, finalDiscountPrice);

  const { sellerId: _ignoredSellerId, ...safeData } = data;

  void _ignoredSellerId;

  const updatedProduct =
  await prisma.product.update({
    where: {
      id,
    },

    data: {
      ...safeData,

      discountPrice: finalDiscountPrice,

      salePrice,

      ...(data.title && {
        slug: generateSlug(data.title),
      }),
    },
  });

  if (
  product.status !==
    "PUBLISHED" &&
  updatedProduct.status ===
    "PUBLISHED"
) {
  await sendProductPublishedEvent(
    updatedProduct
  );
}

return updatedProduct;
};

// ======================================================
// DELETE PRODUCT
// ======================================================

export const deleteProduct = async (sellerId: string, id: string) => {
  const product = await prisma.product.findFirst({
    where: {
      id,
      sellerId,
    },

    select: {
      id: true,
    },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  await prisma.cartItem.deleteMany({
    where: {
      productId: id,
    },
  });

  await prisma.wishlistItem.deleteMany({
    where: {
      productId: id,
    },
  });

  await prisma.product.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
  };
};
