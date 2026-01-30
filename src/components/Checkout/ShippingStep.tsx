import { ArrowRight, Truck, Zap, Rocket, MapPin, Plus, Check, ChevronRight, Edit2 } from 'lucide-react';
import { useCheckout, SHIPPING_METHODS, ShippingMethodId, ShippingAddress } from '@/context/CheckoutContext';
import { fadeUp } from '@/utils/animations';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useAddressStore } from '@/store/useAddressStore';
import { SHIPPING_THRESHOLD } from '@/utils/constants';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ShippingStepProps {
  onNext: () => void;
}

export const ShippingStep = ({ onNext }: ShippingStepProps) => {
  const { formData, updateShippingAddress, setShippingMethod } = useCheckout();
  const { getSubtotal } = useCartStore();
  const { addresses, addAddress, getDefaultAddress } = useAddressStore();

  const subtotal = getSubtotal();
  const isFreeEligible = subtotal >= SHIPPING_THRESHOLD;

  const { shippingAddress, shippingMethod } = formData;
  const [errors, setErrors] = useState<Record<string, string>>({});

  // View states: 'list' (show saved), 'new' (add/edit form), 'selected' (summary)
  const [view, setView] = useState<'list' | 'new' | 'selected'>(
    addresses.length > 0 ? 'selected' : 'new'
  );

  // Initialize with default address if none is set
  useEffect(() => {
    if (addresses.length > 0 && !shippingAddress.address) {
      const defaultAddr = getDefaultAddress() || addresses[0];
      updateShippingAddress(defaultAddr);
      setView('selected');
    }
  }, [addresses, getDefaultAddress, shippingAddress.address, updateShippingAddress]);

  const inputClasses = "w-full px-4 py-3 bg-secondary rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";
  const errorInputClasses = "ring-2 ring-destructive/50";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingAddress.label.trim()) newErrors.label = 'Address label is required';
    if (!shippingAddress.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingAddress.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingAddress.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone is required';
    if (!shippingAddress.address.trim()) newErrors.address = 'Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    updateShippingAddress({ [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (!shippingAddress.label) {
        updateShippingAddress({ label: 'Shipping Address' });
      }
      // Save to store
      addAddress({ ...shippingAddress, label: shippingAddress.label || 'Shipping Address' });
      toast.success('Address saved to profile');
      setView('selected');
    }
  };

  const handleSelectAddress = (address: ShippingAddress) => {
    updateShippingAddress(address);
    setView('selected');
    toast.success('Shipping address updated');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'new') {
      if (validateForm()) {
        addAddress(shippingAddress);
        onNext();
      }
    } else {
      if (validateForm()) {
        onNext();
      }
    }
  };

  const getShippingIcon = (id: string) => {
    switch (id) {
      case 'standard': return Truck;
      case 'express': return Zap;
      case 'overnight': return Rocket;
      default: return Truck;
    }
  };

  return (
    <motion.form onSubmit={handleSubmit} variants={fadeUp} initial="initial" animate="animate" className="space-y-8">
      {/* Shipping Address Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            Shipping Address
          </h2>
          {view === 'selected' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setView('list')}
              className="text-primary hover:text-primary/80"
            >
              Change
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {view === 'selected' && (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 bg-secondary/50 rounded-2xl border-2 border-primary/20 relative group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                  <p className="text-muted-foreground mt-1">{shippingAddress.address}, {shippingAddress.apartment && `${shippingAddress.apartment}, `}{shippingAddress.city}</p>
                  <p className="text-muted-foreground">{shippingAddress.state}, {shippingAddress.zipCode}, {shippingAddress.country}</p>
                  <p className="text-sm text-muted-foreground mt-2">{shippingAddress.phone}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Check size={20} />
                </div>
              </div>
            </motion.div>
          )}

          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectAddress(addr)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                    shippingAddress.address === addr.address
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div>
                    <p className="font-semibold">{addr.firstName} {addr.lastName}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {addr.address}, {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full py-6 border-dashed gap-2 rounded-xl"
                onClick={() => {
                  updateShippingAddress({
                    label: '',
                    firstName: '', lastName: '', email: '', phone: '',
                    address: '', apartment: '', city: '', state: '', zipCode: '',
                    country: 'United States'
                  });
                  setView('new');
                }}
              >
                <Plus size={18} />
                Add New Address
              </Button>
            </motion.div>
          )}

          {view === 'new' && (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <input
                  type="text"
                  placeholder="Address Label (e.g. Home, Office) *"
                  value={shippingAddress.label || ''}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  className={cn(inputClasses, errors.label && errorInputClasses)}
                />
                {errors.label && <p className="text-destructive text-sm mt-1">{errors.label}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="First name *"
                    value={shippingAddress.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={cn(inputClasses, errors.firstName && errorInputClasses)}
                  />
                  {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last name *"
                    value={shippingAddress.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={cn(inputClasses, errors.lastName && errorInputClasses)}
                  />
                  {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email address *"
                    value={shippingAddress.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn(inputClasses, errors.email && errorInputClasses)}
                  />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone number *"
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={cn(inputClasses, errors.phone && errorInputClasses)}
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Street address *"
                  value={shippingAddress.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={cn(inputClasses, errors.address && errorInputClasses)}
                />
                {errors.address && <p className="text-destructive text-sm mt-1">{errors.address}</p>}
              </div>

              <input
                type="text"
                placeholder="Apartment, suite, etc. (optional)"
                value={shippingAddress.apartment}
                onChange={(e) => handleInputChange('apartment', e.target.value)}
                className={inputClasses}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <input
                    type="text"
                    placeholder="City *"
                    value={shippingAddress.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={cn(inputClasses, errors.city && errorInputClasses)}
                  />
                  {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="State *"
                    value={shippingAddress.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={cn(inputClasses, errors.state && errorInputClasses)}
                  />
                  {errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="ZIP *"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={cn(inputClasses, errors.zipCode && errorInputClasses)}
                  />
                  {errors.zipCode && <p className="text-destructive text-sm mt-1">{errors.zipCode}</p>}
                </div>
              </div>

              <select
                value={shippingAddress.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className={inputClasses}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </select>

              {addresses.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setView('list')}
                >
                  Cancel and choose existing
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shipping Method */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <Truck size={20} className="text-primary" />
          Shipping Method
        </h2>
        <div className="space-y-3">
          {SHIPPING_METHODS.map((method) => {
            const Icon = getShippingIcon(method.id);
            const isSelected = shippingMethod === method.id;

            return (
              <motion.button
                key={method.id}
                type="button"
                onClick={() => setShippingMethod(method.id as ShippingMethodId)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}>
                    <Icon size={18} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground">{method.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    {method.id === 'standard' && isFreeEligible ? (
                      <span className="text-primary">Free</span>
                    ) : (
                      `$${method.price}`
                    )}
                  </span>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "border-primary bg-primary" : "border-border"
                  )}>
                    {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-lg shadow-primary/25"
      >
        Continue to Payment
        <ArrowRight size={20} />
      </motion.button>
    </motion.form>
  );
};
