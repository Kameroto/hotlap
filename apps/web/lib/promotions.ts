export type PromotionCode =
  | "HOTLAP10"
  | "RC500";

export type Promotion = {
  code: PromotionCode;
  title: string;
  description: string;
  minimumSubtotal: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maximumDiscount?: number;
};

export type PromotionResult = {
  promotion: Promotion | null;
  discountAmount: number;
  isValid: boolean;
  message: string;
};

export const promotions: Promotion[] = [
  {
    code: "HOTLAP10",
    title: "HotLap 10% Off",
    description:
      "Get 10% off your order, up to ₹1,500.",
    minimumSubtotal: 3000,
    discountType: "percentage",
    discountValue: 10,
    maximumDiscount: 1500,
  },
  {
    code: "RC500",
    title: "₹500 RC Discount",
    description:
      "Save ₹500 when your cart subtotal is at least ₹5,000.",
    minimumSubtotal: 5000,
    discountType: "fixed",
    discountValue: 500,
  },
];

export function normalizePromotionCode(
  code: string,
): string {
  return code.trim().toUpperCase();
}

export function findPromotion(
  code: string,
): Promotion | undefined {
  const normalizedCode =
    normalizePromotionCode(code);

  return promotions.find(
    (promotion) =>
      promotion.code === normalizedCode,
  );
}

export function calculatePromotionDiscount(
  promotion: Promotion,
  subtotal: number,
): number {
  if (subtotal < promotion.minimumSubtotal) {
    return 0;
  }

  if (promotion.discountType === "fixed") {
    return Math.min(
      promotion.discountValue,
      subtotal,
    );
  }

  const percentageDiscount =
    subtotal *
    (promotion.discountValue / 100);

  if (
    promotion.maximumDiscount !== undefined
  ) {
    return Math.min(
      percentageDiscount,
      promotion.maximumDiscount,
      subtotal,
    );
  }

  return Math.min(
    percentageDiscount,
    subtotal,
  );
}

export function validatePromotion(
  code: string,
  subtotal: number,
): PromotionResult {
  const normalizedCode =
    normalizePromotionCode(code);

  if (!normalizedCode) {
    return {
      promotion: null,
      discountAmount: 0,
      isValid: false,
      message: "Enter a coupon code.",
    };
  }

  const promotion =
    findPromotion(normalizedCode);

  if (!promotion) {
    return {
      promotion: null,
      discountAmount: 0,
      isValid: false,
      message:
        "This coupon code is invalid.",
    };
  }

  if (
    subtotal < promotion.minimumSubtotal
  ) {
    return {
      promotion,
      discountAmount: 0,
      isValid: false,
      message: `Add ₹${promotion.minimumSubtotal - subtotal} more to use ${promotion.code}.`,
    };
  }

  return {
    promotion,
    discountAmount:
      calculatePromotionDiscount(
        promotion,
        subtotal,
      ),
    isValid: true,
    message: `${promotion.code} applied successfully.`,
  };
}