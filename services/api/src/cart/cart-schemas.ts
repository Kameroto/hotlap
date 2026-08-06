import { z } from "zod";

export const addCartItemBodySchema =
  z.object({
    productId: z
      .string()
      .uuid(
        "A valid product ID is required.",
      ),

    quantity: z.coerce
      .number()
      .int()
      .min(1)
      .max(99)
      .default(1),
  });

export const updateCartItemBodySchema =
  z.object({
    quantity: z.coerce
      .number()
      .int()
      .min(1)
      .max(99),
  });

export const productIdParamsSchema =
  z.object({
    productId: z
      .string()
      .uuid(
        "A valid product ID is required.",
      ),
  });

export const applyCouponBodySchema =
  z.object({
    code: z
      .string()
      .trim()
      .min(
        1,
        "Enter a coupon code.",
      )
      .max(50)
      .transform((value) =>
        value.toUpperCase(),
      ),
  });

export const mergeCartBodySchema =
  z.object({
    guestCartToken: z
      .string()
      .trim()
      .min(16)
      .max(200),
  });

export type AddCartItemBody =
  z.infer<
    typeof addCartItemBodySchema
  >;

export type UpdateCartItemBody =
  z.infer<
    typeof updateCartItemBodySchema
  >;

export type ProductIdParams =
  z.infer<
    typeof productIdParamsSchema
  >;

export type ApplyCouponBody =
  z.infer<
    typeof applyCouponBodySchema
  >;

export type MergeCartBody =
  z.infer<
    typeof mergeCartBodySchema
  >;