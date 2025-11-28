const brandLogos = [
  { name: "Lader Bikes", src: "/L.png" },
  { name: "Tokyobike", src: "/Tokyo.png" },
  { name: "Pasific", src: "/Pacific.png" },
  { name: "State Bicycle", src: "/State.png" },
  { name: "6KU", src: "/Ku.png" },
  { name: "Aventon", src: "/Aventon.png" },
];

const scrollingLogos = [...brandLogos, ...brandLogos];

export const BrandPartners = () => {
  return (
        <section className="border-y border-border bg-background text-foreground transition-colors">      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Brand Partner
          </p>
         <h2 className="text-3xl font-semibold md:text-4xl">Brand Kece</h2>
          <p className="text-base text-muted-foreground">
            Brand yang bikin makin kece pas Riding.
          </p>
        </div>

        <div className="relative mt-10 overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent" />

          <div className="flex min-w-max animate-marquee gap-6 md:gap-10">
            {scrollingLogos.map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="flex h-20 w-32 items-center justify-center rounded-xl bg-card/70 p-4 shadow-lg shadow-black/10 ring-1 ring-border backdrop-blur"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-h-12 w-full object-contain dark:invert"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
