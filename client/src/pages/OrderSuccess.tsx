import { useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Package, CreditCard, Truck, MapPin, Calendar, Hash, ArrowRight, Search, Download, AlertCircle } from 'lucide-react';
import { generateInvoicePDF, InvoiceData } from '@/utils/invoiceGenerator';
import { CartItem } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { pageTransition, fadeUp } from '@/utils/animations';

const orderStatusSteps = [
  { id: 'placed', label: 'Order Placed', icon: Package },
  { id: 'processing', label: 'Processing', icon: CreditCard },
  { id: 'shipped', label: 'Order Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: MapPin },
];

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate('/shop', { replace: true });
    }
  }, [orderData, navigate]);

  // Generate stable order data using useMemo
  const { orderNumber, orderDate, fullOrderId } = useMemo(() => ({
    orderNumber: orderData?.shortId || orderData?.id?.toString().slice(-8).toUpperCase() || `LXR-${Date.now().toString().slice(-8)}`,
    fullOrderId: orderData?.id || orderData?._id,
    orderDate: orderData?.date || new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }), [orderData]);

  const handleDownloadInvoice = () => {
    try {
      if (!orderData) {
        toast.error('Order data not found', {
          description: 'Please try downloading from your Profile > Orders section.'
        });
        return;
      }

      toast.success('Generating your invoice...', {
        description: 'Your download will start automatically.'
      });

      const invoiceData: InvoiceData = {
        orderId: orderNumber,
        date: orderDate,
        items: orderData.items.map((item: CartItem & { selectedColor?: string; selectedSize?: string }) => ({
          id: item.id || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedColor: item.color || item.selectedColor,
          selectedSize: item.size || item.selectedSize,
        })),
        subtotal: orderData.totals.subtotal,
        shipping: orderData.totals.shipping,
        tax: orderData.totals.tax,
        total: orderData.totals.total,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'Credit Card',
      };

      generateInvoicePDF(invoiceData);
    } catch (error) {
      console.error('Invoice generation failed:', error);
      toast.error('Failed to generate invoice', {
        description: 'Something went wrong. Please try again or contact support.'
      });
    }
  };

  if (!orderData) return null;

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
          {/* Success Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
              >
                <Check size={32} className="text-white" />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-3xl lg:text-4xl font-bold mb-4"
            >
              Order Successful!
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-lg"
            >
              Thank you for your purchase. Your order has been confirmed.
            </motion.p>
          </div>

          {/* Order Info Grid */}
          <motion.div
            variants={fadeUp}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Hash size={18} className="text-primary" />
                <span className="text-sm text-muted-foreground">Order Number</span>
              </div>
              <p className="font-semibold">{orderNumber}</p>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={18} className="text-primary" />
                <span className="text-sm text-muted-foreground">Date</span>
              </div>
              <p className="font-semibold">{orderDate}</p>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard size={18} className="text-primary" />
                <span className="text-sm text-muted-foreground">Payment Method</span>
              </div>
              <p className="font-semibold">{orderData?.paymentMethod || 'Credit Card'}</p>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Truck size={18} className="text-primary" />
                <span className="text-sm text-muted-foreground">Shipping</span>
              </div>
              <p className="font-semibold">{orderData?.shippingMethodName || 'Standard Delivery'}</p>
            </div>
          </motion.div>

          {/* Order Status Timeline */}
          <motion.div
            variants={fadeUp}
            className="bg-card rounded-3xl p-8 border border-border mb-12"
          >
            <h2 className="font-display text-xl font-semibold mb-8">Order Status</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '40%' }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="w-full bg-green-500"
                />
              </div>

              <div className="space-y-8">
                {orderStatusSteps.map((step, index) => {
                  const isDone = index === 0 || (orderData?.status !== 'placed' && index === 1) || (orderData?.status === 'shipped' && index <= 2) || (orderData?.status === 'delivered');
                  // For a fresh order success page, usually the first two are done
                  const displayDone = index <= 1;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className="flex items-start gap-4 relative"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 shrink-0 ${displayDone
                          ? 'bg-green-500 text-white'
                          : 'bg-secondary text-muted-foreground'
                          }`}
                      >
                        {displayDone ? <Check size={20} /> : <step.icon size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${displayDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.id === 'processing' ? 'Payment Confirmed' : step.label}
                          </p>
                          {displayDone && step.id === 'placed' && orderData?.placedAt && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-bold uppercase">
                              at {orderData.placedAt}
                            </span>
                          )}
                          {displayDone && step.id === 'processing' && orderData?.paymentConfirmedAt && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-bold uppercase">
                              at {orderData.paymentConfirmedAt}
                            </span>
                          )}
                        </div>
                        {displayDone && (
                          <p className="text-sm text-green-500">Completed</p>
                        )}
                        {!displayDone && index === 2 && (
                          <p className="text-sm text-muted-foreground">Estimated Delivery: {orderData?.estimatedDelivery || '5-7 business days'}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {orderData && (
              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
              >
                <Download size={20} />
                Download Invoice
              </button>
            )}
            <Link to={`/track-order?order=${fullOrderId}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold h-full"
              >
                <Search size={20} />
                Track Order
              </motion.button>
            </Link>
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border border-border bg-background hover:bg-secondary text-foreground rounded-2xl font-semibold h-full"
              >
                Continue Shopping
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrderSuccess;