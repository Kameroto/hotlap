import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

export default function CTAButtons() {
  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <Button size="lg">
        Shop Now
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <Button variant="outline" size="lg">
        Upcoming Events
        <Calendar className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}