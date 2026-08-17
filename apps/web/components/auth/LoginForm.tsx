"use client";

import { useState } from "react";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

import {
  useForm,
  type FieldError,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/auth-schema";

import { ApiClientError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";

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

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const login = useAuthStore(
    (state) => state.login,
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    submissionError,
    setSubmissionError,
  ] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function submitLogin(
    values: LoginFormValues,
  ): Promise<void> {
    setSubmissionError(null);

    try {
      await login({
        email: values.email,
        password: values.password,
      });

      toast.success(
        "Welcome back to HotLap.",
      );

      const requestedDestination =
        searchParams.get("next");

      const destination =
        requestedDestination?.startsWith(
          "/",
        ) &&
        !requestedDestination.startsWith(
          "//",
        )
          ? requestedDestination
          : "/account";

      router.replace(destination);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Unable to sign in. Please try again.";

      setSubmissionError(message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submitLogin)}
      noValidate
      className="space-y-5"
    >
      {submissionError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {submissionError}
        </div>
      )}

      <div>
        <label
          htmlFor="login-email"
          className="text-sm font-medium"
        >
          Email address
        </label>

        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClassName}
          {...register("email")}
        />

        <FieldErrorMessage
          error={errors.email}
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="login-password"
            className="text-sm font-medium"
          >
            Password
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <input
            id="login-password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            autoComplete="current-password"
            placeholder="Enter your password"
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
            className="absolute top-1/2 right-3 mt-1 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
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
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          {...register("rememberMe")}
        />

        <span>
          Keep me signed in on this device
        </span>
      </label>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        <LogIn className="h-5 w-5" />

        {isSubmitting
          ? "Signing In..."
          : "Sign In"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to HotLap?{" "}
        <Link
          href="/register"
          className="font-semibold text-red-600 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
