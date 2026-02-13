import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { OrderStatus, PaymentStatus } from '@/admin/types';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string;
  type?: 'order' | 'payment' | 'stock';
}

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  Placed: { label: 'Placed', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  Processing: { label: 'Processing', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  Shipped: { label: 'Shipped', className: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  Delivered: { label: 'Delivered', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  Cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  Pending: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  Completed: { label: 'Completed', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  Failed: { label: 'Failed', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

const stockStatusConfig: Record<string, { label: string; className: string }> = {
  'In Stock': { label: 'In Stock', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  'Low Stock': { label: 'Low Stock', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  'Out of Stock': { label: 'Out of Stock', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

const StatusBadge = ({ status, type = 'order' }: StatusBadgeProps) => {
  let config;
  
  if (type === 'order') {
    config = orderStatusConfig[status as OrderStatus];
  } else if (type === 'payment') {
    config = paymentStatusConfig[status as PaymentStatus];
  } else {
    config = stockStatusConfig[status];
  }

  if (!config) {
    return (
      <Badge variant="outline" className="font-medium">
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn('font-medium border', config.className)}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
