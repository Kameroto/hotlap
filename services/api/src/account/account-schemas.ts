import { z } from "zod";

const indianPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^[6-9]\d{9}$/,
    "Enter a valid 10-digit Indian mobile number.",
  );

export const updateProfileBodySchema =
  z.object({
    firstName: z
      .string()
      .trim()
      .min(
        2,
        "First name must contain at least 2 characters.",
      )
      .max(100),

    lastName: z
      .string()
      .trim()
      .min(
        2,
        "Last name must contain at least 2 characters.",
      )
      .max(100),

    phone: indianPhoneSchema.nullable(),
  });

export const addressBodySchema =
  z.object({
    label: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .nullable()
      .optional(),

    recipientName: z
      .string()
      .trim()
      .min(
        2,
        "Recipient name must contain at least 2 characters.",
      )
      .max(150),

    phone: indianPhoneSchema,

    addressLine1: z
      .string()
      .trim()
      .min(
        5,
        "Enter a complete delivery address.",
      )
      .max(250),

    addressLine2: z
      .string()
      .trim()
      .max(250)
      .nullable()
      .optional(),

    city: z
      .string()
      .trim()
      .min(2)
      .max(100),

    state: z
      .string()
      .trim()
      .min(2)
      .max(100),

    postalCode: z
      .string()
      .trim()
      .regex(
        /^[1-9]\d{5}$/,
        "Enter a valid 6-digit Indian PIN code.",
      ),

    country: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .default("India"),

    isDefault: z
      .boolean()
      .default(false),
  });

export const addressIdParamsSchema =
  z.object({
    addressId: z
      .string()
      .uuid(
        "A valid address ID is required.",
      ),
  });

export type UpdateProfileBody =
  z.infer<
    typeof updateProfileBodySchema
  >;

export type AddressBody =
  z.infer<typeof addressBodySchema>;

export type AddressIdParams =
  z.infer<
    typeof addressIdParamsSchema
  >;