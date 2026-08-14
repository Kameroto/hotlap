import { z } from "zod";

export const deliveryAddressSchema =
  z.object({
    recipientName: z
      .string()
      .trim()
      .min(
        2,
        "Enter the recipient name.",
      )
      .max(150),

    phone: z
      .string()
      .trim()
      .regex(
        /^[6-9]\d{9}$/,
        "Enter a valid 10-digit Indian mobile number.",
      ),

    addressLine1: z
      .string()
      .trim()
      .min(
        5,
        "Enter a complete delivery address.",
      )
      .max(250),

    addressLine2: z
      .string()
      .trim()
      .max(250)
      .nullable()
      .optional(),

    city: z
      .string()
      .trim()
      .min(2)
      .max(100),

    state: z
      .string()
      .trim()
      .min(2)
      .max(100),

    postalCode: z
      .string()
      .trim()
      .regex(
        /^[1-9]\d{5}$/,
        "Enter a valid 6-digit Indian PIN code.",
      ),

    country: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .default("India"),
  });

export const createOrderBodySchema =
  z.object({
    directPurchase: z
      .object({
        productId: z
          .string()
          .uuid(
            "A valid product ID is required.",
          ),

        quantity: z
          .literal(1),
      })
      .optional(),

    addressId: z
      .string()
      .uuid(
        "A valid saved address ID is required.",
      )
      .nullable()
      .optional(),

    deliveryAddress:
      deliveryAddressSchema
        .nullable()
        .optional(),

    shippingMethod: z.enum([
      "STANDARD",
      "EXPRESS",
    ]),

    paymentMethod: z.enum([
      "CASH_ON_DELIVERY",
      "UPI",
      "CARD",
      "NET_BANKING",
      "WALLET",
    ]),

    notes: z
      .string()
      .trim()
      .max(
        500,
        "Order notes cannot exceed 500 characters.",
      )
      .nullable()
      .optional(),
  })
  .refine(
    (value) =>
      Boolean(
        value.addressId ||
          value.deliveryAddress,
      ),
    {
      message:
        "Select a saved address or provide a delivery address.",
      path: ["deliveryAddress"],
    },
  );

export const orderIdParamsSchema =
  z.object({
    orderId: z
      .string()
      .trim()
      .min(
        1,
        "An order ID is required.",
      )
      .max(100),
  });

export type DeliveryAddress =
  z.infer<
    typeof deliveryAddressSchema
  >;

export type CreateOrderBody =
  z.infer<
    typeof createOrderBodySchema
  >;

export type OrderIdParams =
  z.infer<
    typeof orderIdParamsSchema
  >;
