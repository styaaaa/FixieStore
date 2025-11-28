import { useEffect, useMemo, useRef } from "react";
import { createGsapTicker } from "@/lib/gsap-lite";

const partnerLogos = [
  { name: "Solaris Studio", src: "/brand-1.png" },
  { name: "Velvet Voyage", src: "/brand-2.png" },
  { name: "Monarch Mods", src: "/brand-3.png" },
  { name: "Astrid Archive", src: "/brand-4.png" },
  { name: "Rustic Rituals", src: "/brand-5.png" },
  { name: "Canvas Club", src: "/brand-6.png" },
  { name: "Sepia Syndicate", src: "/brand-7.png" },
  { name: "Nova Nostalgia", src: "/brand-8.png" },
];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const BrandPartners = () => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tickerRef = useRef<ReturnType<typeof createGsapTicker> | null>(null);
  const marqueeItems = useMemo(
    () => [...partnerLogos, ...partnerLogos],
    []
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const baseWidth = track.scrollWidth / 2;
    const duration = 14; // seconds

    tickerRef.current = createGsapTicker({
      duration,
      repeat: -1,
      ease: easeOutCubic,
      onUpdate: (progress) => {
        const offset = baseWidth * progress;
        track.style.transform = `translateX(-${offset}px)`;
      },
    });

    const pause = () => tickerRef.current?.pause();
    const resume = () => tickerRef.current?.resume();

    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);

    return () => {
      tickerRef.current?.kill();
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
    };
  }, []);

  return (
    <section className="border-t border-b bg-muted/30 py-10">
      <div className="container mx-auto px-4 space-y-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Brand Partner
          </p>
          <h2 className="text-3xl font-bold">
            Roster vintage yang masih relevan buat Gen Z
          </h2>
          <p className="text-muted-foreground">
            Kami nge-line up label yang estetik, berkarakter, dan selalu siap bikin
            feed kamu terlihat timeless tanpa kehilangan vibe playful masa kini.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border bg-card/60 px-6 py-6 shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background via-background/70 to-transparent" />

          <div className="flex items-center gap-10 overflow-hidden">
            <div
              ref={trackRef}
              className="flex items-center gap-10 will-change-transform"
              style={{ transform: "translateX(0)" }}
            >
              {marqueeItems.map((logo, index) => (
                <div
                  key={`${logo.name}-${index}`}
                  className="flex h-24 w-36 items-center justify-center rounded-xl bg-card/80 px-4 py-3 shadow-inner ring-1 ring-border/60"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
