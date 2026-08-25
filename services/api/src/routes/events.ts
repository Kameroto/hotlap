import type {
  FastifyPluginAsync,
} from "fastify";

import {
  eventQuerySchema,
} from "../events/event-query-schema.js";

import {
  findPublicEventBySlug,
  listEvents,
} from "../events/event-service.js";

import { ApiError } from "../utils/api-error.js";

type EventSlugParams = {
  slug: string;
};

export const eventRoutes: FastifyPluginAsync =
  async (app) => {
    app.get<{
      Querystring: Record<
        string,
        unknown
      >;
    }>(
      "/events",
      async (request) => {
        const parsedQuery =
          eventQuerySchema.safeParse(
            request.query,
          );

        if (!parsedQuery.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_EVENT_QUERY",
            message:
              "The event filters are invalid.",
            details:
              parsedQuery.error.flatten()
                .fieldErrors,
          });
        }

        const events = await listEvents(
          parsedQuery.data,
        );

        return {
          events,
          totalItems: events.length,
          scope: parsedQuery.data.scope,
        };
      },
    );

    app.get<{
      Params: EventSlugParams;
    }>(
      "/events/:slug",
      async (request) => {
        const slug =
          request.params.slug.trim();

        if (!slug) {
          throw new ApiError({
            statusCode: 404,
            code: "EVENT_NOT_FOUND",
            message:
              "The requested event was not found.",
          });
        }

        const event =
          await findPublicEventBySlug(
            slug,
          );

        if (!event) {
          throw new ApiError({
            statusCode: 404,
            code: "EVENT_NOT_FOUND",
            message:
              "The requested event was not found.",
          });
        }

        return {
          event,
        };
      },
    );
  };
