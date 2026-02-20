import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Product } from '@/types/product';
import { fadeUp } from '@/utils/animations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ---------------------------------------------------------------------------
// Module-level Trie — built ONCE per browser session, shared across all
// SmartSearch instances (desktop + mobile).
// Why module-level and not inside the component?
//   • Products are fetched only once, not once per component mount.
//   • The Trie is built once from those products and reused forever.
//   • Subsequent queries are pure O(m) Trie lookups — zero network, zero rebuild.
// ---------------------------------------------------------------------------

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  // Products attached at this prefix node — enables O(m) retrieval
  products: Set<Product> = new Set();
}

class SmartSearchTrie {
  private root: TrieNode = new TrieNode();

  /**
   * Insert a product by tokenising its name and category.
   * Each word is inserted independently so "Luxury Watch" is searchable
   * by typing "lux", "wat", "watch", etc.
   * Complexity: O(k * m) per product, where k = word count, m = avg word length.
   */
  insert(product: Product): void {
    const tokens = `${product.name} ${product.category}`
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    for (const token of tokens) {
      let node = this.root;
      for (const char of token) {
        if (!node.children.has(char)) {
          node.children.set(char, new TrieNode());
        }
        node = node.children.get(char)!;
        // Attach the product at every prefix node.
        // Reaching the final char of the query is enough to collect all matches.
        node.products.add(product);
      }
    }
  }

  /**
   * Prefix search: walk the Trie character-by-character.
   * Returns all products whose name/category contains a word starting with `query`.
   * Complexity: O(m) where m = query length — independent of catalogue size.
   */
  search(query: string, limit = 5): Product[] {
    let node = this.root;
    for (const char of query.toLowerCase()) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char)!;
    }
    // Slice to the requested limit before converting to avoid large array allocations
    const result: Product[] = [];
    for (const product of node.products) {
      result.push(product);
      if (result.length >= limit) break;
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// Singleton state — module scope so it outlives individual component mounts
// ---------------------------------------------------------------------------

/** Singleton Trie instance shared across all SmartSearch mounts */
const sharedTrie = new SmartSearchTrie();

/** All products loaded from the server (populated once) */
let cachedProducts: Product[] | null = null;

/**
 * In-flight fetch promise — prevents multiple parallel fetches when two
 * SmartSearch instances (desktop + mobile) mount at the same time.
 */
let fetchPromise: Promise<Product[]> | null = null;

/** Listeners registered by mounted SmartSearch components */
const listeners = new Set<() => void>();

/**
 * Fetch all products once, build the Trie, and notify all mounted listeners.
 * Subsequent calls return the already-resolved promise immediately.
 */
function ensureProductsLoaded(): Promise<Product[]> {
  if (cachedProducts) return Promise.resolve(cachedProducts);

  if (!fetchPromise) {
    fetchPromise = axios
      .get<Product[]>(`${API_URL}/api/products`)
      .then((res) => {
        cachedProducts = res.data;
        // Populate the Trie once with all products
        for (const product of cachedProducts) {
          sharedTrie.insert(product);
        }
        // Notify all mounted SmartSearch components that data is ready
        listeners.forEach((fn) => fn());
        return cachedProducts;
      })
      .catch((err) => {
        console.error('[SmartSearch] Failed to load products for Trie:', err);
        fetchPromise = null; // Allow a retry on next mount
        return [];
      });
  }

  return fetchPromise;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SmartSearchProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export const SmartSearch = ({ onClose, isMobile = false }: SmartSearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(cachedProducts !== null); // true if already cached
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Register this instance as a listener so it re-renders when products load
  useEffect(() => {
    if (cachedProducts) {
      // Products already cached from a previous mount — nothing to do
      setIsReady(true);
      return;
    }

    const notify = () => setIsReady(true);
    listeners.add(notify);

    // Trigger the fetch (no-op if already in flight)
    ensureProductsLoaded();

    return () => {
      listeners.delete(notify);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Trie search — runs synchronously on every query change.
  // No debounce needed: Trie lookup is O(m), essentially free.
  // The Map-based per-session cache below adds another O(1) layer for
  // repeated identical queries (e.g. user clears and retypes the same term).
  // ---------------------------------------------------------------------------

  /** Per-instance query result cache (Map DSA) — O(1) repeated-query lookup */
  const queryCache = useRef<Map<string, Product[]>>(new Map());

  const results = useMemo(() => {
    const key = query.trim().toLowerCase();

    // Require at least 1 character to show suggestions
    if (key.length < 1 || !isReady) return [];

    // Cache hit: return immediately without touching the Trie
    if (queryCache.current.has(key)) {
      return queryCache.current.get(key)!;
    }

    // Cache miss: O(m) Trie lookup
    const found = sharedTrie.search(key, 5);

    // Store in per-instance cache for future repeated lookups
    queryCache.current.set(key, found);
    return found;
  }, [query, isReady]);

  // Close dropdown on outside click
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

  // Safely resolve the product thumbnail
  const getProductImage = (product: Product) =>
    product.colors?.[0]?.image || product.image || '';

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

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && query.trim().length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {!isReady ? (
              // Products are still loading — show a subtle spinner
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Loading suggestions...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((product, index) => (
                  <motion.div
                    key={product._id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      to={`/product/${product._id}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        loading="lazy"
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
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
                    to={`/shop?search=${encodeURIComponent(query.trim())}`}
                    onClick={handleResultClick}
                    className="text-sm text-primary hover:underline"
                  >
                    View all results for "{query.trim()}"
                  </Link>
                </div>
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No products found for "{query.trim()}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
