export default function Loading() {
  return (
    <main
      className="mx-auto min-h-[60vh] max-w-7xl px-6 py-16"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="animate-pulse">
        <div className="h-4 w-32 rounded bg-muted" />

        <div className="mt-5 h-12 max-w-xl rounded bg-muted" />

        <div className="mt-4 h-5 max-w-2xl rounded bg-muted" />

        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border"
            >
              <div className="aspect-[4/3] bg-muted" />

              <div className="space-y-4 p-5">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-7 w-3/4 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
                <div className="h-10 w-full rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">
        Loading HotLap content
      </span>
    </main>
  );
}