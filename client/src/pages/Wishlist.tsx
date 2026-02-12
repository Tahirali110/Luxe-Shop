import { motion } from 'framer-motion';
import { useWishlistStore } from '@/store/useWishlistStore';
import { Product } from '@/types/product';
import { EmptyState } from '@/components/ui/EmptyState';
import ProductCard from '@/components/ProductCard';
import { Pagination } from '@/components/ui/pagination';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { pageTransition, staggerContainer } from '@/utils/animations';
import { Skeleton } from '@/components/ui/skeleton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Wishlist = () => {
  const { items } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all products so we can filter by wishlist IDs
  // In a real app, you might have a dedicated /api/products/batch endpoint
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Product[]>(`${API_URL}/api/products`);
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const wishlistProducts = useMemo(() => {
    return products.filter(p => items.includes(p._id));
  }, [products, items]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(wishlistProducts.length / itemsPerPage);
  const paginatedWishlist = wishlistProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold mb-8">My Wishlist</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square rounded-2xl w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : wishlistProducts.length === 0 ? (
        <EmptyState type="wishlist" />
      ) : (
        <>
          <div className="min-h-[500px]">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedWishlist.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </motion.div>
  );
};

export default Wishlist;
