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