import { useState, useEffect } from 'react';
import { usePaymentStore } from '@/store/usePaymentStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Smartphone } from 'lucide-react';
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

export const PaymentMethods = () => {
  const { methods, fetchPayments, addPaymentMethod, removePaymentMethod, setDefaultPayment, upiIds, addUpiId, removeUpiId, isLoading } = usePaymentStore();
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [upiForm, setUpiForm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ').substring(0, 19) : '';
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + '/' + numbers.substring(2, 4);
    }
    return numbers;
  };

  const validateCard = () => {
    const cardNum = cardForm.cardNumber.replace(/\s/g, '');
    if (cardNum.length < 16) {
      toast.error('Card number must be 16 digits');
      return false;
    }
    if (!cardForm.cardName.trim()) {
      toast.error('Please enter cardholder name');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardForm.expiryDate)) {
      toast.error('Invalid expiry date format (MM/YY)');
      return false;
    }
    if (!/^\d{3,4}$/.test(cardForm.cvv)) {
      toast.error('Invalid CVV');
      return false;
    }
    return true;
  };

  const handleAddCard = async () => {
    if (!validateCard()) return;

    try {
      await addPaymentMethod({
        cardNumber: cardForm.cardNumber,
        cardName: cardForm.cardName,
        expiryDate: cardForm.expiryDate,
        isDefault: methods.length === 0
      });

      setIsCardModalOpen(false);
      setCardForm({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
      toast.success('Card added successfully');
    } catch (error) {
      toast.error('Failed to add card');
    }
  };

  const handleDeleteCard = async (id: string) => {
    const card = methods.find(c => c._id === id);
    if (card?.isDefault) {
      toast.error("Can't delete default card");
      return;
    }
    await removePaymentMethod(id);
    toast.success('Card removed');
  };

  const handleSetDefaultCard = (id: string) => {
    setDefaultPayment(id);
    toast.success('Default card updated');
  };

  const handleAddUpi = async () => {
    if (!upiForm.includes('@')) {
      toast.error('Invalid UPI ID format');
      return;
    }

    try {
      await addUpiId({
        upiId: upiForm,
        isDefault: upiIds.length === 0,
      });

      setIsUpiModalOpen(false);
      setUpiForm('');
      toast.success('UPI ID added');
    } catch (error) {
      toast.error('Failed to add UPI');
    }
  };

  const handleDeleteUpi = async (id: string) => {
    const upi = upiIds.find(u => u._id === id);
    if (upi?.isDefault) {
      toast.error("Can't delete default UPI ID");
      return;
    }
    await removeUpiId(id);
    toast.success('UPI ID removed');
  };

  const handleSetDefaultUpi = (id: string) => {
    // Current backend doesn't support this via a direct dedicated route without adding it
    toast.info('Update functionality coming soon');
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
      {/* Saved Cards */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Saved Cards</h3>
        <div className="space-y-4">
          {methods.map((card) => {
            const cardNum = card.cardNumber.replace(/\s/g, '');
            const cardType = cardNum.startsWith('4') ? 'visa' : cardNum.startsWith('5') ? 'mastercard' : 'amex';
            const gradient = cardType === 'visa'
              ? 'from-blue-600 via-blue-500 to-blue-400'
              : cardType === 'mastercard'
                ? 'from-orange-500 via-red-500 to-pink-500'
                : 'from-purple-600 via-purple-500 to-indigo-400';

            return (
              <motion.div
                key={card._id}
                variants={fadeUp}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${gradient} text-white overflow-hidden`}
              >
                {/* Card Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-white/30" />
                  <div className="absolute top-8 right-8 w-24 h-24 rounded-full border border-white/20" />
                </div>

                {card.isDefault && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                    Default
                  </span>
                )}

                <div className="relative">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-10 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                      <div className="w-8 h-6 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded" />
                    </div>
                    <span className="text-lg font-bold uppercase tracking-wider">{cardType}</span>
                  </div>

                  <div className="mb-6">
                    <p className="text-xl tracking-[0.3em] font-mono">
                      {card.cardNumber}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-white/70 uppercase mb-1">Card Holder</p>
                      <p className="font-medium text-sm">{card.cardName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70 uppercase mb-1">Expires</p>
                      <p className="font-medium">{card.expiryDate}</p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/20">
                    {!card.isDefault && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefaultCard(card._id)}
                          className="text-white hover:bg-white/20 gap-1 h-8 text-xs"
                        >
                          Set Default
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCard(card._id)}
                          className="text-white hover:bg-white/20 gap-1 h-8 text-xs"
                        >
                          <Trash2 size={14} />
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Add New Card Button */}
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCardModalOpen(true)}
            className="w-full p-6 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add New Card
          </motion.button>
        </div>
      </div>

      {/* UPI IDs */}
      <div>
        <h3 className="font-semibold text-lg mb-4">UPI IDs</h3>
        <div className="space-y-3">
          {upiIds.map((upi) => (
            <motion.div
              key={upi._id}
              variants={fadeUp}
              className={`flex items-center gap-4 p-4 bg-card rounded-xl border ${upi.isDefault ? 'border-primary' : 'border-border'
                }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Smartphone size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{upi.upiId}</p>
                {upi.isDefault && (
                  <span className="text-xs text-primary">Default</span>
                )}
              </div>
              {!upi.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUpi(upi._id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </motion.div>
          ))}

          <motion.button
            variants={fadeUp}
            onClick={() => setIsUpiModalOpen(true)}
            className="w-full p-4 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add UPI ID
          </motion.button>
        </div>
      </div>

      {/* Add Card Modal */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add New Card</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardForm.cardNumber}
                onChange={(e) => setCardForm(prev => ({
                  ...prev,
                  cardNumber: formatCardNumber(e.target.value)
                }))}
                maxLength={19}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardForm.cardName}
                onChange={(e) => setCardForm(prev => ({ ...prev, cardName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={cardForm.expiryDate}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    expiryDate: formatExpiry(e.target.value)
                  }))}
                  maxLength={5}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="•••"
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm(prev => ({
                    ...prev,
                    cvv: e.target.value.replace(/\D/g, '').substring(0, 4)
                  }))}
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCardModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCard}>
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add UPI Modal */}
      <Dialog open={isUpiModalOpen} onOpenChange={setIsUpiModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add UPI ID</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="username@upi"
                value={upiForm}
                onChange={(e) => setUpiForm(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your UPI ID linked to any bank account
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpiModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUpi}>
              Add UPI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
