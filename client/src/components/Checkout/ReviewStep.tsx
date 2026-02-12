import { motion } from 'framer-motion';
import { ArrowLeft, Lock, MapPin, CreditCard, Truck, Package, Check, Edit } from 'lucide-react';
import { useCheckout, SHIPPING_METHODS, PAYMENT_METHODS } from '@/context/CheckoutContext';
import { useCartStore } from '@/store/useCartStore';
import { fadeUp } from '@/utils/animations';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface ReviewStepProps {
  onBack: () => void;
  onPlaceOrder: () => void;
  isProcessing: boolean;
  onEditStep: (step: number) => void;
}

export const ReviewStep = ({ onBack, onPlaceOrder, isProcessing, onEditStep }: ReviewStepProps) => {
  const { formData, setAgreeToTerms, getShippingCost } = useCheckout();
  const { shippingAddress, shippingMethod, paymentMethod, paymentDetails, agreeToTerms } = formData;
  const { items, getSubtotal, promoCode, getDiscount, getShipping, getTax, getTotal } = useCartStore();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingCost = getShipping();
  const tax = getTax();
  const total = getTotal();

  useEffect(() => {
    // Telemetry removed
  }, []);

  const selectedShippingMethod = SHIPPING_METHODS.find(m => m.id === shippingMethod);
  const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);

  const maskedCardNumber = paymentDetails.cardNumber
    ? `•••• •••• •••• ${paymentDetails.cardNumber.slice(-4)}`
    : '';

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate" className="space-y-6">
      {/* Shipping Address Review */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            <h3 className="font-semibold">Shipping Address</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEditStep(1)}
            className="text-sm text-primary flex items-center gap-1"
          >
            <Edit size={14} />
            Edit
          </motion.button>
        </div>
        <div className="text-muted-foreground">
          <p className="font-medium text-foreground">{shippingAddress.firstName} {shippingAddress.lastName}</p>
          <p>{shippingAddress.address}{shippingAddress.apartment && `, ${shippingAddress.apartment}`}</p>
          <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
          <p>{shippingAddress.country}</p>
          <p className="mt-2">{shippingAddress.email}</p>
          <p>{shippingAddress.phone}</p>
        </div>
      </div>

      {/* Shipping Method Review */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-primary" />
            <h3 className="font-semibold">Shipping Method</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEditStep(1)}
            className="text-sm text-primary flex items-center gap-1"
          >
            <Edit size={14} />
            Edit
          </motion.button>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{selectedShippingMethod?.name}</p>
            <p className="text-sm">{selectedShippingMethod?.duration}</p>
          </div>
          <span className="font-semibold text-foreground">
            {shippingCost === 0 ? <span className="text-primary">Free</span> : `$${shippingCost}`}
          </span>
        </div>
      </div>

      {/* Payment Method Review */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-primary" />
            <h3 className="font-semibold">Payment Method</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEditStep(2)}
            className="text-sm text-primary flex items-center gap-1"
          >
            <Edit size={14} />
            Edit
          </motion.button>
        </div>
        <div className="text-muted-foreground">
          <p className="font-medium text-foreground">{selectedPaymentMethod?.name}</p>
          {paymentMethod === 'credit-card' && (
            <>
              <p>{maskedCardNumber}</p>
              <p className="text-sm">{paymentDetails.cardName}</p>
            </>
          )}
        </div>
      </div>

      {/* Order Items Review */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-primary" />
          <h3 className="font-semibold">Order Items ({items.length})</h3>
        </div>
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-background text-xs font-semibold rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                <p className="text-sm text-muted-foreground">{item.color}{item.size && ` • ${item.size}`}</p>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Total */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4">Order Total</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-primary">
              <span>Discount ({promoCode})</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>
              {shippingCost === 0 ? (
                <span className="text-primary font-medium">Free</span>
              ) : (
                `$${shippingCost.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between font-display text-xl font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="bg-secondary/50 rounded-2xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="mt-0.5">
            <motion.button
              type="button"
              onClick={() => setAgreeToTerms(!agreeToTerms)}
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                agreeToTerms
                  ? "bg-primary border-primary"
                  : "border-muted-foreground hover:border-primary"
              )}
              whileTap={{ scale: 0.9 }}
            >
              {agreeToTerms && <Check size={14} className="text-primary-foreground" />}
            </motion.button>
          </div>
          <span className="text-sm text-muted-foreground">
            I agree to the <a href="/terms" className="text-primary underline">Terms of Service</a> and{' '}
            <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>. I understand that my order
            will be processed and shipped according to the details provided.
          </span>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <motion.button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          whileHover={{ scale: isProcessing ? 1 : 1.02 }}
          whileTap={{ scale: isProcessing ? 1 : 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-semibold disabled:opacity-50"
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>
        <motion.button
          type="button"
          onClick={onPlaceOrder}
          disabled={!agreeToTerms || isProcessing}
          whileHover={{ scale: (!agreeToTerms || isProcessing) ? 1 : 1.02 }}
          whileTap={{ scale: (!agreeToTerms || isProcessing) ? 1 : 0.98 }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all",
            agreeToTerms && !isProcessing
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full"
              />
              Processing...
            </>
          ) : (
            <>
              <Lock size={18} />
              Place Order
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
