import type { Product } from '../../../apps/web/types/product';
import { catalogueCategories, catalogueProducts } from './catalogue-data';

export const detailSlug = 'e2e-detail-discount';
export const unavailableDetailSlug = 'e2e-detail-upstream-error';
export const slowDetailSlug = 'e2e-detail-loading';
export const missingDetailSlug = 'e2e-detail-missing';

const rows = [
  ['discount', 'Discount', 120, 300, 450],
  ['low', 'Low Stock', 3, 200, null],
  ['soldout', 'Sold Out', 0, 100, null],
  ['single', 'Single Image', 8, 500, null],
  ['loading', 'Loading', 6, 600, null],
] as const;

// The source records are frozen. Copy nested values that differ in this profile.
export const detailProducts = Object.freeze(rows.map(([slug, title, stockQuantity, price, compareAtPrice], index): Product => {
  const base = catalogueProducts[index];
  const id = `00000000-0000-4000-8000-00000000070${index + 1}`;
  const images = index === 2 ? [] : [
    { id: `${id}-2`, url: '/products/wltoys-124019-01-primary.webp', alt: 'Fictional rear angle', sortOrder: 2, isPrimary: false },
    { id: `${id}-1`, url: '/products/mjx-hyper-go-14301-01-primary.webp', alt: 'Fictional primary angle', sortOrder: 3, isPrimary: true },
    { id: `${id}-3`, url: '/products/adjustable-rc-car-stand-01-primary.webp', alt: 'Fictional side angle', sortOrder: 1, isPrimary: false },
  ].slice(0, index === 0 ? 3 : 1).map(image => Object.freeze(image));
  return Object.freeze({
    ...base, id, slug: `e2e-detail-${slug}`, sku: `E2E-DETAIL-${index + 1}`, name: `E2E Detail ${title}`,
    brand: 'E2E Detail Brand', stockQuantity, isInStock: stockQuantity > 0, price, compareAtPrice,
    shortDescription: 'Fictional detail summary.', description: 'Fictional detail description for isolated browser coverage.',
    specifications: Object.freeze({ motorType: 'Synthetic brushless', scale: '1:14' }),
    images: Object.freeze(images) as Product['images'],
  });
}));

export const detailCategories = Object.freeze({
  ...catalogueCategories,
  categories: catalogueCategories.categories.map(category => Object.freeze({
    ...category, productCount: detailProducts.filter(product => product.category.id === category.id).length,
  })),
});
Object.freeze(detailCategories.categories);
