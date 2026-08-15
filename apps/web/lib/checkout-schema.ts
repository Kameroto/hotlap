import { z } from "zod";

export const checkoutSchema = z
  .object({
    email: z.email(
      "A valid account email is required.",
    ),

    addressMode: z.enum([
      "saved",
      "manual",
    ]),

    addressId: z
      .uuid(
        "Select a valid saved address.",
      )
      .nullable(),

    phone: z
      .string()
      .trim(),

    firstName: z
      .string()
      .trim(),

    lastName: z
      .string()
      .trim(),

    addressLine1: z
      .string()
      .trim(),

    addressLine2: z
      .string()
      .trim()
      .max(
        250,
        "Address details cannot exceed 250 characters.",
      )
      .optional(),

    city: z
      .string()
      .trim(),

    state: z
      .string()
      .trim(),

    postalCode: z
      .string()
      .trim(),

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

    confirmOrderDetails: z
      .boolean()
      .refine(
        (confirmed) =>
          confirmed,
        "Confirm that your delivery and order details are correct.",
      ),
  })
  .superRefine(
    (values, context) => {
      if (
        values.addressMode ===
        "saved"
      ) {
        if (!values.addressId) {
          context.addIssue({
            code: "custom",
            path: ["addressId"],
            message:
              "Select a saved address or enter a different address.",
          });
        }

        return;
      }

      if (
        values.firstName.length <
        2
      ) {
        context.addIssue({
          code: "custom",
          path: ["firstName"],
          message:
            "First name must contain at least 2 characters.",
        });
      }

      if (
        values.lastName.length <
        2
      ) {
        context.addIssue({
          code: "custom",
          path: ["lastName"],
          message:
            "Last name must contain at least 2 characters.",
        });
      }

      if (
        !/^[6-9]\d{9}$/.test(
          values.phone,
        )
      ) {
        context.addIssue({
          code: "custom",
          path: ["phone"],
          message:
            "Enter a valid 10-digit Indian mobile number.",
        });
      }

      if (
        values.addressLine1.length <
        5
      ) {
        context.addIssue({
          code: "custom",
          path: ["addressLine1"],
          message:
            "Enter your complete street address.",
        });
      }

      if (values.city.length < 2) {
        context.addIssue({
          code: "custom",
          path: ["city"],
          message:
            "Enter your city.",
        });
      }

      if (values.state.length < 2) {
        context.addIssue({
          code: "custom",
          path: ["state"],
          message:
            "Select your state.",
        });
      }

      if (
        !/^[1-9][0-9]{5}$/.test(
          values.postalCode,
        )
      ) {
        context.addIssue({
          code: "custom",
          path: ["postalCode"],
          message:
            "Enter a valid 6-digit Indian PIN code.",
        });
      }
    },
  );

export type CheckoutFormValues = z.infer<
  typeof checkoutSchema
>;
