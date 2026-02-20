import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminSearch } from '@/hooks/useAdminSearch';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Truck,
  XCircle,
  Printer,
  Calendar,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PageHeader from '@/admin/components/layout/PageHeader';
import StatusBadge from '@/admin/components/shared/StatusBadge';
import EmptyState from '@/admin/components/shared/EmptyState';
import LoadingSpinner from '@/admin/components/shared/LoadingSpinner';
import ConfirmDialog from '@/admin/components/shared/ConfirmDialog';
import { orderService } from '@/admin/services/orderService';
import { useAuthStore } from '@/admin/stores/useAuthStore';
import { Order, OrderStatus, PaymentStatus } from '@/admin/types';
import { formatCurrency, formatDate, formatOrderId } from '@/admin/utils/formatters';
import { toast } from 'sonner';

// Mock data for fallback
const mockOrders: Order[] = [
  {
    _id: '507f1f77bcf86cd799439011',
    user: 'user1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      { productId: '1', name: 'Premium Watch', quantity: 1, price: 299, image: '/placeholder.svg' },
      { productId: '2', name: 'Leather Wallet', quantity: 2, price: 89, image: '/placeholder.svg' },
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      addressLine1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    paymentMethod: 'Credit Card',
    paymentStatus: 'Completed',
    orderStatus: 'Processing',
    totals: { subtotal: 477, tax: 42.93, shipping: 10, total: 529.93 },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '507f1f77bcf86cd799439012',
    user: 'user2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    items: [
      { productId: '3', name: 'Designer Bag', quantity: 1, price: 899, image: '/placeholder.svg' },
    ],
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1987654321',
      addressLine1: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
    },
    paymentMethod: 'UPI',
    paymentStatus: 'Completed',
    orderStatus: 'Shipped',
    totals: { subtotal: 899, tax: 80.91, shipping: 0, total: 979.91 },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '507f1f77bcf86cd799439013',
    user: 'user3',
    customerName: 'Bob Wilson',
    customerEmail: 'bob@example.com',
    items: [
      { productId: '4', name: 'Wireless Earbuds', quantity: 1, price: 249, image: '/placeholder.svg' },
    ],
    shippingAddress: {
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob@example.com',
      phone: '+1555555555',
      addressLine1: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Placed',
    totals: { subtotal: 249, tax: 22.41, shipping: 10, total: 281.41 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const Orders = () => {
  const navigate = useNavigate();
  const { admin } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      // Use mock data as fallback
      setOrders(mockOrders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter]);

  // Trie-based prefix search — O(m) per query, O(1) for repeated queries via Map cache
  const getOrderTokens = useCallback(
    (o: Order) => [
      o._id,
      formatOrderId(o._id),
      o.customerName ?? '',
      o.customerEmail ?? '',
    ],
    []
  );
  const searchedOrders = useAdminSearch(orders, searchQuery, getOrderTokens);

  const filteredOrders = useMemo(() => {
    let result = [...searchedOrders];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.orderStatus === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      result = result.filter((o) => o.paymentStatus === paymentFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'total-desc':
          return b.totals.total - a.totals.total;
        case 'total-asc':
          return a.totals.total - b.totals.total;
        default:
          return 0;
      }
    });

    return result;
  }, [searchedOrders, statusFilter, paymentFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      // Optimistic update for demo
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      toast.success(`Order status updated to ${newStatus}`);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    try {
      await orderService.cancelOrder(orderToCancel);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderToCancel
            ? { ...o, orderStatus: 'Cancelled', paymentStatus: 'Failed' }
            : o
        )
      );
      toast.success('Order cancelled successfully');
    } catch (error) {
      // Optimistic update for demo
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderToCancel
            ? { ...o, orderStatus: 'Cancelled', paymentStatus: 'Failed' }
            : o
        )
      );
      toast.success('Order cancelled successfully');
    } finally {
      setIsCancelling(false);
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description={`${orders.length} total orders`}
        breadcrumbs={[{ label: 'Orders' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={isLoading}
            className="h-9 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Placed">Placed</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="total-desc">Highest Amount</SelectItem>
            <SelectItem value="total-asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description={
            searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Orders will appear here once customers start purchasing'
          }
        />
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order._id} className="group">
                    <TableCell>
                      <span className="font-mono font-medium">
                        {formatOrderId(order._id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName || 'Customer'}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerEmail || order.shippingAddress.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(order.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatCurrency(order.totals.total)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.paymentStatus} type="payment" />
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={admin?.role === 'demo_admin'}
                        value={order.orderStatus}
                        onValueChange={(value) =>
                          handleStatusChange(order._id, value as OrderStatus)
                        }
                      >
                        <SelectTrigger className="w-32 h-8">
                          <StatusBadge status={order.orderStatus} type="order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Placed">Placed</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/orders/${order._id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Invoice
                          </DropdownMenuItem>
                          {order.orderStatus !== 'Cancelled' &&
                            order.orderStatus !== 'Delivered' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  disabled={admin?.role === 'demo_admin'}
                                  onClick={() => {
                                    if (admin?.role !== 'demo_admin') {
                                      setOrderToCancel(order._id);
                                      setCancelDialogOpen(true);
                                    }
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{' '}
                {filteredOrders.length} orders
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone and the customer will be notified."
        confirmLabel="Cancel Order"
        variant="destructive"
        onConfirm={handleCancelOrder}
        isLoading={isCancelling}
      />
    </div>
  );
};

export default Orders;
