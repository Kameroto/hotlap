"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

type AccountGuardProps = {
  children: ReactNode;
};

export default function AccountGuard({
  children,
}: AccountGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const status = useAuthStore(
    (state) => state.status,
  );

  const hasInitialized = useAuthStore(
    (state) =>
      state.hasInitialized,
  );

  const initializationError = useAuthStore(
    (state) => state.initializationError,
  );

  const initialize = useAuthStore(
    (state) => state.initialize,
  );

  useEffect(() => {
    if (
      hasInitialized &&
      status === "unauthenticated"
    ) {
      const destination =
        encodeURIComponent(pathname);

      router.replace(
        `/login?next=${destination}`,
      );
    }
  }, [
    hasInitialized,
    pathname,
    router,
    status,
  ]);

  if (
    status === "idle" ||
    status === "loading"
  ) {
    return (
      <div
        className="flex min-h-[55vh] items-center justify-center px-5"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <LoaderCircle
            className="mx-auto h-8 w-8 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm text-muted-foreground">
            Verifying your account…
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-[55vh] items-center justify-center px-5 py-16">
        <div
          className="w-full max-w-lg rounded-3xl border border-border/80 bg-card/90 p-6 text-center shadow-2xl sm:p-8"
          role="alert"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldAlert
              className="h-6 w-6"
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            We couldn&apos;t verify your session
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {initializationError ??
              "Your account is still protected. Check your connection and try again."}
          </p>

          <button
            type="button"
            onClick={() => {
              void initialize().catch(() => undefined);
            }}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />
            Retry session check
          </button>
        </div>
      </main>
    );
  }

  if (
    !hasInitialized ||
    status !== "authenticated"
  ) {
    return null;
  }

  return children;
}
