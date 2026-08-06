import type { FastifyRequest } from "fastify";

import { ApiError } from "../utils/api-error.js";

export async function getOptionalUserId(
  request: FastifyRequest,
): Promise<string | null> {
  const authorization =
    request.headers.authorization;

  if (!authorization) {
    return null;
  }

  if (
    !authorization.startsWith("Bearer ")
  ) {
    throw new ApiError({
      statusCode: 401,
      code: "INVALID_AUTHORIZATION_HEADER",
      message:
        "The authorization header is invalid.",
    });
  }

  try {
    await request.jwtVerify();

    return request.user.sub;
  } catch {
    throw new ApiError({
      statusCode: 401,
      code: "INVALID_ACCESS_TOKEN",
      message:
        "The supplied access token is invalid or expired.",
    });
  }
}