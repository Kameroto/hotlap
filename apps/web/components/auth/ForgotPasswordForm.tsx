"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Mail,
} from "lucide-react";

import {
  useForm,
  type FieldError,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
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

export default function ForgotPasswordForm() {
  const [requestComplete, setRequestComplete] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(
      forgotPasswordSchema,
    ),

    defaultValues: {
      email: "",
    },
  });

  async function submitRequest(
    values: ForgotPasswordFormValues,
  ) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 600);
    });

    console.info(
      "Temporary password reset request",
      values,
    );

    setRequestComplete(true);
  }

  if (requestComplete) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900">
        <CheckCircle2 className="h-8 w-8" />

        <h2 className="mt-4 text-xl font-semibold">
          Reset request received
        </h2>

        <p className="mt-2 text-sm leading-6">
          In production, HotLap will send a secure,
          time-limited password reset link when the
          account exists.
        </p>

        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-900 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(
        submitRequest,
      )}
      noValidate
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="forgot-email"
          className="text-sm font-medium"
        >
          Email address
        </label>

        <div className="relative">
          <Mail className="absolute top-1/2 left-3 mt-1 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-2 h-11 w-full rounded-lg border bg-background pr-3 pl-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            {...register("email")}
          />
        </div>

        <FieldErrorMessage
          error={errors.email}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        <Mail className="h-5 w-5" />

        {isSubmitting
          ? "Sending Request..."
          : "Send Reset Link"}
      </Button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Login
      </Link>
    </form>
  );
}