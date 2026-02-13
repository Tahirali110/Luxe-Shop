import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Package,
  CreditCard,
  Heart,
  Settings,
  LogOut,
  MapPin,
  ChevronRight,
  Clock,
  Edit2,
  Check,
  X,
  Camera,
} from 'lucide-react';
import { pageTransition, fadeUp } from '@/utils/animations';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useOrderStore } from '@/store/useOrderStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressManager } from '@/components/Profile/AddressManager';
import { OrdersSection } from '@/components/Profile/OrdersSection';
import { PaymentMethods } from '@/components/Profile/PaymentMethods';
import { SettingsPanel } from '@/components/Profile/SettingsPanel';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { Product } from '@/types/product';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

import { useAuthStore } from '@/store/useAuthStore';

// ... (keep other imports)

const menuItems = [
  { id: 'profile', icon: User, label: 'My Profile' },
  { id: 'addresses', icon: MapPin, label: 'Addresses' },
  { id: 'orders', icon: Package, label: 'My Orders' },
  { id: 'payments', icon: CreditCard, label: 'Payment Methods' },
  { id: 'wishlist', icon: Heart, label: 'Wishlist' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('tab') || 'profile';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Get user data and actions from store
  const { user, logout, updateProfile } = useAuthStore();

  // Use store data or fallback to defaults (avoiding hardcoded initialUserData for display where possible)
  const [userData, setUserData] = useState({
    name: user?.name || 'User',
    email: user?.email || '',
    phone: '',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    memberSince: 'January 2025',
  });

  const [editFormData, setEditFormData] = useState(userData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const wishlistItems = useWishlistStore((state) => state.items);
  const { orders, fetchOrders } = useOrderStore();
  const [products, setProducts] = useState<Product[]>([]);

  // Update local state when store user changes
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        avatar: user.avatar || prev.avatar
      }));
    }
  }, [user]);

  // Fetch products for wishlist
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(`${API_URL}/api/products`);
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products for wishlist', err);
      }
    };

    if (activeSection === 'wishlist') {
      fetchProducts();
    }
    fetchOrders();
  }, [activeSection, fetchOrders]);

  const handleLogout = () => {
    // 1. Call logout action from store (clears localStorage and state)
    logout();

    // 2. Close modal
    setShowLogoutModal(false);

    // 3. Navigate immediately with replace to prevent back-button access
    navigate('/auth', { replace: true });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    setEditFormData(userData);
    setIsEditing(true);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData(userData);
    setFormErrors({});
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSaveProfile = async () => {
    const errors: Record<string, string> = {};

    if (!editFormData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(editFormData.email)) {
      errors.email = 'Invalid email format';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await updateProfile(editFormData);
      setUserData(editFormData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 sm:p-6 bg-card rounded-2xl border border-border">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="relative group flex-shrink-0">
                  <img
                    src={isEditing ? editFormData.avatar : userData.avatar}
                    alt={userData.name}
                    className={cn(
                      "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover transition-all",
                      isEditing && "cursor-pointer hover:opacity-80"
                    )}
                    onClick={() => isEditing && fileInputRef.current?.click()}
                  />
                  {isEditing && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl cursor-pointer pointer-events-none group-hover:bg-black/60 transition-colors"
                    >
                      <Camera size={20} className="text-white" />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={formErrors.name ? 'border-destructive' : ''}
                        />
                        {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                          className={formErrors.email ? 'border-destructive' : ''}
                        />
                        {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-display text-xl sm:text-2xl font-bold truncate">{userData.name}</h2>
                      <p className="text-muted-foreground text-sm truncate">{userData.email}</p>
                      <p className="text-sm text-muted-foreground">{userData.phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">Member since {userData.memberSince}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-center sm:justify-end flex-shrink-0">
                {isEditing ? (
                  <>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X size={16} className="mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile}>
                      <Check size={16} className="mr-1" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={handleEditClick}>
                    <Edit2 size={16} className="mr-1" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 bg-card rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <span className="font-medium">Default Address</span>
                </div>
                {orders.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {orders[0].shippingAddress.addressLine1}<br />
                    {orders[0].shippingAddress.city}, {orders[0].shippingAddress.state} {orders[0].shippingAddress.zipCode}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No address saved yet</p>
                )}
              </div>
              <div className="p-4 sm:p-5 bg-card rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock size={18} className="text-primary" />
                  </div>
                  <span className="font-medium">Last Order</span>
                </div>
                {orders.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Order #{orders[0]._id.slice(-8).toUpperCase()}<br />
                      {new Date(orders[0].createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <Link to={`/track-order?order=${orders[0]._id}`} className="text-primary text-sm hover:underline mt-2 inline-block">
                      Track Order →
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No orders placed yet</p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 'addresses':
        return <AddressManager />;

      case 'orders':
        return <OrdersSection />;

      case 'payments':
        return <PaymentMethods />;

      case 'wishlist': {
        const wishlistProducts = products.filter((p) => wishlistItems.includes(p._id));
        return (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
            {wishlistProducts.length === 0 ? (
              <motion.div variants={fadeUp} className="text-center py-12">
                <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Your wishlist is empty</h3>
                <p className="text-muted-foreground mb-6">Start adding items you love!</p>
                <Link to="/shop">
                  <Button>Browse Products</Button>
                </Link>
              </motion.div>
            ) : (
              wishlistProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={fadeUp}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border"
                >
                  <img
                    src={product.colors?.[0]?.image || product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
                  </div>
                  <Link to={`/product/${product._id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        );
      }

      case 'settings':
        return <SettingsPanel />;

      default:
        return null;
    }
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Mobile Navigation (Visible on small screens) */}
          <div className="lg:hidden">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">{userData.name}</h3>
                <p className="text-xs text-muted-foreground">Premium Member</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 text-destructive"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={18} />
              </Button>
            </div>

            {/* Dropdown Navigation */}
            <div className="relative mb-2">
              <select
                value={activeSection}
                onChange={(e) => {
                  setSearchParams({ tab: e.target.value });
                  setIsEditing(false);
                }}
                className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
              >
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Desktop Sidebar (Hidden on small screens) */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:col-span-1"
          >
            <div className="sticky top-24 p-6 bg-card/50 backdrop-blur-xl rounded-3xl border border-border/50 shadow-xl">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="font-semibold">{userData.name}</h3>
                  <p className="text-sm text-muted-foreground">Premium Member</p>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      setSearchParams({ tab: item.id });
                      setIsEditing(false);
                    }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground'
                      }`}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight size={16} className="ml-auto opacity-50" />
                  </motion.button>
                ))}

                <motion.button
                  onClick={() => setShowLogoutModal(true)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </nav>
            </div>
          </motion.aside>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 min-w-0 overflow-hidden"
          >
            <div className="mb-4 lg:mb-6">
              <h1 className="font-display text-2xl lg:text-3xl font-bold">
                {menuItems.find((m) => m.id === activeSection)?.label || 'Profile'}
              </h1>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Profile;
