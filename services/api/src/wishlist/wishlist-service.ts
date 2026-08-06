import {
  ProductStatus,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";
import { toProductResponse } from "../products/product-response.js";
import { ApiError } from "../utils/api-error.js";

export async function getWishlist(
  userId: string,
) {
  const wishlistItems =
    await prisma.wishlistItem.findMany({
      where: {
        userId,

        product: {
          status:
            ProductStatus.ACTIVE,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        product: {
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
        },
      },
    });

  return {
    items: wishlistItems.map(
      (item) => ({
        id: item.id,

        addedAt:
          item.createdAt.toISOString(),

        product:
          toProductResponse(
            item.product,
          ),
      }),
    ),

    totalItems:
      wishlistItems.length,
  };
}

export async function addWishlistItem({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) {
  const product =
    await prisma.product.findFirst({
      where: {
        id: productId,
        status:
          ProductStatus.ACTIVE,
      },

      select: {
        id: true,
      },
    });

  if (!product) {
    throw new ApiError({
      statusCode: 404,
      code: "PRODUCT_NOT_FOUND",
      message:
        "The requested product was not found.",
    });
  }

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },

    update: {},

    create: {
      userId,
      productId,
    },
  });

  return getWishlist(userId);
}

export async function removeWishlistItem({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) {
  await prisma.wishlistItem.deleteMany({
    where: {
      userId,
      productId,
    },
  });

  return getWishlist(userId);
}