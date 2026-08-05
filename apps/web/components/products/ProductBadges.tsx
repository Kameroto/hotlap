import { Badge } from "@/components/ui/badge";
import type { ProductBadge } from "@/types/product";

type ProductBadgesProps = {
  badges: ProductBadge[];
};

const badgeLabels: Record<ProductBadge, string> = {
  new: "New",
  featured: "Featured",
  sale: "Sale",
  "best-seller": "Best Seller",
};

const badgeStyles: Record<ProductBadge, string> = {
  new: "border-blue-200 bg-blue-100 text-blue-700",
  featured: "border-purple-200 bg-purple-100 text-purple-700",
  sale: "border-red-200 bg-red-100 text-red-700",
  "best-seller": "border-amber-200 bg-amber-100 text-amber-800",
};

export default function ProductBadges({
  badges,
}: ProductBadgesProps) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Badge
          key={badge}
          variant="outline"
          className={badgeStyles[badge]}
        >
          {badgeLabels[badge]}
        </Badge>
      ))}
    </div>
  );
}