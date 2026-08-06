import {
  ProductStatus,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";

export type CategoryResponse = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  productCount: number;
};

export async function listCategories(): Promise<
  CategoryResponse[]
> {
  const categories =
    await prisma.category.findMany({
      where: {
        isActive: true,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],

      include: {
        products: {
          where: {
            status:
              ProductStatus.ACTIVE,
          },

          select: {
            id: true,
          },
        },
      },
    });

  return categories.map(
    (category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,

      description:
        category.description,

      sortOrder: category.sortOrder,

      productCount:
        category.products.length,
    }),
  );
}