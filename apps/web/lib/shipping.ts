export type ShippingMethodId =
  | "standard"
  | "express";

export type ShippingMethod = {
  id: ShippingMethodId;
  name: string;
  description: string;
  cost: number;
};

export const FREE_STANDARD_SHIPPING_THRESHOLD =
  5000;

export const STANDARD_SHIPPING_COST = 199;

export const EXPRESS_SHIPPING_COST = 499;

export function getShippingMethods(
  subtotal: number,
): ShippingMethod[] {
  const standardShippingCost =
    subtotal >=
    FREE_STANDARD_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING_COST;

  return [
    {
      id: "standard",
      name: "Standard Delivery",
      description:
        standardShippingCost === 0
          ? "Free standard delivery applied."
          : `Free when your subtotal reaches ₹${FREE_STANDARD_SHIPPING_THRESHOLD.toLocaleString(
              "en-IN",
            )}.`,
      cost: standardShippingCost,
    },
    {
      id: "express",
      name: "Express Delivery",
      description:
        "Express shipping for this order.",
      cost: EXPRESS_SHIPPING_COST,
    },
  ];
}

export function getShippingMethod(
  methodId: ShippingMethodId,
  subtotal: number,
): ShippingMethod {
  const shippingMethods =
    getShippingMethods(subtotal);

  return (
    shippingMethods.find(
      (method) => method.id === methodId,
    ) ?? shippingMethods[0]
  );
}
