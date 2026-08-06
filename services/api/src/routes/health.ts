import type { FastifyPluginAsync } from "fastify";

import { env } from "../config/env.js";

type HealthResponse = {
  status: "ok";
  service: "hotlap-api";
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
};

export const healthRoutes: FastifyPluginAsync =
  async (app) => {
    app.get<{
      Reply: HealthResponse;
    }>(
      "/health",
      {
        schema: {
          response: {
            200: {
              type: "object",
              additionalProperties: false,

              required: [
                "status",
                "service",
                "environment",
                "timestamp",
                "uptimeSeconds",
              ],

              properties: {
                status: {
                  type: "string",
                  const: "ok",
                },

                service: {
                  type: "string",
                  const: "hotlap-api",
                },

                environment: {
                  type: "string",
                },

                timestamp: {
                  type: "string",
                  format: "date-time",
                },

                uptimeSeconds: {
                  type: "number",
                  minimum: 0,
                },
              },
            },
          },
        },
      },

      async () => ({
        status: "ok",
        service: "hotlap-api",
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      }),
    );
  };