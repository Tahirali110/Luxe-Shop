import { ArrowLeft, ArrowRight, CreditCard, Wallet, Smartphone, Lock, Plus, Check, ChevronRight } from 'lucide-react';
import { useCheckout, PAYMENT_METHODS, PaymentMethodId, PaymentDetails } from '@/context/CheckoutContext';
import { fadeUp } from '@/utils/animations';
import { cn } from '@/lib/utils';
import { usePaymentStore } from '@/store/usePaymentStore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const PaymentStep = ({ onNext, onBack }: PaymentStepProps) => {
  const { formData, setPaymentMethod, updatePaymentDetails, setUpiId, setSelectedApp } = useCheckout();
  const { methods, addPaymentMethod, getDefaultPayment, upiIds, addUpiId } = usePaymentStore();

  const { paymentMethod, paymentDetails, upiId, selectedApp } = formData;
  const [errors, setErrors] = useState<Record<string, string>>({});

  // View states: 'list', 'new', 'selected'
  const [view, setView] = useState<'list' | 'new' | 'selected'>(
    methods.length > 0 && paymentMethod === 'credit-card' ? 'selected' : 'new'
  );

  // Initialize with default payment if available and in credit-card mode
  useEffect(() => {
    if (paymentMethod === 'credit-card' && methods.length > 0 && !paymentDetails.cardNumber) {
      const defaultPay = getDefaultPayment() || methods[0];
      updatePaymentDetails(defaultPay);
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
      const newErrors: Record<string, string> = {};
      const cardNumberClean = paymentDetails.cardNumber.replace(/\s/g, '');

      if (!cardNumberClean || cardNumberClean.length < 16) {
        newErrors.cardNumber = 'Valid card number is required (16 digits)';
      }
      if (!paymentDetails.cardName.trim()) {
        newErrors.cardName = 'Name on card is required';
      }
      if (!paymentDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) {
        newErrors.expiryDate = 'Valid expiry date is required (MM/YY)';
      } else {
        const [month, year] = paymentDetails.expiryDate.split('/');
        const expMonth = parseInt(month, 10);
        if (expMonth < 1 || expMonth > 12) {
          newErrors.expiryDate = 'Invalid month';
        }
      }
      if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) {
        newErrors.cvv = 'Valid CVV is required (3-4 digits)';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
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

  const handleSelectPayment = (method: PaymentDetails) => {
    updatePaymentDetails(method);
    setView('selected');
    toast.success('Payment method updated');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (paymentMethod === 'credit-card' && view === 'new') {
        addPaymentMethod(paymentDetails);
        toast.success('Card saved to profile');
      }
      if (paymentMethod === 'upi') {
        const existingUpi = upiIds.find(u => u.upiId === upiId);
        if (!existingUpi) {
          addUpiId({ upiId, isDefault: upiIds.length === 0 });
          toast.success('UPI ID saved to profile');
        }
      }
      onNext();
    }
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

      {/* Credit Card Form - Conditional */}
      {paymentMethod === 'credit-card' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Card Details
            </h3>
            {view === 'selected' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setView('list')}
                className="text-primary"
              >
                Change
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {view === 'selected' && (
              <motion.div
                key="selected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-secondary/50 rounded-2xl border-2 border-primary/20 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <CreditCard size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{paymentDetails.cardNumber}</p>
                    <p className="text-xs text-muted-foreground">{paymentDetails.cardName} • {paymentDetails.expiryDate}</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <Check size={20} />
                </div>
              </motion.div>
            )}

            {view === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectPayment(m)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                      paymentDetails.cardNumber === m.cardNumber
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <CreditCard size={18} className="text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{m.cardNumber}</p>
                        <p className="text-xs text-muted-foreground">{m.cardName} • {m.expiryDate}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-6 border-dashed gap-2 rounded-xl"
                  onClick={() => {
                    updatePaymentDetails({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
                    setView('new');
                  }}
                >
                  <Plus size={18} />
                  Use Different Card
                </Button>
              </motion.div>
            )}

            {view === 'new' && (
              <motion.div
                key="new"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card rounded-2xl border border-border p-6 space-y-4"
              >
                <div>
                  <input
                    type="text"
                    placeholder="Card number"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                    className={cn(inputClasses, errors.cardNumber && errorInputClasses)}
                    maxLength={19}
                  />
                  {errors.cardNumber && <p className="text-destructive text-sm mt-1">{errors.cardNumber}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Name on card"
                    value={paymentDetails.cardName}
                    onChange={(e) => handleCardInputChange('cardName', e.target.value)}
                    className={cn(inputClasses, errors.cardName && errorInputClasses)}
                  />
                  {errors.cardName && <p className="text-destructive text-sm mt-1">{errors.cardName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                      className={cn(inputClasses, errors.expiryDate && errorInputClasses)}
                      maxLength={5}
                    />
                    {errors.expiryDate && <p className="text-destructive text-sm mt-1">{errors.expiryDate}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="CVV"
                      value={paymentDetails.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      className={cn(inputClasses, errors.cvv && errorInputClasses)}
                      maxLength={4}
                    />
                    {errors.cvv && <p className="text-destructive text-sm mt-1">{errors.cvv}</p>}
                  </div>
                </div>

                {methods.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-8 text-xs"
                    onClick={() => setView('list')}
                  >
                    Choose from saved cards
                  </Button>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Lock size={14} />
                  Your payment information is encrypted and secure
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                key={upi.id}
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
            {[
              { id: 'apple-pay', name: 'Apple Pay', color: 'bg-black text-white' },
              { id: 'google-pay', name: 'Google Pay', color: 'bg-white border-border border text-foreground' },
              { id: 'paypal', name: 'PayPal', color: 'bg-[#003087] text-white' },
              { id: 'phone-pe', name: 'PhonePe', color: 'bg-[#5f259f] text-white' },
              { id: 'amazon-pay', name: 'Amazon Pay', color: 'bg-[#232f3e] text-white' },
              { id: 'paytm', name: 'Paytm', color: 'bg-[#00baf2] text-white' },
            ].map((app) => (
              <motion.button
                key={app.id}
                type="button"
                onClick={() => setSelectedApp(app.id as any)}
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
