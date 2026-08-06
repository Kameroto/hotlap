import type {
  FastifyPluginAsync,
} from "fastify";

import {
  listCategories,
} from "../categories/category-service.js";

export const categoryRoutes: FastifyPluginAsync =
  async (app) => {
    app.get(
      "/categories",
      async () => {
        const categories =
          await listCategories();

        return {
          categories,
          totalItems:
            categories.length,
        };
      },
    );
  };