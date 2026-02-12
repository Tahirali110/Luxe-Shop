import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { pageTransition, fadeUp, staggerContainer } from '@/utils/animations';

const CookiePolicy = () => {
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
              <Cookie size={16} />
              Legal
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </motion.div>

          <motion.div variants={fadeUp} className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="bg-card rounded-3xl p-8 border border-border space-y-8">
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">What Are Cookies?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit a website.
                  They help the website remember your preferences and improve your browsing experience.
                  Cookies are widely used to make websites work more efficiently and provide information
                  to website owners.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">How We Use Cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">We use cookies for the following purposes:</p>
                <ul className="text-muted-foreground space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., shopping cart, authentication)</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver personalized advertisements</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <h3 className="font-medium mb-2">Session Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Temporary cookies that are deleted when you close your browser. Used to maintain
                      your session as you navigate our website.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <h3 className="font-medium mb-2">Persistent Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Remain on your device for a set period. Used to remember your preferences and
                      login information for future visits.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <h3 className="font-medium mb-2">Third-Party Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Set by external services like Google Analytics and payment processors.
                      Help us analyze traffic and process transactions securely.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Managing Cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You can control and manage cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="text-muted-foreground space-y-2">
                  <li>• View what cookies are stored on your device</li>
                  <li>• Delete all or specific cookies</li>
                  <li>• Block cookies from specific websites</li>
                  <li>• Block all third-party cookies</li>
                  <li>• Clear all cookies when you close your browser</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Note: Disabling certain cookies may affect the functionality of our website,
                  including the ability to make purchases.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Updates to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices
                  or for operational, legal, or regulatory reasons. We encourage you to review this page
                  periodically for the latest information on our cookie practices.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about our use of cookies, please contact us at privacy@Luxe.com
                  or visit our Contact page.
                </p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CookiePolicy;
