import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";

import ProductImage from "@/components/products/ProductImage";
import ProductPrice from "@/components/products/ProductPrice";
import ProductRating from "@/components/products/ProductRating";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const primaryImage = product.images[0];
  const isInStock = product.stockQuantity > 0;

  return (
    <article className="group overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
        >
          <ProductImage
            src={primaryImage?.url}
            alt={primaryImage?.alt ?? product.name}
            badges={product.badges}
          />
        </Link>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Add ${product.name} to wishlist`}
          className="absolute top-4 right-4 z-10 rounded-full bg-background/90 shadow-sm backdrop-blur"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col p-5">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className="mt-2"
        >
          <h3 className="line-clamp-2 text-xl font-semibold tracking-tight transition-colors hover:text-red-600">
            {product.name}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-4">
          <ProductRating
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>

        <div className="mt-4">
          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            currency={product.currency}
          />
        </div>

        <p
          className={`mt-3 text-sm font-medium ${
            isInStock ? "text-green-600" : "text-red-600"
          }`}
        >
          {isInStock
            ? `${product.stockQuantity} in stock`
            : "Out of stock"}
        </p>

        <Button
          type="button"
          disabled={!isInStock}
          className="mt-5 w-full"
        >
          <ShoppingCart className="h-4 w-4" />
          {isInStock ? "Add to Cart" : "Unavailable"}
        </Button>
      </div>
    </article>
  );
}