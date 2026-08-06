import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { ApiError } from "../utils/api-error.js";

export async function authenticateRequest(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw new ApiError({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message:
        "A valid access token is required.",
    });
  }
}