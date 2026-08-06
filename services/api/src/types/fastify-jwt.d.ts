import type {
  AccessTokenPayload,
} from "../auth/auth-types.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AccessTokenPayload;
    user: AccessTokenPayload;
  }
}