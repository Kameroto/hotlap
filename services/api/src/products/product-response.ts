import type { Prisma } from "../generated/prisma/client.js";

export type ProductImageResponse = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductCategoryResponse = {
  id: string;
  name: string;
  slug: string;
};

export type ProductResponse = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  shortDescription: string;
  description: string;

  price: number;
  compareAtPrice: number | null;
  currency: string;

  stockQuantity: number;
  isInStock: boolean;
  lowStockThreshold: number;

  isFeatured: boolean;
  ratingAverage: number;
  reviewCount: number;

  specifications: unknown;
  badges: string[];

  category: ProductCategoryResponse;
  images: ProductImageResponse[];

  createdAt: string;
  updatedAt: string;
};

export type ProductListResponse = {
  products: ProductResponse[];

  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };

  filters: {
    search: string | null;
    category: string | null;
    brand: string | null;
    minimumPrice: number | null;
    maximumPrice: number | null;
    inStock: boolean | null;
    featured: boolean | null;
    sort: string;
  };
};

export type ProductWithRelations =
  Prisma.ProductGetPayload<{
    include: {
      category: true;
      images: true;
    };
  }>;

export function toProductResponse(
  product: ProductWithRelations,
): ProductResponse {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand,
    shortDescription:
      product.shortDescription,
    description: product.description,

    price: product.price.toNumber(),

    compareAtPrice:
      product.compareAtPrice?.toNumber() ??
      null,

    currency: product.currency,

    stockQuantity: product.stockQuantity,

    isInStock:
      product.stockQuantity > 0,

    lowStockThreshold:
      product.lowStockThreshold,

    isFeatured: product.isFeatured,

    ratingAverage:
      product.ratingAverage.toNumber(),

    reviewCount: product.reviewCount,

    specifications:
      product.specifications,

    badges: product.badges,

    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },

    images: product.images
      .toSorted(
        (firstImage, secondImage) =>
          firstImage.sortOrder -
          secondImage.sortOrder,
      )
      .map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      })),

    createdAt:
      product.createdAt.toISOString(),

    updatedAt:
      product.updatedAt.toISOString(),
  };
}