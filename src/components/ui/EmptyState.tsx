import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Package } from 'lucide-react';
import { fadeUp } from '@/utils/animations';
import { EMPTY_STATES } from '@/utils/constants';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'search';
}

export const EmptyState = ({ type }: EmptyStateProps) => {
  const content = EMPTY_STATES[type];
  
  const icons = {
    cart: ShoppingBag,
    wishlist: Heart,
    search: Package,
  };
  
  const Icon = icons[type];
  
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="relative mb-6"
      >
        {/* Background circles */}
        <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 blur-xl" />
        <div className="absolute inset-0 bg-primary/10 rounded-full scale-125" />
        
        {/* Icon container */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
          <Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
          
          {/* Decorative elements */}
          {type === 'cart' && (
            <>
              <motion.div
                className="absolute -top-2 -right-2 w-4 h-4 bg-muted rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-1 -left-3 w-3 h-3 bg-muted rounded-full"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </>
          )}
          
          {type === 'wishlist' && (
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-destructive fill-destructive" />
            </motion.div>
          )}
        </div>
      </motion.div>
      
      <motion.h3
        variants={fadeUp}
        className="text-xl font-semibold text-foreground mb-2"
      >
        {content.title}
      </motion.h3>
      
      <motion.p
        variants={fadeUp}
        className="text-muted-foreground max-w-xs mb-6"
      >
        {content.description}
      </motion.p>
      
      <motion.div
        variants={fadeUp}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          {content.cta}
        </Link>
      </motion.div>
    </motion.div>
  );
};
