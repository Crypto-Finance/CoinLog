import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  subtitle?: string | ReactNode;
  className?: string;
}

/**
 * Reusable stat card component for displaying metrics.
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Trades"
 *   value={stats.totalTrades}
 *   icon={BarChart3}
 *   color={winRateColor(stats.winRate)}
 * />
 * ```
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'text-foreground',
  subtitle,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'rounded-[24px] bg-[#152031] border border-[rgba(255,255,255,0.1)] shadow-none',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-bold text-[#c3caac]">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', color)} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-[800]', color)}>{value}</div>
        {subtitle && (
          <p className="text-xs text-[#c3caac] mt-1 font-medium">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
