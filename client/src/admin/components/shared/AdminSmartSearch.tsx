import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, ShoppingBag, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '@/admin/services/productService';
import { orderService } from '@/admin/services/orderService';
import { userService } from '@/admin/services/userService';
import { Product, Order, User } from '@/admin/types';
import { formatCurrency, formatOrderId } from '@/admin/utils/formatters';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const AdminSmartSearch = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<{
        products: Product[];
        orders: Order[];
        customers: User[];
    }>({
        products: [],
        orders: [],
        customers: [],
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Perform search
    useEffect(() => {
        const performSearch = async () => {
            if (query.trim().length < 2) {
                setResults({ products: [], orders: [], customers: [] });
                return;
            }

            setIsLoading(true);
            try {
                const [products, orders, users] = await Promise.all([
                    productService.getAll(),
                    orderService.getAll(),
                    userService.getAll(),
                ]);

                const q = query.toLowerCase().trim();

                const filteredProducts = products.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p._id.toLowerCase().includes(q)
                ).slice(0, 3);

                const filteredOrders = orders.filter(o =>
                    o._id.toLowerCase().includes(q) ||
                    formatOrderId(o._id).toLowerCase().includes(q) ||
                    o.customerName?.toLowerCase().includes(q) ||
                    o.customerEmail?.toLowerCase().includes(q) ||
                    o.shippingAddress?.email?.toLowerCase().includes(q)
                ).slice(0, 3);

                const filteredCustomers = users.filter(u =>
                    !u.isAdmin && (
                        u.name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u._id.toLowerCase().includes(q)
                    )
                ).slice(0, 3);

                setResults({
                    products: filteredProducts,
                    orders: filteredOrders,
                    customers: filteredCustomers,
                });
            } catch (error) {
                console.error('Admin search failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (path: string) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    const hasResults = results.products.length > 0 || results.orders.length > 0 || results.customers.length > 0;

    return (
        <div ref={containerRef} className="relative w-full max-w-md hidden md:block">
            <div className="relative group">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search products, orders, customers..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full pl-10 pr-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-xl h-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : query ? (
                        <button onClick={() => setQuery('')} className="hover:text-foreground text-muted-foreground p-1 rounded-full hover:bg-muted transition-colors">
                            <X className="h-3 w-3" />
                        </button>
                    ) : null}
                    <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-background text-[10px] text-muted-foreground font-medium pointer-events-none select-none">
                        <span className="text-[12px]">↵</span> ENTER
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (query.length >= 2) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                    >
                        {!isLoading && !hasResults ? (
                            <div className="py-8 px-4 text-center">
                                <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-20" />
                                <p className="text-sm font-medium">No matches found</p>
                                <p className="text-xs text-muted-foreground mt-1">Try searching for something else</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-1">
                                {/* Products Section */}
                                {results.products.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                                            <Package className="h-3 w-3 text-primary" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Products</span>
                                        </div>
                                        <div className="space-y-1">
                                            {results.products.map((product) => (
                                                <button
                                                    key={product._id}
                                                    onClick={() => handleSelect(`/admin/products/${product._id}/edit`)}
                                                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/80 transition-all text-left group"
                                                >
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                        <img src={product.colors?.[0]?.image || '/placeholder.svg'} alt="" loading="lazy" className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</p>
                                                            <span className="text-xs font-semibold">{formatCurrency(product.price)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5">{product.category}</Badge>
                                                            <span className="text-[10px] text-muted-foreground">{product.stock} in stock</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Orders Section */}
                                {results.orders.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                                            <ShoppingBag className="h-3 w-3 text-primary" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Orders</span>
                                        </div>
                                        <div className="space-y-1">
                                            {results.orders.map((order) => (
                                                <button
                                                    key={order._id}
                                                    onClick={() => handleSelect(`/admin/orders/${order._id}`)}
                                                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/80 transition-all text-left group"
                                                >
                                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                        <ShoppingBag className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-sm font-medium group-hover:text-primary transition-colors">{formatOrderId(order._id)}</p>
                                                            <span className="text-xs font-semibold">{formatCurrency(order.totals.total)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <p className="text-[10px] text-muted-foreground truncate">{order.customerName || 'Guest'}</p>
                                                            <Badge className="text-[9px] h-4 px-1">{order.orderStatus}</Badge>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Customers Section */}
                                {results.customers.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                                            <Users className="h-3 w-3 text-primary" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customers</span>
                                        </div>
                                        <div className="space-y-1">
                                            {results.customers.map((user) => (
                                                <button
                                                    key={user._id}
                                                    onClick={() => handleSelect(`/admin/customers/${user._id}`)}
                                                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/80 transition-all text-left group"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground flex-shrink-0">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{user.name}</p>
                                                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                                                    </div>
                                                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Quick Actions */}
                                <div className="border-t border-border mt-2 pt-2 px-1">
                                    <button
                                        onClick={() => handleSelect(`/admin/products?search=${encodeURIComponent(query)}`)}
                                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 text-xs font-medium text-primary transition-colors"
                                    >
                                        See all results for "{query}"
                                        <ArrowRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
