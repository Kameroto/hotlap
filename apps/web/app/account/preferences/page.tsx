import type { Metadata } from "next";

import PreferencesForm from "@/components/account/PreferencesForm";

export const metadata: Metadata = {
  title: "Preferences",
  description:
    "Manage your HotLap communication preferences.",
};

export default function PreferencesPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
        Account Settings
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Preferences
      </h1>

      <p className="mt-4 text-muted-foreground">
        Choose which HotLap communications and recommendations you receive.
      </p>

      <div className="mt-10">
        <PreferencesForm />
      </div>
    </div>
  );
}