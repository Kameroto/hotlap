import "dotenv/config";

import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum([
      "development",
      "test",
      "production",
    ])
    .default("development"),

  HOST: z
    .string()
    .trim()
    .min(1)
    .default("0.0.0.0"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .max(65535)
    .default(4000),

  WEB_ORIGIN: z
    .string()
    .url()
    .default("http://localhost:3000"),

  LOG_LEVEL: z
    .enum([
      "fatal",
      "error",
      "warn",
      "info",
      "debug",
      "trace",
      "silent",
    ])
    .default("info"),

  DATABASE_URL: z
    .string()
    .trim()
    .min(
      1,
      "DATABASE_URL is required.",
    )
    .refine(
      (value) =>
        value.startsWith("postgresql://") ||
        value.startsWith("postgres://"),
      "DATABASE_URL must be a PostgreSQL connection string.",
    ),

  ACCESS_TOKEN_SECRET: z
    .string()
    .min(
      32,
      "ACCESS_TOKEN_SECRET must contain at least 32 characters.",
    ),

  ACCESS_TOKEN_EXPIRES_IN: z
    .string()
    .trim()
    .min(1)
    .default("15m"),

  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce
    .number()
    .int()
    .positive()
    .max(365)
    .default(30),

  REFRESH_COOKIE_NAME: z
    .string()
    .trim()
    .min(1)
    .default("hotlap_refresh_token"),
});

const parsedEnvironment =
  environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error(
    "Invalid API environment configuration:",
    parsedEnvironment.error.flatten().fieldErrors,
  );

  throw new Error(
    "The HotLap API environment configuration is invalid.",
  );
}

export const env = parsedEnvironment.data;

export type Environment = typeof env;