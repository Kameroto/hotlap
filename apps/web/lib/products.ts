import {
  ApiClientError,
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  type ProductListQuery,
} from "@/lib/api/client";

import type {
  Product,
  ProductListResponse,
} from "@/types/product";

export async function getAllProducts(
  query: ProductListQuery = {},
): Promise<ProductListResponse> {
  return getProducts(query);
}

export async function getFeaturedProductList(
  limit = 6,
): Promise<Product[]> {
  const response =
    await getFeaturedProducts(limit);

  return response.products;
}

export async function findProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    const response =
      await getProductBySlug(slug);

    return response.product;
  } catch (error) {
    if (
      error instanceof ApiClientError &&
      error.statusCode === 404
    ) {
      return null;
    }

    throw error;
  }
}