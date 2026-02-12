import { useState } from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero/index';
import ProductGrid from '@/components/ProductGrid';
import SustainabilitySection from '@/components/Home/SustainabilitySection';
import TestimonialsSection from '@/components/Home/TestimonialsSection';
import NewsletterSection from '@/components/Home/NewsletterSection';
import { pageTransition } from '@/utils/animations';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Hero />
      <ProductGrid searchQuery={searchQuery} />
      <SustainabilitySection />
      <TestimonialsSection />
      <NewsletterSection />
    </motion.div>
  );
};

export default Index;
