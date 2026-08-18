import type { Metadata } from "next";

import {
  Flag,
  ShieldCheck,
} from "lucide-react";

import ProfileForm from "@/components/account/ProfileForm";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Manage your HotLap customer profile.",
};

export default function ProfilePage() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 right-0 size-56 rounded-full bg-primary/8 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          <Flag className="size-4" />
          Personal Information
        </div>

        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Your Profile
        </h1>

        <div className="mt-4 flex max-w-2xl items-start gap-3 text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-primary"
          />
          <p className="leading-7">
            Keep your contact details current. Your sign-in email stays protected and cannot be changed here.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}
