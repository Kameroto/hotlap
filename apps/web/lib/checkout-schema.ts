import { z } from "zod";

export const checkoutSchema = z.object({
  email: z
    .email("Enter a valid email address."),

  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian mobile number.",
    ),

  firstName: z
    .string()
    .trim()
    .min(2, "First name must contain at least 2 characters."),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must contain at least 2 characters."),

  addressLine1: z
    .string()
    .trim()
    .min(5, "Enter your complete street address."),

  addressLine2: z
    .string()
    .trim()
    .optional(),

  city: z
    .string()
    .trim()
    .min(2, "Enter your city."),

  state: z
    .string()
    .trim()
    .min(2, "Select your state."),

  postalCode: z
    .string()
    .trim()
    .regex(
      /^[1-9][0-9]{5}$/,
      "Enter a valid 6-digit Indian PIN code.",
    ),

  shippingMethod: z.enum([
    "standard",
    "express",
  ]),

  orderNotes: z
    .string()
    .trim()
    .max(
      500,
      "Order notes cannot exceed 500 characters.",
    )
    .optional(),

  acceptTerms: z
    .boolean()
    .refine(
      (accepted) => accepted,
      "You must accept the terms and conditions.",
    ),
});

export type CheckoutFormValues = z.infer<
  typeof checkoutSchema
>;