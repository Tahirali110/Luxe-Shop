import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type OrderStatus = 'all' | 'processing' | 'shipped' | 'delivered';

const orderStatusSteps = ['placed', 'processing', 'shipped', 'delivered'];

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

  const { shippingFee, ...rest } = order;

  return {
    ...rest,
    totals: {
      subtotal,
      tax,
      shipping: shippingFee,
      total
    }
  };
});

type DateFilter = 'all' | 'last30' | 'last6months' | 'last12months' | 'thisYear';

export const OrdersSection = () => {
  const { addItem, openCart } = useCartStore();
  const { orders, fetchOrders, isLoading } = useOrderStore();
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [productsCache, setProductsCache] = useState<Product[]>([]);

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

  // Filter by status
  let filteredOrders = orders.filter(order =>
    statusFilter === 'all' || order.status === statusFilter
  );

  // Filter by date (fixed implementation)
  if (dateFilter !== 'all') {
    const now = new Date();
    filteredOrders = filteredOrders.filter(order => {
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
  // Handle pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter]);

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

  function handleContactSupport(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error('Function not implemented.');
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status === 'all' ? (
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

        <div className="flex items-center gap-2 ml-auto">
          <CalendarDays size={16} className="text-muted-foreground" />
          <Select value={dateFilter} onValueChange={(val) => setDateFilter(val as DateFilter)}>
            <SelectTrigger className="w-[140px] h-9">
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
                      <h3 className="font-semibold">{order._id}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">${order.totals.total.toFixed(2)}</span>
                      <p className={`text-sm font-medium capitalize ${order.status === 'delivered' ? 'text-green-500' :
                        order.status === 'shipped' ? 'text-blue-500' :
                          'text-orange-500'
                        }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <div className="flex justify-between items-center">
                      {orderStatusSteps.map((step, index) => {
                        const isActive = index <= getStatusIndex(order.status);
                        const isCurrent = step === order.status;

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
                              {step === 'placed' && <Box size={14} />}
                              {step === 'processing' && <Clock size={14} />}
                              {step === 'shipped' && <Truck size={14} />}
                              {step === 'delivered' && <CheckCircle size={14} />}
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
                        animate={{ width: `${(getStatusIndex(order.status) / (orderStatusSteps.length - 1)) * 100}%` }}
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
                              <Link key={idx} to={`/product/${item.productId}`} className="block">
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
                              <Button variant="outline" size="sm" onClick={handleContactSupport} className="gap-1 bg-background">
                                <MessageCircle size={14} />
                                Contact Support
                              </Button>
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
    </motion.div >
  );
};
