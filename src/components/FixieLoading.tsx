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
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const containerClasses = fullscreen 
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 z-50' 
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${sizeClasses[size]} mx-auto mb-4`} />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
