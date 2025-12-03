interface FixieLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
}

export const FixieLoading = ({
  message = 'Loading...',
  size = 'md',
  fullscreen = false
}: FixieLoadingProps) => {
  const sizeClasses = {
    sm: { bike: 'h-16 w-32', track: 'h-20' },
    md: { bike: 'h-20 w-40', track: 'h-24' },
    lg: { bike: 'h-24 w-52', track: 'h-28' }
  } as const;

  const containerClasses = fullscreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 z-50'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-muted/40 px-6 py-8 shadow-inner">
          <div className={`relative ${sizeClasses[size].track}`}>
            <div className="absolute inset-x-4 bottom-3 h-1 rounded-full bg-muted" />

            <div className={`absolute left-1/2 bottom-0 -translate-x-1/2 ${sizeClasses[size].bike}`}>
              <svg
                viewBox="0 0 120 70"
                className="h-full w-full text-primary drop-shadow-md"
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <g className="origin-center animate-wheel-spin">
                  <circle cx="30" cy="50" r="18" />
                  <line x1="30" y1="32" x2="30" y2="68" />
                  <line x1="12" y1="50" x2="48" y2="50" />
                  <line x1="17" y1="37" x2="43" y2="63" />
                  <line x1="17" y1="63" x2="43" y2="37" />
                </g>

                <g className="origin-center animate-wheel-spin">
                  <circle cx="90" cy="50" r="18" />
                  <line x1="90" y1="32" x2="90" y2="68" />
                  <line x1="72" y1="50" x2="108" y2="50" />
                  <line x1="77" y1="37" x2="103" y2="63" />
                  <line x1="77" y1="63" x2="103" y2="37" />
                </g>

                <circle cx="60" cy="46" r="6" className="origin-center animate-crank-spin" />
                <path d="M30 50 L58 46 L48 30 Z" />
                <path d="M58 46 L90 50 L82 24" />
                <path d="M48 30 L68 24 L74 28" />
                <path d="M82 24 L70 20" />
              </svg>
            </div>

            <div className="absolute right-10 bottom-10 h-3 w-3 rounded-full bg-primary/70 animate-cloud" />
            <div className="absolute right-6 bottom-6 h-2 w-2 rounded-full bg-primary/50 animate-cloud delay-150" />
          </div>

          <p className="pt-2 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};
