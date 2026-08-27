"use client";

import Image from "next/image";

import {
  ChevronLeft,
  ChevronRight,
  Expand,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
    useMemo(
      () =>
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
        ),
      [images],
    );

  const galleryImages =
    useMemo(
      () =>
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
            ],
      [
        orderedImages,
        productName,
      ],
    );

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

  const [
    lightboxIsOpen,
    setLightboxIsOpen,
  ] = useState(false);

  const dialogReference =
    useRef<HTMLDialogElement>(
      null,
    );

  const lightboxTriggerReference =
    useRef<HTMLButtonElement>(
      null,
    );

  const selectedImage =
    galleryImages[
      selectedIndex
    ];

  const selectImage =
    useCallback(
      (index: number) => {
        const nextImage =
          galleryImages[
            index
          ];

        if (!nextImage) {
          return;
        }

        setSelectedIndex(
          index,
        );

        setImageSource(
          nextImage.url,
        );
      },
      [galleryImages],
    );

  const showPrevious =
    useCallback(() => {
      selectImage(
        selectedIndex === 0
          ? galleryImages.length -
              1
          : selectedIndex - 1,
      );
    }, [
      galleryImages.length,
      selectImage,
      selectedIndex,
    ]);

  const showNext =
    useCallback(() => {
      selectImage(
        selectedIndex ===
          galleryImages.length -
            1
          ? 0
          : selectedIndex + 1,
      );
    }, [
      galleryImages.length,
      selectImage,
      selectedIndex,
    ]);

  useEffect(() => {
    const dialog =
      dialogReference.current;

    if (!dialog) {
      return;
    }

    if (
      lightboxIsOpen &&
      !dialog.open
    ) {
      const previousOverflow =
        document.body.style
          .overflow;

      dialog.showModal();
      document.body.style.overflow =
        "hidden";

      return () => {
        document.body.style.overflow =
          previousOverflow;

        if (dialog.open) {
          dialog.close();
        }
      };
    }
  }, [lightboxIsOpen]);

  useEffect(() => {
    if (!lightboxIsOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        galleryImages.length <=
        1
      ) {
        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        event.preventDefault();
        showPrevious();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        event.preventDefault();
        showNext();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    galleryImages.length,
    lightboxIsOpen,
    showNext,
    showPrevious,
  ]);

  function openLightbox() {
    setLightboxIsOpen(true);
  }

  function closeLightbox() {
    setLightboxIsOpen(false);

    requestAnimationFrame(
      () => {
        lightboxTriggerReference.current?.focus();
      },
    );
  }

  return (
    <div className="min-w-0">
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f12] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] hotlap-grid-background" />

        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.055] blur-[110px]" />

        <button
          ref={
            lightboxTriggerReference
          }
          type="button"
          onClick={
            openLightbox
          }
          aria-label={`Open image gallery for ${productName}`}
          className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-inset sm:aspect-[4/3] lg:aspect-square xl:aspect-[4/3]"
        >
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
            className="object-contain p-7 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:scale-[1.035] sm:p-10"
            onError={() =>
              setImageSource(
                placeholderImage,
              )
            }
          />
        </button>

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

        <button
          type="button"
          onClick={
            openLightbox
          }
          aria-label={`Expand image gallery for ${productName}`}
          className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-muted-foreground backdrop-blur-xl transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          <Expand className="size-4" />
        </button>

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

      <dialog
        ref={
          dialogReference
        }
        aria-label={`${productName} image gallery`}
        onCancel={(event) => {
          event.preventDefault();
          closeLightbox();
        }}
        onClose={() => {
          if (
            lightboxIsOpen
          ) {
            closeLightbox();
          }
        }}
        onClick={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            closeLightbox();
          }
        }}
        className="m-auto h-[100dvh] max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-foreground backdrop:bg-black/90 backdrop:backdrop-blur-md sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-2xl"
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#080a0c] sm:rounded-2xl sm:border sm:border-white/10">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/8 px-4 py-3 sm:px-5">
            <p className="min-w-0 truncate text-sm font-semibold">
              {productName}
            </p>

            <div className="flex items-center gap-3">
              <span className="hotlap-supporting-text text-muted-foreground">
                {selectedIndex + 1} / {galleryImages.length}
              </span>

              <button
                type="button"
                onClick={
                  closeLightbox
                }
                aria-label="Close image gallery"
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                <span aria-hidden="true" className="text-2xl leading-none">
                  &times;
                </span>
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <Image
              key={`lightbox-${imageSource}`}
              src={
                imageSource
              }
              alt={
                selectedImage.alt ||
                productName
              }
              fill
              sizes="100vw"
              className="object-contain p-4 sm:p-10"
              onError={() =>
                setImageSource(
                  placeholderImage,
                )
              }
            />

            {galleryImages.length >
              1 && (
              <>
                <button
                  type="button"
                  onClick={
                    showPrevious
                  }
                  aria-label="Previous product image"
                  className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/65 backdrop-blur-xl transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 sm:left-6 sm:size-12"
                >
                  <ChevronLeft className="size-6" />
                </button>

                <button
                  type="button"
                  onClick={
                    showNext
                  }
                  aria-label="Next product image"
                  className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/65 backdrop-blur-xl transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 sm:right-6 sm:size-12"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>

          {galleryImages.length >
            1 && (
            <div className="flex shrink-0 justify-center gap-2 overflow-x-auto border-t border-white/8 px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {galleryImages.map(
                (
                  image,
                  index,
                ) => (
                  <button
                    key={`lightbox-thumbnail-${image.id}`}
                    type="button"
                    onClick={() =>
                      selectImage(
                        index,
                      )
                    }
                    aria-label={`Show product image ${index + 1}`}
                    aria-pressed={
                      index ===
                      selectedIndex
                    }
                    className={cn(
                      "relative size-14 shrink-0 overflow-hidden rounded-lg border bg-[#0c0f12] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/70 sm:size-16",
                      index === selectedIndex
                        ? "border-primary"
                        : "border-white/10 opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={
                        image.url ||
                        placeholderImage
                      }
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1.5"
                    />
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
