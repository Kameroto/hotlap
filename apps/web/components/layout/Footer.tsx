import Link from "next/link";

import {
  ArrowRight,
  Headphones,
  Heart,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import Container from "./Container";

const shopLinks = [
  {
    href: "/products",
    label: "All Products",
  },
  {
    href: "/products?category=rc-cars",
    label: "RC Cars",
  },
  {
    href: "/wishlist",
    label: "Wishlist",
  },
  {
    href: "/cart",
    label: "Cart",
  },
];

const customerLinks = [
  {
    href: "/account",
    label: "My Account",
  },
  {
    href: "/account/orders",
    label: "Orders",
  },
  {
    href: "/account/addresses",
    label: "Addresses",
  },
  {
    href: "/account/preferences",
    label: "Preferences",
  },
];

const companyLinks = [
  {
    href: "/about",
    label: "About HotLap",
  },
  {
    href: "/events",
    label: "RC Events",
  },
  {
    href: "/contact",
    label: "Contact",
  },
];

export default function Footer() {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/8 bg-[#07090b]">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] lg:gap-12 lg:py-16">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="HotLap home"
              className="inline-flex items-center text-2xl font-black italic tracking-[-0.07em]"
            >
              HOTL
              <span className="text-primary">
                A
              </span>
              P
            </Link>

            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              Premium RC cars,
              performance parts and
              accessories for enthusiasts
              who demand more from every
              run.
            </p>

            <div className="mt-7 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-primary" />

                India
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="size-4 shrink-0 text-primary" />

                Genuine products
              </div>

              <div className="flex items-center gap-3">
                <Headphones className="size-4 shrink-0 text-primary" />

                RC enthusiast support
              </div>
            </div>
          </div>

          <FooterColumn
            title="Shop"
            links={
              shopLinks
            }
          />

          <FooterColumn
            title="Customer"
            links={
              customerLinks
            }
          />

          <FooterColumn
            title="HotLap"
            links={
              companyLinks
            }
          />
        </div>

        <div className="border-t border-white/8 py-7">
          <div className="flex flex-col gap-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} HotLap.
              All rights reserved.
            </p>

            <p className="flex items-center gap-1.5">
              Built for people who
              <Heart className="size-3.5 fill-primary text-primary" />
              RC performance.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

type FooterColumnProps = {
  title: string;

  links: {
    href: string;
    label: string;
  }[];
};

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">
        {title}
      </h2>

      <ul className="mt-5 space-y-3">
        {links.map(
          (link) => (
            <li
              key={
                link.href
              }
            >
              <Link
                href={
                  link.href
                }
                className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {
                  link.label
                }

                <ArrowRight className="size-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}