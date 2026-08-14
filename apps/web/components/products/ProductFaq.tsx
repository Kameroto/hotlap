import {
  ChevronDown,
} from "lucide-react";

const frequentlyAskedQuestions = [
  {
    question:
      "How should I evaluate this product?",
    answer:
      "Use the category, description and listed specifications as your reference points. If a requirement is not explicitly listed on this page, do not assume the product supports it before purchasing.",
  },
  {
    question:
      "What does the availability indicator mean?",
    answer:
      "It reflects the stock quantity currently reported by the HotLap catalogue. The cart also applies the current inventory limit when you add or update this product.",
  },
  {
    question:
      "Can I save this product for later?",
    answer:
      "Yes. Signed-in customers can use the wishlist control on this page and review saved products from the Wishlist page.",
  },
  {
    question:
      "How can I explore alternatives?",
    answer:
      "Use the related-products section below or return to the product catalogue to browse and filter other currently listed options.",
  },
] as const;

export default function ProductFaq() {
  return (
    <section
      aria-labelledby="product-faq-heading"
      className="mt-16 border-t border-white/8 pt-14 lg:mt-20 lg:pt-16"
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div>
          <p className="hotlap-kicker">
            Buying Guide
          </p>

          <h2
            id="product-faq-heading"
            className="hotlap-heading mt-4 text-3xl text-foreground sm:text-4xl"
          >
            Product FAQ.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Practical guidance for
            interpreting this page and
            using the existing HotLap
            shopping tools.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101316]">
          {frequentlyAskedQuestions.map(
            (
              item,
              index,
            ) => (
              <details
                key={
                  item.question
                }
                name="product-faq"
                className="group border-b border-white/8 last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-left text-sm font-semibold text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/70 sm:px-7 sm:py-6 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="mr-3 font-mono text-xs text-primary/70">
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    {item.question}
                  </span>

                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none group-open:rotate-180 group-open:text-primary" />
                </summary>

                <div className="px-5 pb-5 pl-12 sm:px-7 sm:pb-6 sm:pl-16">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              </details>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
