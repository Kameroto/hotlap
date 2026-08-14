"use client";

import {
  useEffect,
  useState,
} from "react";

import AddToCartButton from "@/components/cart/AddToCartButton";
import BuyNowButton from "@/components/cart/BuyNowButton";
import ProductAvailability from "@/components/products/ProductAvailability";
import ProductPrice from "@/components/products/ProductPrice";

import type {
  Product,
} from "@/types/product";

type MobilePurchaseBarProps = {
  product: Product;
};

export default function MobilePurchaseBar({
  product,
}: MobilePurchaseBarProps) {
  const [footerIsVisible, setFooterIsVisible] =
    useState(false);

  useEffect(() => {
    const footer =
      document.querySelector(
        "footer",
      );

    if (
      !footer ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setFooterIsVisible(
            entry.isIntersecting,
          );
        },
        {
          threshold: 0,
          rootMargin:
            "0px 0px 160px 0px",
        },
      );

    observer.observe(
      footer,
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  if (footerIsVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Mobile purchase controls"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#090c0f]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto max-w-xl">
        <div className="mb-2.5 flex min-w-0 items-center justify-between gap-3">
          <ProductPrice
            price={
              product.price
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

        <div className="grid grid-cols-2 gap-2.5">
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
            size="default"
            className="w-full border-white/15 bg-white/[0.045] px-3 text-foreground shadow-none hover:border-primary/50 hover:bg-primary/[0.055] hover:text-primary"
          />

          <BuyNowButton
            productId={
              product.id
            }
            productSlug={
              product.slug
            }
            productName={
              product.name
            }
            stockQuantity={
              product.stockQuantity
            }
            className="w-full px-3"
          />
        </div>
      </div>
    </aside>
  );
}
