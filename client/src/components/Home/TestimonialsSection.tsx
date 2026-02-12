import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/utils/animations';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Fashion Blogger',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    rating: 5,
    comment: 'Luxe has completely transformed my wardrobe. The quality is unmatched, and I love knowing my purchases support sustainable practices.',
  },
  {
    id: 2,
    name: 'James Chen',
    role: 'Creative Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 5,
    comment: 'Finally, a brand that combines style with substance. Every piece feels premium, and the customer service is exceptional.',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Entrepreneur',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    rating: 5,
    comment: 'I\'ve been shopping with Luxe for over a year now. The consistency in quality and the timeless designs keep me coming back.',
  },
  {
    id: 4,
    name: 'Michael Thompson',
    role: 'Tech Executive',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 4,
    comment: 'Clean aesthetics, fast shipping, and pieces that actually last. Luxe has become my go-to for professional wear.',
  },
  {
    id: 5,
    name: 'Olivia Park',
    role: 'Interior Designer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rating: 5,
    comment: 'The attention to detail in every garment is remarkable. It\'s rare to find a brand that truly delivers on its promises.',
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 lg:py-28 bg-background">
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
            <Star size={16} className="fill-primary" />
            Testimonials
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-display text-3xl lg:text-4xl xl:text-5xl font-bold mb-6"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Don't just take our word for it — hear from our community of satisfied customers.
          </motion.p>
        </motion.div>

        {/* Featured Testimonial Slider */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <div className="absolute -top-8 left-8 lg:left-0 opacity-10">
            <Quote size={120} className="text-primary" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="relative bg-card rounded-3xl p-8 lg:p-12 border border-border/50 shadow-xl"
            >
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
                />
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < testimonials[currentIndex].rating ? 'fill-primary text-primary' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                  <p className="text-lg lg:text-xl text-foreground leading-relaxed mb-6">
                    "{testimonials[currentIndex].comment}"
                  </p>
                  <div>
                    <p className="font-semibold text-lg">{testimonials[currentIndex].name}</p>
                    <p className="text-muted-foreground">{testimonials[currentIndex].role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-primary w-8' : 'bg-secondary hover:bg-muted-foreground/30'
                    }`}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ChevronRight size={24} />
            </motion.button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.slice(0, 3).map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < testimonial.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                "{testimonial.comment}"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
