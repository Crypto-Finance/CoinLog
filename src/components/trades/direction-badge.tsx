import { Badge } from '@/components/ui/badge';

interface DirectionBadgeProps {
  direction: 'Long' | 'Short';
  className?: string;
}

export function DirectionBadge({ direction, className }: DirectionBadgeProps) {
  return (
    <Badge
      variant={direction === 'Long' ? 'default' : 'destructive'}
      className={className ?? 'w-14 justify-center'}
    >
      {direction}
    </Badge>
  );
}
