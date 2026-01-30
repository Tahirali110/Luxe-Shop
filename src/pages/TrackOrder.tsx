import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  MapPin,
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

  const { getOrderById } = useOrderStore();

  // Fetch real order data if available, otherwise fallback to mock simulation
  const orderData = useMemo(() => {
    if (!searchedOrderId) return null;

    const realOrder = getOrderById(searchedOrderId);

    if (realOrder) {
      const getStatusSteps = (status: string) => {
        const steps = [
          { id: 'placed', label: 'Order Placed', desc: 'Received and confirmed', icon: Package },
          { id: 'processing', label: 'Processing', desc: 'Preparing for shipment', icon: Clock },
          { id: 'shipped', label: 'Shipped', desc: 'Package is on its way', icon: Truck },
          { id: 'delivered', label: 'Delivered', desc: 'Delivered to your address', icon: CheckCircle },
        ];

        const currentIndex = ['placed', 'processing', 'shipped', 'delivered'].indexOf(status);

        return steps.map((step, idx) => ({
          ...step,
          done: idx <= currentIndex,
          date: idx === 0 ? realOrder.placedAt : (idx <= currentIndex ? 'Completed' : 'Pending'),
          description: step.desc
        }));
      };

      const getCarrier = (methodName: string) => {
        if (methodName.includes('Overnight')) return 'FedEx Priority';
        if (methodName.includes('Express')) return 'Blue Dart Express';
        return 'Delhivery';
      };

      return {
        orderId: realOrder.id,
        status: realOrder.status,
        carrier: getCarrier(realOrder.shippingMethodName || 'Standard'),
        trackingNumber: realOrder.trackingNumber || (realOrder.status === 'placed' ? 'Assigning soon' : `LXR${realOrder.id.split('-')[1]}99`),
        estimatedDelivery: realOrder.estimatedDelivery,
        steps: getStatusSteps(realOrder.status)
      };
    }

    // fallback simulation for demo purposes
    const today = new Date();
    const orderDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const estimatedDelivery = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    return {
      orderId: searchedOrderId,
      status: 'shipped',
      carrier: 'Blue Dart Express',
      trackingNumber: '881234567890',
      estimatedDelivery: estimatedDelivery.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
      steps: [
        { id: 'placed', label: 'Order Placed', description: 'Received and confirmed', date: orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), done: true, icon: Package },
        { id: 'processing', label: 'Processing', description: 'Preparing for shipment', date: 'Completed', done: true, icon: Clock },
        { id: 'shipped', label: 'Shipped', description: 'Package is on its way', date: 'Completed', done: true, icon: Truck },
        { id: 'delivered', label: 'Delivered', description: 'Delivered to your address', date: 'Pending', done: false, icon: CheckCircle },
      ],
    };
  }, [searchedOrderId, getOrderById]);

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
              {/* Order Info Card */}
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
                      <p className="font-semibold text-sm">{orderData.carrier}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tracking #</p>
                      <p className="font-semibold text-sm truncate max-w-[140px]">{orderData.trackingNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Calendar size={18} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Delivery</p>
                      <p className="font-semibold text-sm text-green-600">{orderData.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-green-500"
                    />
                    <p className="font-medium text-primary">Your package is on its way!</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
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
