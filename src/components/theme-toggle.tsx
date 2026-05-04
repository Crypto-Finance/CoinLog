'use client';

import { Moon } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

/**
 * ThemeToggle - Visual indicator only
 * Neon Modular is dark-mode only design
 * This component serves as a visual element showing the current theme state
 */
export function ThemeToggle() {
  return (
    <button
      className={cn(
        'flex items-center justify-center',
        'h-9 px-3 rounded-full',
        'border border-[#BFFF00]/50 bg-transparent',
        'text-[#BFFF00]',
        'hover:bg-[#BFFF00]/10 hover:border-[#BFFF00]',
        'transition-all duration-200',
        'cursor-default'
      )}
      title="Dark mode (Neon Modular design is dark-only)"
      disabled
    >
      <Moon className="h-4 w-4" />
      <span className="sr-only">Dark mode active</span>
    </button>
  );
}
