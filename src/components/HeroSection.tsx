import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Slide = {
  id: string;
  title: string;
  description: string;
  image: string;
  accent?: string;
};

const slides: Slide[] = [
  {
    id: "bubble-boy",
    title: "Retro spirit, pedal with it",
    description: "Keep your pace. Controlled speed lasts longer than chaos.",
    image: "/Poster.png",
    accent: "What",
  },
  {
    id: "night-ride",
    title: "Timeless ride, fixie pride",
    description: "Hold your line. Focus on your path, not the noise around you.",
    image: "/part.png",
    accent: "Is",
  },
  {
    id: "bold-fixie",
    title: "Culture moves, fixie proves",
    description: "One ride at a time. Win the day, then the next.",
    image: "/cycology.png",
    accent: "That?",
  },
];
export const HeroSection = () => {
  const slidesWithClones = useMemo(
    () => [slides[slides.length - 1], ...slides, slides[0]],
    []
  );
  const maxIndex = slidesWithClones.length - 1;
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("left");

  const handleNext = useCallback(() => {
    setDirection("left");
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setDirection("right");
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5200);

    return () => clearInterval(interval);
  }, [handleNext]);

  useEffect(() => {
    if (!isTransitioning) {
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsTransitioning(true));
      });

      return () => cancelAnimationFrame(timer);
    }
  }, [isTransitioning]);

  const handleTransitionEnd = useCallback(() => {
    if (currentIndex === slidesWithClones.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(slides.length);
    }
  }, [currentIndex, slidesWithClones.length]);

  const translateValue = useMemo(
    () => `translateX(-${currentIndex * 100}%)`,
    [currentIndex]
  );

  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative h-[70vh] w-full md:h-[100vh]">
        <div
          className="flex h-full"
          style={{
            transform: translateValue,
            transition: isTransitioning
              ? "transform 900ms ease-in-out"
              : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slidesWithClones.map((slide, index) => (
            <article
              key={`${slide.id}-${index}`}
              className="relative h-[70vh] w-full flex-shrink-0 bg-neutral-900 md:h-[100vh]"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-transform duration-5000",
                  direction === "left"
                    ? "scale-100"
                    : "scale-[1.01] origin-center"
                )}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
              <div className="absolute inset-0">
                <div className="container mx-auto flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-white drop-shadow-[0_6px_22px_rgba(0,0,0,0.45)]">
                  {slide.accent && (
                    <span className="text-sm uppercase tracking-[0.2em] text-white/80">
                      {slide.accent}
                    </span>
                  )}
                  <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="max-w-2xl text-sm font-medium text-white/80 md:text-base">
                    {slide.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/70 via-background/40 to-transparent" />

        <div className="absolute inset-y-0 left-0 flex items-center px-3">
          <Button
            variant="secondary"
            size="icon"
            onClick={handlePrev}
            className="pointer-events-auto h-12 w-12 rounded-full border border-border/70 bg-background/80 text-foreground shadow-lg backdrop-blur"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center px-3">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleNext}
            className="pointer-events-auto h-12 w-12 rounded-full border border-border/70 bg-background/80 text-foreground shadow-lg backdrop-blur"
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => {
            const normalizedIndex =
              currentIndex === 0
                ? slides.length - 1
                : currentIndex === slidesWithClones.length - 1
                  ? 0
                  : currentIndex - 1;

            const isActive = normalizedIndex === index;

            return (
              <span
                key={index}
                className={cn(
                  "h-2.5 w-2.5 rounded-full border border-border/70 bg-foreground/30 transition",
                  isActive
                    ? "bg-foreground shadow-[0_0_0_6px_rgba(255,255,255,0.18)]"
                    : ""
                )}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
