"use client";

import { useState } from "react";
import Link from "next/link";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";

import {
  useForm,
  type FieldError,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";

import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/auth-schema";

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

export default function RegisterForm() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    registrationComplete,
    setRegistrationComplete,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  async function submitRegistration(
    values: RegisterFormValues,
  ) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 700);
    });

    console.info(
      "Temporary frontend registration",
      {
        ...values,
        password: "[REDACTED]",
        confirmPassword: "[REDACTED]",
      },
    );

    setRegistrationComplete(true);
  }

  if (registrationComplete) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900">
        <CheckCircle2 className="h-8 w-8" />

        <h2 className="mt-4 text-xl font-semibold">
          Registration form verified
        </h2>

        <p className="mt-2 text-sm leading-6">
          Your frontend account form works. The backend
          will later create the user securely and hash the
          password.
        </p>

        <Link
          href="/login"
          className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
        >
          Continue to Login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(
        submitRegistration,
      )}
      noValidate
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="register-first-name"
            className="text-sm font-medium"
          >
            First name
          </label>

          <input
            id="register-first-name"
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
            htmlFor="register-last-name"
            className="text-sm font-medium"
          >
            Last name
          </label>

          <input
            id="register-last-name"
            autoComplete="family-name"
            className={inputClassName}
            {...register("lastName")}
          />

          <FieldErrorMessage
            error={errors.lastName}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="text-sm font-medium"
        >
          Email address
        </label>

        <input
          id="register-email"
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
          htmlFor="register-phone"
          className="text-sm font-medium"
        >
          Mobile number
        </label>

        <input
          id="register-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="10-digit Indian mobile number"
          className={inputClassName}
          {...register("phone")}
        />

        <FieldErrorMessage
          error={errors.phone}
        />
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="text-sm font-medium"
        >
          Password
        </label>

        <div className="relative">
          <input
            id="register-password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            className={`${inputClassName} pr-11`}
            {...register("password")}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (currentValue) =>
                  !currentValue,
              )
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="absolute top-1/2 right-3 mt-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <FieldErrorMessage
          error={errors.password}
        />

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Use at least 8 characters with uppercase,
          lowercase, and a number.
        </p>
      </div>

      <div>
        <label
          htmlFor="register-confirm-password"
          className="text-sm font-medium"
        >
          Confirm password
        </label>

        <div className="relative">
          <input
            id="register-confirm-password"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            className={`${inputClassName} pr-11`}
            {...register(
              "confirmPassword",
            )}
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (currentValue) =>
                  !currentValue,
              )
            }
            aria-label={
              showConfirmPassword
                ? "Hide confirmation password"
                : "Show confirmation password"
            }
            className="absolute top-1/2 right-3 mt-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <FieldErrorMessage
          error={errors.confirmPassword}
        />
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          {...register("acceptTerms")}
        />

        <span>
          I agree to the HotLap terms and privacy
          policy.
        </span>
      </label>

      <FieldErrorMessage
        error={errors.acceptTerms}
      />

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        <UserPlus className="h-5 w-5" />

        {isSubmitting
          ? "Creating Account..."
          : "Create Account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-red-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}