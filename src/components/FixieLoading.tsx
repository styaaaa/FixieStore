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
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm'
    : 'flex min-h-[60vh] items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-muted/40 px-6 py-8 shadow-inner">
          <div className={`relative ${sizeClasses[size].track}`}>
            <div className="absolute inset-x-4 bottom-3 h-1 rounded-full bg-muted" />

            <div
              className={`absolute left-1/2 bottom-0 -translate-x-1/2 ${sizeClasses[size].bike} animate-ride`}
            >
              <svg
                viewBox="0 0 120 70"
                className="h-full w-full text-primary drop-shadow-md"
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <g
                  className="animate-wheel-spin"
                  style={{ transformOrigin: '30px 50px', transformBox: 'fill-box' }}
                >
                  <circle cx="30" cy="50" r="18" />
                  <line x1="30" y1="32" x2="30" y2="68" />
                  <line x1="12" y1="50" x2="48" y2="50" />
                  <line x1="17" y1="37" x2="43" y2="63" />
                  <line x1="17" y1="63" x2="43" y2="37" />
                </g>

                <g
                  className="animate-wheel-spin"
                  style={{ transformOrigin: '90px 50px', transformBox: 'fill-box' }}
                >
                  <circle cx="90" cy="50" r="18" />
                  <line x1="90" y1="32" x2="90" y2="68" />
                  <line x1="72" y1="50" x2="108" y2="50" />
                  <line x1="77" y1="37" x2="103" y2="63" />
                  <line x1="77" y1="63" x2="103" y2="37" />
                </g>

                <path d="M30 50 L58 46 L48 30 Z" />
                <path d="M58 46 L90 50 L82 24" />
                <path d="M48 30 L68 24 L74 28" />
                <path d="M82 24 L70 20" />

                <g className="animate-crank-spin [transform-origin:60px_46px]">
                  <circle cx="60" cy="46" r="6" />
                  <line x1="60" y1="46" x2="60" y2="30" />
                  <rect x="57" y="24" width="6" height="6" rx="1" />
                  <line x1="60" y1="46" x2="60" y2="62" />
                  <rect x="57" y="62" width="6" height="6" rx="1" />
                </g>

                <g className="animate-pulse">
                  <path
                    d="M14 34 C8 28 8 22 14 18"
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={0.5}
                  />
                  <path
                    d="M20 26 C14 20 14 14 20 10"
                    strokeWidth={2}
                    strokeLinecap="round"
                    opacity={0.35}
                  />
                </g>
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
