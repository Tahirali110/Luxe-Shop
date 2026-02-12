import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { fadeUp, staggerContainer } from '@/utils/animations';
import { useAddressStore } from '@/store/useAddressStore';

const emptyAddress = {
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
  isDefault: false,
};

export const AddressManager = () => {
  const { addresses, fetchAddresses, addAddress, removeAddress, updateAddress, setDefaultAddress, isLoading } = useAddressStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      label: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      isDefault: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (address: any) => {
    setEditingId(address._id);
    setFormData({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.addressLine1 || !formData.city || !formData.firstName) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (editingId) {
        await updateAddress(editingId, formData);
        toast.success('Address updated');
      } else {
        await addAddress(formData);
        toast.success('Address added');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleDelete = async (id: string) => {
    const addressToDelete = addresses.find(a => a._id === id);
    if (addressToDelete?.isDefault) {
      toast.error("Can't delete default address");
      return;
    }
    await removeAddress(id);
    toast.success('Address deleted');
  };

  if (isLoading && addresses.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin text-primary mr-2" />
        <p className="text-muted-foreground font-medium">Loading addresses...</p>
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <AnimatePresence mode="popLayout">
        {addresses.map((address) => (
          <motion.div
            key={address._id}
            variants={fadeUp}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative p-6 bg-card rounded-2xl border transition-all ${address.isDefault ? 'border-primary ring-1 ring-primary/20' : 'border-border'
              }`}
          >
            {address.isDefault && (
              <span className="absolute top-4 right-4 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Default
              </span>
            )}

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{address.label}</h4>
                  <span className="text-xs text-muted-foreground">• {address.firstName} {address.lastName}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />
                  {address.city}, {address.state} {address.zipCode}<br />
                  {address.country}<br />
                  {address.phone}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditModal(address)}
                className="gap-1 h-9"
              >
                <Edit2 size={14} />
                Edit
              </Button>
              {!address.isDefault && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultAddress(address._id)}
                    className="gap-1 h-9"
                  >
                    <Check size={14} />
                    Set Default
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address._id)}
                    className="gap-1 h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button
        variants={fadeUp}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleOpenAddModal}
        className="w-full p-6 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 bg-secondary/30"
      >
        <Plus size={20} />
        Add New Address
      </motion.button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="label">Address Label *</Label>
              <Input
                id="label"
                placeholder="e.g., Home, Office"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="w-4 h-4 rounded border-border"
              />
              <Label htmlFor="isDefault" className="font-normal cursor-pointer">
                Set as default address
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Save Changes' : 'Add Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
