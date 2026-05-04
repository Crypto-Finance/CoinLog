'use client';

import { cn } from '@/lib/utils/utils';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message = 'Loading...',
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16',
        fullScreen && 'min-h-screen',
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-[#BFFF00]" />
      <p className="text-sm text-[#c3caac] font-medium">{message}</p>
    </div>
  );
}
