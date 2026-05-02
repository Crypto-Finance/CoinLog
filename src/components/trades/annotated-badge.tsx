import { Badge } from '@/components/ui/badge';

interface AnnotatedBadgeProps {
  className?: string;
}

export function AnnotatedBadge({ className }: AnnotatedBadgeProps) {
  return (
    <Badge variant="secondary" className={className ?? 'bg-emerald-100 text-emerald-700'}>
      Annotated
    </Badge>
  );
}
