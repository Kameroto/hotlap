"use client";

import Link from "next/link";

import {
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
      "View purchases and delivery status.",

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
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
        Account Overview
      </p>

      <h1 className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl">
        Welcome back
        {user?.firstName
          ? `, ${user.firstName}`
          : ""}
      </h1>

      <p className="mt-4 break-words text-muted-foreground">
        Manage your orders,
        profile, delivery addresses,
        wishlist and account
        preferences.
      </p>

      <div className="mt-8 grid min-w-0 gap-5 md:mt-10 md:grid-cols-2">
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
                className="group w-full min-w-0 overflow-hidden rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-5 break-words text-xl font-semibold transition group-hover:text-red-600 motion-reduce:transition-none">
                  {
                    action.title
                  }
                </h2>

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
    </div>
  );
}
