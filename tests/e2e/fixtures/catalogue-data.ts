import type { CategoriesResponse } from '../../../apps/web/lib/api/types';
import type { Product } from '../../../apps/web/types/product';

// Fictional, in-memory records only. Never import these into production seeds.
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

const categories: CategoriesResponse['categories'] = ['Alpha', 'Beta'].map((name, index) => ({
  id: `00000000-0000-4000-8000-00000000010${index + 1}`,
  name: `E2E Fixture ${name}`,
  slug: `e2e-fixture-${name.toLowerCase()}`,
  description: 'Fictional test-only catalogue category.',
  sortOrder: index + 1,
  productCount: 3,
}));

const rows = [
  { name: 'Alder', category: 0, price: 300, day: '03', featured: true, rating: 3.2 },
  { name: 'Birch', category: 1, price: 100, day: '06', featured: false, rating: 4.1 },
  { name: 'Cedar', category: 0, price: 600, day: '01', featured: true, rating: 4.8 },
  { name: 'Dune', category: 1, price: 200, day: '05', featured: false, rating: 2.6 },
  { name: 'Elm', category: 0, price: 500, day: '02', featured: false, rating: 4.5 },
  { name: 'Fir', category: 1, price: 400, day: '04', featured: true, rating: 3.7 },
] as const;

export const catalogueProducts = freeze(rows.map((row, index): Product => {
  const category = categories[row.category];
  return {
    id: `00000000-0000-4000-8000-00000000000${index + 1}`,
    name: `E2E Catalogue ${row.name}`,
    slug: `e2e-catalogue-${row.name.toLowerCase()}`,
    sku: index === 4 ? 'E2E-ORBIT-E' : `E2E-CATALOGUE-${index + 1}`,
    brand: index === 1 ? 'E2E Orbit Brand' : 'E2E Fixture Brand',
    shortDescription: 'Fictional test-only product; not a real catalogue offer.',
    description: `Fictional test-only ${row.name} record.${index === 0 ? ' Search token orbit.' : ''}`,
    price: row.price,
    compareAtPrice: null,
    currency: 'INR',
    stockQuantity: 20,
    isInStock: true,
    lowStockThreshold: 5,
    isFeatured: row.featured,
    ratingAverage: row.rating,
    reviewCount: index + 11,
    specifications: {},
    badges: [],
    category: { id: category.id, name: category.name, slug: category.slug },
    images: [{
      id: `00000000-0000-4000-8000-00000000020${index + 1}`,
      url: '/products/product-placeholder.svg',
      alt: `Fictional E2E Catalogue ${row.name} placeholder artwork`,
      sortOrder: 0,
      isPrimary: true,
    }],
    createdAt: `2026-01-${row.day}T00:00:00.000Z`,
    updatedAt: '2026-02-01T00:00:00.000Z',
  };
}));

export const catalogueCategories = freeze({
  categories,
  totalItems: categories.length,
} satisfies CategoriesResponse);
