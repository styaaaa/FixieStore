interface FixieLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
}

const SIZE_MAP = {
  sm: { bike: 'h-16 w-32', track: 'h-20' },
  md: { bike: 'h-20 w-40', track: 'h-24' },
  lg: { bike: 'h-24 w-52', track: 'h-28' }
} as const;

export const FixieLoading = ({
  message = 'Memuat halaman...',
  size = 'md',
  fullscreen = false
}: FixieLoadingProps) => {
  const containerClasses = fullscreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm'
    : 'flex min-h-[60vh] items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-muted/40 px-6 py-8 shadow-inner">
          <div className={`relative ${SIZE_MAP[size].track}`}>
            <div className="absolute inset-x-4 bottom-4 h-[6px] rounded-full bg-muted" />

            <div className={`absolute left-1/2 bottom-1 -translate-x-1/2 ${SIZE_MAP[size].bike} animate-ride`}>
              <svg
                viewBox="0 0 200 140"
                className="h-full w-full text-primary drop-shadow-md"
                fill="none"
                stroke="currentColor"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <g className="animate-wheel-spin" style={{ transformOrigin: '60px 98px', transformBox: 'fill-box' }}>
                  <circle cx="60" cy="98" r="26" />
                  <line x1="60" y1="72" x2="60" y2="124" />
                  <line x1="34" y1="98" x2="86" y2="98" />
                  <line x1="42" y1="80" x2="78" y2="116" />
                  <line x1="42" y1="116" x2="78" y2="80" />
                </g>

                <g className="animate-wheel-spin" style={{ transformOrigin: '152px 98px', transformBox: 'fill-box' }}>
                  <circle cx="152" cy="98" r="26" />
                  <line x1="152" y1="72" x2="152" y2="124" />
                  <line x1="126" y1="98" x2="178" y2="98" />
                  <line x1="134" y1="80" x2="170" y2="116" />
                  <line x1="134" y1="116" x2="170" y2="80" />
                </g>

                <path d="M60 98 L110 90 L92 56 Z" />
                <path d="M110 90 L152 98 L140 50" />
                <path d="M92 56 L124 46 L134 54" />
                <path d="M140 50 L122 42" />

                <g className="animate-crank-spin [transform-origin:110px_90px]">
                  <circle cx="110" cy="90" r="8" />
                  <line x1="110" y1="90" x2="110" y2="64" />
                  <rect x="105" y="56" width="10" height="10" rx="2" />
                  <line x1="110" y1="90" x2="110" y2="116" />
                  <rect x="105" y="116" width="10" height="10" rx="2" />
                </g>

                <path d="M84 52 L66 40" strokeWidth={4} />
                <path d="M136 44 L158 40" strokeWidth={4} />
                <path d="M154 40 L170 36" strokeWidth={4} />
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
