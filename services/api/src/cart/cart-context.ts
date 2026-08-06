import { randomUUID } from "node:crypto";

import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { getOptionalUserId } from "../auth/optional-authenticate.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

export const GUEST_CART_HEADER =
  "x-cart-token";

export type CartContext = {
  cartId: string;
  userId: string | null;
  guestCartToken: string | null;
};

function readGuestCartToken(
  request: FastifyRequest,
): string | null {
  const headerValue =
    request.headers[
      GUEST_CART_HEADER
    ];

  const token = Array.isArray(
    headerValue,
  )
    ? headerValue[0]
    : headerValue;

  if (
    typeof token !== "string" ||
    token.trim().length === 0
  ) {
    return null;
  }

  const normalizedToken =
    token.trim();

  if (
    normalizedToken.length < 16 ||
    normalizedToken.length > 200
  ) {
    throw new ApiError({
      statusCode: 400,
      code: "INVALID_CART_TOKEN",
      message:
        "The guest cart token is invalid.",
    });
  }

  return normalizedToken;
}

export async function resolveCartContext(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<CartContext> {
  const userId =
    await getOptionalUserId(request);

  if (userId) {
    const existingCart =
      await prisma.cart.findFirst({
        where: {
          userId,
        },

        orderBy: {
          createdAt: "asc",
        },

        select: {
          id: true,
        },
      });

    const cart =
      existingCart ??
      (await prisma.cart.create({
        data: {
          userId,
        },

        select: {
          id: true,
        },
      }));

    return {
      cartId: cart.id,
      userId,
      guestCartToken: null,
    };
  }

  const providedToken =
    readGuestCartToken(request);

  const guestCartToken =
    providedToken ?? randomUUID();

  const existingGuestCart =
    await prisma.cart.findUnique({
      where: {
        token: guestCartToken,
      },

      select: {
        id: true,
      },
    });

  const cart =
    existingGuestCart ??
    (await prisma.cart.create({
      data: {
        token: guestCartToken,
      },

      select: {
        id: true,
      },
    }));

  reply.header(
    GUEST_CART_HEADER,
    guestCartToken,
  );

  return {
    cartId: cart.id,
    userId: null,
    guestCartToken,
  };
}