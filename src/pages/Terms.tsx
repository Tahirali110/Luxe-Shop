import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { pageTransition, fadeUp, staggerContainer } from '@/utils/animations';

const Terms = () => {
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
              <FileText size={16} />
              Legal
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </motion.div>

          <motion.div variants={fadeUp} className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="bg-card rounded-3xl p-8 border border-border space-y-8">
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using the Luxe website, you accept and agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use our website or services.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">2. Use of Website</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">You agree to use our website only for lawful purposes. You may not:</p>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Use the website in any way that violates applicable laws</li>
                  <li>• Attempt to gain unauthorized access to our systems</li>
                  <li>• Interfere with or disrupt the website's functionality</li>
                  <li>• Use automated systems to access the website without permission</li>
                  <li>• Transmit any viruses, malware, or harmful code</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">3. Account Registration</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When you create an account, you must provide accurate and complete information.
                  You are responsible for maintaining the confidentiality of your account credentials
                  and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">4. Products and Pricing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All product descriptions, images, and prices are subject to change without notice.
                  We reserve the right to limit quantities and to refuse or cancel orders at our discretion.
                  Prices are displayed in USD and do not include applicable taxes or shipping costs.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">5. Orders and Payment</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By placing an order, you agree to pay the total amount shown at checkout, including
                  product prices, taxes, and shipping costs. We accept major credit cards, PayPal,
                  and Apple Pay. All payments are processed securely through our payment providers.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on this website, including text, images, logos, and designs, is the
                  property of Luxe and is protected by copyright and trademark laws. You may not
                  reproduce, distribute, or use any content without our written permission.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Luxe shall not be liable for any indirect, incidental, special, or consequential
                  damages arising from your use of our website or products. Our total liability shall
                  not exceed the amount paid for the product giving rise to the claim.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">8. Dispute Resolution</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Any disputes arising from these terms or your use of our website shall be resolved
                  through binding arbitration in accordance with the rules of the American Arbitration
                  Association. The arbitration shall take place in New York, NY.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">9. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be effective
                  immediately upon posting to the website. Your continued use of the website constitutes
                  acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">10. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact us at legal@Luxe.com
                  or through our Contact page.
                </p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Terms;
