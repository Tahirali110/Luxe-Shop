import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Product } from '@/types/product';
import { fadeUp } from '@/utils/animations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface SmartSearchProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export const SmartSearch = ({ onClose, isMobile = false }: SmartSearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Ideally use a search endpoint, for now fetch all and filter client-side
        // or use the existing filter logic if backend supports it
        const response = await axios.get<Product[]>(`${API_URL}/api/products`);
        const allProducts = response.data;
        const filtered = allProducts.filter(product =>
          product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(debouncedQuery.toLowerCase())
        ).slice(0, 5);
        setResults(filtered);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedQuery]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setQuery('');
    setIsOpen(false);
    onClose?.();
  };

  // Safe access for image
  const getProductImage = (product: Product) => {
    return product.colors?.[0]?.image || product.image || '';
  };

  return (
    <div ref={containerRef} className={`relative ${isMobile ? 'w-full' : 'w-64 lg:w-80'}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products..."
          className="w-full pl-4 pr-20 py-2.5 bg-secondary/50 rounded-full border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />

        <div className="absolute right-1 flex items-center gap-1">
          {query && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={handleClear}
              className="p-1.5 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
          <button className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && debouncedQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">Searching...</div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((product, index) => (
                  <motion.div
                    key={product._id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/product/${product._id}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.category} • ${product.price}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                <div className="px-4 py-2 border-t border-border mt-2">
                  <Link
                    to={`/shop?search=${encodeURIComponent(debouncedQuery)}`}
                    onClick={handleResultClick}
                    className="text-sm text-primary hover:underline"
                  >
                    View all results for "{debouncedQuery}"
                  </Link>
                </div>
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No products found for "{debouncedQuery}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
