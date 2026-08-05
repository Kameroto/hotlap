"use client";

import Image from "next/image";
import { useState } from "react";

import ProductBadges from "@/components/products/ProductBadges";
import type { ProductBadge } from "@/types/product";

type ProductImageProps = {
  src?: string;
  alt: string;
  badges?: ProductBadge[];
};

const placeholderImage = "/products/product-placeholder.svg";

export default function ProductImage({
  src,
  alt,
  badges = [],
}: ProductImageProps) {
  const [imageSource, setImageSource] = useState(
    src || placeholderImage,
  );

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
      <Image
        src={imageSource}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
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