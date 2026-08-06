import type {
  FastifyPluginAsync,
} from "fastify";

import { authenticateRequest } from "../auth/authenticate.js";

import { resolveCartContext } from "../cart/cart-context.js";

import {
  addCartItemBodySchema,
  applyCouponBodySchema,
  mergeCartBodySchema,
  productIdParamsSchema,
  updateCartItemBodySchema,
  type AddCartItemBody,
  type ApplyCouponBody,
  type MergeCartBody,
  type ProductIdParams,
  type UpdateCartItemBody,
} from "../cart/cart-schemas.js";

import {
  addCartItem,
  applyCartCoupon,
  getCartResponse,
  mergeGuestCart,
  removeCartCoupon,
  removeCartItem,
  updateCartItem,
} from "../cart/cart-service.js";

import { ApiError } from "../utils/api-error.js";

export const cartRoutes: FastifyPluginAsync =
  async (app) => {
    app.get(
      "/cart",
      async (request, reply) => {
        const context =
          await resolveCartContext(
            request,
            reply,
          );

        return getCartResponse(
          context.cartId,
        );
      },
    );

    app.post<{
      Body: AddCartItemBody;
    }>(
      "/cart/items",
      async (request, reply) => {
        const parsedBody =
          addCartItemBodySchema.safeParse(
            request.body,
          );

        if (!parsedBody.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_CART_ITEM",
            message:
              "The cart item is invalid.",
            details:
              parsedBody.error.flatten()
                .fieldErrors,
          });
        }

        const context =
          await resolveCartContext(
            request,
            reply,
          );

        const cart =
          await addCartItem({
            cartId:
              context.cartId,

            productId:
              parsedBody.data
                .productId,

            quantity:
              parsedBody.data
                .quantity,
          });

        return reply
          .code(201)
          .send(cart);
      },
    );

    app.patch<{
      Params: ProductIdParams;
      Body: UpdateCartItemBody;
    }>(
      "/cart/items/:productId",
      async (request, reply) => {
        const parsedParams =
          productIdParamsSchema.safeParse(
            request.params,
          );

        const parsedBody =
          updateCartItemBodySchema.safeParse(
            request.body,
          );

        if (
          !parsedParams.success ||
          !parsedBody.success
        ) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_CART_UPDATE",
            message:
              "The cart update is invalid.",
          });
        }

        const context =
          await resolveCartContext(
            request,
            reply,
          );

        return updateCartItem({
          cartId:
            context.cartId,

          productId:
            parsedParams.data
              .productId,

          quantity:
            parsedBody.data
              .quantity,
        });
      },
    );

    app.delete<{
      Params: ProductIdParams;
    }>(
      "/cart/items/:productId",
      async (request, reply) => {
        const parsedParams =
          productIdParamsSchema.safeParse(
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

        const context =
          await resolveCartContext(
            request,
            reply,
          );

        return removeCartItem({
          cartId:
            context.cartId,

          productId:
            parsedParams.data
              .productId,
        });
      },
    );

    app.post<{
      Body: ApplyCouponBody;
    }>(
      "/cart/coupon",
      async (request, reply) => {
        const parsedBody =
          applyCouponBodySchema.safeParse(
            request.body,
          );

        if (!parsedBody.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_COUPON_CODE",
            message:
              "The coupon code is invalid.",
          });
        }

        const context =
          await resolveCartContext(
            request,
            reply,
          );

        return applyCartCoupon({
          cartId:
            context.cartId,

          code: parsedBody.data.code,
        });
      },
    );

    app.delete(
      "/cart/coupon",
      async (request, reply) => {
        const context =
          await resolveCartContext(
            request,
            reply,
          );

        return removeCartCoupon(
          context.cartId,
        );
      },
    );

    app.post<{
      Body: MergeCartBody;
    }>(
      "/cart/merge",
      {
        preHandler:
          authenticateRequest,
      },
      async (request) => {
        const parsedBody =
          mergeCartBodySchema.safeParse(
            request.body,
          );

        if (!parsedBody.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_CART_MERGE",
            message:
              "The guest cart token is invalid.",
          });
        }

        return mergeGuestCart({
          userId:
            request.user.sub,

          guestCartToken:
            parsedBody.data
              .guestCartToken,
        });
      },
    );
  };