"use client";

import { useState } from "react";

import {
  CheckCircle2,
  Save,
} from "lucide-react";

import {
  useForm,
  type FieldError,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";

const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters."),

  lastName: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters."),

  email: z
    .email("Enter a valid email address."),

  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian mobile number.",
    ),
});

type ProfileFormValues = z.infer<
  typeof profileSchema
>;

type FieldErrorMessageProps = {
  error?: FieldError;
};

function FieldErrorMessage({
  error,
}: FieldErrorMessageProps) {
  if (!error?.message) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-red-600">
      {error.message}
    </p>
  );
}

const inputClassName =
  "mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ProfileForm() {
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),

    defaultValues: {
      firstName: "Tanmay",
      lastName: "Saini",
      email: "sainitanmay@gmail.com",
      phone: "9876543210",
    },
  });

  async function saveProfile(
    values: ProfileFormValues,
  ) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 500);
    });

    console.info(
      "Temporary profile update",
      values,
    );

    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit(saveProfile)}
      noValidate
      className="rounded-2xl border bg-card p-6"
    >
      {saved && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          Profile changes saved locally for demonstration.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="profile-first-name"
            className="text-sm font-medium"
          >
            First name
          </label>

          <input
            id="profile-first-name"
            autoComplete="given-name"
            className={inputClassName}
            {...register("firstName")}
          />

          <FieldErrorMessage
            error={errors.firstName}
          />
        </div>

        <div>
          <label
            htmlFor="profile-last-name"
            className="text-sm font-medium"
          >
            Last name
          </label>

          <input
            id="profile-last-name"
            autoComplete="family-name"
            className={inputClassName}
            {...register("lastName")}
          />

          <FieldErrorMessage
            error={errors.lastName}
          />
        </div>

        <div>
          <label
            htmlFor="profile-email"
            className="text-sm font-medium"
          >
            Email address
          </label>

          <input
            id="profile-email"
            type="email"
            autoComplete="email"
            className={inputClassName}
            {...register("email")}
          />

          <FieldErrorMessage
            error={errors.email}
          />
        </div>

        <div>
          <label
            htmlFor="profile-phone"
            className="text-sm font-medium"
          >
            Mobile number
          </label>

          <input
            id="profile-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className={inputClassName}
            {...register("phone")}
          />

          <FieldErrorMessage
            error={errors.phone}
          />
        </div>
      </div>

      <div className="mt-7 flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || !isDirty}
        >
          <Save className="h-5 w-5" />

          {isSubmitting
            ? "Saving..."
            : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}