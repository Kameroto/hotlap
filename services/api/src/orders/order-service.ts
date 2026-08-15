import {
  randomUUID,
} from "node:crypto";

import {
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  ShippingMethod,
  type Prisma,
} from "../generated/prisma/client.js";

import {
  getCartResponse,
} from "../cart/cart-service.js";

import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

import type {
  CreateOrderBody,
  DeliveryAddress,
} from "./order-schemas.js";

const FREE_STANDARD_SHIPPING_THRESHOLD =
  5000;

const STANDARD_SHIPPING_COST = 199;
const EXPRESS_SHIPPING_COST = 499;

type StoredDeliveryAddress = {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type OrderWithDetails =
  Prisma.OrderGetPayload<{
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true;
            };
          };
        };
      };
      coupon: true;
    };
  }>;

function roundCurrency(
  value: number,
): number {
  return (
    Math.round(
      (value + Number.EPSILON) *
        100,
    ) / 100
  );
}

function createOrderNumber(): string {
  return `HL-${randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase()}`;
}

function getShippingCost(
  shippingMethod: ShippingMethod,
  subtotal: number,
): number {
  if (
    shippingMethod ===
    ShippingMethod.EXPRESS
  ) {
    return EXPRESS_SHIPPING_COST;
  }

  return subtotal >=
    FREE_STANDARD_SHIPPING_THRESHOLD
    ? 0
    : STANDARD_SHIPPING_COST;
}

function normalizeDeliveryAddress(
  address: DeliveryAddress,
): StoredDeliveryAddress {
  return {
    recipientName:
      address.recipientName,

    phone:
      address.phone,

    addressLine1:
      address.addressLine1,

    addressLine2:
      address.addressLine2 ??
      null,

    city:
      address.city,

    state:
      address.state,

    postalCode:
      address.postalCode,

    country:
      address.country,
  };
}

function parseStoredDeliveryAddress(
  value: Prisma.JsonValue,
): StoredDeliveryAddress {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new ApiError({
      statusCode: 500,
      code:
        "INVALID_ORDER_ADDRESS",
      message:
        "The stored order address is invalid.",
    });
  }

  const address =
    value as Record<
      string,
      Prisma.JsonValue
    >;

  function readRequiredString(
    key: keyof StoredDeliveryAddress,
  ): string {
    const field = address[key];

    if (typeof field !== "string") {
      throw new ApiError({
        statusCode: 500,
        code:
          "INVALID_ORDER_ADDRESS",
        message:
          "The stored order address is invalid.",
      });
    }

    return field;
  }

  const addressLine2Value =
    address.addressLine2;

  return {
    recipientName:
      readRequiredString(
        "recipientName",
      ),

    phone:
      readRequiredString("phone"),

    addressLine1:
      readRequiredString(
        "addressLine1",
      ),

    addressLine2:
      typeof addressLine2Value ===
      "string"
        ? addressLine2Value
        : null,

    city:
      readRequiredString("city"),

    state:
      readRequiredString("state"),

    postalCode:
      readRequiredString(
        "postalCode",
      ),

    country:
      readRequiredString(
        "country",
      ),
  };
}

function toOrderSummary(
  order: OrderWithDetails,
) {
  const totalQuantity =
    order.items.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  return {
    id: order.id,

    orderNumber:
      order.orderNumber,

    status:
      order.status,

    paymentStatus:
      order.paymentStatus,

    paymentMethod:
      order.paymentMethod,

    shippingMethod:
      order.shippingMethod,

    totalQuantity,

    total:
      order.total.toNumber(),

    placedAt:
      order.placedAt.toISOString(),

    updatedAt:
      order.updatedAt.toISOString(),

    items:
      order.items.map(
        (item) => ({
          id: item.id,

          productId:
            item.productId,

          productName:
            item.productName,

          productSlug:
            item.productSlug,

          sku:
            item.sku,

          quantity:
            item.quantity,

          unitPrice:
            item.unitPrice.toNumber(),

          lineTotal:
            item.lineTotal.toNumber(),

          productImageUrl:
            item.product?.images
              .sort(
                (first, second) => {
                  if (
                    first.isPrimary !==
                    second.isPrimary
                  ) {
                    return first.isPrimary
                      ? -1
                      : 1;
                  }

                  return (
                    first.sortOrder -
                    second.sortOrder
                  );
                },
              )[0]?.url ?? null,

          productImageAlt:
            item.product?.images
              .sort(
                (first, second) => {
                  if (
                    first.isPrimary !==
                    second.isPrimary
                  ) {
                    return first.isPrimary
                      ? -1
                      : 1;
                  }

                  return (
                    first.sortOrder -
                    second.sortOrder
                  );
                },
              )[0]?.alt ??
            item.productName,
        }),
      ),
  };
}

function toOrderDetails(
  order: OrderWithDetails,
) {
  return {
    ...toOrderSummary(order),

    customerEmail:
      order.customerEmail,

    customerPhone:
      order.customerPhone,

    customerName:
      order.customerName,

    deliveryAddress:
      parseStoredDeliveryAddress(
        order.deliveryAddress,
      ),

    subtotal:
      order.subtotal.toNumber(),

    discountAmount:
      order.discountAmount.toNumber(),

    shippingCost:
      order.shippingCost.toNumber(),

    taxAmount:
      order.taxAmount.toNumber(),

    total:
      order.total.toNumber(),

    coupon:
      order.coupon
        ? {
            code:
              order.coupon.code,

            name:
              order.coupon.name,
          }
        : null,

    notes:
      order.notes,

    placedAt:
      order.placedAt.toISOString(),

    confirmedAt:
      order.confirmedAt?.toISOString() ??
      null,

    shippedAt:
      order.shippedAt?.toISOString() ??
      null,

    deliveredAt:
      order.deliveredAt?.toISOString() ??
      null,

    cancelledAt:
      order.cancelledAt?.toISOString() ??
      null,

    createdAt:
      order.createdAt.toISOString(),

    updatedAt:
      order.updatedAt.toISOString(),
  };
}

async function getDeliveryAddress({
  userId,
  addressId,
  deliveryAddress,
}: {
  userId: string;
  addressId:
    | string
    | null
    | undefined;
  deliveryAddress:
    | DeliveryAddress
    | null
    | undefined;
}): Promise<{
  addressId: string | null;
  address: StoredDeliveryAddress;
}> {
  if (addressId) {
    const savedAddress =
      await prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

    if (!savedAddress) {
      throw new ApiError({
        statusCode: 404,
        code:
          "ADDRESS_NOT_FOUND",
        message:
          "The selected delivery address was not found.",
      });
    }

    return {
      addressId:
        savedAddress.id,

      address: {
        recipientName:
          savedAddress.recipientName,

        phone:
          savedAddress.phone,

        addressLine1:
          savedAddress.addressLine1,

        addressLine2:
          savedAddress.addressLine2,

        city:
          savedAddress.city,

        state:
          savedAddress.state,

        postalCode:
          savedAddress.postalCode,

        country:
          savedAddress.country,
      },
    };
  }

  if (!deliveryAddress) {
    throw new ApiError({
      statusCode: 400,
      code:
        "DELIVERY_ADDRESS_REQUIRED",
      message:
        "A delivery address is required.",
    });
  }

  return {
    addressId: null,

    address:
      normalizeDeliveryAddress(
        deliveryAddress,
      ),
  };
}

export async function createOrder({
  userId,
  information,
}: {
  userId: string;
  information: CreateOrderBody;
}) {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

  if (!user || !user.isActive) {
    throw new ApiError({
      statusCode: 404,
      code: "USER_NOT_FOUND",
      message:
        "The authenticated user no longer exists.",
    });
  }

  const resolvedAddress =
    await getDeliveryAddress({
      userId,

      addressId:
        information.addressId,

      deliveryAddress:
        information.deliveryAddress,
    });

  if (information.directPurchase) {
    const directPurchase =
      information.directPurchase;

    const createdOrder =
      await prisma.$transaction(
        async (transaction) => {
          const product =
            await transaction.product.findUnique({
              where: {
                id:
                  directPurchase.productId,
              },
            });

          if (
            !product ||
            product.status !==
              ProductStatus.ACTIVE
          ) {
            throw new ApiError({
              statusCode: 409,
              code:
                "PRODUCT_UNAVAILABLE",
              message:
                "The selected product is no longer available.",
            });
          }

          if (
            product.stockQuantity <
            directPurchase.quantity
          ) {
            throw new ApiError({
              statusCode: 409,
              code:
                "INSUFFICIENT_STOCK",
              message:
                `${product.name} is currently unavailable.`,
            });
          }

          const subtotal =
            roundCurrency(
              product.price.toNumber() *
                directPurchase.quantity,
            );

          const shippingCost =
            getShippingCost(
              information.shippingMethod,
              subtotal,
            );

          const taxAmount = 0;

          const total =
            roundCurrency(
              subtotal +
                shippingCost +
                taxAmount,
            );

          const inventoryUpdate =
            await transaction.product.updateMany({
              where: {
                id: product.id,
                status:
                  ProductStatus.ACTIVE,
                stockQuantity: {
                  gte:
                    directPurchase.quantity,
                },
              },

              data: {
                stockQuantity: {
                  decrement:
                    directPurchase.quantity,
                },
              },
            });

          if (
            inventoryUpdate.count !==
            1
          ) {
            throw new ApiError({
              statusCode: 409,
              code:
                "INSUFFICIENT_STOCK",
              message:
                `${product.name} is currently unavailable.`,
            });
          }

          return transaction.order.create({
            data: {
              orderNumber:
                createOrderNumber(),

              userId,

              addressId:
                resolvedAddress.addressId,

              couponId: null,

              status:
                OrderStatus.CONFIRMED,

              paymentStatus:
                PaymentStatus.PENDING,

              paymentMethod:
                information.paymentMethod,

              shippingMethod:
                information.shippingMethod,

              customerEmail:
                user.email,

              customerPhone:
                resolvedAddress.address
                  .phone,

              customerName:
                resolvedAddress.address
                  .recipientName,

              deliveryAddress:
                resolvedAddress.address,

              subtotal,
              discountAmount: 0,
              shippingCost,
              taxAmount,
              total,

              notes:
                information.notes ??
                null,

              confirmedAt:
                new Date(),

              items: {
                create: {
                  productId:
                    product.id,

                  productName:
                    product.name,

                  productSlug:
                    product.slug,

                  sku:
                    product.sku,

                  quantity:
                    directPurchase.quantity,

                  unitPrice:
                    product.price,

                  lineTotal:
                    subtotal,
                },
              },
            },
          });
        },
      );

    return getOrderDetails({
      userId,
      orderId:
        createdOrder.id,
    });
  }

  const cart =
    await prisma.cart.findFirst({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  if (!cart) {
    throw new ApiError({
      statusCode: 400,
      code: "EMPTY_CART",
      message:
        "Add products before placing an order.",
    });
  }

  const cartResponse =
    await getCartResponse(cart.id);

  if (
    cartResponse.items.length === 0
  ) {
    throw new ApiError({
      statusCode: 400,
      code: "EMPTY_CART",
      message:
        "Add products before placing an order.",
    });
  }

  if (
    cart.appliedCouponCode &&
    !cartResponse.coupon?.isValid
  ) {
    throw new ApiError({
      statusCode: 409,
      code:
        "CART_COUPON_INVALID",
      message:
        cartResponse.coupon?.message ??
        "The applied coupon is no longer valid. Review your cart before checkout.",
    });
  }

  const shippingCost =
    getShippingCost(
      information.shippingMethod,
      cartResponse.subtotal,
    );

  const taxAmount = 0;

  const total =
    roundCurrency(
      cartResponse.totalBeforeShipping +
        shippingCost +
        taxAmount,
    );

  const coupon =
    cart.appliedCouponCode &&
    cartResponse.coupon?.isValid
      ? await prisma.coupon.findUnique({
          where: {
            code:
              cart.appliedCouponCode,
          },
        })
      : null;

  const createdOrder =
    await prisma.$transaction(
      async (transaction) => {
        const cartWithItems =
          await transaction.cart.findUnique({
            where: {
              id: cart.id,
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
          !cartWithItems ||
          cartWithItems.items.length === 0
        ) {
          throw new ApiError({
            statusCode: 400,
            code: "EMPTY_CART",
            message:
              "Add products before placing an order.",
          });
        }

        for (
          const cartItem of
          cartWithItems.items
        ) {
          if (
            cartItem.product.status !==
            ProductStatus.ACTIVE
          ) {
            throw new ApiError({
              statusCode: 409,
              code:
                "PRODUCT_UNAVAILABLE",
              message:
                `${cartItem.product.name} is no longer available.`,
            });
          }

          if (
            cartItem.quantity >
            cartItem.product
              .stockQuantity
          ) {
            throw new ApiError({
              statusCode: 409,
              code:
                "INSUFFICIENT_STOCK",
              message:
                `Only ${cartItem.product.stockQuantity} units of ${cartItem.product.name} are currently available.`,
            });
          }
        }

        const order =
          await transaction.order.create({
            data: {
              orderNumber:
                createOrderNumber(),

              userId,

              addressId:
                resolvedAddress.addressId,

              couponId:
                coupon?.id ?? null,

              status:
                OrderStatus.CONFIRMED,

              paymentStatus:
                information.paymentMethod ===
                "CASH_ON_DELIVERY"
                  ? PaymentStatus.PENDING
                  : PaymentStatus.PENDING,

              paymentMethod:
                information.paymentMethod,

              shippingMethod:
                information.shippingMethod,

              customerEmail:
                user.email,

              customerPhone:
                resolvedAddress.address
                  .phone,

              customerName:
                resolvedAddress.address
                  .recipientName,

              deliveryAddress:
                resolvedAddress.address,

              subtotal:
                cartResponse.subtotal,

              discountAmount:
                cartResponse
                  .discountAmount,

              shippingCost,

              taxAmount,

              total,

              notes:
                information.notes ??
                null,

              confirmedAt:
                new Date(),

              items: {
                create:
                  cartWithItems.items.map(
                    (cartItem) => {
                      const unitPrice =
                        cartItem.product.price.toNumber();

                      return {
                        productId:
                          cartItem.productId,

                        productName:
                          cartItem.product.name,

                        productSlug:
                          cartItem.product.slug,

                        sku:
                          cartItem.product.sku,

                        quantity:
                          cartItem.quantity,

                        unitPrice,

                        lineTotal:
                          roundCurrency(
                            unitPrice *
                              cartItem.quantity,
                          ),
                      };
                    },
                  ),
              },
            },
          });

        for (
          const cartItem of
          cartWithItems.items
        ) {
          const inventoryUpdate =
            await transaction.product.updateMany({
              where: {
                id:
                  cartItem.productId,

                status:
                  ProductStatus.ACTIVE,

                stockQuantity: {
                  gte:
                    cartItem.quantity,
                },
              },

              data: {
                stockQuantity: {
                  decrement:
                    cartItem.quantity,
                },
              },
            });

          if (
            inventoryUpdate.count !==
            1
          ) {
            throw new ApiError({
              statusCode: 409,
              code:
                "INSUFFICIENT_STOCK",
              message:
                `${cartItem.product.name} is no longer available in the requested quantity.`,
            });
          }
        }

        if (coupon) {
          await transaction.coupon.update({
            where: {
              id: coupon.id,
            },

            data: {
              usageCount: {
                increment: 1,
              },
            },
          });
        }

        await transaction.cartItem.deleteMany({
          where: {
            cartId:
              cart.id,
          },
        });

        await transaction.cart.update({
          where: {
            id:
              cart.id,
          },

          data: {
            appliedCouponCode:
              null,
          },
        });

        return order;
      },
    );

  return getOrderDetails({
    userId,
    orderId:
      createdOrder.id,
  });
}

export async function getOrders(
  userId: string,
) {
  const orders =
    await prisma.order.findMany({
      where: {
        userId,
      },

      orderBy: {
        placedAt: "desc",
      },

      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },

        coupon: true,
      },
    });

  return {
    orders:
      orders.map(
        toOrderSummary,
      ),

    totalOrders:
      orders.length,
  };
}

export async function getOrderDetails({
  userId,
  orderId,
}: {
  userId: string;
  orderId: string;
}) {
  const order =
    await prisma.order.findFirst({
      where: {
        userId,

        OR: [
          {
            id:
              orderId,
          },
          {
            orderNumber:
              orderId,
          },
        ],
      },

      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },

        coupon: true,
      },
    });

  if (!order) {
    throw new ApiError({
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
      message:
        "The requested order was not found.",
    });
  }

  return {
    order:
      toOrderDetails(order),
  };
}
