import { motion } from 'framer-motion';
import { Truck, Star, Shield, Sparkles } from 'lucide-react';

const floatingCards = [
  {
    icon: Truck,
    title: 'Free Shipping',
    subtitle: 'On orders $100+',
    position: 'top-8 -left-4 md:top-12 md:-left-8',
    delay: 0.8,
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    icon: Star,
    title: '4.9 Rating',
    subtitle: '50K+ Reviews',
    position: 'bottom-24 -left-8 md:bottom-32 md:-left-12',
    delay: 1,
    gradient: 'from-accent/20 to-accent/5',
  },
  {
    icon: Shield,
    title: 'Secure Pay',
    subtitle: '100% Protected',
    position: 'top-20 -right-4 md:top-24 md:-right-8',
    delay: 1.2,
    gradient: 'from-primary/20 to-accent/5',
  },
  {
    icon: Sparkles,
    title: 'Premium',
    subtitle: 'Handpicked',
    position: 'bottom-8 -right-4 md:bottom-12 md:-right-8',
    delay: 1.4,
    gradient: 'from-accent/20 to-primary/5',
  },
];

const FloatingElements = () => {
  return (
    <>
      {floatingCards.map((card, index) => (
        <motion.div
          key={index}
          className={`absolute ${card.position} z-30`}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: card.delay }}
        >
          <motion.div
            className={`
              flex items-center gap-3 px-4 py-3 
              rounded-2xl backdrop-blur-xl 
              bg-gradient-to-br ${card.gradient}
              border border-border/50
              shadow-lg shadow-background/50
            `}
            style={{ willChange: 'transform' }}
            animate={{
              y: [0, -12, 0],
              x: [0, (index % 2 === 0 ? 6 : -6), 0],
              rotate: [0, (index % 2 === 0 ? 2 : -2), 0],
            }}
            transition={{
              duration: 5 + index,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-background/80 flex items-center justify-center">
              <card.icon size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{card.title}</p>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* Background Blobs */}
      <motion.div
        className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
        style={{ willChange: 'transform, opacity' }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"
        style={{ willChange: 'transform, opacity' }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.15, 0.3],
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
};

export default FloatingElements;
