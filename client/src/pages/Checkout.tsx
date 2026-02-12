import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ShoppingBag, Download } from 'lucide-react';
import { generateInvoicePDF, InvoiceData } from '@/utils/invoiceGenerator';
import { useCartStore } from '@/store/useCartStore';
import { CheckoutProvider, useCheckout } from '@/context/CheckoutContext';
import { CheckoutStepper } from '@/components/Checkout/CheckoutStepper';
import { ShippingStep } from '@/components/Checkout/ShippingStep';
import { PaymentStep } from '@/components/Checkout/PaymentStep';
import { ReviewStep } from '@/components/Checkout/ReviewStep';
import { OrderSummary } from '@/components/Checkout/OrderSummary';
import { useOrderStore, Order } from '@/store/useOrderStore';
import { SHIPPING_METHODS, SUPPORTED_PAYMENT_APPS } from '@/context/CheckoutContext';
import { pageTransition, fadeUp } from '@/utils/animations';
import { toast } from 'sonner';
import axios from 'axios';

const CheckoutContent = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { currentStep, setCurrentStep, formData, resetCheckout } = useCheckout();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastOrderData = useRef<any>(null);

  // Countdown timer after order complete
  useEffect(() => {
    if (orderComplete) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            navigate('/order-success', { state: { orderData: lastOrderData.current } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    }
  }, [orderComplete, navigate]);

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    // Construct order data compatible with backend
    const orderPayload = {
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        selectedColor: item.color,
        selectedSize: item.size || 'N/A',
      })),
      shippingAddress: {
        firstName: formData.shippingAddress.firstName,
        lastName: formData.shippingAddress.lastName,
        email: formData.shippingAddress.email,
        phone: formData.shippingAddress.phone,
        addressLine1: formData.shippingAddress.address,
        addressLine2: formData.shippingAddress.apartment,
        city: formData.shippingAddress.city,
        state: formData.shippingAddress.state,
        zipCode: formData.shippingAddress.zipCode,
        country: formData.shippingAddress.country,
      },
      paymentMethod: formData.paymentMethod === 'credit-card' ? 'Credit Card' :
        formData.paymentMethod === 'upi' ? 'UPI' :
          formData.paymentMethod === 'wallet-apps' ? 'Wallet' : 'COD',
      totals: {
        subtotal: useCartStore.getState().getSubtotal(),
        shipping: useCartStore.getState().getShipping(),
        tax: useCartStore.getState().getTax(),
        total: useCartStore.getState().getTotal(),
      },
      // Note: user ID is handled by backend via token
    };

    try {
      // Get auth token
      const userStr = localStorage.getItem('user');
      const token = userStr ? JSON.parse(userStr).token : null;

      if (!token) {
        toast.error('You must be logged in to place an order');
        setIsProcessing(false);
        navigate('/auth');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Real API Call
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, orderPayload, config);

      const orderId = data._id; // Use real ID from backend
      setGeneratedOrderId(orderId);

      // Store in ref for Invoice/Success page (formatting specific to success page expectation)
      lastOrderData.current = {
        ...data,
        orderId: data._id, // Map _id to orderId for invoice gen if needed
        id: data._id,
        date: new Date(data.createdAt).toLocaleDateString(),
        // Ensure items structure matches if needed for display
        items: items.map(item => ({ ...item, id: item.productId.toString() }))
      };

      // Save to global order store (optional if fetching from backend later, but good for immediate UI update)
      // useOrderStore.getState().addOrder(data); // Might need type alignment or fetching from backend

      // Success: Clear cart and show confirmation
      clearCart();
      resetCheckout();
      setIsProcessing(false);
      setOrderComplete(true);
      setCountdown(5);

      toast.success('Order placed successfully!', {
        description: 'Check your email for confirmation details.',
      });

    } catch (error: any) {
      setIsProcessing(false);
      const errorMsg = error.response?.data?.message || 'Failed to place order';
      toast.error(errorMsg);
      console.error('Order placement failed:', error);
    }
  };

  // Empty cart state
  if (items.length === 0 && !orderComplete) {
    return (
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-20"
      >
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingBag size={40} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart before checking out.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold"
          >
            Shop Now
          </Link>
        </div>
      </motion.div>
    );
  }

  // Order complete state
  if (orderComplete) {
    return (
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <Check size={48} className="text-primary" />
          </motion.div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-4">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Order confirmation has been sent to{' '}
            <span className="text-foreground font-medium">
              {formData.shippingAddress.email || 'your email'}
            </span>
          </p>
          <div className="my-8 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => {
                const data = lastOrderData.current;
                if (data) {
                  const invoiceData: InvoiceData = {
                    orderId: data.orderId,
                    date: data.date,
                    items: data.items.map((item: any) => ({
                      id: item.id || item.productId,
                      name: item.name,
                      price: item.price,
                      quantity: item.quantity,
                      selectedColor: item.color || item.selectedColor,
                      selectedSize: item.size || item.selectedSize,
                    })),
                    subtotal: data.totals.subtotal,
                    shipping: data.totals.shipping,
                    tax: data.totals.tax,
                    total: data.totals.total,
                    shippingAddress: data.shippingAddress,
                    paymentMethod: 'Credit Card',
                  };
                  generateInvoicePDF(invoiceData);
                } else {
                  toast.error("Invoice data not ready.");
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 hover:scale-105 transition-all shadow-xl shadow-green-500/20"
            >
              <Download size={24} />
              DOWNLOAD YOUR INVOICE NOW
            </button>
            <p className="text-xs text-muted-foreground">Download your receipt before redirection</p>
          </div>

          {/* Dynamic Countdown */}
          <motion.div key={countdown} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="my-4">
            <p className="text-xs text-muted-foreground">Redirecting in</p>
            <motion.span
              className="text-3xl font-display font-bold text-primary"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            >
              {countdown}
            </motion.span>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold"
            >
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-semibold"
            >
              Return Home
            </Link>
          </div>
        </motion.div>
      </motion.div >
    );
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            variants={fadeUp}
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </motion.button>

          {/* Checkout Header */}
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground">Complete your order in just a few steps</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Checkout Form */}
            <div className="lg:col-span-2">
              {/* Stepper */}
              <CheckoutStepper currentStep={currentStep} onStepClick={handleEditStep} />

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ShippingStep onNext={handleNextStep} />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PaymentStep onNext={handleNextStep} onBack={handlePrevStep} />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ReviewStep
                      onBack={handlePrevStep}
                      onPlaceOrder={handlePlaceOrder}
                      isProcessing={isProcessing}
                      onEditStep={handleEditStep}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Order Summary */}
            <div className="order-first lg:order-last">
              <OrderSummary />
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

const Checkout = () => {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
};

export default Checkout;
