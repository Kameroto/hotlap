"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import { LoaderCircle } from "lucide-react";

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
    !hasInitialized ||
    status === "idle" ||
    status === "loading"
  ) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-red-600" />

          <p className="mt-3 text-sm text-muted-foreground">
            Loading your account…
          </p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return children;
}