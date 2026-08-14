import {
  BarChart3,
  MessageSquareText,
} from "lucide-react";

import ProductRating from "@/components/products/ProductRating";

type ProductReviewsProps = {
  ratingAverage: number;
  reviewCount: number;
};

export default function ProductReviews({
  ratingAverage,
  reviewCount,
}: ProductReviewsProps) {
  const hasAggregateReviews =
    reviewCount > 0;

  return (
    <section
      aria-labelledby="product-reviews-heading"
      className="mt-16 border-t border-white/8 pt-14 lg:mt-20 lg:pt-16"
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div>
          <p className="hotlap-kicker">
            Customer Feedback
          </p>

          <h2
            id="product-reviews-heading"
            className="hotlap-heading mt-4 text-3xl text-foreground sm:text-4xl"
          >
            Reviews at a Glance.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Only the aggregate review
            information currently
            available in the HotLap
            catalogue is shown here.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101316]">
          <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[auto_1fr] md:items-center md:gap-8">
            <div className="flex size-24 flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.055]">
              <span className="text-3xl font-black tracking-[-0.05em] text-foreground">
                {ratingAverage.toFixed(
                  1,
                )}
              </span>

              <span className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-primary">
                Out of 5
              </span>
            </div>

            <div>
              <ProductRating
                rating={
                  ratingAverage
                }
                reviewCount={
                  reviewCount
                }
              />

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {hasAggregateReviews
                  ? `The catalogue reports an aggregate score from ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}.`
                  : "The catalogue does not currently report any reviews for this product."}
              </p>
            </div>
          </div>

          <div className="grid gap-px border-t border-white/8 bg-white/8 sm:grid-cols-2">
            <ReviewDataNotice
              icon={
                MessageSquareText
              }
              title="Written reviews unavailable"
              text="Individual comments, reviewer details and review dates are not included in the current catalogue data."
            />

            <ReviewDataNotice
              icon={
                BarChart3
              }
              title="No rating breakdown"
              text="Per-star rating totals are not available, so no distribution is inferred or displayed."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewDataNotice({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BarChart3;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 bg-[#0d1013] p-5 sm:p-6">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-primary">
        <Icon className="size-4" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {title}
        </h3>

        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          {text}
        </p>
      </div>
    </div>
  );
}
