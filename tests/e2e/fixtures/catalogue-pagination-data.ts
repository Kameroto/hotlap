import type { CategoriesResponse } from '../../../apps/web/lib/api/types';
import type { Product } from '../../../apps/web/types/product';

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

const categories = ['Alpha', 'Beta'].map((name, index) => ({
  id: `00000000-0000-4000-8000-00000000030${index + 1}`,
  name: `E2E Pagination ${name}`,
  slug: `e2e-pagination-${name.toLowerCase()}`,
}));

export const paginationProducts = freeze(Array.from({ length: 16 }, (_, index): Product => {
  const number = String(index + 1).padStart(2, '0');
  const day = String(16 - index).padStart(2, '0');
  const name = `E2E Pagination Product ${number}`;

  return {
    id: `00000000-0000-4000-8000-0000000040${number}`,
    name,
    slug: `e2e-pagination-product-${number}`,
    sku: `E2E-PAGINATION-${number}`,
    brand: 'E2E Fixture Brand',
    shortDescription: 'Fictional test-only product; not a real catalogue offer.',
    description: `Fictional test-only pagination record ${number}.${index < 13 ? ' Search token ORBIT.' : ''}`,
    price: (16 - index) * 100,
    compareAtPrice: null,
    currency: 'INR',
    stockQuantity: 20,
    isInStock: true,
    lowStockThreshold: 5,
    isFeatured: true,
    ratingAverage: 4,
    reviewCount: index + 1,
    specifications: {},
    badges: [],
    category: categories[index < 14 ? 0 : 1],
    images: [{
      id: `00000000-0000-4000-8000-0000000050${number}`,
      url: '/products/product-placeholder.svg',
      alt: `Fictional ${name} placeholder artwork`,
      sortOrder: 0,
      isPrimary: true,
    }],
    createdAt: `2026-01-${day}T00:00:00.000Z`,
    updatedAt: '2026-02-01T00:00:00.000Z',
  };
}));

export const paginationCategories = freeze({
  categories: categories.map((category, index) => ({
    ...category,
    description: 'Fictional test-only pagination category.',
    sortOrder: index + 1,
    productCount: paginationProducts.filter(product => product.category.id === category.id).length,
  })),
  totalItems: categories.length,
} satisfies CategoriesResponse);
