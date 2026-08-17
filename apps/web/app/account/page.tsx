"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  Heart,
  MapPin,
  Package,
  Settings,
  UserRound,
} from "lucide-react";

import {
  useAuthStore,
} from "@/store/auth-store";

const accountActions = [
  {
    href:
      "/account/orders",

    title:
      "Your Orders",

    description:
      "Review purchases, order status and details.",

    icon:
      Package,
  },

  {
    href:
      "/wishlist",

    title:
      "Wishlist",

    description:
      "View products you have saved.",

    icon:
      Heart,
  },

  {
    href:
      "/account/addresses",

    title:
      "Delivery Addresses",

    description:
      "Manage delivery locations.",

    icon:
      MapPin,
  },

  {
    href:
      "/account/profile",

    title:
      "Profile",

    description:
      "Update your customer information.",

    icon:
      UserRound,
  },

  {
    href:
      "/account/preferences",

    title:
      "Preferences",

    description:
      "Manage your HotLap account preferences.",

    icon:
      Settings,
  },
];

export default function AccountOverviewPage() {
  const user =
    useAuthStore(
      (state) =>
        state.user,
    );

  return (
    <div className="w-full min-w-0">
      <header className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/10 p-6 shadow-2xl shadow-black/10 sm:p-8">
        <div
          className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Account Overview
          </p>

          <h1 className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back
            {user?.firstName
              ? `, ${user.firstName}`
              : ""}
          </h1>

          <p className="mt-4 max-w-2xl break-words text-sm leading-6 text-muted-foreground sm:text-base">
            Your HotLap account keeps orders,
            saved products and delivery details
            together in one place.
          </p>

          {user?.email && (
            <p className="mt-5 max-w-full break-all text-sm font-medium text-foreground/80">
              {user.email}
            </p>
          )}
        </div>
      </header>

      <section
        className="mt-8 md:mt-10"
        aria-labelledby="account-actions-heading"
      >
        <div className="flex min-w-0 items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Your garage
            </p>
            <h2
              id="account-actions-heading"
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              Account essentials
            </h2>
          </div>
        </div>

        <div className="mt-5 grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2">
        {accountActions.map(
          (action) => {
            const Icon =
              action.icon;

            return (
              <Link
                key={
                  action.href
                }
                href={
                  action.href
                }
                className="group relative w-full min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-xl hover:shadow-black/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
                    <Icon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-primary motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mt-5 break-words text-lg font-semibold transition group-hover:text-primary motion-reduce:transition-none">
                  {
                    action.title
                  }
                </h3>

                <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
                  {
                    action.description
                  }
                </p>
              </Link>
            );
          },
        )}
        </div>
      </section>
    </div>
  );
}
