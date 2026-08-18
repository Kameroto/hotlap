import type { Metadata } from "next";

import {
  Settings,
  ShieldCheck,
} from "lucide-react";

import AccountSettingsPanel from "@/components/account/AccountSettingsPanel";

export const metadata: Metadata = {
  title: "Account Settings",
  description:
    "Manage the information and order details connected to your HotLap account.",
};

export default function AccountSettingsPage() {
  return (
    <div className="relative min-w-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 right-0 size-56 rounded-full bg-primary/8 blur-3xl"
      />

      <div className="relative min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          <Settings
            aria-hidden="true"
            className="size-4"
          />
          Customer Account
        </div>

        <h1 className="mt-3 break-words text-4xl font-bold tracking-tight sm:text-5xl">
          Account Settings
        </h1>

        <div className="mt-4 flex max-w-2xl items-start gap-3 text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-primary"
          />
          <p className="break-words leading-7">
            Manage your account information, saved addresses, and order-related details from one place.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <AccountSettingsPanel />
        </div>
      </div>
    </div>
  );
}
