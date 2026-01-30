import { motion } from 'framer-motion';
import { useWishlistStore } from '@/store/useWishlistStore';
import { products } from '@/utils/mockData';
import { EmptyState } from '@/components/ui/EmptyState';
import ProductCard from '@/components/ProductCard';
import { Pagination } from '@/components/ui/pagination';
import { useState, useMemo } from 'react';
import { pageTransition, staggerContainer } from '@/utils/animations';

const Wishlist = () => {
  const { items } = useWishlistStore();
  const wishlistProducts = useMemo(() => products.filter(p => items.includes(p.id)), [items]);

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
      {wishlistProducts.length === 0 ? (
        <EmptyState type="wishlist" />
      ) : (
        <>
          <div className="min-h-[500px]">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedWishlist.map(product => (
                <ProductCard key={product.id} product={product} />
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
