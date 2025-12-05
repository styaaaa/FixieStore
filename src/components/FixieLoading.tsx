import { cn } from "@/lib/utils";

type FixieLoadingSize = "sm" | "md" | "lg";

type FixieLoadingVariant = "default" | "ghost";

type FixieLoadingProps = {
  message?: string;
  className?: string;
  fullscreen?: boolean;
  size?: FixieLoadingSize;
  variant?: FixieLoadingVariant;
};

const sizeMap: Record<FixieLoadingSize, string> = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

const gapMap: Record<FixieLoadingSize, string> = {
  sm: "gap-3",
  md: "gap-6",
  lg: "gap-8",
};

const textMap: Record<FixieLoadingSize, string> = {
  sm: "text-xs font-medium text-muted-foreground sm:text-sm",
  md: "text-sm font-medium text-muted-foreground sm:text-base",
  lg: "text-base font-semibold text-muted-foreground",
};

const inlinePaddingMap: Record<FixieLoadingSize, string> = {
  sm: "w-full py-4",
  md: "w-full py-6",
  lg: "w-full py-8",
};

export const FixieLoading = ({
  message = "Memuat...",
  className,
  fullscreen = true,
  size = "md",
  variant = "ghost",
}: FixieLoadingProps) => {
  const variantClassName: Record<FixieLoadingVariant, string> = {
    default:
      "text-muted-foreground/80 dark:text-muted-foreground/70",
    ghost:
      "text-muted-foreground/60 dark:text-muted-foreground/60",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        gapMap[size],
        fullscreen ? "min-h-[60vh] sm:min-h-screen" : inlinePaddingMap[size],
        className
      )}
    >
      <div className="relative">
        <svg
          viewBox="0 0 220 140"
          className={cn(
            variantClassName[variant],
            "fixie-loading-bike",
            sizeMap[size]
          )}
          role="img"
          aria-hidden={message ? undefined : true}
          aria-busy="true"
        >
          <g
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <g className="fixie-loading-wheel">
              <circle cx="60" cy="94" r="36" />
            </g>
            <g className="fixie-loading-wheel">
              <circle cx="160" cy="94" r="36" />
            </g>
          </g>

          <g
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M60 94L96 40L152 40L160 94L108 94L60 94Z" />
            <path d="M96 40L108 94" />
            <path d="M96 40L160 94" />
            <line x1="94" y1="42" x2="84" y2="26" />
            <line x1="152" y1="40" x2="174" y2="32" />
          </g>

          <g
            className="fixie-loading-crank"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <circle cx="108" cy="84" r="12" />
            <line x1="108" y1="84" x2="138" y2="84" />
            <line x1="138" y1="84" x2="148" y2="92" />
            <line x1="108" y1="84" x2="82" y2="84" />
            <line x1="82" y1="84" x2="72" y2="76" />
          </g>

          <g
            className="fixie-loading-chain"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M108 84L60 94" />
            <path d="M108 84L160 94" />
          </g>

          <g
            className="fixie-loading-seat"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <line x1="86" y1="28" x2="108" y2="24" />
            <line x1="108" y1="24" x2="122" y2="24" />
          </g>
        </svg>

        <div
          className={cn(
            "fixie-loading-trail",
            variant === "ghost" && "fixie-loading-trail-ghost"
          )}
          aria-hidden
        />
      </div>

      {message && <p className={textMap[size]}>{message}</p>}
    </div>
  );
};

export default FixieLoading;
