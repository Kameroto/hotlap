import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter.",
  )
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter.",
  )
  .regex(
    /[0-9]/,
    "Password must contain at least one number.",
  );

export const loginSchema = z.object({
  email: z
    .email("Enter a valid email address.")
    .transform((value) => value.trim().toLowerCase()),

  password: z
    .string()
    .min(1, "Enter your password."),

  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<
  typeof loginSchema
>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(
        2,
        "First name must contain at least 2 characters.",
      ),

    lastName: z
      .string()
      .trim()
      .min(
        2,
        "Last name must contain at least 2 characters.",
      ),

    email: z
      .email("Enter a valid email address.")
      .transform((value) =>
        value.trim().toLowerCase(),
      ),

    phone: z
      .string()
      .trim()
      .regex(
        /^[6-9]\d{9}$/,
        "Enter a valid 10-digit Indian mobile number.",
      ),

    password: passwordSchema,

    confirmPassword: z.string(),

    acceptTerms: z
      .boolean()
      .refine(
        (accepted) => accepted,
        "You must accept the terms and privacy policy.",
      ),
  })
  .refine(
    (values) =>
      values.password === values.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

export type RegisterFormValues = z.infer<
  typeof registerSchema
>;

export const forgotPasswordSchema = z.object({
  email: z
    .email("Enter a valid email address.")
    .transform((value) =>
      value.trim().toLowerCase(),
    ),
});

export type ForgotPasswordFormValues = z.infer<
  typeof forgotPasswordSchema
>;