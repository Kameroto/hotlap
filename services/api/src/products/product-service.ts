import {
  ProductStatus,
  type Prisma,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";

import type {
  ProductQuery,
  ProductSort,
} from "./product-query-schema.js";

import {
  toProductResponse,
  type ProductListResponse,
  type ProductResponse,
} from "./product-response.js";

function buildProductWhere(
  query: ProductQuery,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
  };

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        brand: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        sku: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        shortDescription: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.category) {
    where.category = {
      slug: query.category,
      isActive: true,
    };
  }

  if (query.brand) {
    where.brand = {
      equals: query.brand,
      mode: "insensitive",
    };
  }

  if (
    query.minimumPrice !== undefined ||
    query.maximumPrice !== undefined
  ) {
    const priceFilter: Prisma.DecimalFilter =
      {};

    if (
      query.minimumPrice !== undefined
    ) {
      priceFilter.gte =
        query.minimumPrice;
    }

    if (
      query.maximumPrice !== undefined
    ) {
      priceFilter.lte =
        query.maximumPrice;
    }

    where.price = priceFilter;
  }

  if (query.inStock === true) {
    where.stockQuantity = {
      gt: 0,
    };
  }

  if (query.inStock === false) {
    where.stockQuantity = {
      lte: 0,
    };
  }

  if (query.featured !== undefined) {
    where.isFeatured =
      query.featured;
  }

  return where;
}

function buildProductOrderBy(
  sort: ProductSort,
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [
        {
          createdAt: "desc",
        },
      ];

    case "price-asc":
      return [
        {
          price: "asc",
        },
        {
          name: "asc",
        },
      ];

    case "price-desc":
      return [
        {
          price: "desc",
        },
        {
          name: "asc",
        },
      ];

    case "rating":
      return [
        {
          ratingAverage: "desc",
        },
        {
          reviewCount: "desc",
        },
      ];

    case "name":
      return [
        {
          name: "asc",
        },
      ];

    case "featured":
    default:
      return [
        {
          isFeatured: "desc",
        },
        {
          createdAt: "desc",
        },
      ];
  }
}

export async function listProducts(
  query: ProductQuery,
): Promise<ProductListResponse> {
  const where =
    buildProductWhere(query);

  const orderBy =
    buildProductOrderBy(query.sort);

  const skip =
    (query.page - 1) *
    query.pageSize;

  const [products, totalItems] =
    await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,

        include: {
          category: true,

          images: {
            orderBy: [
              {
                isPrimary: "desc",
              },
              {
                sortOrder: "asc",
              },
            ],
          },
        },
      }),

      prisma.product.count({
        where,
      }),
    ]);

  const totalPages = Math.ceil(
    totalItems / query.pageSize,
  );

  return {
    products: products.map(
      toProductResponse,
    ),

    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages,

      hasPreviousPage:
        query.page > 1,

      hasNextPage:
        query.page < totalPages,
    },

    filters: {
      search: query.search ?? null,
      category:
        query.category ?? null,
      brand: query.brand ?? null,

      minimumPrice:
        query.minimumPrice ?? null,

      maximumPrice:
        query.maximumPrice ?? null,

      inStock:
        query.inStock ?? null,

      featured:
        query.featured ?? null,

      sort: query.sort,
    },
  };
}

export async function listFeaturedProducts(
  limit: number,
): Promise<ProductResponse[]> {
  const products =
    await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      },

      orderBy: [
        {
          ratingAverage: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      take: limit,

      include: {
        category: true,

        images: {
          orderBy: [
            {
              isPrimary: "desc",
            },
            {
              sortOrder: "asc",
            },
          ],
        },
      },
    });

  return products.map(
    toProductResponse,
  );
}

export async function findProductBySlug(
  slug: string,
): Promise<ProductResponse | null> {
  const product =
    await prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.ACTIVE,
      },

      include: {
        category: true,

        images: {
          orderBy: [
            {
              isPrimary: "desc",
            },
            {
              sortOrder: "asc",
            },
          ],
        },
      },
    });

  return product
    ? toProductResponse(product)
    : null;
}