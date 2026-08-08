"use client";

import Image from "next/image";

import {
  ChevronLeft,
  ChevronRight,
  Expand,
} from "lucide-react";

import {
  useState,
} from "react";

import ProductBadges from "@/components/products/ProductBadges";

import {
  cn,
} from "@/lib/utils";

import type {
  ProductBadge,
  ProductImage,
} from "@/types/product";

type ProductGalleryProps = {
  productName: string;
  images: ProductImage[];
  badges?: ProductBadge[];
};

const placeholderImage =
  "/products/product-placeholder.svg";

export default function ProductGallery({
  productName,
  images,
  badges = [],
}: ProductGalleryProps) {
  const orderedImages =
    [...images].sort(
      (
        firstImage,
        secondImage,
      ) => {
        if (
          firstImage.isPrimary !==
          secondImage.isPrimary
        ) {
          return firstImage.isPrimary
            ? -1
            : 1;
        }

        return (
          firstImage.sortOrder -
          secondImage.sortOrder
        );
      },
    );

  const galleryImages =
    orderedImages.length > 0
      ? orderedImages
      : [
          {
            id:
              "placeholder",

            url:
              placeholderImage,

            alt:
              productName,

            sortOrder:
              0,

            isPrimary:
              true,
          },
        ];

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  const [
    imageSource,
    setImageSource,
  ] = useState(
    galleryImages[0].url,
  );

  const selectedImage =
    galleryImages[
      selectedIndex
    ];

  function selectImage(
    index: number,
  ) {
    const nextImage =
      galleryImages[index];

    if (!nextImage) {
      return;
    }

    setSelectedIndex(
      index,
    );

    setImageSource(
      nextImage.url,
    );
  }

  function showPrevious() {
    selectImage(
      selectedIndex === 0
        ? galleryImages.length -
            1
        : selectedIndex - 1,
    );
  }

  function showNext() {
    selectImage(
      selectedIndex ===
        galleryImages.length -
          1
        ? 0
        : selectedIndex + 1,
    );
  }

  return (
    <div className="min-w-0">
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f12] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] hotlap-grid-background" />

        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.055] blur-[110px]" />

        <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square xl:aspect-[4/3]">
          <Image
            key={
              imageSource
            }
            src={
              imageSource
            }
            alt={
              selectedImage.alt ||
              productName
            }
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-contain p-7 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] sm:p-10"
            onError={() =>
              setImageSource(
                placeholderImage,
              )
            }
          />
        </div>

        {badges.length >
          0 && (
          <div className="absolute top-4 left-4 z-10">
            <ProductBadges
              badges={
                badges
              }
            />
          </div>
        )}

        <div className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-muted-foreground backdrop-blur-xl">
          <Expand className="size-4" />
        </div>

        {galleryImages.length >
          1 && (
          <>
            <button
              type="button"
              onClick={
                showPrevious
              }
              aria-label="Previous product image"
              className="absolute top-1/2 left-4 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-foreground opacity-80 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:text-primary sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={
                showNext
              }
              aria-label="Next product image"
              className="absolute top-1/2 right-4 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-foreground opacity-80 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:text-primary sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {galleryImages.length >
        1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {galleryImages.map(
            (
              image,
              index,
            ) => {
              const isSelected =
                index ===
                selectedIndex;

              return (
                <button
                  key={
                    image.id
                  }
                  type="button"
                  onClick={() =>
                    selectImage(
                      index,
                    )
                  }
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={
                    isSelected
                  }
                  className={cn(
                    "relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border bg-[#0c0f12] transition-all duration-300 sm:w-24",

                    isSelected
                      ? "border-primary shadow-[0_0_0_1px_rgba(255,106,0,0.35)]"
                      : "border-white/10 opacity-60 hover:border-white/25 hover:opacity-100",
                  )}
                >
                  <Image
                    src={
                      image.url ||
                      placeholderImage
                    }
                    alt={
                      image.alt ||
                      productName
                    }
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                </button>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}