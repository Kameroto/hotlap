import { z } from "zod";

const passwordSchema = z
  .string()
  .min(
    8,
    "Password must contain at least 8 characters.",
  )
  .max(
    128,
    "Password cannot exceed 128 characters.",
  )
  .regex(
    /[A-Z]/,
    "Password must contain an uppercase letter.",
  )
  .regex(
    /[a-z]/,
    "Password must contain a lowercase letter.",
  )
  .regex(
    /[0-9]/,
    "Password must contain a number.",
  );

export const registerBodySchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2)
    .max(80),

  lastName: z
    .string()
    .trim()
    .min(2)
    .max(80),

  email: z
    .email()
    .transform((value) =>
      value.trim().toLowerCase(),
    ),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/),

  password: passwordSchema,
});

export const loginBodySchema = z.object({
  email: z
    .email()
    .transform((value) =>
      value.trim().toLowerCase(),
    ),

  password: z
    .string()
    .min(1)
    .max(128),
});

export type RegisterBody = z.infer<
  typeof registerBodySchema
>;

export type LoginBody = z.infer<
  typeof loginBodySchema
>;