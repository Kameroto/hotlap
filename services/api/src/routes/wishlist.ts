import type {
  FastifyPluginAsync,
} from "fastify";

import { authenticateRequest } from "../auth/authenticate.js";

import {
  wishlistItemBodySchema,
  wishlistProductParamsSchema,
  type WishlistItemBody,
  type WishlistProductParams,
} from "../wishlist/wishlist-schemas.js";

import {
  addWishlistItem,
  getWishlist,
  removeWishlistItem,
} from "../wishlist/wishlist-service.js";

import { ApiError } from "../utils/api-error.js";

export const wishlistRoutes: FastifyPluginAsync =
  async (app) => {
    app.get(
      "/wishlist",
      {
        preHandler:
          authenticateRequest,
      },
      async (request) => {
        return getWishlist(
          request.user.sub,
        );
      },
    );

    app.post<{
      Body: WishlistItemBody;
    }>(
      "/wishlist/items",
      {
        preHandler:
          authenticateRequest,
      },
      async (request, reply) => {
        const parsedBody =
          wishlistItemBodySchema.safeParse(
            request.body,
          );

        if (!parsedBody.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_WISHLIST_ITEM",
            message:
              "The wishlist item is invalid.",
            details:
              parsedBody.error.flatten()
                .fieldErrors,
          });
        }

        const wishlist =
          await addWishlistItem({
            userId:
              request.user.sub,
            productId:
              parsedBody.data
                .productId,
          });

        return reply
          .code(201)
          .send(wishlist);
      },
    );

    app.delete<{
      Params: WishlistProductParams;
    }>(
      "/wishlist/items/:productId",
      {
        preHandler:
          authenticateRequest,
      },
      async (request) => {
        const parsedParams =
          wishlistProductParamsSchema.safeParse(
            request.params,
          );

        if (!parsedParams.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_PRODUCT_ID",
            message:
              "The product ID is invalid.",
          });
        }

        return removeWishlistItem({
          userId:
            request.user.sub,
          productId:
            parsedParams.data
              .productId,
        });
      },
    );
  };