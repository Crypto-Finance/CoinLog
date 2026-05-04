import { Badge, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils/utils';

interface AnnotatedBadgeProps {
  className?: string;
}

export function AnnotatedBadge({ className }: AnnotatedBadgeProps) {
  return (
    <Badge 
      className={cn(
        badgeVariants({ variant: 'default' }),
        'rounded-full border-0',
        className
      )}
    >
      Annotated
    </Badge>
  );
}
