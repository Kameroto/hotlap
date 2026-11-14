import Link from "next/link";

import {
  ArrowUpRight,
  BatteryCharging,
  Boxes,
  CarFront,
  type LucideIcon,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";

import {
  getCategories,
} from "@/lib/api/categories";

import type {
  Category,
} from "@/lib/api/types";

const categoryPresentation: Record<
  string,
  {
    icon: LucideIcon;
    index: string;
  }
> = {
  "rc-cars": {
    icon: CarFront,
    index: "01",
  },
  "batteries-chargers": {
    icon: BatteryCharging,
    index: "02",
  },
  "3d-printed-accessories": {
    icon: Boxes,
    index: "03",
  },
};

export default async function ShopByCategory() {
  const categories =
    await getCategories()
      .then((response) =>
        response.categories.filter(
          (category) =>
            category.productCount >
            0,
        ),
      )
      .catch(() => []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div
      id="shop-by-category"
      className="min-w-0 max-w-full scroll-mt-24"
    >
      <Section className="relative overflow-hidden border-b border-white/8 bg-[#0c0f12]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-0 opacity-[0.12] hotlap-grid-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_0%,rgba(255,106,0,0.035),transparent_30rem)]" />
        </div>

        <Container>
          <div className="relative">
            <SectionHeading
              badge="Catalogue"
              title="Shop by Category"
              subtitle="Explore RC cars, batteries and 3D-printed accessories available in the current HotLap catalogue."
            />

            <div className="mt-10 grid min-w-0 gap-5 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
              {categories.map(
                (category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                  />
                ),
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}

function CategoryCard({
  category,
}: {
  category: Category;
}) {
  const presentation =
    categoryPresentation[
      category.slug
    ];
  const Icon =
    presentation?.icon ?? Boxes;

  return (
    <Link
      href={`/products?category=${encodeURIComponent(
        category.slug,
      )}`}
      className="group relative min-h-[260px] min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-[#101316] p-6 outline-none transition-[border-color,background-color] duration-300 hover:border-primary/45 hover:bg-[#12161a] focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:p-7 md:min-h-[300px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,106,0,0.045),transparent_44%)]"
      />

      <div className="relative flex h-full min-h-[212px] flex-col md:min-h-[244px]">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.075] text-primary transition-colors duration-300 group-hover:border-primary/50 group-hover:bg-primary/[0.12] motion-reduce:transition-none">
            <Icon
              aria-hidden="true"
              className="size-5"
            />
          </span>

          <span className="font-mono text-xs font-semibold tracking-[0.16em] text-muted-foreground">
            {presentation?.index ??
              "—"}
          </span>
        </div>

        <div className="mt-auto pt-12">
          <p className="hotlap-supporting-text font-semibold uppercase tracking-[0.14em] text-primary">
            {category.productCount}{" "}
            {category.productCount === 1
              ? "product"
              : "products"}
          </p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <h3 className="min-w-0 max-w-[15rem] break-words text-2xl leading-tight text-foreground lg:text-3xl">
              {category.name}
            </h3>

            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.035] text-foreground transition-colors duration-300 group-hover:border-primary/50 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
              <ArrowUpRight
                aria-hidden="true"
                className="size-4"
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
