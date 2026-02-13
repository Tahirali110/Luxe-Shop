import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/useCartStore';
import { SHIPPING_COST } from '@/utils/constants';

// Shipping method options
export const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard Shipping', price: 10, duration: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 20, duration: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 50, duration: 'Next business day' },
] as const;

// Payment method options
export const PAYMENT_METHODS = [
  { id: 'credit-card', name: 'Credit Card', icon: 'CreditCard' },
  { id: 'upi', name: 'UPI Pay', icon: 'Smartphone' },
  { id: 'wallet-apps', name: 'Payment Apps', icon: 'Wallet' },
] as const;

export const SUPPORTED_PAYMENT_APPS = [
  { id: 'apple-pay', name: 'Apple Pay', icon: 'Smartphone' },
  { id: 'google-pay', name: 'Google Pay', icon: 'Smartphone' },
  { id: 'paypal', name: 'PayPal', icon: 'Wallet' },
  { id: 'phone-pe', name: 'PhonePe', icon: 'Smartphone' },
  { id: 'amazon-pay', name: 'Amazon Pay', icon: 'Smartphone' },
  { id: 'paytm', name: 'Paytm', icon: 'Smartphone' },
] as const;

export type ShippingMethodId = typeof SHIPPING_METHODS[number]['id'];
export type PaymentMethodId = typeof PAYMENT_METHODS[number]['id'];
export type PaymentAppId = typeof SUPPORTED_PAYMENT_APPS[number]['id'];

export interface ShippingAddress {
  label: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentDetails {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export interface CouponData {
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  description: string;
}

export interface CheckoutFormData {
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethodId;
  paymentMethod: PaymentMethodId;
  selectedApp: PaymentAppId | '';
  paymentDetails: PaymentDetails;
  upiId: string;
  agreeToTerms: boolean;
  appliedCoupon: CouponData | null;
  stripePaymentMethodId?: string;
}

interface CheckoutContextType {
  currentStep: number;
  formData: CheckoutFormData;
  setCurrentStep: (step: number) => void;
  updateShippingAddress: (data: Partial<ShippingAddress>) => void;
  setShippingMethod: (method: ShippingMethodId) => void;
  setPaymentMethod: (method: PaymentMethodId) => void;
  setSelectedApp: (appId: PaymentAppId) => void;
  updatePaymentDetails: (data: Partial<PaymentDetails>) => void;
  setUpiId: (id: string) => void;
  setStripePaymentMethodId: (id: string) => void;
  setAgreeToTerms: (agree: boolean) => void;
  resetCheckout: () => void;
  getShippingCost: () => number;
}

const initialFormData: CheckoutFormData = {
  shippingAddress: {
    label: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  },
  shippingMethod: 'standard',
  paymentMethod: 'credit-card',
  selectedApp: '',
  paymentDetails: {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  },
  upiId: '',
  agreeToTerms: false,
  appliedCoupon: null,
  stripePaymentMethodId: undefined,
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData);

  useEffect(() => {
    // Sync shipping method to cart store on mount
    useCartStore.getState().setShippingMethod(formData.shippingMethod);
  }, [formData.shippingMethod]);

  const updateShippingAddress = (data: Partial<ShippingAddress>) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, ...data },
    }));
  };

  const setShippingMethod = (method: ShippingMethodId) => {
    setFormData(prev => ({ ...prev, shippingMethod: method }));
    useCartStore.getState().setShippingMethod(method);
  };

  const setPaymentMethod = (method: PaymentMethodId) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };

  const setSelectedApp = (appId: PaymentAppId) => {
    setFormData(prev => ({ ...prev, selectedApp: appId, paymentMethod: 'wallet-apps' }));
  };

  const updatePaymentDetails = (data: Partial<PaymentDetails>) => {
    setFormData(prev => ({
      ...prev,
      paymentDetails: { ...prev.paymentDetails, ...data },
    }));
  };

  const setUpiId = (id: string) => {
    setFormData(prev => ({ ...prev, upiId: id }));
  };

  const setStripePaymentMethodId = (id: string) => {
    setFormData(prev => ({ ...prev, stripePaymentMethodId: id }));
  };

  const setAgreeToTerms = (agree: boolean) => {
    setFormData(prev => ({ ...prev, agreeToTerms: agree }));
  };

  const getShippingCost = () => {
    // Source of truth: cart pricing rules
    return useCartStore.getState().getShipping();
  };

  const resetCheckout = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
  };

  return (
    <CheckoutContext.Provider
      value={{
        currentStep,
        formData,
        setCurrentStep,
        updateShippingAddress,
        setShippingMethod,
        setPaymentMethod,
        setSelectedApp,
        updatePaymentDetails,
        setUpiId,
        setStripePaymentMethodId,
        setAgreeToTerms,
        resetCheckout,
        getShippingCost,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
