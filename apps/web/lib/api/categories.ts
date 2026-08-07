import {
  apiRequest,
} from "@/lib/api/client";

import type {
  CategoriesResponse,
} from "@/lib/api/types";

export async function getCategories(): Promise<CategoriesResponse> {
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
}