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
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
        Account Overview
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Welcome back
        {user?.firstName
          ? `, ${user.firstName}`
          : ""}
      </h1>

      <p className="mt-4 text-muted-foreground">
        Manage your orders,
        profile, delivery addresses,
        wishlist and account
        preferences.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
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
                className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-xl font-semibold transition group-hover:text-red-600">
                  {
                    action.title
                  }
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
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