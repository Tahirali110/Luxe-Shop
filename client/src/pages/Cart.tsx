import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, HeartCrack, PartyPopper, Truck, Tag, X, Loader2 } from 'lucide-react';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { pageTransition, fadeUp } from '@/utils/animations';
import { useEffect, useState } from 'react';
import { SHIPPING_THRESHOLD, SHIPPING_COST, TAX_RATE } from '@/utils/constants';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { forwardRef } from 'react';

// Promo codes are now managed in the persisted cart store
const CartItemRow = forwardRef<HTMLDivElement, { item: CartItem }>(({ item }, ref) => {
  const { updateQuantity, removeItem } = useCartStore();
  const [isRemoving, setIsRemoving] = useState(false);
  const [pendingRemove, setPendingRemove] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => removeItem(item.id), 600);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      // Play heartbreak animation first, then remove
      setPendingRemove(true);
      setIsRemoving(true);
      setTimeout(() => removeItem(item.id), 600);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 1, scale: 1, x: 0 }}
      animate={isRemoving ? {
        opacity: 0,
        scale: 0.6,
        x: -100,
        transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
      } : { opacity: 1, scale: 1, x: 0 }}
      className="relative flex gap-6 p-6 bg-card rounded-3xl"
    >
      {isRemoving && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-3xl z-10"
        >
          <motion.div
            animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.4 }}
          >
            <HeartCrack className="w-10 h-10 text-destructive" />
          </motion.div>
        </motion.div>
      )}

      <Link to={`/product/${item.productId}`} className="flex-shrink-0">
        <motion.div whileHover={{ scale: 1.05 }} className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-secondary">
          <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
        </motion.div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {item.color}{item.size && ` • ${item.size}`}
            </p>
            <Link to={`/product/${item.productId}`}>
              <h3 className="font-display font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                {item.name}
              </h3>
            </Link>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRemove}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div className="flex items-center bg-secondary rounded-xl">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-2 hover:bg-background/50 rounded-l-xl transition-colors"
            >
              <Minus size={16} />
            </motion.button>
            <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-2 hover:bg-background/50 rounded-r-xl transition-colors"
            >
              <Plus size={16} />
            </motion.button>
          </div>

          <div className="text-right">
            <p className="font-display font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
            {item.quantity > 1 && (
              <p className="text-sm text-muted-foreground">${item.price} each</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Shipping Progress Component
const ShippingMeter = ({ subtotal }: { subtotal: number }) => {
  const progress = Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100);
  const remaining = SHIPPING_THRESHOLD - subtotal;
  const isFreeShipping = subtotal >= SHIPPING_THRESHOLD;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl ${isFreeShipping ? 'bg-primary/10' : 'bg-secondary/50'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Truck size={18} className={isFreeShipping ? 'text-primary' : 'text-muted-foreground'} />
          <span className={`text-sm font-medium ${isFreeShipping ? 'text-primary' : 'text-foreground'}`}>
            {isFreeShipping ? 'Free Shipping Unlocked!' : `Add $${remaining.toFixed(2)} for free shipping`}
          </span>
        </div>
        {isFreeShipping && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <PartyPopper className="w-5 h-5 text-primary" />
          </motion.div>
        )}
      </div>
      <div className="relative">
        <Progress
          value={progress}
          className={`h-2 ${isFreeShipping ? 'bg-primary/20' : 'bg-muted'}`}
        />
        {isFreeShipping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        ${subtotal.toFixed(2)} / ${SHIPPING_THRESHOLD} for free shipping
      </p>
    </motion.div>
  );
};

// Promo Code Section Component
const PromoCodeSection = () => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { promoCode, applyPromoCode, removePromoCode } = useCartStore();

  const handleApply = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const ok = applyPromoCode(couponCode);
    if (!ok) {
      setIsApplying(false);
      return;
    }
    setIsApplying(false);
    setCouponCode('');


  };

  return (
    <div className="mb-4">
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
                <p className="text-xs text-muted-foreground">Discount applied</p>
              </div>
            </div>
            <button
              onClick={removePromoCode}
              className="p-1 hover:bg-primary/20 rounded-lg transition-colors"
            >
              <X size={16} className="text-primary" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <Input
              placeholder="Promo code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className="flex-1"
            />
            <Button
              onClick={handleApply}
              disabled={isApplying || !couponCode.trim()}
              variant="outline"
              className="px-4"
            >
              {isApplying ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {!promoCode && (
        <p className="text-xs text-muted-foreground mt-2">Try: SAVE20, WELCOME10</p>
      )}
    </div>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getTotalItems, promoCode, getDiscount, getShipping, getTax, getTotal, getTaxableSubtotal } = useCartStore();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const tax = getTax();
  const taxableAmount = getTaxableSubtotal();
  const total = getTotal();
  const isFreeShipping = shipping === 0 && subtotal > 0;



  if (items.length === 0) {
    return (
      <motion.div variants={pageTransition} initial="initial" animate="animate" className="container mx-auto px-4 py-12">
        <EmptyState type="cart" />
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">{getTotalItems()} items in your cart</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </AnimatePresence>

              <motion.div variants={fadeUp}>
                <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowRight size={18} className="rotate-180" />
                  Continue Shopping
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-card rounded-3xl p-6 lg:p-8 space-y-6">
                <h2 className="font-display text-xl font-semibold">Order Summary</h2>

                {/* Shipping Progress Meter */}
                <ShippingMeter subtotal={subtotal} />

                {/* Promo Code Section */}
                <PromoCodeSection />

                <div className="space-y-4">
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
                      {isFreeShipping ? (
                        <span className="flex items-center gap-2">
                          {subtotal >= SHIPPING_THRESHOLD ? (
                            <>
                              <span className="line-through text-muted-foreground/50">${SHIPPING_COST.toFixed(2)}</span>
                              <span className="text-primary font-medium">Free</span>
                            </>
                          ) : (
                            <span className="text-primary font-medium">Free</span>
                          )}
                        </span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex justify-between font-display text-xl font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-lg shadow-primary/25"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </motion.button>

                <div className="p-4 bg-secondary/50 rounded-xl">
                  <p className="text-sm text-center text-muted-foreground">
                    🔒 Secure checkout powered by industry-standard encryption
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default Cart;