import cors from "@fastify/cors";
import Fastify from "fastify";

import { env } from "./config/env.js";
import { healthRoutes } from "./routes/health.js";

type ErrorResponse = {
  statusCode: number;
  error: string;
  message: string;
};

type NormalizedError = {
  statusCode: number;
  name: string;
  message: string;
};

function normalizeError(error: unknown): NormalizedError {
  if (!(error instanceof Error)) {
    return {
      statusCode: 500,
      name: "Internal Server Error",
      message: "An unexpected error occurred.",
    };
  }

  let statusCode = 500;

  if (
    "statusCode" in error &&
    typeof error.statusCode === "number" &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
  ) {
    statusCode = error.statusCode;
  }

  return {
    statusCode,
    name: error.name || "Error",
    message: error.message || "An unexpected error occurred.",
  };
}

export async function buildApp() {
  const logger =
    env.NODE_ENV === "development"
      ? {
          level: env.LOG_LEVEL,
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          },
        }
      : {
          level: env.LOG_LEVEL,
        };

  const app = Fastify({
    logger,
    disableRequestLogging: false,
  });

  await app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
    methods: [
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
  });

  app.get("/", async () => ({
    service: "HotLap API",
    version: "0.1.0",
    healthEndpoint: "/api/v1/health",
  }));

  await app.register(healthRoutes, {
    prefix: "/api/v1",
  });

  app.setNotFoundHandler(async (request, reply) => {
    const response: ErrorResponse = {
      statusCode: 404,
      error: "Not Found",
      message: `Route ${request.method} ${request.url} was not found.`,
    };

    return reply.code(404).send(response);
  });

  app.setErrorHandler(async (error, request, reply) => {
    const normalizedError = normalizeError(error);

    request.log.error(
      {
        error,
        statusCode: normalizedError.statusCode,
      },
      "Request failed",
    );

    const response: ErrorResponse = {
      statusCode: normalizedError.statusCode,

      error:
        normalizedError.statusCode >= 500
          ? "Internal Server Error"
          : normalizedError.name,

      message:
        normalizedError.statusCode >= 500 &&
        env.NODE_ENV === "production"
          ? "An unexpected error occurred."
          : normalizedError.message,
    };

    return reply
      .code(normalizedError.statusCode)
      .send(response);
  });

  return app;
}