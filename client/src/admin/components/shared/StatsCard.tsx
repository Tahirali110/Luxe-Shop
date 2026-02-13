import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPercentage } from '@/admin/utils/formatters';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  loading?: boolean;
}

const StatsCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-primary',
  className,
  loading = false,
}: StatsCardProps) => {
  const isPositive = change && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow',
        className
      )}
    >
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-secondary rounded" />
              <div className="h-8 w-32 bg-secondary rounded" />
            </div>
            <div className="h-12 w-12 bg-secondary rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl md:text-3xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-primary" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    isPositive ? 'text-primary' : 'text-destructive'
                  )}
                >
                  {formatPercentage(change)}
                </span>
                {changeLabel && (
                  <span className="text-sm text-muted-foreground">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              'h-12 w-12 rounded-xl flex items-center justify-center bg-primary/10',
              iconColor
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;
