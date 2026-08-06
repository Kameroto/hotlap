import { z } from "zod";

export const productSortValues = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "rating",
  "name",
] as const;

const optionalBooleanQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const productQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .max(120)
      .optional(),

    category: z
      .string()
      .trim()
      .max(100)
      .optional(),

    brand: z
      .string()
      .trim()
      .max(100)
      .optional(),

    minimumPrice: z.coerce
      .number()
      .nonnegative()
      .optional(),

    maximumPrice: z.coerce
      .number()
      .nonnegative()
      .optional(),

    inStock: optionalBooleanQuery,

    featured: optionalBooleanQuery,

    sort: z
      .enum(productSortValues)
      .default("featured"),

    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1),

    pageSize: z.coerce
      .number()
      .int()
      .min(1)
      .max(48)
      .default(12),
  })
  .refine(
    (query) =>
      query.minimumPrice === undefined ||
      query.maximumPrice === undefined ||
      query.minimumPrice <= query.maximumPrice,
    {
      message:
        "minimumPrice cannot be greater than maximumPrice.",
      path: ["maximumPrice"],
    },
  );

export const featuredProductsQuerySchema =
  z.object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(24)
      .default(8),
  });

export type ProductQuery = z.infer<
  typeof productQuerySchema
>;

export type FeaturedProductsQuery = z.infer<
  typeof featuredProductsQuerySchema
>;

export type ProductSort =
  (typeof productSortValues)[number];