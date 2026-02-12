import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check, Sparkles } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/utils/animations';
import { toast } from 'sonner';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubscribed(true);
    toast.success('Welcome to the Luxe family!', {
      description: 'Check your inbox for a special welcome offer.',
    });
  };

  return (
    <section className="py-20 lg:py-28 bg-foreground dark:bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6"
          >
            <Sparkles size={16} />
            Stay Updated
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-display text-3xl lg:text-4xl xl:text-5xl font-bold text-background dark:text-foreground mb-6"
          >
            Join the Luxe Community
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-lg text-background/70 dark:text-muted-foreground mb-10"
          >
            Subscribe to our newsletter for exclusive offers, early access to new collections,
            and style inspiration delivered straight to your inbox.
          </motion.p>

          {!isSubscribed ? (
            <motion.form
              variants={fadeUp}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-background dark:bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold disabled:opacity-70 transition-all"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-primary"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <Check size={24} />
              </motion.div>
              <span className="text-lg font-medium text-background dark:text-foreground">
                You're all set! Check your inbox.
              </span>
            </motion.div>
          )}

          <motion.p
            variants={fadeUp}
            className="text-sm text-background/50 dark:text-muted-foreground mt-6"
          >
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
