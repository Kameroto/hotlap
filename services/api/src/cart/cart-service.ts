import {
  DiscountType,
  ProductStatus,
  type Prisma,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";
import { toProductResponse } from "../products/product-response.js";
import { ApiError } from "../utils/api-error.js";

export type CartCouponResponse = {
  code: string;
  name: string;
  description: string | null;
  isValid: boolean;
  discountAmount: number;
  message: string;
};

export type CartResponse = {
  id: string;

  items: Array<{
    id: string;
    quantity: number;
    lineTotal: number;
    isPurchasable: boolean;
    product: ReturnType<
      typeof toProductResponse
    >;
  }>;

  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  totalBeforeShipping: number;

  coupon:
    | CartCouponResponse
    | null;

  updatedAt: string;
};

function roundCurrency(
  value: number,
): number {
  return (
    Math.round(
      (value +
        Number.EPSILON) *
        100,
    ) / 100
  );
}

type CouponDatabase = Pick<
  Prisma.TransactionClient,
  "coupon"
>;

export async function evaluateCoupon(
  couponCode: string | null,
  subtotal: number,
  database: CouponDatabase = prisma,
  evaluatedAt: Date = new Date(),
): Promise<CartCouponResponse | null> {
  if (!couponCode) {
    return null;
  }

  const coupon =
    await database.coupon.findUnique({
      where: {
        code: couponCode,
      },
    });

  if (!coupon) {
    return {
      code: couponCode,
      name: couponCode,
      description: null,
      isValid: false,
      discountAmount: 0,
      message:
        "This coupon no longer exists.",
    };
  }

  if (!coupon.isActive) {
    return {
      code: coupon.code,
      name: coupon.name,
      description:
        coupon.description,
      isValid: false,
      discountAmount: 0,
      message:
        "This coupon is inactive.",
    };
  }

  if (
    coupon.startsAt &&
    coupon.startsAt > evaluatedAt
  ) {
    return {
      code: coupon.code,
      name: coupon.name,
      description:
        coupon.description,
      isValid: false,
      discountAmount: 0,
      message:
        "This coupon is not active yet.",
    };
  }

  if (
    coupon.expiresAt &&
    coupon.expiresAt < evaluatedAt
  ) {
    return {
      code: coupon.code,
      name: coupon.name,
      description:
        coupon.description,
      isValid: false,
      discountAmount: 0,
      message:
        "This coupon has expired.",
    };
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usageCount >=
      coupon.usageLimit
  ) {
    return {
      code: coupon.code,
      name: coupon.name,
      description:
        coupon.description,
      isValid: false,
      discountAmount: 0,
      message:
        "This coupon has reached its usage limit.",
    };
  }

  const minimumSubtotal =
    coupon.minimumSubtotal.toNumber();

  if (subtotal < minimumSubtotal) {
    const amountRequired =
      roundCurrency(
        minimumSubtotal - subtotal,
      );

    return {
      code: coupon.code,
      name: coupon.name,
      description:
        coupon.description,
      isValid: false,
      discountAmount: 0,
      message: `Add ₹${amountRequired.toLocaleString(
        "en-IN",
      )} more to use this coupon.`,
    };
  }

  let discountAmount = 0;

  if (
    coupon.discountType ===
    DiscountType.PERCENTAGE
  ) {
    discountAmount =
      subtotal *
      (coupon.discountValue.toNumber() /
        100);
  } else {
    discountAmount =
      coupon.discountValue.toNumber();
  }

  if (
    coupon.maximumDiscount !== null
  ) {
    discountAmount = Math.min(
      discountAmount,
      coupon.maximumDiscount.toNumber(),
    );
  }

  discountAmount = roundCurrency(
    Math.min(
      discountAmount,
      subtotal,
    ),
  );

  return {
    code: coupon.code,
    name: coupon.name,
    description:
      coupon.description,
    isValid: true,
    discountAmount,
    message:
      "Coupon applied successfully.",
  };
}

export async function getCartResponse(
  cartId: string,
): Promise<CartResponse> {
  const cart =
    await prisma.cart.findUnique({
      where: {
        id: cartId,
      },

      include: {
        items: {
          orderBy: {
            createdAt: "asc",
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
        },
      },
    });

  if (!cart) {
    throw new ApiError({
      statusCode: 404,
      code: "CART_NOT_FOUND",
      message:
        "The requested cart was not found.",
    });
  }

  const items = cart.items.map(
    (item) => {
      const unitPrice =
        item.product.price.toNumber();

      return {
        id: item.id,
        quantity: item.quantity,

        isPurchasable:
          item.product.status ===
            ProductStatus.ACTIVE &&
          item.product.stockQuantity >
            0,

        lineTotal: roundCurrency(
          unitPrice * item.quantity,
        ),

        product: toProductResponse(
          item.product,
        ),
      };
    },
  );

  const totalQuantity =
    items.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  const subtotal = roundCurrency(
    items.reduce(
      (total, item) =>
        total + item.lineTotal,
      0,
    ),
  );

  const coupon =
    await evaluateCoupon(
      cart.appliedCouponCode,
      subtotal,
    );

  const discountAmount =
    coupon?.isValid
      ? coupon.discountAmount
      : 0;

  return {
    id: cart.id,
    items,
    totalQuantity,
    subtotal,
    discountAmount,

    totalBeforeShipping:
      roundCurrency(
        Math.max(
          subtotal -
            discountAmount,
          0,
        ),
      ),

    coupon,
    updatedAt:
      cart.updatedAt.toISOString(),
  };
}

async function findPurchasableProduct(
  productId: string,
) {
  const product =
    await prisma.product.findFirst({
      where: {
        id: productId,
        status: ProductStatus.ACTIVE,
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

  if (product.stockQuantity <= 0) {
    throw new ApiError({
      statusCode: 409,
      code: "PRODUCT_OUT_OF_STOCK",
      message:
        "This product is currently out of stock.",
    });
  }

  return product;
}

export async function addCartItem({
  cartId,
  productId,
  quantity,
}: {
  cartId: string;
  productId: string;
  quantity: number;
}): Promise<CartResponse> {
  const product =
    await findPurchasableProduct(
      productId,
    );

  await prisma.$transaction(
    async (transaction) => {
      const existingItem =
        await transaction.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId,
              productId,
            },
          },
        });

      const nextQuantity =
        (existingItem?.quantity ?? 0) +
        quantity;

      if (
        nextQuantity >
        product.stockQuantity
      ) {
        throw new ApiError({
          statusCode: 409,
          code:
            "INSUFFICIENT_STOCK",
          message: `Only ${product.stockQuantity} units are currently available.`,
        });
      }

      await transaction.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId,
            productId,
          },
        },

        update: {
          quantity: nextQuantity,
        },

        create: {
          cartId,
          productId,
          quantity: nextQuantity,
        },
      });
    },
  );

  return getCartResponse(cartId);
}

export async function updateCartItem({
  cartId,
  productId,
  quantity,
}: {
  cartId: string;
  productId: string;
  quantity: number;
}): Promise<CartResponse> {
  const product =
    await findPurchasableProduct(
      productId,
    );

  if (
    quantity >
    product.stockQuantity
  ) {
    throw new ApiError({
      statusCode: 409,
      code: "INSUFFICIENT_STOCK",
      message: `Only ${product.stockQuantity} units are currently available.`,
    });
  }

  const updated =
    await prisma.cartItem.updateMany({
      where: {
        cartId,
        productId,
      },

      data: {
        quantity,
      },
    });

  if (updated.count === 0) {
    throw new ApiError({
      statusCode: 404,
      code: "CART_ITEM_NOT_FOUND",
      message:
        "The product is not in this cart.",
    });
  }

  return getCartResponse(cartId);
}

export async function removeCartItem({
  cartId,
  productId,
}: {
  cartId: string;
  productId: string;
}): Promise<CartResponse> {
  await prisma.cartItem.deleteMany({
    where: {
      cartId,
      productId,
    },
  });

  return getCartResponse(cartId);
}

export async function applyCartCoupon({
  cartId,
  code,
}: {
  cartId: string;
  code: string;
}): Promise<CartResponse> {
  const currentCart =
    await getCartResponse(cartId);

  if (
    currentCart.items.length === 0
  ) {
    throw new ApiError({
      statusCode: 400,
      code: "EMPTY_CART",
      message:
        "Add products before applying a coupon.",
    });
  }

  const coupon =
    await evaluateCoupon(
      code,
      currentCart.subtotal,
    );

  if (!coupon || !coupon.isValid) {
    throw new ApiError({
      statusCode: 400,
      code: "INVALID_COUPON",
      message:
        coupon?.message ??
        "This coupon is invalid.",
    });
  }

  await prisma.cart.update({
    where: {
      id: cartId,
    },

    data: {
      appliedCouponCode: code,
    },
  });

  return getCartResponse(cartId);
}

export async function removeCartCoupon(
  cartId: string,
): Promise<CartResponse> {
  await prisma.cart.update({
    where: {
      id: cartId,
    },

    data: {
      appliedCouponCode: null,
    },
  });

  return getCartResponse(cartId);
}

export async function mergeGuestCart({
  userId,
  guestCartToken,
}: {
  userId: string;
  guestCartToken: string;
}): Promise<CartResponse> {
  const userCart =
    await prisma.cart.findFirst({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  const resolvedUserCart =
    userCart ??
    (await prisma.cart.create({
      data: {
        userId,
      },
    }));

  const guestCart =
    await prisma.cart.findUnique({
      where: {
        token: guestCartToken,
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

  if (
    !guestCart ||
    guestCart.userId !== null
  ) {
    throw new ApiError({
      statusCode: 404,
      code: "GUEST_CART_NOT_FOUND",
      message:
        "The guest cart was not found.",
    });
  }

  if (
    guestCart.id ===
    resolvedUserCart.id
  ) {
    return getCartResponse(
      resolvedUserCart.id,
    );
  }

  await prisma.$transaction(
    async (transaction) => {
      for (const guestItem of guestCart.items) {
        if (
          guestItem.product.status !==
            ProductStatus.ACTIVE ||
          guestItem.product
            .stockQuantity <= 0
        ) {
          continue;
        }

        const existingUserItem =
          await transaction.cartItem.findUnique({
            where: {
              cartId_productId: {
                cartId:
                  resolvedUserCart.id,
                productId:
                  guestItem.productId,
              },
            },
          });

        const mergedQuantity =
          Math.min(
            (existingUserItem?.quantity ??
              0) +
              guestItem.quantity,

            guestItem.product
              .stockQuantity,
          );

        await transaction.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId:
                resolvedUserCart.id,
              productId:
                guestItem.productId,
            },
          },

          update: {
            quantity:
              mergedQuantity,
          },

          create: {
            cartId:
              resolvedUserCart.id,
            productId:
              guestItem.productId,
            quantity:
              mergedQuantity,
          },
        });
      }

      if (
        !resolvedUserCart.appliedCouponCode &&
        guestCart.appliedCouponCode
      ) {
        await transaction.cart.update({
          where: {
            id: resolvedUserCart.id,
          },

          data: {
            appliedCouponCode:
              guestCart.appliedCouponCode,
          },
        });
      }

      await transaction.cart.delete({
        where: {
          id: guestCart.id,
        },
      });
    },
  );

  return getCartResponse(
    resolvedUserCart.id,
  );
}
