import { ArrowLeft, ArrowRight, CreditCard, Wallet, Smartphone, Lock, Plus, Check, ChevronRight } from 'lucide-react';
import { useCheckout, PAYMENT_METHODS, PaymentMethodId, PaymentDetails } from '@/context/CheckoutContext';
import { fadeUp } from '@/utils/animations';
import { cn } from '@/lib/utils';
import { usePaymentStore, SavedPayment } from '@/store/usePaymentStore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CardElement } from '@stripe/react-stripe-js';

// Stripe CardElement styling options
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1a1a1a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
};

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

import { useStripe, useElements } from '@stripe/react-stripe-js';

export const PaymentStep = ({ onNext, onBack }: PaymentStepProps) => {
  const { formData, setPaymentMethod, updatePaymentDetails, setUpiId, setSelectedApp, setStripePaymentMethodId } = useCheckout();
  const { methods, addPaymentMethod, getDefaultPayment, upiIds, addUpiId } = usePaymentStore();

  const { paymentMethod, paymentDetails, upiId, selectedApp } = formData;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // View states: 'stripe' for new Stripe card, 'list' for saved cards, 'selected' for selected saved card
  const [view, setView] = useState<'stripe' | 'list' | 'selected'>('stripe');

  useEffect(() => {
    usePaymentStore.getState().fetchPayments();
  }, []);

  // Initialize with default payment if available and in credit-card mode
  useEffect(() => {
    if (paymentMethod === 'credit-card' && methods.length > 0 && !paymentDetails.cardNumber) {
      const defaultPay = getDefaultPayment() || methods[0];
      updatePaymentDetails({
        cardNumber: defaultPay.cardNumber,
        cardName: defaultPay.cardName,
        expiryDate: defaultPay.expiryDate,
        cvv: '' // Don't store CVV in backend
      });
      setView('selected');
    }
  }, [paymentMethod, methods, getDefaultPayment, paymentDetails.cardNumber, updatePaymentDetails]);

  // Initialize with default UPI if available
  useEffect(() => {
    if (paymentMethod === 'upi' && upiIds.length > 0 && !upiId) {
      const defaultUpi = upiIds.find(u => u.isDefault) || upiIds[0];
      setUpiId(defaultUpi.upiId);
    }
  }, [paymentMethod, upiIds, upiId, setUpiId]);

  const inputClasses = "w-full px-4 py-3 bg-secondary rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";
  const errorInputClasses = "ring-2 ring-destructive/50";

  const getPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return CreditCard;
      case 'Wallet': return Wallet;
      case 'Smartphone': return Smartphone;
      default: return CreditCard;
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').slice(0, 19) : '';
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    updatePaymentDetails({ [field]: formattedValue });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    if (paymentMethod === 'credit-card') {
      // For Stripe CardElement, we rely on cardComplete state
      if (!cardComplete) {
        setCardError('Please enter valid card details');
        return false;
      }
      if (cardError) {
        return false;
      }
      return true;
    }

    if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID');
        return false;
      }
      return true;
    }

    if (paymentMethod === 'wallet-apps') {
      if (!selectedApp) {
        toast.error('Please select a payment app');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleSelectPayment = (method: SavedPayment) => {
    updatePaymentDetails({
      cardNumber: method.cardNumber,
      cardName: method.cardName,
      expiryDate: method.expiryDate,
      cvv: ''
    });
    setView('selected');
    toast.success('Payment method updated');
  };

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (paymentMethod === 'credit-card') {
        if (!stripe || !elements) {
          toast.error('Stripe not initialized');
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          toast.error('Card element not found');
          return;
        }

        // Create PaymentMethod
        try {
          const { error, paymentMethod: stripeMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
              name: paymentDetails.cardName,
              // We could add more billing details here if available in formData
            },
          });

          if (error) {
            setCardError(error.message || 'Failed to process card details');
            return;
          }

          if (stripeMethod) {
            setStripePaymentMethodId(stripeMethod.id);
            onNext();
          }
        } catch (err) {
          console.error('Stripe error:', err);
          toast.error('Failed to save card details');
        }
      } else if (paymentMethod === 'upi') {
        const existingUpi = upiIds.find(u => u.upiId === upiId);
        if (!existingUpi) {
          await addUpiId({ upiId, isDefault: upiIds.length === 0 });
          toast.success('UPI ID saved to profile');
        }
        onNext();
      } else {
        onNext();
      }
    }
  };

  // Handle CardElement changes
  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  return (
    <motion.form onSubmit={handleSubmit} variants={fadeUp} initial="initial" animate="animate" className="space-y-8">
      {/* Payment Method Selection */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-primary" />
          Payment Method
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = getPaymentIcon(method.icon);
            const isSelected = paymentMethod === method.id;

            return (
              <motion.button
                key={method.id}
                type="button"
                onClick={() => {
                  setPaymentMethod(method.id as PaymentMethodId);
                  if (method.id === 'upi' && upiIds.length > 0 && !upiId) {
                    const defaultUpi = upiIds.find(u => u.isDefault) || upiIds[0];
                    setUpiId(defaultUpi.upiId);
                  }
                  if (method.id === 'wallet-apps' && !selectedApp) {
                    // Don't auto-set, let user pick
                  }
                }}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <Icon size={24} />
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {method.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Credit Card Form - Stripe CardElement */}
      {paymentMethod === 'credit-card' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Card Details
            </h3>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6 space-y-4"
          >
            {/* Stripe CardElement */}
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Card Information
              </label>
              <div className="w-full px-4 py-4 bg-secondary rounded-xl border-0 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <CardElement
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardChange}
                />
              </div>
              {cardError && (
                <p className="text-destructive text-sm mt-2">{cardError}</p>
              )}
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
              <Lock size={14} />
              <span>Your payment is securely processed by <strong>Stripe</strong></span>
            </div>

            {/* Test Card Info */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-sm">
              <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">Test Mode</p>
              <p className="text-blue-600 dark:text-blue-300">
                Use card: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">4242 4242 4242 4242</code>
              </p>
              <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
                Any future date, any 3-digit CVC
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* UPI Section */}
      {paymentMethod === 'upi' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Smartphone size={20} className="text-primary" />
              UPI Details
            </h3>
          </div>

          <div className="space-y-3">
            {upiIds.map((upi) => (
              <motion.button
                key={upi._id}
                type="button"
                onClick={() => setUpiId(upi.upiId)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                  upiId === upi.upiId
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    upiId === upi.upiId ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}>
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">{upi.upiId}</p>
                    {upi.isDefault && <p className="text-[10px] text-primary uppercase font-bold tracking-tight">Default</p>}
                  </div>
                </div>
                {upiId === upi.upiId && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                    <Check size={14} />
                  </div>
                )}
              </motion.button>
            ))}

            <div className="relative group">
              <input
                type="text"
                placeholder="Enter new UPI ID (e.g. username@bank)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className={cn(
                  inputClasses,
                  "pl-12",
                  !upiIds.some(u => u.upiId === upiId) && upiId && "ring-2 ring-primary/20"
                )}
              />
              <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
            <Lock size={14} />
            Secure UPI payment via encrypted gateway
          </div>
        </motion.div>
      )}

      {/* Payment Apps Section */}
      {paymentMethod === 'wallet-apps' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Wallet size={20} className="text-primary" />
              Choose Payment App
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {([
              { id: 'apple-pay', name: 'Apple Pay', color: 'bg-black text-white' },
              { id: 'google-pay', name: 'Google Pay', color: 'bg-white border-border border text-foreground' },
              { id: 'paypal', name: 'PayPal', color: 'bg-[#003087] text-white' },
              { id: 'phone-pe', name: 'PhonePe', color: 'bg-[#5f259f] text-white' },
              { id: 'amazon-pay', name: 'Amazon Pay', color: 'bg-[#232f3e] text-white' },
              { id: 'paytm', name: 'Paytm', color: 'bg-[#00baf2] text-white' },
            ] as const).map((app) => (
              <motion.button
                key={app.id}
                type="button"
                onClick={() => setSelectedApp(app.id)}

                className={cn(
                  "relative p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border-2",
                  selectedApp === app.id
                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                    : "border-transparent bg-secondary/30 hover:bg-secondary/50 grayscale-[0.5] hover:grayscale-0"
                )}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm font-bold text-xs", app.color)}>
                  {app.name === 'Apple Pay' && ' Pay'}
                  {app.name === 'Google Pay' && <span className="flex font-bold"><span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-500">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></span>}
                  {app.name === 'PayPal' && 'PayPal'}
                  {app.name === 'PhonePe' && 'PhonePe'}
                  {app.name === 'Amazon Pay' && 'Amazon'}
                  {app.name === 'Paytm' && 'Paytm'}
                </div>
                <span className="text-xs font-medium text-center">{app.name}</span>

                {selectedApp === app.id && (
                  <motion.div
                    layoutId="app-check"
                    className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-sm"
                  >
                    <Check size={12} strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
            <Lock size={12} />
            You will be redirected to the selected app for payment
          </p>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-semibold"
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-lg shadow-primary/25"
        >
          Review Order
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </motion.form >
  );
};
