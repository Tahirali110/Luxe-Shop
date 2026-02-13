import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ShoppingBag, Download } from 'lucide-react';
import { generateInvoicePDF, InvoiceData } from '@/utils/invoiceGenerator';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { CheckoutProvider, useCheckout } from '@/context/CheckoutContext';
import { CheckoutStepper } from '@/components/Checkout/CheckoutStepper';
import { ShippingStep } from '@/components/Checkout/ShippingStep';
import { PaymentStep } from '@/components/Checkout/PaymentStep';
import { ReviewStep } from '@/components/Checkout/ReviewStep';
import { OrderSummary } from '@/components/Checkout/OrderSummary';
import { useOrderStore, Order, OrderItem } from '@/store/useOrderStore';
import { SHIPPING_METHODS, SUPPORTED_PAYMENT_APPS } from '@/context/CheckoutContext';
import { pageTransition, fadeUp } from '@/utils/animations';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { createPaymentIntent } from '@/services/paymentService';

const CheckoutContent = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { currentStep, setCurrentStep, formData, resetCheckout } = useCheckout();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastOrderData = useRef<Order | null>(null);

  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  // Countdown timer after order complete
  useEffect(() => {
    if (orderComplete) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
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
  }, [orderComplete]);

  // Handle navigation when countdown reaches 0
  useEffect(() => {
    if (orderComplete && countdown === 0) {
      navigate('/order-success', { state: { orderData: lastOrderData.current } });
    }
  }, [orderComplete, countdown, navigate]);

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

    // Sync shipping method from form to store to ensure accurate totals calculation
    useCartStore.getState().setShippingMethod(formData.shippingMethod as any);

    const totalAmount = useCartStore.getState().getTotal();
    let paymentIntentId: string | null = null;

    // Process Stripe payment for credit card
    if (formData.paymentMethod === 'credit-card') {
      if (!stripe || !elements) {
        toast.error('Payment system not ready. Please refresh and try again.');
        setIsProcessing(false);
        return;
      }

      try {
        // Step 1: Create PaymentIntent on backend
        const { clientSecret, paymentIntentId: intentId } = await createPaymentIntent(totalAmount);
        paymentIntentId = intentId;

        // Step 2: Confirm payment with Stripe using stored PaymentMethod ID
        const { stripePaymentMethodId } = formData;

        if (!stripePaymentMethodId) {
          toast.error('Payment information missing. Please try again.');
          setIsProcessing(false);
          return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: stripePaymentMethodId,
        });

        if (error) {
          console.error('Payment error:', error);
          toast.error(error.message || 'Payment failed. Please try again.');
          setIsProcessing(false);
          return;
        }

        if (paymentIntent?.status !== 'succeeded') {
          toast.error('Payment was not successful. Please try again.');
          setIsProcessing(false);
          return;
        }

        // Payment successful!
        toast.success('Payment processed successfully!');
      } catch (err: any) {
        console.error('Payment processing error:', err);
        toast.error(err.message || 'Failed to process payment');
        setIsProcessing(false);
        return;
      }
    }

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
      paymentStatus: formData.paymentMethod === 'credit-card' ? 'Completed' : 'Pending',
      paymentIntentId: paymentIntentId,
      totals: {
        subtotal: useCartStore.getState().getSubtotal(),
        shipping: useCartStore.getState().getShipping(),
        tax: useCartStore.getState().getTax(),
        total: totalAmount,
      },
      shippingMethodId: formData.shippingMethod,
      shippingMethodName: SHIPPING_METHODS.find(m => m.id === formData.shippingMethod)?.name || 'Standard Shipping',
      estimatedDelivery: SHIPPING_METHODS.find(m => m.id === formData.shippingMethod)?.duration || '5-7 business days',
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

      const selectedMethod = SHIPPING_METHODS.find(m => m.id === formData.shippingMethod) || SHIPPING_METHODS[0];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString();

      // Store in ref for Invoice/Success page
      lastOrderData.current = {
        ...data,
        id: data._id,
        shortId: data._id.toString().slice(-8).toUpperCase(),
        date: dateStr,
        placedAt: `${dateStr} ${timeStr}`,
        paymentConfirmedAt: `${dateStr} ${timeStr}`,
        shippingMethodName: selectedMethod.name,
        estimatedDelivery: selectedMethod.duration,
        // Ensure items structure matches
        items: items.map(item => ({ ...item, id: item.productId.toString() }))
      };

      // Success: Clear cart and show confirmation
      clearCart();
      resetCheckout();
      setIsProcessing(false);
      setOrderComplete(true);
      setCountdown(5);

      toast.success('Order placed successfully!', {
        description: 'Check your email for confirmation details.',
      });

    } catch (error) {
      setIsProcessing(false);
      let errorMsg = 'Failed to place order';
      if (axios.isAxiosError<{ message: string }>(error)) {
        errorMsg = error.response?.data?.message || errorMsg;
      }
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
                    orderId: data.orderId || data._id,
                    date: data.date || new Date(data.createdAt).toLocaleDateString(),
                    items: data.items.map((item: OrderItem) => ({
                      id: item.productId,
                      name: item.name,
                      price: item.price,
                      quantity: item.quantity,
                      selectedColor: item.selectedColor,
                      selectedSize: item.selectedSize,
                    })),
                    subtotal: data.totals.subtotal,
                    shipping: data.totals.shipping,
                    tax: data.totals.tax,
                    total: data.totals.total,
                    shippingAddress: {
                      name: `${data.shippingAddress.firstName} ${data.shippingAddress.lastName}`,
                      address: data.shippingAddress.addressLine1 + (data.shippingAddress.addressLine2 ? `, ${data.shippingAddress.addressLine2}` : ''),
                      city: data.shippingAddress.city,
                      state: data.shippingAddress.state,
                      zipCode: data.shippingAddress.zipCode,
                      email: data.shippingAddress.email,
                      phone: data.shippingAddress.phone,
                    },
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
    <Elements stripe={getStripe()}>
      <CheckoutProvider>
        <CheckoutContent />
      </CheckoutProvider>
    </Elements>
  );
};

export default Checkout;
