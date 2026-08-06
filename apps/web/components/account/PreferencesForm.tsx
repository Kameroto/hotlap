"use client";

import { useState } from "react";

import {
  Bell,
  CheckCircle2,
  Mail,
  Save,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Preferences = {
  orderUpdates: boolean;
  promotionalEmails: boolean;
  eventAnnouncements: boolean;
  productRecommendations: boolean;
};

export default function PreferencesForm() {
  const [preferences, setPreferences] =
    useState<Preferences>({
      orderUpdates: true,
      promotionalEmails: false,
      eventAnnouncements: true,
      productRecommendations: true,
    });

  const [saved, setSaved] =
    useState(false);

  function updatePreference(
    preference: keyof Preferences,
  ) {
    setSaved(false);

    setPreferences(
      (currentPreferences) => ({
        ...currentPreferences,
        [preference]:
          !currentPreferences[preference],
      }),
    );
  }

  function savePreferences() {
    console.info(
      "Temporary customer preferences",
      preferences,
    );

    setSaved(true);
  }

  const preferenceOptions = [
    {
      key: "orderUpdates" as const,
      title: "Order updates",
      description:
        "Receive shipment, delivery, and order-status notifications.",
      icon: Bell,
    },
    {
      key: "promotionalEmails" as const,
      title: "Offers and promotions",
      description:
        "Receive discounts, coupon codes, and seasonal offers.",
      icon: Mail,
    },
    {
      key: "eventAnnouncements" as const,
      title: "RC event announcements",
      description:
        "Receive updates about races, meetups, and HotLap events.",
      icon: Trophy,
    },
    {
      key: "productRecommendations" as const,
      title: "Product recommendations",
      description:
        "Receive suggestions based on products and categories you explore.",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="rounded-2xl border bg-card p-6">
      {saved && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          Preferences saved for this frontend demonstration.
        </div>
      )}

      <div className="divide-y">
        {preferenceOptions.map((option) => {
          const Icon = option.icon;

          return (
            <label
              key={option.key}
              className="flex cursor-pointer items-start justify-between gap-6 py-5 first:pt-0 last:pb-0"
            >
              <span className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className="h-5 w-5" />
                </span>

                <span>
                  <span className="font-semibold">
                    {option.title}
                  </span>

                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </span>

              <input
                type="checkbox"
                checked={
                  preferences[option.key]
                }
                onChange={() =>
                  updatePreference(option.key)
                }
                className="mt-3 h-4 w-4 shrink-0"
              />
            </label>
          );
        })}
      </div>

      <div className="mt-7 flex justify-end border-t pt-6">
        <Button
          type="button"
          size="lg"
          onClick={savePreferences}
        >
          <Save className="h-5 w-5" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}