import {
  cache,
} from "react";

import {
  apiRequest,
} from "@/lib/api/client";

import type {
  CategoriesResponse,
} from "@/lib/api/types";

export const getCategories = cache(async (): Promise<CategoriesResponse> => {
  return apiRequest<CategoriesResponse>(
    "/categories",
    {},
    {
      includeAuthentication:
        false,
      retryAfterRefresh:
        false,
    },
  );
});
