import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Printer,
  Download,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { generateInvoicePDF, InvoiceData } from '@/utils/invoiceGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/admin/components/layout/PageHeader';
import StatusBadge from '@/admin/components/shared/StatusBadge';
import LoadingSpinner from '@/admin/components/shared/LoadingSpinner';
import ConfirmDialog from '@/admin/components/shared/ConfirmDialog';
import { orderService } from '@/admin/services/orderService';
import { useAuthStore } from '@/admin/stores/useAuthStore';
import { Order, OrderStatus } from '@/admin/types';
import { formatCurrency, formatDateTime, formatOrderId } from '@/admin/utils/formatters';
import { toast } from 'sonner';

const statusTimeline: { status: OrderStatus; icon: React.ElementType; label: string }[] = [
  { status: 'Placed', icon: Clock, label: 'Order Placed' },
  { status: 'Processing', icon: Package, label: 'Processing' },
  { status: 'Shipped', icon: Truck, label: 'Shipped' },
  { status: 'Delivered', icon: CheckCircle, label: 'Delivered' },
];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const data = await orderService.getById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      await orderService.updateStatus(order._id, newStatus);
      setOrder({ ...order, orderStatus: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      // Optimistic update for demo
      setOrder({ ...order, orderStatus: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    setIsCancelling(true);
    try {
      await orderService.cancelOrder(order._id);
      setOrder({ ...order, orderStatus: 'Cancelled', paymentStatus: 'Failed' });
      toast.success('Order cancelled successfully');
    } catch (error) {
      // Optimistic update for demo
      setOrder({ ...order, orderStatus: 'Cancelled', paymentStatus: 'Failed' });
      toast.success('Order cancelled successfully');
    } finally {
      setIsCancelling(false);
      setCancelDialogOpen(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!order) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name} (${item.selectedColor || '-'} / ${item.selectedSize || '-'})</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>LUXE Invoice - ${order._id}</title>
          <style>
             body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 50px; }
            .logo { font-size: 32px; font-weight: bold; color: #000; }
            .invoice-label { font-size: 24px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { text-align: left; padding: 12px; background: #f8f8f8; }
            .totals { float: right; width: 300px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
            .footer { margin-top: 100px; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">LUXE</div>
            <div class="invoice-label">INVOICE</div>
          </div>
            <div style="display: flex; justify-content: space-between;">
            <div>
              <strong>Order #:</strong> ${order._id}<br>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}
            </div>
            <div style="text-align: right;">
              <strong>Bill To:</strong><br>
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.addressLine1}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <div class="totals-row"><span>Subtotal</span><span>$${order.totals.subtotal.toFixed(2)}</span></div>
            <div class="totals-row"><span>Shipping</span><span>$${order.totals.shipping.toFixed(2)}</span></div>
            <div class="totals-row"><span>Tax</span><span>$${order.totals.tax.toFixed(2)}</span></div>
            <div class="totals-row grand-total"><span>Grand Total</span><span>$${order.totals.total.toFixed(2)}</span></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadInvoice = () => {
    if (!order) return;

    toast.success('Generating invoice...');

    const invoiceData: InvoiceData = {
      orderId: order._id,
      date: new Date(order.createdAt).toLocaleDateString(),
      items: order.items.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor || 'N/A',
        selectedSize: item.selectedSize || 'N/A',
      })),
      subtotal: order.totals.subtotal,
      shipping: order.totals.shipping,
      tax: order.totals.tax,
      total: order.totals.total,
      shippingAddress: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        address: order.shippingAddress.addressLine1,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode,
        email: order.shippingAddress.email,
        phone: order.shippingAddress.phone,
      },
      paymentMethod: order.paymentMethod,
    };

    setTimeout(() => {
      generateInvoicePDF(invoiceData);
    }, 500);
  };

  const getTimelineStatus = (timelineStatus: OrderStatus) => {
    if (!order) return 'pending';
    if (order.orderStatus === 'Cancelled') return 'cancelled';

    const statusOrder = ['Placed', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(order.orderStatus);
    const timelineIndex = statusOrder.indexOf(timelineStatus);

    if (timelineIndex < currentIndex) return 'completed';
    if (timelineIndex === currentIndex) return 'current';
    return 'pending';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${formatOrderId(order._id)}`}
        breadcrumbs={[
          { label: 'Orders', href: '/admin/orders' },
          { label: formatOrderId(order._id) },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrintInvoice}>
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
            <Button variant="outline" onClick={handleDownloadInvoice}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
              <Button
                variant="destructive"
                onClick={() => setCancelDialogOpen(true)}
                disabled={admin?.role === 'demo_admin'}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              {order.orderStatus === 'Cancelled' ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10">
                  <XCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Order Cancelled</p>
                    <p className="text-sm text-muted-foreground">
                      This order has been cancelled
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {statusTimeline.map((step, index) => {
                    const status = getTimelineStatus(step.status);
                    const Icon = step.icon;

                    return (
                      <div key={step.status} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${status === 'completed'
                              ? 'bg-primary text-primary-foreground'
                              : status === 'current'
                                ? 'bg-primary/20 text-primary border-2 border-primary'
                                : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium mt-2">{step.label}</p>
                        </div>
                        {index < statusTimeline.length - 1 && (
                          <div
                            className={`flex-1 h-1 mx-2 rounded ${status === 'completed' ? 'bg-primary' : 'bg-muted'
                              }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {order.orderStatus !== 'Cancelled' && (
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-sm font-medium">Update Status:</span>
                  <Select
                    disabled={admin?.role === 'demo_admin'}
                    value={order.orderStatus}
                    onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Placed">Placed</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedSize && <span className="ml-3">Size: {item.selectedSize}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right min-w-24">
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.totals.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.totals.shipping === 0
                      ? 'Free'
                      : formatCurrency(order.totals.shipping)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDateTime(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <div className="flex items-center gap-2 mt-1">
                  <CreditCard className="h-4 w-4" />
                  <span>{order.paymentMethod}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${order.shippingAddress.email}`}
                  className="hover:text-primary"
                >
                  {order.shippingAddress.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.shippingAddress.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="text-sm">
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

export default OrderDetail;
