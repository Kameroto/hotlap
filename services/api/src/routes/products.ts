import type {
  FastifyPluginAsync,
} from "fastify";

import {
  featuredProductsQuerySchema,
  productQuerySchema,
} from "../products/product-query-schema.js";

import {
  findProductBySlug,
  listFeaturedProducts,
  listProducts,
} from "../products/product-service.js";

import { ApiError } from "../utils/api-error.js";

type ProductSlugParams = {
  slug: string;
};

export const productRoutes: FastifyPluginAsync =
  async (app) => {
    app.get<{
      Querystring: Record<
        string,
        unknown
      >;
    }>(
      "/products",
      async (request) => {
        const parsedQuery =
          productQuerySchema.safeParse(
            request.query,
          );

        if (!parsedQuery.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_PRODUCT_QUERY",
            message:
              "The product filters are invalid.",

            details:
              parsedQuery.error.flatten()
                .fieldErrors,
          });
        }

        return listProducts(
          parsedQuery.data,
        );
      },
    );

    app.get<{
      Querystring: Record<
        string,
        unknown
      >;
    }>(
      "/products/featured",
      async (request) => {
        const parsedQuery =
          featuredProductsQuerySchema.safeParse(
            request.query,
          );

        if (!parsedQuery.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_FEATURED_PRODUCT_QUERY",
            message:
              "The featured-product request is invalid.",

            details:
              parsedQuery.error.flatten()
                .fieldErrors,
          });
        }

        const products =
          await listFeaturedProducts(
            parsedQuery.data.limit,
          );

        return {
          products,
          totalItems:
            products.length,
        };
      },
    );

    app.get<{
      Params: ProductSlugParams;
    }>(
      "/products/:slug",
      async (request) => {
        const slug =
          request.params.slug.trim();

        if (!slug) {
          throw new ApiError({
            statusCode: 400,
            code:
              "PRODUCT_SLUG_REQUIRED",
            message:
              "A product slug is required.",
          });
        }

        const product =
          await findProductBySlug(
            slug,
          );

        if (!product) {
          throw new ApiError({
            statusCode: 404,
            code:
              "PRODUCT_NOT_FOUND",
            message:
              "The requested product was not found.",
          });
        }

        return {
          product,
        };
      },
    );
  };