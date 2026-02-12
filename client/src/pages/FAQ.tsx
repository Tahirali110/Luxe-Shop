import { motion } from 'framer-motion';
import { HelpCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { pageTransition, fadeUp, staggerContainer } from '@/utils/animations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqCategories = [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping takes 5-7 business days, Express shipping takes 2-3 business days, and Overnight shipping delivers the next business day. International shipping may take 10-15 business days depending on location.',
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order ships, you\'ll receive a confirmation email with a tracking number. You can also track your order from your account dashboard under "My Orders".',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination. You can see the exact shipping cost at checkout.',
      },
      {
        question: 'Can I change or cancel my order?',
        answer: 'Orders can be modified or cancelled within 1 hour of placement. After this window, the order enters processing and cannot be changed. Please contact our support team immediately if you need to make changes.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    questions: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for unworn, unwashed items with original tags attached. Items must be in their original condition. Sale items and intimates are final sale.',
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Log into your account, go to "My Orders", select the order containing the item you wish to return, and click "Return Item". Follow the prompts to print your prepaid return label.',
      },
      {
        question: 'When will I receive my refund?',
        answer: 'Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method. Please allow additional time for your bank to process the refund.',
      },
      {
        question: 'Do you offer exchanges?',
        answer: 'Yes, we offer free exchanges for different sizes or colors of the same item. Simply initiate a return and select "Exchange" instead of "Refund".',
      },
    ],
  },
  {
    category: 'Products & Sizing',
    questions: [
      {
        question: 'How do I find my size?',
        answer: 'Each product page includes a detailed size guide. Click on "Size Guide" to see measurements in inches or centimeters. If you\'re between sizes, we generally recommend sizing up for a more comfortable fit.',
      },
      {
        question: 'Are your products true to size?',
        answer: 'Most of our products are true to size. However, some styles may run slightly small or large. Check the product reviews for sizing feedback from other customers.',
      },
      {
        question: 'What materials do you use?',
        answer: 'We use a variety of high-quality, sustainable materials including organic cotton, recycled polyester, Tencel, and responsibly-sourced wool. Material details are listed on each product page.',
      },
      {
        question: 'How do I care for my items?',
        answer: 'Care instructions are included on each garment\'s label and in the product description. Generally, we recommend washing in cold water, using gentle detergent, and air drying when possible to extend the life of your items.',
      },
    ],
  },
  {
    category: 'Account & Payment',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. All transactions are secured with industry-standard encryption.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, we use SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers and is processed through secure, trusted payment providers.',
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link within a few minutes. Check your spam folder if you don\'t see it.',
      },
      {
        question: 'Can I save multiple addresses?',
        answer: 'Yes, you can save multiple shipping and billing addresses in your account. Go to "My Profile" > "Addresses" to add, edit, or remove addresses.',
      },
    ],
  },
];

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

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
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <HelpCircle size={16} />
            Help Center
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl lg:text-5xl font-bold mb-6"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Find answers to common questions about orders, shipping, returns, and more.
          </motion.p>

          {/* Search */}
          <motion.div variants={fadeUp} className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </motion.div>
        </motion.div>

        {/* FAQ Sections */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto space-y-8"
        >
          {filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              variants={fadeUp}
              className="bg-card rounded-3xl p-6 lg:p-8 border border-border"
            >
              <h2 className="font-display text-xl font-semibold mb-6">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`${categoryIndex}-${index}`}
                    className="border border-border rounded-2xl px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}

          {filteredCategories.length === 0 && (
            <motion.div variants={fadeUp} className="text-center py-12">
              <HelpCircle size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse our categories above.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FAQ;
