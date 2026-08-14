"use client";

import Link from "next/link";

import {
  BatteryCharging,
  Box,
  CarFront,
  Cog,
  FlaskConical,
  Gauge,
  Heart,
  Layers3,
  LoaderCircle,
  PackageCheck,
  Ruler,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  toast,
} from "sonner";

import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductImage from "@/components/products/ProductImage";
import ProductAvailability from "@/components/products/ProductAvailability";
import ProductPrice from "@/components/products/ProductPrice";
import ProductRating from "@/components/products/ProductRating";

import {
  Button,
} from "@/components/ui/button";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  cn,
} from "@/lib/utils";

import {
  useAuthStore,
} from "@/store/auth-store";

import {
  useWishlistStore,
} from "@/store/wishlist-store";

import type {
  Product,
} from "@/types/product";

type ProductCardProps = {
  product: Product;
};

type DisplaySpecification = {
  key: string;
  label: string;
  value: string;
  icon: LucideIcon;
};

const specificationMetadata: Record<
  string,
  {
    label: string;
    icon: LucideIcon;
  }
> = {
  scale: {
    label: "Scale",
    icon: Ruler,
  },

  topSpeed: {
    label: "Top Speed",
    icon: Gauge,
  },

  motor: {
    label: "Motor",
    icon: Zap,
  },

  drivetrain: {
    label: "Drivetrain",
    icon: Cog,
  },

  chassis: {
    label: "Chassis",
    icon: Wrench,
  },

  category: {
    label: "Type",
    icon: CarFront,
  },

  capacity: {
    label: "Capacity",
    icon: BatteryCharging,
  },

  chemistry: {
    label: "Chemistry",
    icon: FlaskConical,
  },

  enclosure: {
    label: "Enclosure",
    icon: Box,
  },

  material: {
    label: "Material",
    icon: Layers3,
  },

  use: {
    label: "Use",
    icon: PackageCheck,
  },

  adjustment: {
    label: "Adjustment",
    icon: SlidersHorizontal,
  },
};

const preferredSpecificationOrder = [
  "scale",
  "topSpeed",
  "motor",
  "drivetrain",
  "chassis",
  "category",
  "capacity",
  "chemistry",
  "enclosure",
  "material",
  "use",
  "adjustment",
];

function humanizeSpecificationKey(
  value: string,
): string {
  return value
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2",
    )
    .replace(
      /[-_]/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function getDisplaySpecifications(
  product: Product,
): DisplaySpecification[] {
  const entries =
    Object.entries(
      product.specifications,
    ).filter(
      ([, value]) =>
        Boolean(
          value?.trim(),
        ),
    );

  entries.sort(
    (
      [firstKey],
      [secondKey],
    ) => {
      const firstIndex =
        preferredSpecificationOrder.indexOf(
          firstKey,
        );

      const secondIndex =
        preferredSpecificationOrder.indexOf(
          secondKey,
        );

      const normalizedFirstIndex =
        firstIndex === -1
          ? Number.MAX_SAFE_INTEGER
          : firstIndex;

      const normalizedSecondIndex =
        secondIndex === -1
          ? Number.MAX_SAFE_INTEGER
          : secondIndex;

      return (
        normalizedFirstIndex -
        normalizedSecondIndex
      );
    },
  );

  return entries
    .slice(
      0,
      4,
    )
    .map(
      ([key, value]) => {
        const metadata =
          specificationMetadata[
            key
          ];

        return {
          key,

          label:
            metadata?.label ??
            humanizeSpecificationKey(
              key,
            ),

          value,

          icon:
            metadata?.icon ??
            Settings2,
        };
      },
    );
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const authStatus =
    useAuthStore(
      (state) =>
        state.status,
    );

  const wishlistItems =
    useWishlistStore(
      (state) =>
        state.items,
    );

  const wishlistHasHydrated =
    useWishlistStore(
      (state) =>
        state.hasHydrated,
    );

  const wishlistIsLoading =
    useWishlistStore(
      (state) =>
        state.isLoading,
    );

  const toggleWishlist =
    useWishlistStore(
      (state) =>
        state.toggleWishlist,
    );

  const primaryImage =
    product.images.find(
      (image) =>
        image.isPrimary,
    ) ??
    product.images[0];

  const productIsInWishlist =
    wishlistItems.some(
      (item) =>
        item.product.id ===
        product.id,
    );

  const specifications =
    getDisplaySpecifications(
      product,
    );

  async function handleWishlistToggle() {
    if (
      authStatus !==
      "authenticated"
    ) {
      toast.info(
        "Sign in to save products to your wishlist.",
        {
          action: {
            label:
              "Sign In",

            onClick: () => {
              window.location.href =
                "/login";
            },
          },
        },
      );

      return;
    }

    try {
      await toggleWishlist(
        product.id,
      );

      if (
        productIsInWishlist
      ) {
        toast.info(
          `${product.name} removed from your wishlist.`,
        );

        return;
      }

      toast.success(
        `${product.name} saved to your wishlist.`,
        {
          action: {
            label:
              "View Wishlist",

            onClick: () => {
              window.location.href =
                "/wishlist";
            },
          },
        },
      );
    } catch (error) {
      const message =
        error instanceof
        ApiClientError
          ? error.message
          : "Unable to update your wishlist.";

      toast.error(
        message,
      );
    }
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101316] text-card-foreground shadow-[0_14px_45px_rgba(0,0,0,0.24)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_65px_rgba(0,0,0,0.42)]">
      <div className="relative overflow-hidden border-b border-white/8 bg-[#0b0d0f]">
        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
        >
          <ProductImage
            src={
              primaryImage?.url
            }
            alt={
              primaryImage?.alt ??
              product.name
            }
            badges={
              product.badges
            }
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={
            !wishlistHasHydrated ||
            wishlistIsLoading
          }
          aria-label={
            productIsInWishlist
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={
            productIsInWishlist
          }
          onClick={() => {
            void handleWishlistToggle();
          }}
          className={cn(
            "absolute top-4 right-4 z-10 rounded-full border-white/12 bg-black/55 shadow-lg backdrop-blur-xl",

            productIsInWishlist
              ? "border-primary/50 bg-primary/15 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:border-primary/40 hover:bg-black/75 hover:text-primary",
          )}
        >
          {wishlistIsLoading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Heart
              className={cn(
                "size-4",

                productIsInWishlist &&
                  "fill-current",
              )}
            />
          )}
        </Button>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-primary">
            <CarFront className="size-3.5" />

            {
              product.category.name
            }
          </div>

          {product.isFeatured && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-primary">
              <Sparkles className="size-3" />

              Featured
            </span>
          )}
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {product.brand}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className="mt-2"
        >
          <h3 className="line-clamp-2 text-xl font-bold tracking-[-0.025em] text-foreground transition-colors duration-300 hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3">
          <ProductRating
            rating={
              product.ratingAverage
            }
            reviewCount={
              product.reviewCount
            }
          />
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {
            product.shortDescription
          }
        </p>

        {specifications.length >
          0 && (
          <div className="mt-5 overflow-hidden rounded-xl border border-white/8 bg-black/15">
            {specifications.map(
              (
                specification,
                index,
              ) => {
                const Icon =
                  specification.icon;

                return (
                  <div
                    key={
                      specification.key
                    }
                    className={cn(
                      "grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2.5",

                      index !==
                        specifications.length -
                          1 &&
                        "border-b border-white/7",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Icon className="size-3.5 shrink-0 text-primary" />

                      <span className="text-xs font-medium text-muted-foreground">
                        {
                          specification.label
                        }
                      </span>
                    </div>

                    <span className="max-w-40 truncate text-right text-xs font-semibold text-foreground sm:text-sm">
                      {
                        specification.value
                      }
                    </span>
                  </div>
                );
              },
            )}
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="border-t border-white/8 pt-5">
            <div className="flex items-end justify-between gap-4">
              <ProductPrice
                price={
                  product.price
                }
                compareAtPrice={
                  product.compareAtPrice ??
                  undefined
                }
                currency="INR"
              />

              <ProductAvailability
                productId={
                  product.id
                }
                stockQuantity={
                  product.stockQuantity
                }
                lowStockThreshold={
                  product.lowStockThreshold
                }
              />
            </div>

            <AddToCartButton
              productId={
                product.id
              }
              productName={
                product.name
              }
              stockQuantity={
                product.stockQuantity
              }
              className="mt-5 w-full"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
