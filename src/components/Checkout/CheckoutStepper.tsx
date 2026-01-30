import { motion } from 'framer-motion';
import { Check, Truck, CreditCard, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { id: 1, name: 'Shipping', icon: Truck },
  { id: 2, name: 'Payment', icon: CreditCard },
  { id: 3, name: 'Review', icon: ClipboardCheck },
];

export const CheckoutStepper = ({ currentStep, onStepClick }: CheckoutStepperProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        
        {/* Active progress line */}
        <motion.div
          className="absolute top-5 left-0 h-0.5 bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isPast = currentStep >= step.id;
          const Icon = step.icon;

          return (
            <motion.button
              key={step.id}
              onClick={() => isCompleted && onStepClick?.(step.id)}
              disabled={!isCompleted}
              className={cn(
                "relative z-10 flex flex-col items-center",
                isCompleted && "cursor-pointer",
                !isCompleted && !isActive && "cursor-default"
              )}
              whileHover={isCompleted ? { scale: 1.05 } : {}}
              whileTap={isCompleted ? { scale: 0.95 } : {}}
            >
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isPast && "bg-secondary text-muted-foreground"
                )}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <Check size={18} />
                  </motion.div>
                ) : (
                  <Icon size={18} />
                )}
              </motion.div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium transition-colors",
                  isPast ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
