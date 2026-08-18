import Link from "next/link";

import {
  ArrowRight,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";

const accountSettings = [
  {
    href: "/account/profile",
    title: "Profile",
    description:
      "Manage your name and phone number, and view the email connected to your account.",
    action: "Open Profile",
    icon: UserRound,
  },
  {
    href: "/account/addresses",
    title: "Addresses",
    description:
      "Manage your saved delivery addresses and choose your default address.",
    action: "Manage Addresses",
    icon: MapPin,
  },
  {
    href: "/account/orders",
    title: "Orders",
    description:
      "View your order history, current status, order details, and available reorder actions.",
    action: "View Orders",
    icon: Package,
  },
];

export default function AccountSettingsPanel() {
  return (
    <section
      aria-labelledby="account-settings-heading"
      className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-card/90 shadow-[0_20px_70px_rgba(0,0,0,0.22)]"
    >
      <div className="border-b border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-5 py-5 sm:px-7">
        <h2
          id="account-settings-heading"
          className="text-xl font-semibold tracking-tight"
        >
          Account essentials
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Choose an area to review or update the information connected to your account.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-3">
        {accountSettings.map((setting, index) => {
          const Icon = setting.icon;

          return (
            <Link
              key={setting.href}
              href={setting.href}
              aria-label={`${setting.action}: ${setting.description}`}
              className={`group flex min-h-60 min-w-0 flex-col rounded-2xl border border-white/10 bg-black/15 p-5 outline-none transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/[0.045] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none sm:p-6 ${
                index === accountSettings.length - 1
                  ? "sm:col-span-2 xl:col-span-1"
                  : ""
              }`}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <Icon
                  aria-hidden="true"
                  className="size-5"
                />
              </span>

              <h3 className="mt-5 break-words text-lg font-semibold transition-colors group-hover:text-primary motion-reduce:transition-none">
                {setting.title}
              </h3>

              <p className="mt-2 min-w-0 flex-1 break-words text-sm leading-6 text-muted-foreground">
                {setting.description}
              </p>

              <span className="mt-6 inline-flex min-h-11 items-center gap-2 break-words text-sm font-semibold text-primary">
                {setting.action}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
