"use client";

import {
  Share2,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

type ProductShareButtonProps = {
  productName: string;
  shortDescription: string;
};

async function copyText(
  value: string,
): Promise<void> {
  if (
    navigator.clipboard?.writeText
  ) {
    await navigator.clipboard.writeText(
      value,
    );

    return;
  }

  const textArea =
    document.createElement(
      "textarea",
    );

  textArea.value = value;
  textArea.setAttribute(
    "readonly",
    "",
  );
  textArea.style.position =
    "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(
    textArea,
  );
  textArea.select();

  const copied =
    document.execCommand(
      "copy",
    );

  textArea.remove();

  if (!copied) {
    throw new Error(
      "Clipboard access is unavailable.",
    );
  }
}

export default function ProductShareButton({
  productName,
  shortDescription,
}: ProductShareButtonProps) {
  async function handleShare() {
    const url =
      window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shortDescription,
          url,
        });

        return;
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }
      }
    }

    try {
      await copyText(url);
      toast.success(
        "Product link copied.",
      );
    } catch {
      toast.error(
        "Unable to share this product in your browser.",
      );
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        void handleShare();
      }}
      className="px-2 text-muted-foreground hover:text-primary"
      aria-label={`Share ${productName}`}
    >
      <Share2 className="size-4" />
      Share
    </Button>
  );
}
