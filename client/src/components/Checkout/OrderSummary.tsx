import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useCheckout } from '@/context/CheckoutContext';
import { fadeUp } from '@/utils/animations';
import { Tag } from 'lucide-react';

export const OrderSummary = () => {
  const { items, getSubtotal, promoCode, getDiscount, getShipping, getTax, getTotal } = useCartStore();
  const { currentStep } = useCheckout();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingCost = getShipping();
  const tax = getTax();
  const total = getTotal();

  useEffect(() => {
    // Telemetry removed
  }, []);

  return (
    <motion.div
      variants={fadeUp}
      className="bg-card rounded-3xl p-6 lg:p-8 lg:sticky lg:top-24 lg:self-start"
    >
      <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>

      {/* Items List */}
      <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
              <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
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

      <div className="h-px bg-border mb-6" />

      {/* Promo is applied on Cart and persisted */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          {promoCode ? (
            <motion.div
              key="applied"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20"
            >
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-primary" />
                <div>
                  <span className="font-medium text-primary">{promoCode}</span>
                  <p className="text-xs text-muted-foreground">Promo applied in cart</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="none"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-muted-foreground"
            >
              No promo code applied.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-border mb-6" />

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {/* Discount Line */}
        <AnimatePresence>
          {discount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-between text-primary"
            >
              <span>Discount ({promoCode})</span>
              <span>-${discount.toFixed(2)}</span>
            </motion.div>
          )}
        </AnimatePresence>

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
      </div>

      <div className="h-px bg-border mb-4" />

      <div className="flex justify-between font-display text-xl font-bold">
        <span>Total</span>
        <span>{total !== null ? `$${total.toFixed(2)}` : '—'}</span>
      </div>

      {/* Security Badge */}
      <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
        <p className="text-sm text-center text-muted-foreground">
          🔒 Secure checkout powered by industry-standard encryption
        </p>
      </div>
    </motion.div>
  );
};
