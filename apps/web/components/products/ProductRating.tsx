import {
  Star,
} from "lucide-react";

type ProductRatingProps = {
  rating: number;
  reviewCount: number;
};

export default function ProductRating({
  rating,
  reviewCount,
}: ProductRatingProps) {
  if (reviewCount <= 0) {
    return null;
  }

  const roundedRating =
    Math.round(
      rating,
    );

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div
        className="flex items-center gap-0.5"
        aria-label={`${rating.toFixed(1)} out of 5 stars`}
      >
        {Array.from({
          length: 5,
        }).map(
          (
            _,
            index,
          ) => (
            <Star
              key={
                index
              }
              className={
                index <
                roundedRating
                  ? "size-4 fill-amber-400 text-amber-400"
                  : "size-4 text-white/15"
              }
            />
          ),
        )}
      </div>

      <span className="text-sm font-semibold text-foreground">
        {rating.toFixed(
          1,
        )}
      </span>

      <span className="text-sm text-muted-foreground">
        (
        {reviewCount}{" "}
        {reviewCount === 1
          ? "review"
          : "reviews"}
        )
      </span>
    </div>
  );
}
