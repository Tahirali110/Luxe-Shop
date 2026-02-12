import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, RefreshCw, ArrowLeft, MessageCircle } from 'lucide-react';
import { pageTransition, fadeUp } from '@/utils/animations';

const OrderFailed = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-destructive/20 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center"
            >
              <X size={32} className="text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-3xl lg:text-4xl font-bold mb-4"
          >
            Payment Failed
          </motion.h1>
          
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg mb-8"
          >
            We couldn't process your payment. Please check your payment details and try again.
          </motion.p>

          {/* Error Details */}
          <motion.div
            variants={fadeUp}
            className="bg-destructive/10 rounded-2xl p-6 mb-8 text-left"
          >
            <h3 className="font-semibold text-destructive mb-3">Possible reasons:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Insufficient funds in your account</li>
              <li>• Incorrect card details entered</li>
              <li>• Card has expired or been blocked</li>
              <li>• Transaction was declined by your bank</li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-4"
          >
            <Link to="/checkout">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold"
              >
                <RefreshCw size={20} />
                Try Again
              </motion.button>
            </Link>
            
            <Link to="/cart">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-semibold"
              >
                <ArrowLeft size={20} />
                Back to Cart
              </motion.button>
            </Link>

            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground rounded-2xl font-semibold hover:bg-secondary/50 transition-colors"
              >
                <MessageCircle size={20} />
                Contact Support
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrderFailed;
