import { Badge, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils/utils';

interface DirectionBadgeProps {
  direction: 'Long' | 'Short';
  className?: string;
}

export function DirectionBadge({ direction, className }: DirectionBadgeProps) {
  return (
    <Badge
      className={cn(
        badgeVariants({ variant: 'default' }),
        'rounded-full px-2 py-0.5 text-xs',
        direction === 'Long'
          ? 'bg-[#BFFF00] text-[#081425] border-0'
          : 'bg-[#FFD1DC] text-[#081425] border-0',
        className
      )}
    >
      {direction}
    </Badge>
  );
}
