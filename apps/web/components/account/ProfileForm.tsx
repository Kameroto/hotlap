"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Save,
} from "lucide-react";

import {
  useForm,
  type FieldError,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  useAuthStore,
} from "@/store/auth-store";

const profileSchema = z.object({
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

  email: z.email(
    "Enter a valid email address.",
  ),

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
  const user = useAuthStore(
    (state) => state.user,
  );

  const updateProfile = useAuthStore(
    (state) => state.updateProfile,
  );

  const [
    savedSuccessfully,
    setSavedSuccessfully,
  ] = useState(false);

  const {
    register,
    reset,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(
      profileSchema,
    ),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    reset({
      firstName:
        user.firstName,

      lastName:
        user.lastName,

      email:
        user.email,

      phone:
        user.phone ?? "",
    });
  }, [
    reset,
    user,
  ]);

  async function saveProfile(
    values: ProfileFormValues,
  ): Promise<void> {
    setSavedSuccessfully(false);

    try {
      const updatedUser =
        await updateProfile({
          firstName:
            values.firstName,

          lastName:
            values.lastName,

          phone:
            values.phone,
        });

      reset({
        firstName:
          updatedUser.firstName,

        lastName:
          updatedUser.lastName,

        email:
          updatedUser.email,

        phone:
          updatedUser.phone ?? "",
      });

      setSavedSuccessfully(true);

      toast.success(
        "Your profile has been updated.",
      );
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Unable to update your profile.";

      toast.error(message);
    }
  }

  if (!user) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
        Loading your profile...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(
        saveProfile,
      )}
      noValidate
      className="rounded-2xl border bg-card p-6"
    >
      {savedSuccessfully && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />

          <span>
            Your profile changes were saved successfully.
          </span>
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
            className={
              inputClassName
            }
            {...register(
              "firstName",
            )}
          />

          <FieldErrorMessage
            error={
              errors.firstName
            }
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
            className={
              inputClassName
            }
            {...register(
              "lastName",
            )}
          />

          <FieldErrorMessage
            error={
              errors.lastName
            }
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
            readOnly
            className={`${inputClassName} cursor-not-allowed bg-muted text-muted-foreground`}
            {...register("email")}
          />

          <p className="mt-1 text-xs text-muted-foreground">
            Email changes are not currently supported.
          </p>

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
            className={
              inputClassName
            }
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
          disabled={isSubmitting}
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