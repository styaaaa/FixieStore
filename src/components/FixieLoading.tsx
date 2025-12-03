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
        <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border bg-card/70 px-6 py-8 shadow-inner">
          <div className={`relative ${sizeClasses[size].track}`}>
            <div className="absolute inset-x-4 bottom-3 h-1 rounded-full bg-muted" />

            <div className={`absolute left-[-35%] bottom-0 ${sizeClasses[size].bike} animate-ride`}>                
              <svg
                viewBox="0 0 120 70"
                className="h-full w-full text-primary drop-shadow-md"
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="30"
                  cy="50"
                  r="18"
                  className="origin-center animate-wheel-spin"
                />
                <circle
                  cx="90"
                  cy="50"
                  r="18"
                  className="origin-center animate-wheel-spin"
                />
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
