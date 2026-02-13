import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Package,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/admin/components/layout/PageHeader';
import StatusBadge from '@/admin/components/shared/StatusBadge';
import EmptyState from '@/admin/components/shared/EmptyState';
import LoadingSpinner from '@/admin/components/shared/LoadingSpinner';
import ConfirmDialog from '@/admin/components/shared/ConfirmDialog';
import { productService } from '@/admin/services/productService';
import { useAuthStore } from '@/admin/stores/useAuthStore';
import { Product } from '@/admin/types';
import { formatCurrency, getStockStatus } from '@/admin/utils/formatters';
import { toast } from 'sonner';

const Products = () => {
  const navigate = useNavigate();
  const { admin } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getAll();
      // Ensure local stock calculation if variants exist
      const syncedData = data.map(p => {
        if (p.variantStock && p.variantStock.length > 0) {
          const totalStock = p.variantStock.reduce((acc, curr) => acc + (curr.stock || 0), 0);
          return { ...p, stock: totalStock };
        }
        return p;
      });
      setProducts(syncedData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockFilter]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Stock filter - check individual variants
    if (stockFilter !== 'all') {
      result = result.filter((p) => {
        // Determine stock status based on individual variants
        let hasLowStock = false;
        let hasOutOfStock = false;
        let allOutOfStock = false;

        if (p.variantStock && p.variantStock.length > 0) {
          hasLowStock = p.variantStock.some(v => v.stock > 0 && v.stock <= 5);
          hasOutOfStock = p.variantStock.some(v => v.stock === 0);
          allOutOfStock = p.variantStock.every(v => v.stock === 0);
        } else {
          // Fallback to product-level stock
          hasLowStock = p.stock > 0 && p.stock <= 5;
          allOutOfStock = p.stock === 0;
        }

        if (stockFilter === 'in-stock') {
          // In stock = has stock and no low/out variants (or total > 10)
          return p.stock > 10 && !hasLowStock && !hasOutOfStock;
        }
        if (stockFilter === 'low-stock') {
          // Low stock = any individual variant is low (1-5)
          return hasLowStock || (hasOutOfStock && !allOutOfStock);
        }
        if (stockFilter === 'out-of-stock') {
          // Out of stock = all variants are 0
          return allOutOfStock;
        }
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock':
          return a.stock - b.stock;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [products, searchQuery, categoryFilter, stockFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map((p) => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await productService.delete(productToDelete);
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    setIsDeleting(true);
    try {
      await productService.bulkDelete(selectedProducts);
      setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p._id)));
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} products deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete products');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`${products.length} total products`}
        breadcrumbs={[{ label: 'Products' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              disabled={isLoading}
              className="h-9 gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/admin/products/new')}
              className="h-9 gap-2"
              disabled={admin?.role === 'demo_admin'}
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Clothing">Clothing</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="stock">Stock Level</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted"
          >
            <span className="text-sm font-medium">
              {selectedProducts.length} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeleting || admin?.role === 'demo_admin'}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProducts([])}
            >
              Clear Selection
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first product'
          }
          action={
            !searchQuery && categoryFilter === 'all' && stockFilter === 'all'
              ? { label: 'Add Product', onClick: () => navigate('/admin/products/new') }
              : undefined
          }
        />
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        paginatedProducts.length > 0 &&
                        paginatedProducts.every((p) =>
                          selectedProducts.includes(p._id)
                        )
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product) => {
                  let stockStatus = getStockStatus(product.stock);

                  // Override status if specific variants are low/out of stock
                  if (product.variantStock && product.variantStock.length > 0) {
                    const hasLowStockVariant = product.variantStock.some(v => v.stock > 0 && v.stock <= 5);
                    const hasOutOfStockVariant = product.variantStock.some(v => v.stock === 0);
                    const allOutOfStock = product.variantStock.every(v => v.stock === 0);

                    if (allOutOfStock) {
                      stockStatus = { label: 'Out of Stock', variant: 'destructive' };
                    } else if (hasLowStockVariant || hasOutOfStockVariant) {
                      // If any variant is low or out (but not all out), show Low Stock warning
                      stockStatus = { label: 'Low Stock', variant: 'warning' };
                    }
                  }

                  return (
                    <TableRow key={product._id} className="group">
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product._id)}
                          onCheckedChange={(checked) =>
                            handleSelectProduct(product._id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.colors[0]?.image || '/placeholder.svg'}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          </div>
                          {product.badge && (
                            <Badge variant="secondary" className="ml-2">
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">
                            {formatCurrency(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help w-fit group/stock">
                              <StatusBadge status={stockStatus.label} type="stock" />
                              <span className="text-sm text-muted-foreground">
                                ({product.stock})
                              </span>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 shadow-xl border-border bg-card/95 backdrop-blur-md">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b pb-2">
                                <h4 className="text-sm font-semibold">Stock Breakdown</h4>
                                <Badge variant="outline" className="text-[10px]">{product.variantStock?.length || 0} Variants</Badge>
                              </div>
                              {product.variantStock && product.variantStock.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                  {product.variantStock.map((v, i) => (
                                    <div key={i} className="text-xs flex justify-between items-center bg-muted/30 p-2 rounded-md transition-colors hover:bg-muted/50">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{v.color}</span>
                                        <span className="text-[10px] text-muted-foreground">{v.size}</span>
                                      </div>
                                      <Badge variant={v.stock === 0 ? "destructive" : v.stock < 5 ? "warning" : "secondary"} className="h-5">
                                        {v.stock}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                  <p className="text-xs text-muted-foreground">No variant data available</p>
                                </div>
                              )}
                              <div className="pt-2 border-t flex justify-between items-center text-[11px]">
                                <span className="font-medium">Total Inventory</span>
                                <span className="font-bold">{product.stock} Units</span>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-primary">★</span>
                          <span>{product.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({product.reviewsCount})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/product/${product._id}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/products/${product._id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              disabled={admin?.role === 'demo_admin'}
                              onClick={() => {
                                if (admin?.role !== 'demo_admin') {
                                  setProductToDelete(product._id);
                                  setDeleteDialogOpen(true);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
                {filteredProducts.length} products
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Products;
