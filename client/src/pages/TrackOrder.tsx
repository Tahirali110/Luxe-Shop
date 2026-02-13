import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  ArrowLeft,
  Calendar,
  Hash
} from 'lucide-react';
import { pageTransition, fadeUp } from '@/utils/animations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOrderStore, Order } from '@/store/useOrderStore';
import { SHIPPING_METHODS } from '@/context/CheckoutContext';

interface OrderStatus {
  id: string;
  label: string;
  description: string;
  date: string;
  done: boolean;
  icon: React.ElementType;
}

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('order') || '';
  const [orderId, setOrderId] = useState(initialOrderId);
  const [searchedOrderId, setSearchedOrderId] = useState(initialOrderId);
  const [isSearching, setIsSearching] = useState(false);

  const { orders, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Automatically track the latest order if no order ID is in search params
  useEffect(() => {
    if (!initialOrderId && orders.length > 0) {
      // Sort orders by date to find the latest
      const latestOrder = [...orders].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      if (latestOrder) {
        setOrderId(latestOrder._id);
        setSearchedOrderId(latestOrder._id);
      }
    }
  }, [initialOrderId, orders]);

  // Fetch real order data if available, otherwise fallback to mock simulation
  const orderData = useMemo(() => {
    if (!searchedOrderId) return null;

    // Flexible search: match full ID, or last 8 characters (case-insensitive, ignoring '#')
    const cleanSearchId = searchedOrderId.replace('#', '').toUpperCase();
    const realOrder = orders.find(o =>
      o._id === searchedOrderId ||
      o._id.toUpperCase() === cleanSearchId ||
      o._id.slice(-8).toUpperCase() === cleanSearchId
    );

    if (realOrder) {
      const getStatusSteps = (status: string) => {
        const steps = [
          { id: 'Placed', label: 'Order Placed', desc: 'Received and confirmed', icon: Package },
          { id: 'Processing', label: 'Processing', desc: 'Preparing for shipment', icon: Clock },
          { id: 'Shipped', label: 'Shipped', desc: 'Package is on its way', icon: Truck },
          { id: 'Delivered', label: 'Delivered', desc: 'Delivered to your address', icon: CheckCircle },
        ];

        const statuses = ['Placed', 'Processing', 'Shipped', 'Delivered'];
        const currentIndex = statuses.indexOf(status);

        const formatDate = (dateInput: string | number | Date | undefined): string => {
          if (!dateInput) return 'Pending';
          try {
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return String(dateInput);
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (e) {
            return String(dateInput);
          }
        };

        return steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          let stepDate = 'Pending';

          if (idx === 0) {
            stepDate = formatDate(realOrder.createdAt);
          } else if (idx === currentIndex) {
            stepDate = formatDate(realOrder.updatedAt || new Date());
          } else if (idx < currentIndex) {
            stepDate = 'Completed';
          }

          return {
            ...step,
            done: isDone,
            date: stepDate,
            description: step.desc
          };
        });
      };

      const getCarrier = (methodName: string) => {
        if (!methodName) return 'Delhivery';
        const name = methodName.toLowerCase();
        if (name.includes('overnight')) return 'FedEx Priority';
        if (name.includes('express')) return 'Blue Dart Express';
        return 'Delhivery';
      };

      const getStatusMessage = (status: string) => {
        switch (status) {
          case 'Placed': return "We've received your order and are confirming details.";
          case 'Processing': return "Your order is being prepared for shipment.";
          case 'Shipped': return "Your package is on its way!";
          case 'Delivered': return "Your package has been delivered successfully.";
          case 'Cancelled': return "This order has been cancelled.";
          default: return "Your package is on its way!";
        }
      };

      const formatEstimatedDate = (dateInput: string | undefined): string => {
        if (dateInput && dateInput !== 'TBD') return dateInput;
        // Fallback for older orders or missing data
        return "5-7 business days";
      };

      return {
        orderId: `#${(realOrder._id || realOrder.id || '').slice(-8).toUpperCase()}`,
        status: realOrder.orderStatus,
        carrier: getCarrier(realOrder.shippingMethodName || ''),
        trackingNumber: realOrder.trackingNumber || (realOrder.orderStatus === 'Placed' ? 'Assigning soon' : `LXR${realOrder._id.substring(0, 8).toUpperCase()}99`),
        estimatedDelivery: formatEstimatedDate(realOrder.estimatedDelivery),
        steps: getStatusSteps(realOrder.orderStatus),
        statusMessage: getStatusMessage(realOrder.orderStatus)
      };
    }

    return null;
  }, [searchedOrderId, orders]);

  const handleSearch = async () => {
    if (!orderId.trim()) return;
    setIsSearching(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setSearchedOrderId(orderId.trim());
    setIsSearching(false);
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen py-12 lg:py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Shop
            </Link>
            <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order ID to see the current status</p>
          </div>

          {/* Search Box */}
          <motion.div
            variants={fadeUp}
            className="bg-card rounded-3xl p-6 border border-border mb-8"
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter Order ID (e.g., NXS-12345678)"
                  className="pl-11 h-12 rounded-xl"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !orderId.trim()}
                className="h-12 px-6 rounded-xl"
              >
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Clock size={18} />
                  </motion.div>
                ) : (
                  'Track'
                )}
              </Button>
            </div>
          </motion.div>

          {/* Order Status */}
          {orderData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-3xl p-6 border border-border">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Hash size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Order ID</p>
                      <p className="font-semibold text-sm">{orderData.orderId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Truck size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Carrier</p>
                      <p className="font-semibold text-sm">{orderData.status === 'Cancelled' ? 'N/A' : orderData.carrier}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tracking #</p>
                      <p className="font-semibold text-sm truncate max-w-[140px]">{orderData.status === 'Cancelled' ? 'Void' : orderData.trackingNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${orderData.status === 'Cancelled' ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                      <Calendar size={18} className={orderData.status === 'Cancelled' ? 'text-destructive' : 'text-green-500'} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{orderData.status === 'Cancelled' ? 'Status' : 'Est. Delivery'}</p>
                      <p className={`font-semibold text-sm ${orderData.status === 'Cancelled' ? 'text-destructive' : 'text-green-600'}`}>
                        {orderData.status === 'Cancelled' ? 'Cancelled' : orderData.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div className={`p-4 rounded-2xl border ${orderData.status === 'Cancelled' ? 'bg-destructive/5 border-destructive/10' : 'bg-primary/5 border-primary/10'}`}>
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={orderData.status === 'Cancelled' ? {} : { scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-3 h-3 rounded-full ${orderData.status === 'Cancelled' ? 'bg-destructive' : 'bg-green-500'}`}
                    />
                    <p className={`font-medium ${orderData.status === 'Cancelled' ? 'text-destructive' : 'text-primary'}`}>
                      {orderData.statusMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline - Only show if not cancelled */}
              {orderData.status !== 'Cancelled' ? (
                <div className="bg-card rounded-3xl p-8 border border-border">
                  <h2 className="font-display text-xl font-semibold mb-8">Shipment Progress</h2>

                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{
                          height: `${(orderData.steps.filter(s => s.done).length / orderData.steps.length) * 100}%`
                        }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="w-full bg-primary"
                      />
                    </div>

                    <div className="space-y-8">
                      {orderData.steps.map((step, index) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 relative"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.15 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${step.done
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground'
                              }`}
                          >
                            {step.done ? <CheckCircle size={20} /> : <step.icon size={20} />}
                          </motion.div>
                          <div className="flex-1 pt-1">
                            <div className="flex items-center justify-between">
                              <p className={`font-semibold ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.label}
                              </p>
                              <span className={`text-sm ${step.done ? 'text-primary' : 'text-muted-foreground'}`}>
                                {step.date}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-destructive/5 rounded-3xl p-12 border border-destructive/10 text-center">
                  <XCircle size={48} className="text-destructive mx-auto mb-4" />
                  <h2 className="font-display text-xl font-semibold text-destructive mb-2">Order Cancelled</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    This order has been cancelled and is no longer being processed. If you believe this is an error, please contact our support team.
                  </p>
                </div>
              )}

              {/* Help Section */}
              <motion.div
                variants={fadeUp}
                className="text-center p-6 bg-secondary/30 rounded-2xl"
              >
                <p className="text-muted-foreground mb-2">Need help with your order?</p>
                <Link to="/contact" className="text-primary hover:underline font-medium">
                  Contact Support
                </Link>
              </motion.div>
            </motion.div>
          ) : searchedOrderId ? (
            <motion.div
              variants={fadeUp}
              className="text-center py-16 bg-card rounded-3xl border border-destructive/20"
            >
              <XCircle size={64} className="mx-auto text-destructive/30 mb-6" />
              <h3 className="font-display text-xl font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find an order with ID <span className="font-semibold text-foreground">"{searchedOrderId}"</span>.
                Please check the ID in your email confirmation and try again.
              </p>
              <Button
                variant="outline"
                onClick={() => { setOrderId(''); setSearchedOrderId(''); }}
                className="mt-6"
              >
                Clear Search
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={fadeUp}
              className="text-center py-16 bg-card rounded-3xl border border-border"
            >
              <Package size={64} className="mx-auto text-muted-foreground/30 mb-6" />
              <h3 className="font-display text-xl font-semibold mb-2">Enter Your Order ID</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter your order ID above to track your shipment status and estimated delivery date.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TrackOrder;
