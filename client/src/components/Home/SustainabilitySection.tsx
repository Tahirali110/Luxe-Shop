import { motion } from 'framer-motion';
import { Leaf, Recycle, Heart } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/utils/animations';

const sustainabilityFeatures = [
  {
    icon: Leaf,
    title: 'Eco-Friendly Materials',
    description: 'We source only sustainable, organic, and recycled materials to minimize our environmental footprint.',
  },
  {
    icon: Recycle,
    title: 'Circular Economy',
    description: 'Our take-back program ensures your old items are recycled or repurposed, never ending up in landfills.',
  },
  {
    icon: Heart,
    title: 'Ethical Production',
    description: 'Fair wages, safe conditions, and transparent supply chains are at the core of our manufacturing process.',
  },
];

const SustainabilitySection = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30 dark:bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Leaf size={16} />
            Our Commitment
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-display text-3xl lg:text-4xl xl:text-5xl font-bold mb-6"
          >
            Sustainability at Luxe
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            We believe fashion can be both beautiful and responsible. Every piece we create
            is designed with the planet in mind.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {sustainabilityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className="group p-8 bg-card rounded-3xl border border-border/50 text-center hover:shadow-xl transition-all duration-300"
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
              >
                <feature.icon size={28} className="text-primary" />
              </motion.div>
              <h3 className="font-display text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SustainabilitySection;
