import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { products, categories, priceRanges, sortOptions } from '@/utils/mockData';
import ProductCard from '@/components/ProductCard';
import { Pagination } from '@/components/ui/pagination';
import { pageTransition, staggerContainer, fadeUp } from '@/utils/animations';
import { Skeleton } from '@/components/ui/skeleton';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedPriceRange, sortBy, searchQuery]);

  // Sync category and search from URL
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (category && categories.includes(category as any)) {
      setSelectedCategory(category);
    } else if (!category) {
      setSelectedCategory('All');
    }

    if (search !== null) {
      setSearchQuery(search);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);

    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }

    setSearchParams(newParams);
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price >= selectedPriceRange.min && product.price < selectedPriceRange.max;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesPrice && matchesSearch;
    });

    switch (sortBy.value) {
      case 'price-asc':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered = [...filtered].sort((a, b) => b.id - a.id);
        break;
    }

    return filtered;
  }, [selectedCategory, selectedPriceRange, sortBy, searchQuery]);

  // Handle pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedPriceRange, sortBy, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? '' : 'sticky top-24'}`}>
      <div className="space-y-8">
        <div>
          <h3 className="font-display font-semibold text-lg mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryChange(category)}
                className={`block w-full text-left px-4 py-2 rounded-xl transition-colors ${selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display font-semibold text-lg mb-4">Price Range</h3>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <motion.button
                key={range.label}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPriceRange(range)}
                className={`block w-full text-left px-4 py-2 rounded-xl transition-colors ${selectedPriceRange.label === range.label
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
              >
                {range.label}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            handleCategoryChange('All');
            setSelectedPriceRange(priceRanges[0]);
            setSearchQuery('');
          }}
          className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
        >
          Clear All Filters
        </motion.button>
      </div>
    </div>
  );

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-8">
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Shop <span className="gradient-text">Collection</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our curated selection of premium products.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar />
            </aside>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl font-medium"
                >
                  <SlidersHorizontal size={18} />
                  Filters
                </motion.button>

                <p className="text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{filteredProducts.length}</span> products
                </p>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl font-medium"
                  >
                    {sortBy.label}
                    <ChevronDown size={18} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50"
                      >
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option);
                              setIsSortOpen(false);
                            }}
                            className={`block w-full text-left px-4 py-3 hover:bg-secondary transition-colors ${sortBy.value === option.value ? 'bg-secondary font-medium' : ''
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="min-h-[800px]">
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                >
                  {isLoading ? (
                    [...Array(itemsPerPage)].map((_, i) => (
                      <div key={i} className="space-y-4">
                        <Skeleton className="aspect-square rounded-2xl w-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    ))
                  ) : (
                    paginatedProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))
                  )}
                </motion.div>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            {filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-2xl font-display mb-2">No products found</p>
                <p className="text-muted-foreground">Try adjusting your filters.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-background z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-xl font-semibold">Filters</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 rounded-xl hover:bg-secondary"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                <FilterSidebar isMobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div >
  );
};

export default Shop;
