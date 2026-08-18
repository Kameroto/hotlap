"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Save,
  UserRound,
} from "lucide-react";

import {
  useForm,
  type FieldError,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import { ApiClientError } from "@/lib/api/client";

import { useAuthStore } from "@/store/auth-store";

const indianMobilePattern = /^[6-9]\d{9}$/;

const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(
      2,
      "First name must contain at least 2 characters.",
    )
    .max(
      100,
      "First name must contain no more than 100 characters.",
    ),

  lastName: z
    .string()
    .trim()
    .min(
      2,
      "Last name must contain at least 2 characters.",
    )
    .max(
      100,
      "Last name must contain no more than 100 characters.",
    ),

  email: z.email(
    "Enter a valid email address.",
  ),

  phone: z
    .string()
    .trim()
    .refine(
      (phone) =>
        phone.length === 0 ||
        indianMobilePattern.test(phone),
      "Enter a valid 10-digit Indian mobile number.",
    ),
});

type ProfileFormValues = z.infer<
  typeof profileSchema
>;

type FieldErrorMessageProps = {
  error?: FieldError;
  id: string;
};

function FieldErrorMessage({
  error,
  id,
}: FieldErrorMessageProps) {
  if (!error?.message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-start gap-1.5 text-sm text-destructive"
    >
      <AlertCircle
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0"
      />
      {error.message}
    </p>
  );
}

const inputClassName =
  "mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/30 read-only:cursor-not-allowed read-only:bg-white/[0.035] read-only:text-muted-foreground motion-reduce:transition-none aria-invalid:border-destructive/70 aria-invalid:ring-2 aria-invalid:ring-destructive/20";

export default function ProfileForm() {
  const user = useAuthStore(
    (state) => state.user,
  );

  const updateProfile = useAuthStore(
    (state) => state.updateProfile,
  );

  const submissionInFlightRef =
    useRef(false);

  const [savedSuccessfully, setSavedSuccessfully] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const {
    register,
    reset,
    handleSubmit,

    formState: {
      errors,
      isDirty,
      isSubmitting,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!user || isDirty) {
      return;
    }

    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
    });
  }, [isDirty, reset, user]);

  async function saveProfile(
    values: ProfileFormValues,
  ): Promise<void> {
    setSavedSuccessfully(false);
    setSubmitError(null);

    try {
      const normalizedPhone =
        values.phone.trim();

      const updatedUser = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone:
          normalizedPhone.length > 0
            ? normalizedPhone
            : null,
      });

      reset({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
      });

      setSavedSuccessfully(true);

      toast.success(
        "Your profile has been updated.",
      );
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Unable to update your profile. Please try again.";

      setSubmitError(message);
      toast.error(message);
    }
  }

  async function submitProfile(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    if (submissionInFlightRef.current) {
      event.preventDefault();
      return;
    }

    submissionInFlightRef.current = true;

    try {
      await handleSubmit(saveProfile)(event);
    } finally {
      submissionInFlightRef.current = false;
    }
  }

  if (!user) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-white/10 bg-card/90 p-8 text-center text-muted-foreground"
      >
        Loading your profile…
      </div>
    );
  }

  const firstNameErrorId =
    "profile-first-name-error";
  const lastNameErrorId =
    "profile-last-name-error";
  const emailHelpId = "profile-email-help";
  const phoneHelpId = "profile-phone-help";
  const phoneErrorId = "profile-phone-error";

  return (
    <form
      onSubmit={submitProfile}
      onChange={() => setSavedSuccessfully(false)}
      noValidate
      aria-busy={isSubmitting}
      className="overflow-hidden rounded-3xl border border-white/10 bg-card/90 shadow-[0_20px_70px_rgba(0,0,0,0.22)]"
    >
      <div className="border-b border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <UserRound
              aria-hidden="true"
              className="size-5"
            />
          </span>

          <div>
            <h2 className="font-semibold text-foreground">
              Profile details
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Fields marked required must be completed.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {submitError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/35 bg-destructive/10 p-4 text-sm text-destructive"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
            />
            <div>
              <p className="font-semibold">
                Profile not updated
              </p>
              <p className="mt-1 leading-6">
                {submitError}
              </p>
            </div>
          </div>
        )}

        {savedSuccessfully && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400"
          >
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
            />
            <div>
              <p className="font-semibold">
                Profile updated
              </p>
              <p className="mt-1 text-emerald-300/80">
                Your changes were saved successfully.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-first-name"
              className="text-sm font-medium"
            >
              First name
              <span className="ml-1 text-primary">
                (required)
              </span>
            </label>

            <input
              id="profile-first-name"
              autoComplete="given-name"
              aria-invalid={
                errors.firstName ? true : undefined
              }
              aria-describedby={
                errors.firstName
                  ? firstNameErrorId
                  : undefined
              }
              className={inputClassName}
              {...register("firstName")}
            />

            <FieldErrorMessage
              id={firstNameErrorId}
              error={errors.firstName}
            />
          </div>

          <div>
            <label
              htmlFor="profile-last-name"
              className="text-sm font-medium"
            >
              Last name
              <span className="ml-1 text-primary">
                (required)
              </span>
            </label>

            <input
              id="profile-last-name"
              autoComplete="family-name"
              aria-invalid={
                errors.lastName ? true : undefined
              }
              aria-describedby={
                errors.lastName
                  ? lastNameErrorId
                  : undefined
              }
              className={inputClassName}
              {...register("lastName")}
            />

            <FieldErrorMessage
              id={lastNameErrorId}
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

            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 size-4 translate-y-0.5 text-muted-foreground"
              />
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                readOnly
                aria-describedby={emailHelpId}
                className={`${inputClassName} pl-11`}
                {...register("email")}
              />
            </div>

            <p
              id={emailHelpId}
              className="mt-2 text-xs leading-5 text-muted-foreground"
            >
              Your sign-in email is read-only and is never included in profile updates.
            </p>
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="text-sm font-medium"
            >
              Mobile number
              <span className="ml-1 text-muted-foreground">
                (optional)
              </span>
            </label>

            <input
              id="profile-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit Indian mobile number"
              aria-invalid={
                errors.phone ? true : undefined
              }
              aria-describedby={
                errors.phone
                  ? `${phoneHelpId} ${phoneErrorId}`
                  : phoneHelpId
              }
              className={inputClassName}
              {...register("phone")}
            />

            <p
              id={phoneHelpId}
              className="mt-2 text-xs leading-5 text-muted-foreground"
            >
              Leave blank to remove it. Indian mobile numbers must be 10 digits and start with 6–9.
            </p>

            <FieldErrorMessage
              id={phoneErrorId}
              error={errors.phone}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            {isSubmitting
              ? "Saving your profile changes…"
              : isDirty
                ? "You have unsaved changes."
                : "Your profile is up to date."}
          </p>

          <Button
            type="submit"
            size="lg"
            disabled={!isDirty || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin motion-reduce:animate-none"
              />
            ) : (
              <Save
                aria-hidden="true"
                className="size-5"
              />
            )}

            {isSubmitting
              ? "Saving…"
              : "Save Profile"}
          </Button>
        </div>
      </div>
    </form>
  );
}
