export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProductBadge =
  | "new"
  | "featured"
  | "sale"
  | "best-seller"
  | string;

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type Product = {
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

  specifications: Record<
    string,
    string
  >;

  badges: ProductBadge[];

  category: ProductCategory;

  images: ProductImage[];

  createdAt: string;
  updatedAt: string;
};

export type ProductListResponse = {
  products: Product[];

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

export type FeaturedProductsResponse = {
  products: Product[];
  totalItems: number;
};

export type ProductDetailsResponse = {
  product: Product;
};