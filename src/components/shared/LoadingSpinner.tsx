'use client';

import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Show full-page centered spinner */
  fullPage?: boolean;
  /** Show skeleton placeholders instead of spinner */
  skeleton?: boolean;
  /** Number of skeleton rows when skeleton=true */
  skeletonRows?: number;
  /** Custom size class for the spinner icon */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Optional text label displayed below the spinner */
  label?: string;
}

const sizeMap = {
  sm: 'size-5',
  md: 'size-8',
  lg: 'size-12',
};

export function LoadingSpinner({
  fullPage = false,
  skeleton = false,
  skeletonRows = 4,
  size = 'md',
  className,
  label,
}: LoadingSpinnerProps) {
  // Skeleton mode
  if (skeleton) {
    return (
      <div className={cn('w-full space-y-4 p-4', className)}>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            {i % 2 === 0 && <Skeleton className="h-4 w-5/6" />}
          </div>
        ))}
      </div>
    );
  }

  // Full-page spinner
  if (fullPage) {
    return (
      <div
        className={cn(
          'flex min-h-[50vh] flex-col items-center justify-center gap-3',
          className
        )}
      >
        <Loader2 className={cn('animate-spin text-emerald-600', sizeMap[size])} />
        {label && (
          <p className="text-sm text-muted-foreground">{label}</p>
        )}
      </div>
    );
  }

  // Inline spinner
  return (
    <div className={cn('flex items-center justify-center gap-2 py-4', className)}>
      <Loader2 className={cn('animate-spin text-emerald-600', sizeMap[size])} />
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
