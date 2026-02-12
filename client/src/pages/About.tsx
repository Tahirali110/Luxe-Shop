import { motion } from 'framer-motion';
import { Heart, Users, Globe, Award, Sparkles } from 'lucide-react';
import { pageTransition, fadeUp, staggerContainer } from '@/utils/animations';

const values = [
  {
    icon: Heart,
    title: 'Passion for Quality',
    description: 'Every piece is crafted with meticulous attention to detail, ensuring you receive only the finest products.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We listen, adapt, and continuously improve based on your feedback.',
  },
  {
    icon: Globe,
    title: 'Sustainable Future',
    description: 'We\'re committed to ethical sourcing and eco-friendly practices to minimize our environmental impact.',
  },
  {
    icon: Award,
    title: 'Timeless Design',
    description: 'Our collections blend contemporary trends with classic aesthetics for pieces that last beyond seasons.',
  },
];

const milestones = [
  { year: '2018', title: 'Founded', description: 'Luxe was born from a vision to redefine modern fashion.' },
  { year: '2019', title: 'First Collection', description: 'Launched our inaugural line with 50 carefully curated pieces.' },
  { year: '2020', title: 'Going Digital', description: 'Expanded our online presence to reach customers worldwide.' },
  { year: '2022', title: 'Sustainability Pledge', description: 'Achieved carbon-neutral operations and switched to 100% recycled packaging.' },
  { year: '2025', title: '50K+ Customers', description: 'Celebrated serving over 50,000 happy customers across 40+ countries.' },
];

const About = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-secondary/50 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles size={16} />
              Our Story
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold mb-6"
            >
              Crafting Tomorrow's
              <span className="block gradient-text">Timeless Classics</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg lg:text-xl text-muted-foreground"
            >
              Luxe is more than a fashion brand—it's a movement towards conscious style.
              We believe everyone deserves access to premium, sustainable fashion that doesn't
              compromise on quality or ethics.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl lg:text-4xl font-bold mb-4"
            >
              Our Values
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              These principles guide everything we do, from design to delivery.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="bg-card rounded-3xl p-8 border border-border text-center hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <value.icon size={28} className="text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-20 lg:py-28 bg-secondary/30 dark:bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl lg:text-4xl font-bold mb-4"
            >
              Our Journey
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              From humble beginnings to global recognition, here's how we've grown.
            </motion.p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-4" />
                  )}
                </div>
                <div className="flex-1 bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-lg mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / CTA */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl lg:text-4xl font-bold mb-6"
            >
              Join the Luxe Family
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground mb-8"
            >
              Whether you're looking for your next favorite outfit or want to be part of our
              growing team, we'd love to connect with you.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Shop Now
              </a>
              <a
                href="/careers"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-semibold hover:bg-secondary/80 transition-colors"
              >
                View Careers
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
