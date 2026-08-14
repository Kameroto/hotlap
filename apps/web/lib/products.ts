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

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const relatedProducts:
    Product[] = [];

  const seenProductIds =
    new Set<string>([
      product.id,
    ]);

  function addProducts(
    products: Product[],
  ) {
    for (const candidate of products) {
      if (
        seenProductIds.has(
          candidate.id,
        )
      ) {
        continue;
      }

      seenProductIds.add(
        candidate.id,
      );
      relatedProducts.push(
        candidate,
      );

      if (
        relatedProducts.length ===
        limit
      ) {
        break;
      }
    }
  }

  const categoryResponse =
    await getAllProducts({
      category:
        product.category.slug,
      sort: "featured",
      pageSize: Math.min(
        limit + 1,
        48,
      ),
    });

  addProducts(
    categoryResponse.products,
  );

  if (
    relatedProducts.length <
    limit
  ) {
    try {
      const catalogueResponse =
        await getAllProducts({
          sort: "featured",
          pageSize: Math.min(
            limit * 3,
            48,
          ),
        });

      addProducts(
        catalogueResponse.products,
      );
    } catch {
      // Same-category recommendations remain useful if the fallback is unavailable.
    }
  }

  return relatedProducts;
}
