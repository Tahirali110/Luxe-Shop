import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Minus, Plus } from 'lucide-react';
import { useState, forwardRef } from 'react';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { fadeUp } from '@/utils/animations';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ product, index = 0, priority = false }, ref) => {
  const { addItem, updateQuantity, items } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const [selectedColor] = useState(product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'Default', hex: '#000000', image: product.image || '' });
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // Use _id from MongoDB but fallback to id if it exists (for backward compatibility if needed)
  const productId = product._id;

  const cartItemId = `${productId}-${selectedColor.name}-${product.sizes?.[0] || 'default'}`;
  const quantity = items.find(i => i.id === cartItemId)?.quantity || 0;
  const inWishlist = isInWishlist(productId);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, selectedColor.name, selectedColor.hex, product.sizes?.[0]);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsHeartAnimating(true);
    toggleItem(productId, product.name);
    setTimeout(() => setIsHeartAnimating(false), 300);
  };

  return (
    <motion.div
      ref={ref}
      layout
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      {/* Wishlist Button with Pop Animation */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={isHeartAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
        onClick={handleWishlistToggle}
        className="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md"
      >
        <Heart className={`w-4 h-4 transition-all ${inWishlist ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
      </motion.button>

      {product.badge && (
        <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
          {product.badge}
        </span>
      )}

      {product.stock === 0 && (
        <span className="absolute top-14 left-4 z-10 px-3 py-1 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase rounded-full tracking-wider shadow-lg">
          Out of Stock
        </span>
      )}

      <Link to={`/product/${productId}`}>
        <div className={`bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300 product-card-glow dark:hover:border-border ${product.stock === 0 ? 'opacity-75 grayscale-[0.3]' : ''}`}>
          <div className="aspect-square overflow-hidden bg-secondary">
            <img
              src={selectedColor.image}
              alt={product.name}
              loading={priority ? "eager" : "lazy"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</p>
            <h3 className="font-semibold mt-1 line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-xs font-medium">{product.rating || 0}</span>
              <span className="text-[10px] text-muted-foreground">({product.reviewsCount || 0})</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-bold">${product.price}</span>
                {product.originalPrice && <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>}
              </div>

              <AnimatePresence mode="wait">
                {product.stock === 0 ? (
                  <Button key="soldout" variant="secondary" size="sm" disabled className="rounded-xl opacity-50 cursor-not-allowed">
                    Sold Out
                  </Button>
                ) : quantity === 0 ? (
                  <motion.button
                    key="add"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdd}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl transition-all"
                  >
                    Add
                  </motion.button>
                ) : (
                  <motion.div
                    key="qty"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 bg-secondary rounded-xl"
                    onClick={e => e.preventDefault()}
                  >
                    <button onClick={() => updateQuantity(cartItemId, Math.max(0, quantity - 1))} className="p-2 hover:bg-background/50 rounded-l-xl transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                    <button onClick={() => updateQuantity(cartItemId, Math.min(product.stock, quantity + 1))} className="p-2 hover:bg-background/50 rounded-r-xl transition-colors"><Plus className="w-3 h-3" /></button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;