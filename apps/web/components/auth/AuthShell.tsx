import Link from "next/link";
import type { ReactNode } from "react";

import {
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Trophy,
} from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const benefits = [
  {
    icon: ShoppingBag,
    title: "Faster checkout",
    description:
      "Save your details for a quicker purchasing experience.",
  },
  {
    icon: Trophy,
    title: "Track every order",
    description:
      "View order progress and your complete purchase history.",
  },
  {
    icon: CheckCircle2,
    title: "Save your favourites",
    description:
      "Keep your wishlist synchronized with your account.",
  },
];

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
      <section className="hidden bg-neutral-950 px-10 py-16 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div>
          <Link
            href="/"
            className="text-3xl font-bold tracking-wide text-red-500"
          >
            HotLap
          </Link>

          <div className="mt-20 max-w-xl">
            <p className="text-[0.875rem] font-semibold uppercase tracking-[0.25em] text-red-400">
              Built for RC enthusiasts
            </p>

            <h2 className="mt-5 text-5xl font-bold leading-tight">
              Your HotLap account keeps your RC journey together.
            </h2>

            <p className="mt-6 text-lg leading-8 text-neutral-300">
              Save products, manage orders, maintain delivery
              addresses, and keep your account details together.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="flex gap-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5 text-red-400" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {benefit.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-neutral-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-14 sm:px-8 lg:px-12">
        <div className="w-full max-w-lg">
          <Link
            href="/"
            className="text-3xl font-bold tracking-wide text-red-600 lg:hidden"
          >
            HotLap
          </Link>

          <div className="mt-10 lg:mt-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <p className="mt-7 text-[0.875rem] font-semibold uppercase tracking-[0.2em] text-red-600">
              {eyebrow}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {title}
            </h1>

            <p className="mt-4 leading-7 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mt-9">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
