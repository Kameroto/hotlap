"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useProductPurchaseState } from "@/hooks/use-product-purchase-state";
import { getMaximumProductAddition, parseProductQuantity } from "@/lib/product-purchase-state";
import type { Product } from "@/types/product";

const QuantityContext = createContext<{
  draft: string;
  maximum: number;
  quantity: number | null;
  setDraft: (value: string) => void;
} | null>(null);

export function ProductQuantityProvider({ product, children }: { product: Product; children: ReactNode }) {
  const { cartQuantity } = useProductPurchaseState({ productId: product.id, stockQuantity: product.stockQuantity });
  const maximum = getMaximumProductAddition(product.stockQuantity, cartQuantity);
  const [draft, setDraft] = useState(maximum ? "1" : "");
  const [previousMaximum, setPreviousMaximum] = useState(maximum);

  if (previousMaximum !== maximum) {
    const previous = parseProductQuantity(draft, previousMaximum) ?? 1;
    setPreviousMaximum(maximum);
    setDraft(maximum ? String(Math.min(previous, maximum)) : "");
  }

  const quantity = parseProductQuantity(draft, maximum);
  return (
    <QuantityContext.Provider value={{ draft, maximum, quantity, setDraft }}>
      {children}
    </QuantityContext.Provider>
  );
}

export function useProductQuantity() {
  const value = useContext(QuantityContext);
  if (!value) throw new Error("Product quantity requires a product purchase provider");
  return value;
}

export function ProductQuantity() {
  const id = useId();
  const { draft, maximum, quantity, setDraft } = useProductQuantity();
  const invalid = maximum > 0 && quantity === null;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <label htmlFor={id} className="text-sm font-medium">Quantity</label>
      <Button type="button" variant="outline" size="sm" aria-label="Decrease quantity"
        disabled={quantity === null || quantity <= 1} onClick={() => setDraft(String((quantity ?? 1) - 1))}>−</Button>
      <input id={id} type="text" inputMode="numeric" value={draft} disabled={!maximum}
        aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined}
        className="h-9 w-12 rounded border border-white/20 bg-transparent text-center focus-visible:outline-2 focus-visible:outline-primary"
        onChange={event => setDraft(event.target.value)} />
      <Button type="button" variant="outline" size="sm" aria-label="Increase quantity"
        disabled={quantity === null || quantity >= maximum} onClick={() => setDraft(String((quantity ?? 0) + 1))}>+</Button>
      {invalid && <p id={`${id}-error`} className="w-full text-xs text-red-400" role="status">Enter a whole number from 1 to {maximum}.</p>}
    </div>
  );
}
