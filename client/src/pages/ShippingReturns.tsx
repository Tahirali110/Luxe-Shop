import { motion } from 'framer-motion';
import { Truck, RotateCcw, Package, Clock, Globe, Shield } from 'lucide-react';
import { pageTransition, fadeUp, staggerContainer } from '@/utils/animations';

const ShippingReturns = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen py-12 lg:py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl lg:text-5xl font-bold mb-6"
          >
            Shipping & Returns
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Everything you need to know about getting your order and our hassle-free return policy.
          </motion.p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Shipping Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Truck size={24} className="text-primary" />
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-bold">Shipping Information</h2>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border mb-8">
              <h3 className="font-semibold text-lg mb-6">Domestic Shipping (United States)</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-muted-foreground" />
                    <span>Standard Shipping</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$10.00</p>
                    <p className="text-sm text-muted-foreground">5-7 business days</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-muted-foreground" />
                    <span>Express Shipping</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$25.00</p>
                    <p className="text-sm text-muted-foreground">2-3 business days</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-muted-foreground" />
                    <span>Overnight Shipping</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$50.00</p>
                    <p className="text-sm text-muted-foreground">Next business day</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                <strong>Free Shipping:</strong> Orders over $100 qualify for free standard shipping within the continental United States.
              </p>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <Globe size={20} className="text-primary" />
                <h3 className="font-semibold text-lg">International Shipping</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                We ship to over 50 countries worldwide. International shipping rates are calculated at checkout
                based on destination, weight, and dimensions.
              </p>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• Delivery time: 10-15 business days (varies by location)</li>
                <li>• Customs and import duties may apply and are the responsibility of the recipient</li>
                <li>• Tracking information provided for all international orders</li>
              </ul>
            </div>
          </motion.section>

          {/* Returns Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <RotateCcw size={24} className="text-primary" />
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-bold">Return Policy</h2>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border mb-8">
              <h3 className="font-semibold text-lg mb-4">30-Day Return Window</h3>
              <p className="text-muted-foreground mb-6">
                We want you to love every purchase. If you're not completely satisfied, you may return
                most items within 30 days of delivery for a full refund.
              </p>

              <h4 className="font-medium mb-3">Eligibility Requirements:</h4>
              <ul className="text-muted-foreground space-y-2 mb-6">
                <li>• Items must be unworn, unwashed, and in original condition</li>
                <li>• Original tags must be attached</li>
                <li>• Items must be in original packaging</li>
                <li>• Proof of purchase required (order confirmation email or receipt)</li>
              </ul>

              <h4 className="font-medium mb-3">Non-Returnable Items:</h4>
              <ul className="text-muted-foreground space-y-2">
                <li>• Final sale items (marked as such on product page)</li>
                <li>• Intimates and swimwear (for hygiene reasons)</li>
                <li>• Gift cards</li>
                <li>• Personalized or custom-made items</li>
              </ul>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border">
              <h3 className="font-semibold text-lg mb-4">How to Return an Item</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium">Initiate Your Return</p>
                    <p className="text-sm text-muted-foreground">Log into your account, go to "My Orders", and click "Return Item".</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium">Print Your Label</p>
                    <p className="text-sm text-muted-foreground">Download and print the prepaid return shipping label.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium">Ship Your Package</p>
                    <p className="text-sm text-muted-foreground">Drop off your package at any authorized shipping location.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">4</div>
                  <div>
                    <p className="font-medium">Receive Your Refund</p>
                    <p className="text-sm text-muted-foreground">Refunds are processed within 5-7 business days of receiving your return.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Exchanges */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-primary/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={24} className="text-primary" />
                <h3 className="font-semibold text-lg">Free Exchanges</h3>
              </div>
              <p className="text-muted-foreground">
                Need a different size or color? We offer free exchanges on all orders.
                Simply initiate a return and select "Exchange" to get the right item shipped to you at no extra cost.
              </p>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-4">Have questions about your order?</p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShippingReturns;
