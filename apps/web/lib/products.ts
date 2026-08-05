import { products } from "@/data/products";
import type { Product, ProductCategory } from "@/types/product";

export function getAllProducts(): Product[] {
  return products;
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(
  category: ProductCategory,
): Product[] {
  return products.filter((product) => product.category === category);
}

export function getInStockProducts(): Product[] {
  return products.filter((product) => product.stockQuantity > 0);
}