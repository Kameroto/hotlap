"use client";

import Image from "next/image";
import { useState } from "react";

import ProductBadges from "@/components/products/ProductBadges";
import {
  cn,
} from "@/lib/utils";
import type { ProductBadge } from "@/types/product";

type ProductImageProps = {
  src?: string;
  alt: string;
  badges?: ProductBadge[];
  variant?:
    | "default"
    | "thumbnail";
};

const placeholderImage = "/products/product-placeholder.svg";

export default function ProductImage({
  src,
  alt,
  badges = [],
  variant = "default",
}: ProductImageProps) {
  const [imageSource, setImageSource] = useState(
    src || placeholderImage,
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        variant === "thumbnail"
          ? "h-full w-full"
          : "aspect-[4/3]",
      )}
    >
      <Image
        src={imageSource}
        alt={alt}
        fill
        sizes={
          variant === "thumbnail"
            ? "72px"
            : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        }
        className={cn(
          "object-contain transition-transform duration-300 group-hover:scale-105",
          variant === "thumbnail"
            ? "p-2"
            : "p-6",
        )}
        onError={() => setImageSource(placeholderImage)}
      />

      {badges.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <ProductBadges badges={badges} />
        </div>
      )}
    </div>
  );
}
