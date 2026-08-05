export type ProductCategory =
  | "rc-cars"
  | "spare-parts"
  | "batteries-chargers"
  | "electronics"
  | "wheels-tires"
  | "3d-printed-accessories"
  | "merchandise";

export type ProductBadge =
  | "new"
  | "featured"
  | "sale"
  | "best-seller";

export type Product = {
  id: string;
  slug: string;
  name: string;

  shortDescription: string;
  description: string;

  brand: string;
  category: ProductCategory;

  price: number;
  compareAtPrice?: number;
  currency: "INR";

  sku: string;
  stockQuantity: number;

  rating: number;
  reviewCount: number;

  featured: boolean;
  badges: ProductBadge[];

  images: {
  id: string;
  url: string;
  alt: string;
}[];

  specifications: Record<string, string>;
};