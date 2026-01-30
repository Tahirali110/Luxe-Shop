import { motion } from 'framer-motion';
import { products } from '@/utils/mockData';

const orbitProducts = products.slice(0, 3);

const HeroOrbit = () => {
  return (
    <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] lg:w-[500px] lg:h-[500px]">
      {/* Center Main Product */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center z-20"
      >
        <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 blur-3xl" />
          <motion.div
            className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-background"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img
              src={products[0]?.colors[0].image}
              alt="Featured product"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Orbiting Products */}
      {orbitProducts.map((product, index) => {
        const angle = (360 / orbitProducts.length) * index;
        const radius = 160; // Distance from center
        const duration = 20 + index * 5; // Different speeds

        return (
          <motion.div
            key={product.id}
            className="absolute top-1/2 left-1/2 z-10"
            style={{
              transformOrigin: '0 0',
            }}
            animate={{
              rotate: [angle, angle + 360],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <motion.div
              className="relative -translate-x-1/2 -translate-y-1/2"
              style={{
                x: radius * 1.2 + index * 20,
              }}
              animate={{
                rotate: [-angle, -angle - 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration, repeat: Infinity, ease: 'linear' },
                scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-background bg-card">
                <img
                  src={product.colors[0].image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Decorative Rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      <motion.div
        className="absolute -inset-8 md:-inset-12 rounded-full border border-primary/5"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.div
        className="absolute -inset-16 md:-inset-24 rounded-full border border-primary/5"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      />
    </div>
  );
};

export default HeroOrbit;
