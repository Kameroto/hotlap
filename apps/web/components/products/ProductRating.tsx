import { Star } from "lucide-react";

type ProductRatingProps = {
  rating: number;
  reviewCount: number;
};

export default function ProductRating({
  rating,
  reviewCount,
}: ProductRatingProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={16}
            className={
              index < Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>

      <span className="text-sm text-muted-foreground">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  );
}