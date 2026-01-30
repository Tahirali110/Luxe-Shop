import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Heart, Minus, Plus, ShoppingBag, Truck, Shield, RotateCcw, Ruler, AlertTriangle, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { products } from '@/utils/mockData';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import ProductCard from '@/components/ProductCard';
import { ProductTabs } from '@/components/Product/ProductTabs';
import { pageTransition, fadeUp, staggerContainer } from '@/utils/animations';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Size guide data
const sizeGuideData = {
  clothing: [
    { size: 'XS', chest: '32-34"', waist: '26-28"', hips: '34-36"' },
    { size: 'S', chest: '34-36"', waist: '28-30"', hips: '36-38"' },
    { size: 'M', chest: '38-40"', waist: '32-34"', hips: '40-42"' },
    { size: 'L', chest: '42-44"', waist: '36-38"', hips: '44-46"' },
    { size: 'XL', chest: '46-48"', waist: '40-42"', hips: '48-50"' },
  ],
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();

  const product = useMemo(() => products.find(p => p.id === Number(id)), [id]);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [showLens, setShowLens] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [imageNatural, setImageNatural] = useState<{ w: number; h: number } | null>(null);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [relatedScrollIndex, setRelatedScrollIndex] = useState(0);

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [id]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6);
  }, [product]);

  // Mock stock number (low stock urgency)
  const stockLeft = useMemo(() => Math.floor(Math.random() * 8) + 2, []);

  // Reset added state when product changes
  useEffect(() => {
    setIsAddedToCart(false);
  }, [id]);

  // Reset image dimensions and index when product or color changes
  useEffect(() => {
    setImageNatural(null);
    setActiveImageIndex(0);
  }, [id, selectedColorIndex]);

  const selectedColor = product?.colors[selectedColorIndex];

  // Calculate dynamic price based on color and size
  const currentPrice = useMemo(() => {
    if (!product || !selectedColor) return 0;
    let price = selectedColor.price || product.price;
    if (selectedSize && product.sizePriceAdjustments && product.sizePriceAdjustments[selectedSize]) {
      price += product.sizePriceAdjustments[selectedSize];
    }
    return price;
  }, [product, selectedColor, selectedSize]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-12 mt-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-3xl w-full" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-20 h-20 rounded-xl" />)}
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-12 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-16 flex-1 rounded-2xl" />
              <Skeleton className="h-16 w-16 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !selectedColor) {
    return (
      <motion.div variants={pageTransition} initial="initial" animate="animate" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-primary hover:underline">Return to Shop</Link>
        </div>
      </motion.div>
    );
  }

  const galleryImages = selectedColor.images && selectedColor.images.length > 0
    ? selectedColor.images
    : [selectedColor.image];
  const activeImage = galleryImages[activeImageIndex] || selectedColor.image;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (isAddedToCart) {
      navigate('/cart');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedColor.name, selectedColor.hex, selectedSize || product.sizes?.[0], currentPrice);
    }
    toast.success('Added to cart!', {
      description: `${product.name} (${selectedColor.name}${selectedSize ? `, ${selectedSize}` : ''}) x ${quantity}`,
      icon: '✓',
    });
    setIsAddedToCart(true);
  };

  const handleWishlistToggle = () => {
    setIsHeartAnimating(true);
    toggleItem(product.id);
    setTimeout(() => setIsHeartAnimating(false), 300);
  };

  const LENS_HEAD_SIZE = 100;
  const PIN_STEM_HEIGHT = 0;
  const ZOOM_FACTOR = 15;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setCursorPosition({ x: mouseX, y: mouseY });

    if (imageNatural) {
      const W = rect.width;
      const H = rect.height;
      const imgW = imageNatural.w;
      const imgH = imageNatural.h;
      const s = Math.max(W / imgW, H / imgH);
      const offsetX = (W - imgW * s) / 2;
      const offsetY = (H - imgH * s) / 2;
      const imgX = (mouseX - offsetX) / s;
      const imgY = (mouseY - offsetY) / s;
      const normX = imgX / imgW;
      const normY = imgY / imgH;
      setLensPosition({
        x: Math.max(0, Math.min(100, normX * 100)),
        y: Math.max(0, Math.min(100, normY * 100)),
      });
    } else {
      const percentX = (mouseX / rect.width) * 100;
      const percentY = (mouseY / rect.height) * 100;
      setLensPosition({
        x: Math.max(0, Math.min(100, percentX)),
        y: Math.max(0, Math.min(100, percentY)),
      });
    }
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <main className="py-8 pb-32 lg:pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            variants={fadeUp}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div variants={fadeUp}>
              <div
                ref={imageRef}
                className="relative aspect-square rounded-3xl overflow-hidden bg-secondary"
                style={{ cursor: showLens ? 'none' : 'crosshair' }}
                onMouseEnter={() => setShowLens(true)}
                onMouseLeave={() => setShowLens(false)}
                onMouseMove={handleMouseMove}
              >
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    {product.badge}
                  </div>
                )}
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setImageNatural({ w: img.naturalWidth, h: img.naturalHeight });
                  }}
                />

                <AnimatePresence>
                  {showLens && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute pointer-events-none hidden md:block"
                      style={{
                        left: cursorPosition.x - 50,
                        top: cursorPosition.y - 50,
                        zIndex: 30,
                        width: LENS_HEAD_SIZE,
                        height: LENS_HEAD_SIZE + PIN_STEM_HEIGHT,
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 rounded-full overflow-hidden border-4"
                        style={{
                          width: LENS_HEAD_SIZE,
                          height: LENS_HEAD_SIZE,
                          borderColor: 'hsl(var(--primary))',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.35), inset 0 0 30px rgba(255,255,255,0.15)',
                        }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${activeImage})`,
                            backgroundSize: `${ZOOM_FACTOR * 100}%`,
                            backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
                            backgroundRepeat: 'no-repeat',
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 30%, transparent 50%, rgba(0,0,0,0.05) 100%)',
                          }}
                        />
                      </div>

                      <div
                        className="absolute left-1/2"
                        style={{
                          top: LENS_HEAD_SIZE - 2,
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '14px solid transparent',
                          borderRight: '14px solid transparent',
                          borderTop: `${PIN_STEM_HEIGHT + 2}px solid hsl(var(--primary))`,
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Color-Specific Gallery Thumbnails */}
              <div className="flex gap-3 mt-4 overflow-x-auto pb-4 no-scrollbar">
                {galleryImages.map((img, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === index ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'} />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviewsCount || 0} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <motion.span
                  key={currentPrice}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-4xl font-bold"
                >
                  ${currentPrice}
                </motion.span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                    <span className="px-2 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded-lg">
                      Save ${product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">{product.longDescription}</p>

              {product.stock <= 5 && product.stock > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl mb-6"
                >
                  <AlertTriangle size={18} />
                  <span className="text-sm font-medium">Hurry! Only {product.stock} left in stock</span>
                </motion.div>
              )}

              {product.stock === 0 && (
                <div className="flex items-center gap-2 p-3 bg-secondary text-muted-foreground rounded-xl mb-6 border border-border">
                  <AlertTriangle size={18} />
                  <span className="text-sm font-medium text-destructive">Currently Out of Stock</span>
                </div>
              )}

              {/* Color Selection (Circle Swatches) */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Color: {selectedColor.name}</h3>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => (
                    <motion.button
                      key={color.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColorIndex(index)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColorIndex === index
                        ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'border-border'
                        }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>

              {product.sizes && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Size</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Ruler size={14} />
                          Size Guide
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="font-display text-xl">Size Guide</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="py-3 px-4 text-left font-semibold">Size</th>
                                <th className="py-3 px-4 text-left font-semibold">Chest</th>
                                <th className="py-3 px-4 text-left font-semibold">Waist</th>
                                <th className="py-3 px-4 text-left font-semibold">Hips</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sizeGuideData.clothing.map((row) => (
                                <tr key={row.size} className="border-b border-border/50 hover:bg-secondary/50">
                                  <td className="py-3 px-4 font-medium">{row.size}</td>
                                  <td className="py-3 px-4 text-muted-foreground">{row.chest}</td>
                                  <td className="py-3 px-4 text-muted-foreground">{row.waist}</td>
                                  <td className="py-3 px-4 text-muted-foreground">{row.hips}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <motion.button
                        key={size}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedSize === size
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="hidden lg:block mb-8">
                <h3 className="font-medium mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center bg-secondary rounded-xl ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-background/50 rounded-l-xl transition-colors"
                    >
                      <Minus size={18} />
                    </motion.button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 hover:bg-background/50 rounded-r-xl transition-colors"
                    >
                      <Plus size={18} />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex gap-4 mb-8">
                <Button
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                  className={`flex-1 h-16 rounded-2xl font-semibold shadow-lg transition-all text-lg ${isAddedToCart
                    ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                    : product.stock === 0 ? 'bg-secondary text-muted-foreground' : 'bg-primary text-primary-foreground shadow-primary/25'
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {product.stock === 0 ? (
                      <motion.span key="outofstock">Out of Stock</motion.span>
                    ) : isAddedToCart ? (
                      <motion.div
                        key="buy"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <Check size={20} />
                        Buy Now
                      </motion.div>
                    ) : (
                      <motion.div
                        key="add"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingBag size={20} />
                        Add to Cart
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isHeartAnimating ? { scale: [1, 1.3, 1] } : {}}
                  onClick={handleWishlistToggle}
                  className={`p-4 rounded-2xl border-2 transition-all ${inWishlist ? 'bg-destructive/10 border-destructive text-destructive' : 'border-border hover:border-primary'
                    }`}
                >
                  <Heart size={20} className={inWishlist ? 'fill-current' : ''} />
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-4 p-6 bg-secondary/50 rounded-2xl">
                <div className="text-center">
                  <Truck size={24} className="mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders $100+</p>
                </div>
                <div className="text-center">
                  <Shield size={24} className="mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">2 Year Warranty</p>
                  <p className="text-xs text-muted-foreground">Full coverage</p>
                </div>
                <div className="text-center">
                  <RotateCcw size={24} className="mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30 day return</p>
                </div>
              </div>
            </motion.div>
          </div>

          <ProductTabs
            description={product.longDescription || product.description}
            details={{
              material: 'Premium quality fabric blend - 60% Cotton, 35% Polyester, 5% Elastane',
              care: 'Machine wash cold with like colors. Tumble dry low. Do not bleach.',
              features: product.features || [
                'Premium quality construction',
                'Comfortable fit for all-day wear',
                'Breathable and lightweight fabric',
                'Durable and long-lasting',
              ],
              specifications: {
                'SKU': `NXS-${product.id.toString().padStart(3, '0')}`,
                'Category': product.category,
                'Stock': product.stock > 0 ? `${product.stock} units available` : 'Out of Stock',
                'Warranty': '2 years',
              },
            }}
            reviews={product.reviews || []}
            avgRating={product.rating.toString()}
            totalReviews={product.reviewsCount || 0}
          />

          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <div className="flex items-center justify-between mb-8">
                <motion.h2 variants={fadeUp} className="font-display text-2xl lg:text-3xl font-bold">
                  You Might Also Like
                </motion.h2>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRelatedScrollIndex(Math.max(0, relatedScrollIndex - 1))}
                    disabled={relatedScrollIndex === 0}
                    className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRelatedScrollIndex(Math.min(relatedProducts.length - 4, relatedScrollIndex + 1))}
                    disabled={relatedScrollIndex >= relatedProducts.length - 4}
                    className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
              </div>
              <div className="overflow-hidden">
                <motion.div
                  className="flex gap-6"
                  animate={{ x: -relatedScrollIndex * (100 / 4 + 1.5) + '%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {relatedProducts.map((item, index) => (
                    <div key={item.id} className="w-[calc(25%-18px)] flex-shrink-0">
                      <ProductCard product={item} index={index} />
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border lg:hidden z-40">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <motion.p
              key={currentPrice}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="font-display text-lg font-bold"
            >
              ${currentPrice}
            </motion.p>
            {product.originalPrice && (
              <p className="text-xs text-muted-foreground line-through">${product.originalPrice}</p>
            )}
          </div>

          <div className="flex items-center bg-secondary rounded-xl">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-background/50 rounded-l-xl transition-colors"
            >
              <Minus size={16} />
            </motion.button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-background/50 rounded-r-xl transition-colors"
            >
              <Plus size={16} />
            </motion.button>
          </div>

          <Button
            disabled={product.stock === 0}
            onClick={handleAddToCart}
            className={`flex-1 h-12 rounded-xl font-semibold transition-all ${isAddedToCart
              ? 'bg-gradient-to-r from-primary to-accent'
              : product.stock === 0 ? 'bg-secondary text-muted-foreground' : 'bg-primary text-primary-foreground'
              }`}
          >
            {product.stock === 0 ? "Out of Stock" : isAddedToCart ? (
              <div className="flex items-center gap-2">
                <Check size={18} />
                Buy Now
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                Add to Cart
              </div>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;