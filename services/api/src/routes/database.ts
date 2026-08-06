import type {
  FastifyPluginAsync,
} from "fastify";

import { prisma } from "../lib/prisma.js";

type DatabaseHealthResponse = {
  status: "ok";
  database: "connected";
  timestamp: string;
};

export const databaseRoutes: FastifyPluginAsync =
  async (app) => {
    app.get<{
      Reply: DatabaseHealthResponse;
    }>(
      "/database",
      {
        schema: {
          response: {
            200: {
              type: "object",
              additionalProperties: false,

              required: [
                "status",
                "database",
                "timestamp",
              ],

              properties: {
                status: {
                  type: "string",
                  const: "ok",
                },

                database: {
                  type: "string",
                  const: "connected",
                },

                timestamp: {
                  type: "string",
                  format: "date-time",
                },
              },
            },
          },
        },
      },

      async () => {
        await prisma.$queryRaw`SELECT 1`;

        return {
          status: "ok",
          database: "connected",
          timestamp: new Date().toISOString(),
        };
      },
    );
  };