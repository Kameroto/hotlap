import { z } from "zod";

export const wishlistItemBodySchema =
  z.object({
    productId: z
      .string()
      .uuid(
        "A valid product ID is required.",
      ),
  });

export const wishlistProductParamsSchema =
  z.object({
    productId: z
      .string()
      .uuid(
        "A valid product ID is required.",
      ),
  });

export type WishlistItemBody =
  z.infer<
    typeof wishlistItemBodySchema
  >;

export type WishlistProductParams =
  z.infer<
    typeof wishlistProductParamsSchema
  >;