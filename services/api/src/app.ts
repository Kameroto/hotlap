import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";

import { env } from "./config/env.js";

import { accountRoutes } from "./routes/account.js";
import { authRoutes } from "./routes/auth.js";
import { cartRoutes } from "./routes/cart.js";
import { categoryRoutes } from "./routes/categories.js";
import { databaseRoutes } from "./routes/database.js";
import { eventRoutes } from "./routes/events.js";
import { healthRoutes } from "./routes/health.js";
import { orderRoutes } from "./routes/orders.js";
import { productRoutes } from "./routes/products.js";
import { wishlistRoutes } from "./routes/wishlist.js";

import { ApiError } from "./utils/api-error.js";

type ErrorResponse = {
  statusCode: number;
  error: string;
  code: string;
  message: string;
  details?: unknown;
};

type NormalizedError = {
  statusCode: number;
  error: string;
  code: string;
  message: string;
  details?: unknown;
};

function normalizeError(
  error: unknown,
): NormalizedError {
  if (error instanceof ApiError) {
    return {
      statusCode:
        error.statusCode,

      error:
        error.name,

      code:
        error.code,

      message:
        error.message,

      ...(error.details !== undefined
        ? {
            details:
              error.details,
          }
        : {}),
    };
  }

  if (!(error instanceof Error)) {
    return {
      statusCode: 500,
      error:
        "Internal Server Error",
      code:
        "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected error occurred.",
    };
  }

  let statusCode = 500;

  if (
    "statusCode" in error &&
    typeof error.statusCode ===
      "number" &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
  ) {
    statusCode =
      error.statusCode;
  }

  return {
    statusCode,

    error:
      statusCode >= 500
        ? "Internal Server Error"
        : error.name,

    code:
      statusCode >= 500
        ? "INTERNAL_SERVER_ERROR"
        : "REQUEST_ERROR",

    message:
      error.message ||
      "An unexpected error occurred.",
  };
}

export async function buildApp() {
  const logger =
    env.NODE_ENV === "development"
      ? {
          level:
            env.LOG_LEVEL,

          transport: {
            target:
              "pino-pretty",

            options: {
              colorize: true,

              translateTime:
                "SYS:standard",

              ignore:
                "pid,hostname",
            },
          },
        }
      : {
          level:
            env.LOG_LEVEL,
        };

  const app = Fastify({
    logger,
    disableRequestLogging: false,
  });

  await app.register(cors, {
    origin:
      env.WEB_ORIGIN,

    credentials:
      true,

    methods: [
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Cart-Token",
    ],

    exposedHeaders: [
      "X-Cart-Token",
    ],
  });

  await app.register(cookie);

  await app.register(jwt, {
    secret:
      env.ACCESS_TOKEN_SECRET,
  });

  app.get("/", async () => ({
    service:
      "HotLap API",

    version:
      "0.7.0",

    endpoints: {
      health:
        "/api/v1/health",

      database:
        "/api/v1/database",

      authentication:
        "/api/v1/auth",

      account:
        "/api/v1/account",

      orders:
        "/api/v1/orders",

      categories:
        "/api/v1/categories",

      products:
        "/api/v1/products",

      featuredProducts:
        "/api/v1/products/featured",

      events:
        "/api/v1/events",

      cart:
        "/api/v1/cart",

      wishlist:
        "/api/v1/wishlist",
    },
  }));

  await app.register(
    healthRoutes,
    {
      prefix:
        "/api/v1",
    },
  );

  await app.register(
    databaseRoutes,
    {
      prefix:
        "/api/v1",
    },
  );

  await app.register(
    authRoutes,
    {
      prefix:
        "/api/v1/auth",
    },
  );

  await app.register(
    accountRoutes,
    {
      prefix:
        "/api/v1/account",
    },
  );

  await app.register(
    categoryRoutes,
    {
      prefix:
        "/api/v1",
    },
  );

  await app.register(
    productRoutes,
    {
      prefix:
        "/api/v1",
    },
  );

  await app.register(
    eventRoutes,
    {
      prefix:
        "/api/v1",
    },
  );

  await app.register(
    cartRoutes,
    {
      prefix:
        "/api/v1",
    },
  );

  await app.register(
    wishlistRoutes,
    {
      prefix:
        "/api/v1",
    },
  );

  await app.register(
    orderRoutes,
    {
      prefix:
        "/api/v1",
    },
  );

  app.setNotFoundHandler(
    async (
      request,
      reply,
    ) => {
      const response: ErrorResponse = {
        statusCode: 404,
        error:
          "Not Found",

        code:
          "ROUTE_NOT_FOUND",

        message:
          `Route ${request.method} ${request.url} was not found.`,
      };

      return reply
        .code(404)
        .send(response);
    },
  );

  app.setErrorHandler(
    async (
      error,
      request,
      reply,
    ) => {
      const normalizedError =
        normalizeError(error);

      if (
        normalizedError.statusCode >=
        500
      ) {
        request.log.error(
          {
            error,

            statusCode:
              normalizedError.statusCode,
          },
          "Request failed",
        );
      } else {
        request.log.warn(
          {
            statusCode:
              normalizedError.statusCode,

            code:
              normalizedError.code,
          },
          "Request rejected",
        );
      }

      const response: ErrorResponse = {
        statusCode:
          normalizedError.statusCode,

        error:
          normalizedError.error,

        code:
          normalizedError.code,

        message:
          normalizedError.statusCode >=
            500 &&
          env.NODE_ENV === "production"
            ? "An unexpected error occurred."
            : normalizedError.message,

        ...(normalizedError.details !==
        undefined
          ? {
              details:
                normalizedError.details,
            }
          : {}),
      };

      return reply
        .code(
          normalizedError.statusCode,
        )
        .send(response);
    },
  );

  return app;
}
