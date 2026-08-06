"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  UserRound,
} from "lucide-react";

import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const accountLinks = [
  {
    href: "/account",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/account/profile",
    label: "Profile",
    icon: UserRound,
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: MapPin,
  },
  {
    href: "/account/preferences",
    label: "Preferences",
    icon: Settings,
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    icon: Heart,
  },
  {
    href: "/account/orders",
    label: "Orders",
    icon: Package,
  },
];

export default function AccountNavigation() {
  const pathname = usePathname();

  const user = useAuthStore(
    (state) => state.user,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const status = useAuthStore(
    (state) => state.status,
  );

  async function handleLogout(): Promise<void> {
    try {
      await logout();

      toast.success(
        "You have been signed out.",
      );

      window.location.replace("/login");
    } catch {
      toast.error(
        "Your local session was cleared, but the server could not be reached.",
      );

      window.location.replace("/login");
    }
  }

  return (
    <aside className="h-fit rounded-2xl border bg-card p-4 lg:sticky lg:top-24">
      <div className="border-b px-3 pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
          Customer Account
        </p>

        <p className="mt-2 font-semibold">
          {user
            ? `${user.firstName} ${user.lastName}`
            : "HotLap Customer"}
        </p>

        <p className="mt-1 break-all text-sm text-muted-foreground">
          {user?.email ?? "Customer account"}
        </p>
      </div>

      <nav
        className="mt-4 flex gap-2 overflow-x-auto lg:flex-col"
        aria-label="Customer account"
      >
        {accountLinks.map((link) => {
          const Icon = link.icon;

          const isActive =
            link.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(
                  link.href,
                );

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t pt-4">
        <button
          type="button"
          onClick={() => {
            void handleLogout();
          }}
          disabled={status === "loading"}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />

          {status === "loading"
            ? "Signing Out..."
            : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}