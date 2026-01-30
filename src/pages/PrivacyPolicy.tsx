import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { pageTransition, fadeUp, staggerContainer } from '@/utils/animations';

const PrivacyPolicy = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen py-12 lg:py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield size={16} />
              Legal
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </motion.div>

          <motion.div variants={fadeUp} className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="bg-card rounded-3xl p-8 border border-border space-y-8">
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Luxe ("we," "our," or "us"). We are committed to protecting your personal information
                  and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                  your information when you visit our website or make a purchase.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Name, email address, and contact information</li>
                  <li>• Billing and shipping addresses</li>
                  <li>• Payment information (processed securely through our payment providers)</li>
                  <li>• Order history and preferences</li>
                  <li>• Communications with our customer service team</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Process and fulfill your orders</li>
                  <li>• Send order confirmations and shipping updates</li>
                  <li>• Respond to your inquiries and provide customer support</li>
                  <li>• Send promotional communications (with your consent)</li>
                  <li>• Improve our website and services</li>
                  <li>• Detect and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">4. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share your information with third-party service
                  providers who assist us in operating our website, processing payments, and delivering orders.
                  These providers are contractually obligated to protect your information.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">5. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures to protect your personal information, including
                  SSL encryption, secure payment processing, and regular security assessments. However, no method
                  of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">6. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Access your personal information</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Request deletion of your data</li>
                  <li>• Opt-out of marketing communications</li>
                  <li>• Request a copy of your data</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">7. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your browsing experience,
                  analyze site traffic, and personalize content. You can manage your cookie preferences
                  through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">8. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy or wish to exercise your rights,
                  please contact us at privacy@Luxe.com or through our Contact page.
                </p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
