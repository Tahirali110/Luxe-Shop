import { motion } from 'framer-motion';
import { Star, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { useState } from 'react';

import { Review } from '@/types/product';

interface ProductTabsProps {
  description: string;
  details: {
    material?: string;
    care?: string;
    features?: string[];
    specifications?: Record<string, string>;
  };
  reviews: Review[];
  avgRating: string;
  totalReviews: number;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export const ProductTabs = ({ description, details, reviews, avgRating, totalReviews, activeTab, onTabChange }: ProductTabsProps) => {
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const reviewsPerPage = 4;

  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);
  const paginatedReviews = reviews.slice(
    (currentReviewPage - 1) * reviewsPerPage,
    currentReviewPage * reviewsPerPage
  );
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      defaultValue="description"
      className="mt-12"
    >
      <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 gap-0">
        <TabsTrigger
          value="description"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
        >
          Description
        </TabsTrigger>
        <TabsTrigger
          value="details"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
        >
          Details
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
        >
          Reviews ({totalReviews})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-neutral dark:prose-invert max-w-none"
        >
          <p className="text-muted-foreground leading-relaxed text-lg">
            {description}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Crafted with meticulous attention to detail, this piece represents the perfect fusion of contemporary design
            and timeless elegance. Each item undergoes rigorous quality control to ensure it meets our exacting standards.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Whether you're dressing for a casual day out or a special occasion, this versatile piece adapts effortlessly
            to any setting, making it an essential addition to your wardrobe.
          </p>
        </motion.div>
      </TabsContent>

      <TabsContent value="details" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Material & Care */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-2xl border border-border">
              <h4 className="font-semibold mb-4">Material</h4>
              <p className="text-muted-foreground">
                {details.material || 'Premium quality fabric blend - 60% Cotton, 35% Polyester, 5% Elastane'}
              </p>
            </div>
            <div className="p-6 bg-card rounded-2xl border border-border">
              <h4 className="font-semibold mb-4">Care Instructions</h4>
              <p className="text-muted-foreground">
                {details.care || 'Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on low heat if needed.'}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h4 className="font-semibold mb-4">Key Features</h4>
            <ul className="grid sm:grid-cols-2 gap-3">
              {(details.features || [
                'Premium quality construction',
                'Comfortable fit for all-day wear',
                'Breathable and lightweight fabric',
                'Durable and long-lasting',
                'Easy care and maintenance',
                'Versatile styling options',
              ]).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle size={16} className="text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h4 className="font-semibold mb-4">Specifications</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.entries(details.specifications || {
                'SKU': 'NXS-PRD-001',
                'Weight': '0.35 kg',
                'Origin': 'Ethically sourced',
                'Warranty': '2 years',
              }).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Review Summary */}
          <div className="flex items-center gap-6 mb-8 p-6 bg-card rounded-2xl border border-border">
            <div className="text-center">
              <p className="font-display text-4xl font-bold">{avgRating}</p>
              <div className="flex items-center gap-1 justify-center my-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(Number(avgRating)) ? 'fill-primary text-primary' : 'text-muted-foreground'}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{totalReviews} reviews</p>
            </div>

            {/* Rating Bars */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => r.rating === stars).length;
                const percentage = (count / reviews.length) * 100 || 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">{stars}★</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: (5 - stars) * 0.1 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review List */}
          <div className="grid md:grid-cols-2 gap-6">
            {paginatedReviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{review.userName}</span>
                      {review.verified && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {review.images.map((img, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary cursor-pointer"
                        onClick={() => window.open(img.startsWith('http') || img.startsWith('data:') ? img : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`, '_blank')}
                      >
                        <img
                          src={img.startsWith('http') || img.startsWith('data:') ? img : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`}
                          alt={`Review image ${i + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
                {review.adminReply && (
                  <div className="mt-4 p-4 bg-secondary/50 rounded-xl text-sm">
                    <p className="font-medium text-primary mb-1">Response from Luxe:</p>
                    <p className="text-muted-foreground">{review.adminReply}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <Pagination
            currentPage={currentReviewPage}
            totalPages={totalReviewPages}
            onPageChange={setCurrentReviewPage}
          />
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};
