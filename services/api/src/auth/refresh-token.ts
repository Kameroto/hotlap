import {
  createHash,
  randomBytes,
} from "node:crypto";

import { env } from "../config/env.js";

const REFRESH_TOKEN_BYTE_LENGTH = 48;

export function createRefreshToken(): string {
  return randomBytes(
    REFRESH_TOKEN_BYTE_LENGTH,
  ).toString("base64url");
}

export function hashRefreshToken(
  refreshToken: string,
): string {
  return createHash("sha256")
    .update(refreshToken)
    .digest("hex");
}

export function getRefreshTokenExpiry(): Date {
  const expiresAt = new Date();

  expiresAt.setUTCDate(
    expiresAt.getUTCDate() +
      env.REFRESH_TOKEN_EXPIRES_DAYS,
  );

  return expiresAt;
}