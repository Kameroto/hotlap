import type {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  Prisma,
  UserRole,
} from "../generated/prisma/client.js";

import {
  loginBodySchema,
  registerBodySchema,
  type LoginBody,
  type RegisterBody,
} from "../auth/auth-schemas.js";

import type {
  AccessTokenPayload,
  AuthenticationResponse,
  PublicUser,
} from "../auth/auth-types.js";

import {
  hashPassword,
  verifyPassword,
} from "../auth/password.js";

import {
  createRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
} from "../auth/refresh-token.js";

import { authenticateRequest } from "../auth/authenticate.js";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

const GENERIC_LOGIN_ERROR =
  "The email address or password is incorrect.";

function toPublicUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  emailVerifiedAt: Date | null;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    emailVerifiedAt:
      user.emailVerifiedAt?.toISOString() ??
      null,
    createdAt: user.createdAt.toISOString(),
  };
}

function getRequestMetadata(
  request: FastifyRequest,
): {
  userAgent: string | null;
  ipAddress: string;
} {
  const userAgentHeader =
    request.headers["user-agent"];

  return {
    userAgent:
      typeof userAgentHeader === "string"
        ? userAgentHeader.slice(0, 500)
        : null,

    ipAddress: request.ip,
  };
}

function setRefreshCookie(
  reply: FastifyReply,
  refreshToken: string,
  expiresAt: Date,
): void {
  reply.setCookie(
    env.REFRESH_COOKIE_NAME,
    refreshToken,
    {
      httpOnly: true,
      secure:
        env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      expires: expiresAt,
    },
  );
}

function clearRefreshCookie(
  reply: FastifyReply,
): void {
  reply.clearCookie(
    env.REFRESH_COOKIE_NAME,
    {
      httpOnly: true,
      secure:
        env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
    },
  );
}

async function createSession({
  request,
  reply,
  user,
}: {
  request: FastifyRequest;
  reply: FastifyReply;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}): Promise<string> {
  const refreshToken =
    createRefreshToken();

  const tokenHash =
    hashRefreshToken(refreshToken);

  const expiresAt =
    getRefreshTokenExpiry();

  const metadata =
    getRequestMetadata(request);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent:
        metadata.userAgent,
      ipAddress:
        metadata.ipAddress,
    },
  });

  setRefreshCookie(
    reply,
    refreshToken,
    expiresAt,
  );

  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return reply.jwtSign(payload, {
    expiresIn:
      env.ACCESS_TOKEN_EXPIRES_IN,
  });
}

export const authRoutes: FastifyPluginAsync =
  async (app) => {
    app.post<{
      Body: RegisterBody;
      Reply: AuthenticationResponse;
    }>(
      "/register",
      async (request, reply) => {
        const parsedBody =
          registerBodySchema.safeParse(
            request.body,
          );

        if (!parsedBody.success) {
          throw new ApiError({
            statusCode: 400,
            code: "VALIDATION_ERROR",
            message:
              "The registration information is invalid.",
            details:
              parsedBody.error.flatten()
                .fieldErrors,
          });
        }

        const {
          firstName,
          lastName,
          email,
          phone,
          password,
        } = parsedBody.data;

        const passwordHash =
          await hashPassword(password);

        try {
          const user =
            await prisma.user.create({
              data: {
                firstName,
                lastName,
                email,
                phone,
                passwordHash,
                role: UserRole.CUSTOMER,
              },
            });

          const accessToken =
            await createSession({
              request,
              reply,
              user,
            });

          return reply.code(201).send({
            accessToken,
            user: toPublicUser(user),
          });
        } catch (error) {
          if (
            error instanceof
              Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            throw new ApiError({
              statusCode: 409,
              code: "EMAIL_ALREADY_REGISTERED",
              message:
                "An account already exists for this email address.",
            });
          }

          throw error;
        }
      },
    );

    app.post<{
      Body: LoginBody;
      Reply: AuthenticationResponse;
    }>(
      "/login",
      async (request, reply) => {
        const parsedBody =
          loginBodySchema.safeParse(
            request.body,
          );

        if (!parsedBody.success) {
          throw new ApiError({
            statusCode: 400,
            code: "VALIDATION_ERROR",
            message:
              "The login information is invalid.",
            details:
              parsedBody.error.flatten()
                .fieldErrors,
          });
        }

        const user =
          await prisma.user.findUnique({
            where: {
              email:
                parsedBody.data.email,
            },
          });

        if (!user || !user.isActive) {
          throw new ApiError({
            statusCode: 401,
            code: "INVALID_CREDENTIALS",
            message:
              GENERIC_LOGIN_ERROR,
          });
        }

        const passwordIsValid =
          await verifyPassword(
            parsedBody.data.password,
            user.passwordHash,
          );

        if (!passwordIsValid) {
          throw new ApiError({
            statusCode: 401,
            code: "INVALID_CREDENTIALS",
            message:
              GENERIC_LOGIN_ERROR,
          });
        }

        const accessToken =
          await createSession({
            request,
            reply,
            user,
          });

        return {
          accessToken,
          user: toPublicUser(user),
        };
      },
    );

    app.post<{
      Reply: AuthenticationResponse;
    }>(
      "/refresh",
      async (request, reply) => {
        const refreshToken =
          request.cookies[
            env.REFRESH_COOKIE_NAME
          ];

        if (!refreshToken) {
          throw new ApiError({
            statusCode: 401,
            code:
              "REFRESH_TOKEN_REQUIRED",
            message:
              "A valid refresh session is required.",
          });
        }

        const currentTokenHash =
          hashRefreshToken(
            refreshToken,
          );

        const existingSession =
          await prisma.session.findUnique({
            where: {
              tokenHash:
                currentTokenHash,
            },

            include: {
              user: true,
            },
          });

        if (
          !existingSession ||
          existingSession.revokedAt ||
          existingSession.expiresAt <=
            new Date() ||
          !existingSession.user.isActive
        ) {
          clearRefreshCookie(reply);

          throw new ApiError({
            statusCode: 401,
            code:
              "INVALID_REFRESH_SESSION",
            message:
              "The refresh session is invalid or has expired.",
          });
        }

        const newRefreshToken =
          createRefreshToken();

        const newTokenHash =
          hashRefreshToken(
            newRefreshToken,
          );

        const newExpiresAt =
          getRefreshTokenExpiry();

        const metadata =
          getRequestMetadata(request);

        await prisma.session.update({
          where: {
            id: existingSession.id,
          },

          data: {
            tokenHash:
              newTokenHash,
            expiresAt:
              newExpiresAt,
            userAgent:
              metadata.userAgent,
            ipAddress:
              metadata.ipAddress,
          },
        });

        setRefreshCookie(
          reply,
          newRefreshToken,
          newExpiresAt,
        );

        const accessToken =
          await reply.jwtSign(
            {
              sub:
                existingSession.user.id,
              email:
                existingSession.user
                  .email,
              role:
                existingSession.user
                  .role,
            },
            {
              expiresIn:
                env.ACCESS_TOKEN_EXPIRES_IN,
            },
          );

        return {
          accessToken,
          user: toPublicUser(
            existingSession.user,
          ),
        };
      },
    );

    app.get(
      "/me",
      {
        preHandler:
          authenticateRequest,
      },
      async (request) => {
        const user =
          await prisma.user.findUnique({
            where: {
              id: request.user.sub,
            },
          });

        if (!user || !user.isActive) {
          throw new ApiError({
            statusCode: 404,
            code: "USER_NOT_FOUND",
            message:
              "The authenticated user no longer exists.",
          });
        }

        return {
          user: toPublicUser(user),
        };
      },
    );

    app.post(
      "/logout",
      async (request, reply) => {
        const refreshToken =
          request.cookies[
            env.REFRESH_COOKIE_NAME
          ];

        if (refreshToken) {
          const tokenHash =
            hashRefreshToken(
              refreshToken,
            );

          await prisma.session.updateMany({
            where: {
              tokenHash,
              revokedAt: null,
            },

            data: {
              revokedAt: new Date(),
            },
          });
        }

        clearRefreshCookie(reply);

        return {
          message:
            "You have been signed out.",
        };
      },
    );

    app.post(
      "/logout-all",
      {
        preHandler:
          authenticateRequest,
      },
      async (request, reply) => {
        await prisma.session.updateMany({
          where: {
            userId: request.user.sub,
            revokedAt: null,
          },

          data: {
            revokedAt: new Date(),
          },
        });

        clearRefreshCookie(reply);

        return {
          message:
            "All sessions have been signed out.",
        };
      },
    );
  };