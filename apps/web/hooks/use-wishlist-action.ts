"use client";

import {
  toast,
} from "sonner";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  useAuthStore,
} from "@/store/auth-store";

import {
  useWishlistStore,
} from "@/store/wishlist-store";

type UseWishlistActionOptions = {
  productId: string;
  productName: string;
  productSlug: string;
};

export function useWishlistAction({
  productId,
  productName,
  productSlug,
}: UseWishlistActionOptions) {
  const authStatus =
    useAuthStore(
      (state) =>
        state.status,
    );

  const isSaved =
    useWishlistStore(
      (state) =>
        state.items.some(
          (item) =>
            item.product.id ===
            productId,
        ),
    );

  const loadStatus =
    useWishlistStore(
      (state) =>
        state.loadStatus,
    );

  const globalOperationIsPending =
    useWishlistStore(
      (state) =>
        state.isLoading,
    );

  const productOperationIsPending =
    useWishlistStore(
      (state) =>
        state.pendingProductIds.includes(
          productId,
        ),
    );

  const toggleWishlist =
    useWishlistStore(
      (state) =>
        state.toggleWishlist,
    );

  const actionIsDisabled =
    authStatus === "loading" ||
    loadStatus !== "loaded" ||
    globalOperationIsPending ||
    productOperationIsPending;

  async function toggle() {
    if (
      authStatus !==
      "authenticated"
    ) {
      toast.info(
        "Sign in to save products to your wishlist.",
        {
          action: {
            label: "Sign In",

            onClick: () => {
              window.location.href =
                `/login?next=${encodeURIComponent(
                  `/products/${productSlug}`,
                )}`;
            },
          },
        },
      );

      return;
    }

    if (actionIsDisabled) {
      return;
    }

    try {
      const mutationWasPerformed =
        await toggleWishlist(
          productId,
        );

      if (
        !mutationWasPerformed
      ) {
        return;
      }

      if (isSaved) {
        toast.info(
          `${productName} removed from your wishlist.`,
        );

        return;
      }

      toast.success(
        `${productName} saved to your wishlist.`,
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

      toast.error(message);
    }
  }

  return {
    isSaved,
    isPending:
      productOperationIsPending,
    isDisabled:
      actionIsDisabled,
    toggle,
  };
}
