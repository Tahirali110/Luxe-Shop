import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, User, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { SmartSearch } from '@/components/ui/SmartSearch';
import { APP_NAME } from '@/utils/constants';
import { popIn } from '@/utils/animations';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Contact', href: '/contact' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.getTotalItems());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActiveLink = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm' 
          : 'bg-background/95 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'
        }`}>
          {/* Logo + Search Compact */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link to="/" className="flex-shrink-0">
              <motion.span
                className="font-display text-xl lg:text-2xl font-bold tracking-tight"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="gradient-text">{APP_NAME}</span>
              </motion.span>
            </Link>

            {/* Search - Desktop (Compact, near logo) */}
            <div className="hidden md:block">
              <SmartSearch />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <Link key={link.label} to={link.href}>
                  <motion.span
                    className={`text-sm font-medium transition-colors relative ${
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    {link.label}
                    <span 
                      className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`} 
                    />
                    {!isActive && (
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary hover:w-full transition-all duration-300 group-hover:w-full" />
                    )}
                  </motion.span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'light' ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User - Goes to Profile if logged in, Auth otherwise */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                navigate(isLoggedIn ? '/profile' : '/auth');
              }}
              className="hidden sm:flex p-2.5 rounded-xl hover:bg-secondary transition-colors"
              aria-label="Account"
            >
              <User size={20} />
            </motion.button>

            {/* Wishlist */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/wishlist')}
              className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              <AnimatePresence>
                {wishlistItems > 0 && (
                  <motion.span
                    variants={popIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full flex items-center justify-center"
                  >
                    {wishlistItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Cart - Navigates to /cart page */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/cart')}
              className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    variants={popIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-secondary transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-border/50"
            >
              <div className="py-4 space-y-4">
                {/* Mobile Search */}
                <SmartSearch isMobile onClose={() => setIsMobileMenuOpen(false)} />
                
                {/* Mobile Nav Links */}
                <nav className="space-y-1">
                  {NAV_ITEMS.map((link, index) => {
                    const isActive = isActiveLink(link.href);
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block py-3 px-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive 
                              ? 'text-foreground bg-secondary/50 border-l-2 border-primary' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Navbar;