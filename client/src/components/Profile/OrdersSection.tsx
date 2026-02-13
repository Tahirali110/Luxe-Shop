import { useState, useEffect, useMemo, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  Box,
  Eye,
  RefreshCw,
  Printer,
  Download,
  MessageCircle,
  ChevronDown,
  Filter,
  CalendarDays,
  Star,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import { generateInvoicePDF, InvoiceData } from '@/utils/invoiceGenerator';
import { fadeUp, staggerContainer } from '@/utils/animations';
import { Pagination } from '@/components/ui/pagination';
import { useOrderStore, Order } from '@/store/useOrderStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from 'axios';
import { Product } from '@/types/product';
import ReviewModal from '../ReviewModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type OrderStatus = 'All' | 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

const orderStatusSteps = ['Placed', 'Processing', 'Shipped', 'Delivered'];

// Mock orders with hardcoded values to remove dependency on mockData.ts
const mockOrdersData = [
  {
    id: 'ORD-001',
    date: '2026-01-25',
    placedAt: '2026-01-25 10:30 AM',
    paymentConfirmedAt: '2026-01-25 10:35 AM',
    status: 'delivered' as const,
    shippingFee: 10,
    items: [
      {
        id: 'mock-1', name: 'Premium Wireless Headphones', price: 299.99, quantity: 1,
        selectedColor: 'Black', selectedSize: 'M',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
      },
      {
        id: 'mock-2', name: 'Smart Fitness Watch', price: 199.99, quantity: 1,
        selectedColor: 'Navy', selectedSize: 'L',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
      },
    ],
    shippingAddress: {
      label: 'Home',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Fashion Street',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
    shippingMethodName: 'Standard Shipping',
    estimatedDelivery: '2026-01-28',
    paymentMethod: 'Credit Card (**** 4242)',
    trackingNumber: '1Z999AA10123456784',
  },
  {
    id: 'ORD-002',
    date: '2025-12-20',
    placedAt: '2025-12-20 03:15 PM',
    paymentConfirmedAt: '2025-12-20 03:20 PM',
    status: 'shipped' as const,
    shippingFee: 15,
    items: [
      {
        id: 'mock-3', name: 'Ergonomic Office Chair', price: 249.99, quantity: 2,
        selectedColor: 'White', selectedSize: 'S',
        image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500'
      },
    ],
    shippingAddress: {
      label: 'Office',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Fashion Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      apartment: '',
      country: 'United States',
    },
    shippingMethodName: 'Express Shipping',
    estimatedDelivery: '2025-12-23',
    paymentMethod: 'PayPal',
    trackingNumber: '1Z999AA10123456785',
  },
  {
    id: 'ORD-003',
    date: '2025-05-15',
    placedAt: '2025-05-15 09:00 AM',
    paymentConfirmedAt: '2025-05-15 09:05 AM',
    status: 'processing' as const,
    shippingFee: 0,
    items: [
      {
        id: 'mock-4', name: 'Premium Sunglasses', price: 159.99, quantity: 1,
        selectedColor: 'Gray', selectedSize: 'XL',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'
      },
    ],
    shippingAddress: {
      label: 'Home',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '456 Business Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      apartment: '',
      country: 'United States',
    },
    shippingMethodName: 'Free Shipping',
    estimatedDelivery: '2025-05-20',
    paymentMethod: 'Apple Pay',
    trackingNumber: null,
  },
];

const mockOrders: Order[] = mockOrdersData.map(order => {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% Tax
  const total = subtotal + tax + order.shippingFee;

  const { shippingFee, items, shippingAddress, status, ...rest } = order;

  return {
    ...rest,
    _id: order.id,
    user: 'mock-user-id',
    paymentStatus: 'paid',
    orderStatus: (status.charAt(0).toUpperCase() + status.slice(1)) as any,
    createdAt: order.date,
    items: items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      image: item.image
    })),
    shippingAddress: {
      firstName: shippingAddress.firstName,
      lastName: shippingAddress.lastName,
      email: shippingAddress.email,
      phone: shippingAddress.phone,
      addressLine1: shippingAddress.address,
      addressLine2: shippingAddress.apartment,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country
    },
    totals: {
      subtotal,
      tax,
      shipping: shippingFee,
      total
    }
  };
});

type DateFilter = 'all' | 'last30' | 'last6months' | 'last12months' | 'thisYear';

import { useAuthStore } from '@/store/useAuthStore';

// ... (existing imports)

// ...

export const OrdersSection = () => {
  const { user } = useAuthStore();
  const { addItem, openCart } = useCartStore();
  const { orders, fetchOrders, isLoading } = useOrderStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle auto-opening review modal from search params
  useEffect(() => {
    const action = searchParams.get('action');
    const orderId = searchParams.get('orderId');
    const productId = searchParams.get('productId');
    const productName = searchParams.get('productName');

    if (action === 'review' && orderId && productId && productName) {
      setReviewingItem({
        productId,
        productName: decodeURIComponent(productName),
        orderId
      });

      // Clear the search params after opening to avoid re-opening on manual refresh/navigation
      const newParams = new URLSearchParams(searchParams);
      ['action', 'orderId', 'productId', 'productName'].forEach(p => newParams.delete(p));
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [productsCache, setProductsCache] = useState<Product[]>([]);
  const [reviewingItem, setReviewingItem] = useState<{
    productId: string;
    productName: string;
    orderId: string;
    initialData?: { rating: number; comment: string; images: string[] };
    isEdit?: boolean;
  } | null>(null);

  // Fetch products for reorder logic
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(`${API_URL}/api/products`);
        setProductsCache(response.data);
      } catch (err) {
        console.error('Failed to fetch products for reorder logic', err);
      }
    };
    fetchProducts();
    fetchOrders(); // Fetch real orders from backend
  }, [fetchOrders]);

  // Filter logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by status
    if (statusFilter !== 'All') {
      result = result.filter(order => order.orderStatus === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(order =>
        order._id.toLowerCase().includes(q) ||
        formatOrderId(order._id).toLowerCase().includes(q) ||
        order.items.some(item => item.name.toLowerCase().includes(q))
      );
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt || '');
        const diffTime = now.getTime() - orderDate.getTime();
        const diffMonths = (now.getFullYear() - orderDate.getFullYear()) * 12 + (now.getMonth() - orderDate.getMonth());

        if (dateFilter === 'last30') return (diffTime / (1000 * 60 * 60 * 24)) <= 30;
        if (dateFilter === 'last6months') return diffMonths >= 0 && diffMonths <= 6;
        if (dateFilter === 'last12months') return diffMonths >= 0 && diffMonths <= 12;
        if (dateFilter === 'thisYear') return orderDate.getFullYear() === now.getFullYear();
        return true;
      });
    }

    return result;
  }, [orders, statusFilter, searchQuery, dateFilter]);
  // Handle pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, searchQuery]);

  const getStatusIndex = (status: string) => {
    return orderStatusSteps.indexOf(status);
  };

  const handleReorder = (orderId: string) => {
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) return;

      order.items.forEach(item => {
        const baseProduct = productsCache.find(p => p._id === item.productId || p.name === item.name);

        if (baseProduct) {
          const colorVariant = baseProduct.colors?.find(c => c.name === item.selectedColor);
          for (let i = 0; i < item.quantity; i++) {
            addItem(baseProduct, item.selectedColor, colorVariant?.hex || '#000000', item.selectedSize);
          }
        }
      });

      toast.success('Items added to cart!', {
        description: `Order ${orderId} has been successfully reordered.`,
      });

      openCart();
    } catch (error) {
      console.error('Reorder failed:', error);
      toast.error('Reorder failed. Please try again.');
    }
  };

  const handleEditReview = (item: any, orderId: string) => {
    const product = productsCache.find((p) => p._id === item.productId);
    const review = product?.reviews?.find((r) => r.user === user?._id);

    if (review) {
      setReviewingItem({
        productId: item.productId,
        productName: item.name,
        orderId: orderId,
        initialData: {
          rating: review.rating,
          comment: review.comment,
          images: review.images || []
        },
        isEdit: true
      });
    } else {
      // Fallback or error if review not found locally
      console.error("Review not found for user", user?._id);
      toast.error("Could not load your review for editing. Please try refreshing.");
    }
  };

  const handlePrint = (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name} (${item.selectedColor} / ${item.selectedSize})</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>LUXE Invoice - ${orderId}</title>
          <style>
             body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 50px; }
            .logo { font-size: 32px; font-weight: bold; color: #000; }
            .invoice-label { font-size: 24px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { text-align: left; padding: 12px; background: #f8f8f8; }
            .totals { float: right; width: 300px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
            .footer { margin-top: 100px; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">LUXE</div>
            <div class="invoice-label">INVOICE</div>
          </div>
            <div style="display: flex; justify-content: space-between;">
            <div>
              <strong>Order #:</strong> ${orderId}<br>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}
            </div>
            <div style="text-align: right;">
              <strong>Bill To:</strong><br>
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.addressLine1}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <div class="totals-row"><span>Subtotal</span><span>$${order.totals.subtotal.toFixed(2)}</span></div>
            <div class="totals-row"><span>Shipping</span><span>$${order.totals.shipping.toFixed(2)}</span></div>
            <div class="totals-row"><span>Tax</span><span>$${order.totals.tax.toFixed(2)}</span></div>
            <div class="totals-row grand-total"><span>Grand Total</span><span>$${order.totals.total.toFixed(2)}</span></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadInvoice = (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    toast.success('Generating invoice...', {
      description: `Invoice for ${orderId} is being prepared.`,
    });

    const invoiceData: InvoiceData = {
      orderId: order._id,
      date: new Date(order.createdAt).toLocaleDateString(),
      items: order.items.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })),
      subtotal: order.totals.subtotal,
      shipping: order.totals.shipping,
      tax: order.totals.tax,
      total: order.totals.total,
      shippingAddress: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        address: order.shippingAddress.addressLine1,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode,
        email: order.shippingAddress.email,
        phone: order.shippingAddress.phone,
      },
      paymentMethod: order.paymentMethod,
    };

    setTimeout(() => {
      generateInvoicePDF(invoiceData);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin text-primary mr-2" />
        <p className="text-muted-foreground font-medium">Loading orders...</p>
      </div>
    );
  }


  const formatOrderId = (id: string) => {
    return `#${id.slice(-8).toUpperCase()}`;
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {(['All', 'Processing', 'Shipped', 'Delivered'] as OrderStatus[]).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status === 'All' ? (
                <>
                  <Filter size={14} className="mr-1" />
                  All Orders
                </>
              ) : (
                status
              )}
            </Button>
          ))}
        </div>

        <div className="flex flex-1 items-center gap-2 ml-auto min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background/50 border-border/50 focus-visible:ring-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-muted-foreground hidden sm:block" />
            <Select value={dateFilter} onValueChange={(val) => setDateFilter(val as DateFilter)}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="last6months">Last 6 Months</SelectItem>
                <SelectItem value="last12months">Last 12 Months</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-12">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground">No orders match the selected filter.</p>
        </motion.div>
      ) : (
        <div className="min-h-[600px]">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {paginatedOrders.map((order) => (
              <motion.div
                key={order._id}
                variants={fadeUp}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{formatOrderId(order._id)}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">${order.totals.total.toFixed(2)}</span>
                      <p className={`text-sm font-medium capitalize ${order.orderStatus === 'Delivered' ? 'text-green-500' :
                        order.orderStatus === 'Shipped' ? 'text-blue-500' :
                          order.orderStatus === 'Cancelled' ? 'text-red-500' :
                            'text-orange-500'
                        }`}>
                        {order.orderStatus}
                      </p>
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <div className="flex justify-between items-center">
                      {orderStatusSteps.map((step, index) => {
                        const isActive = index <= getStatusIndex(order.orderStatus);
                        const isCurrent = step === order.orderStatus;

                        return (
                          <div key={step} className="flex flex-col items-center relative z-10">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-muted-foreground'
                                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                            >
                              {step === 'Placed' && <Box size={14} />}
                              {step === 'Processing' && <Clock size={14} />}
                              {step === 'Shipped' && <Truck size={14} />}
                              {step === 'Delivered' && <CheckCircle size={14} />}
                            </motion.div>
                            <div className="flex flex-col items-center mt-2">
                              <span className={`text-[10px] sm:text-xs capitalize font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-secondary -z-0">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(getStatusIndex(order.orderStatus) / (orderStatusSteps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        {item.quantity > 1 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      className="gap-1"
                    >
                      <Eye size={14} />
                      View Details
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`}
                      />
                    </Button>
                    <Link to={`/track-order?order=${order._id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Truck size={14} />
                        Track Order
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order._id)}
                      className="gap-1"
                    >
                      <RefreshCw size={14} />
                      Reorder
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedOrder === order._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 sm:p-6 bg-secondary/30 space-y-6">
                        <div>
                          <h4 className="font-semibold mb-3">Items</h4>
                          <div className="space-y-3">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="space-y-2">
                                <Link to={`/product/${item.productId}`} className="block">
                                  <motion.div
                                    whileHover={{ x: 4 }}
                                    className="flex gap-4 p-3 bg-card rounded-xl hover:bg-card/80 transition-colors"
                                  >
                                    <img
                                      src={item.image || ''}
                                      alt={item.name || 'Product'}
                                      className="w-16 h-16 rounded-lg object-cover bg-secondary"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium hover:text-primary transition-colors truncate">{item.name}</h5>
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                                        {item.selectedColor && <span>{item.selectedColor}</span>}
                                        {item.selectedColor && item.selectedSize && <span className="w-1 h-1 rounded-full bg-border" />}
                                        {item.selectedSize && <span>Size {item.selectedSize}</span>}
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span>Qty: {item.quantity || 1}</span>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="font-semibold">${(item.price || 0).toFixed(2)}</p>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unit Price</p>
                                    </div>
                                  </motion.div>
                                </Link>
                                {order.orderStatus === 'Delivered' && (
                                  <div className="flex justify-end px-3">
                                    {!item.isReviewed ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-primary hover:text-primary/80 hover:bg-primary/5 h-8 gap-1.5 font-medium"
                                        onClick={() => setReviewingItem({
                                          productId: item.productId,
                                          productName: item.name,
                                          orderId: order._id
                                        })}
                                      >
                                        <Star size={14} className="fill-primary" />
                                        Add Review
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 gap-1.5 font-medium"
                                        onClick={() => handleEditReview(item, order._id)}
                                      >
                                        <MessageCircle size={14} />
                                        Edit Review
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Shipping Address</h4>
                            <div className="p-3 bg-card rounded-xl text-sm mb-4">
                              <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                              <p className="text-muted-foreground">
                                {order.shippingAddress.addressLine1}<br />
                                {order.shippingAddress.addressLine2 ? `${order.shippingAddress.addressLine2}, ` : ''}{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Link to={`/track-order?order=${order._id}`}>
                                <Button variant="outline" size="sm" className="gap-1 bg-background">
                                  <Truck size={14} />
                                  Track Order
                                </Button>
                              </Link>
                              <Link to="/contact">
                                <Button variant="outline" size="sm" className="gap-1 bg-background">
                                  <MessageCircle size={14} />
                                  Contact Support
                                </Button>
                              </Link>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3">Order Summary</h4>
                            <div className="p-3 bg-card rounded-xl space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${order.totals.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>${order.totals.shipping.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>${order.totals.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                                <span>Total</span>
                                <span>${order.totals.total.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadInvoice(order._id)}
                                className="gap-1 bg-background flex-1"
                              >
                                <Download size={14} />
                                Invoice
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrint(order._id)}
                                className="gap-1 bg-background flex-1"
                              >
                                <Printer size={14} />
                                Print
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
            }
          </motion.div >
        </div>
      )}

      {
        filteredOrders.length > ordersPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )
      }
      {reviewingItem && (
        <ReviewModal
          isOpen={!!reviewingItem}
          onClose={() => setReviewingItem(null)}
          productId={reviewingItem.productId}
          productName={reviewingItem.productName}
          orderId={reviewingItem.orderId}
          initialData={reviewingItem.initialData}
          isEdit={reviewingItem.isEdit}
          onSuccess={() => fetchOrders()}
        />
      )}
    </motion.div >
  );
};
