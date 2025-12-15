  // Lightweight GSAP-inspired ticker for environments without the full library.
  // Supports simple repeated animations driven by requestAnimationFrame.
  type EaseFunction = (t: number) => number;

  interface TickerOptions {
    duration?: number; // seconds
    repeat?: number; // -1 for infinite
    ease?: EaseFunction;
    onUpdate?: (progress: number) => void;
  }

  interface TickerControl {
    kill: () => void;
    pause: () => void;
    resume: () => void;
  }

  const defaultEase: EaseFunction = (t) => t;

  export const createGsapTicker = ({
    duration = 1,
    repeat = 0,
    ease = defaultEase,
    onUpdate,
  }: TickerOptions): TickerControl => {
    let frameId: number | null = null;
    let startTime: number | null = null;
    let iteration = 0;
    let paused = false;

    const step = (timestamp: number) => {
      if (paused) {
        frameId = requestAnimationFrame(step);
        return;
      }

      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = (timestamp - startTime) / 1000;
      const rawProgress = Math.min(elapsed / duration, 1);
      const eased = ease(rawProgress);

      onUpdate?.(eased);

      if (rawProgress >= 1) {
        iteration += 1;
        if (repeat === -1 || iteration <= repeat) {
          startTime = timestamp;
        } else {
          return;
        }
      }

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return {
      kill: () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
      },
      pause: () => {
        paused = true;
      },
      resume: () => {
        paused = false;
        startTime = performance.now();
        frameId = requestAnimationFrame(step);
      },
    };
  };