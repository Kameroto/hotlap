import type {
  FastifyPluginAsync,
} from "fastify";

import {
  authenticateRequest,
} from "../auth/authenticate.js";

import {
  createOrderBodySchema,
  orderIdParamsSchema,
  type CreateOrderBody,
  type OrderIdParams,
} from "../orders/order-schemas.js";

import {
  createOrder,
  getOrderDetails,
  getOrders,
} from "../orders/order-service.js";

import {
  ApiError,
} from "../utils/api-error.js";

export const orderRoutes: FastifyPluginAsync =
  async (app) => {
    app.addHook(
      "preHandler",
      authenticateRequest,
    );

    app.get(
      "/orders",
      async (request) => {
        return getOrders(
          request.user.sub,
        );
      },
    );

    app.get<{
      Params: OrderIdParams;
    }>(
      "/orders/:orderId",
      async (request) => {
        const parsedParams =
          orderIdParamsSchema.safeParse(
            request.params,
          );

        if (!parsedParams.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_ORDER_ID",
            message:
              "The order ID is invalid.",
          });
        }

        return getOrderDetails({
          userId:
            request.user.sub,

          orderId:
            parsedParams.data.orderId,
        });
      },
    );

    app.post<{
      Body: CreateOrderBody;
    }>(
      "/orders",
      async (request, reply) => {
        const parsedBody =
          createOrderBodySchema.safeParse(
            request.body,
          );

        if (!parsedBody.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_ORDER_INFORMATION",
            message:
              "The checkout information is invalid.",

            details:
              parsedBody.error.flatten()
                .fieldErrors,
          });
        }

        const order =
          await createOrder({
            userId:
              request.user.sub,

            information:
              parsedBody.data,
          });

        return reply
          .code(201)
          .send(order);
      },
    );
  };
