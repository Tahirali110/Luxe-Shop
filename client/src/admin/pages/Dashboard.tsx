import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/admin/components/layout/PageHeader';
import StatsCard from '@/admin/components/shared/StatsCard';
import StatusBadge from '@/admin/components/shared/StatusBadge';
import LoadingSpinner from '@/admin/components/shared/LoadingSpinner';
import { formatCurrency, formatRelativeTime, formatOrderId } from '@/admin/utils/formatters';
import { productService } from '@/admin/services/productService';
import { orderService } from '@/admin/services/orderService';
import { userService } from '@/admin/services/userService';
import { Product, Order, User } from '@/admin/types';



const Dashboard = () => {
  // State for chart data
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topProductsData, setTopProductsData] = useState<{ name: string; sales: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
          productService.getAll(),
          orderService.getAll(),
          userService.getAll(),
        ]);

        let fetchedProducts: Product[] = [];
        let fetchedOrders: Order[] = [];
        let fetchedUsers: User[] = [];

        if (productsRes.status === 'fulfilled') fetchedProducts = productsRes.value;
        if (ordersRes.status === 'fulfilled') fetchedOrders = ordersRes.value;
        if (usersRes.status === 'fulfilled') fetchedUsers = usersRes.value;

        setProducts(fetchedProducts);
        setOrders(fetchedOrders);
        setUsers(fetchedUsers);

        // --- Calculate Chart Data ---

        // 1. Revenue Trend (Last 7 Days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d;
        });

        const revenueChart = last7Days.map(date => {
          const dateStr = date.toLocaleDateString();
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...

          const dailyRevenue = fetchedOrders
            .filter(o => {
              const orderDate = new Date(o.createdAt).toLocaleDateString();
              return orderDate === dateStr && o.paymentStatus !== 'Failed'; // Include Pending/Completed usually
            })
            .reduce((sum, o) => sum + o.totals.total, 0);

          return { date: dayName, revenue: dailyRevenue };
        });
        setRevenueData(revenueChart);

        // 2. Order Status Distribution
        const statusCounts = fetchedOrders.reduce((acc, order) => {
          acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const statusChart = [
          { name: 'Placed', value: statusCounts['Placed'] || 0, color: 'hsl(220, 70%, 55%)' },
          { name: 'Processing', value: statusCounts['Processing'] || 0, color: 'hsl(45, 90%, 55%)' },
          { name: 'Shipped', value: statusCounts['Shipped'] || 0, color: 'hsl(270, 70%, 55%)' },
          { name: 'Delivered', value: statusCounts['Delivered'] || 0, color: 'hsl(140, 70%, 45%)' },
          { name: 'Cancelled', value: statusCounts['Cancelled'] || 0, color: 'hsl(0, 70%, 55%)' },
        ].filter(item => item.value > 0);
        setOrderStatusData(statusChart);

        // 3. Top Selling Products
        const productSales = fetchedOrders.reduce((acc, order) => {
          if (order.orderStatus === 'Cancelled') return acc;
          order.items.forEach(item => {
            if (acc[item.name]) {
              acc[item.name] += item.quantity;
            } else {
              acc[item.name] = item.quantity;
            }
          });
          return acc;
        }, {} as Record<string, number>);

        const topProductsChart = Object.entries(productSales)
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);
        setTopProductsData(topProductsChart);

        // --- Enrich Users with real stats from orders ---
        const enrichedUsers = fetchedUsers.map(u => {
          const userOrders = fetchedOrders.filter(o => {
            let orderUserId: string | null = null;

            if (o.user) {
              if (typeof o.user === 'object' && o.user !== null) {
                orderUserId = (o.user as any)._id?.toString() || null;
              } else {
                orderUserId = o.user.toString();
              }
            }

            const isUserIdMatch = orderUserId && orderUserId === u._id.toString();
            const isEmailFallback = !orderUserId && o.customerEmail === u.email;

            return (isUserIdMatch || isEmailFallback) && o.orderStatus !== 'Cancelled';
          });
          return {
            ...u,
            totalOrders: userOrders.length,
            totalSpent: userOrders.reduce((sum, o) => sum + o.totals.total, 0)
          };
        });
        setUsers(enrichedUsers);

        // --- Ensure Product stock is synced with variantStock ---
        const syncProducts = fetchedProducts.map(p => {
          if (p.variantStock && p.variantStock.length > 0) {
            const totalStock = p.variantStock.reduce((acc, curr) => acc + (curr.stock || 0), 0);
            return { ...p, stock: totalStock };
          }
          return p;
        });
        setProducts(syncProducts);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate metrics
  // Include all orders except Cancelled for Revenue (or adjust based on paymentStatus)
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled' && o.paymentStatus !== 'Failed')
    .reduce((sum, o) => sum + o.totals.total, 0);

  // Low stock: Check if ANY individual variant has low stock (≤5)
  const lowStockProducts = products.filter(p => {
    if (p.variantStock && p.variantStock.length > 0) {
      // Check each variant individually - if ANY variant is low, product is low stock
      return p.variantStock.some(v => v.stock > 0 && v.stock <= 5);
    }
    // Fallback to product-level stock
    return p.stock > 0 && p.stock <= 5;
  });

  // Sort orders by date (newest first)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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
        title="Dashboard"
        description="Welcome back! Here's what's happening with your store."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={12.5}
          changeLabel="vs last month"
          icon={DollarSign}
        />
        <StatsCard
          title="Total Orders"
          value={orders.length}
          change={8.2}
          changeLabel="vs last month"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Total Products"
          value={products.length}
          change={3.1}
          changeLabel="new this month"
          icon={Package}
        />
        <StatsCard
          title="Total Customers"
          value={users.length}
          change={15.3}
          changeLabel="vs last month"
          icon={Users}
        />
        <StatsCard
          title="Low Stock Alert"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{formatOrderId(order._id)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName || 'Customer'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.totals.total)}</p>
                      <StatusBadge status={order.orderStatus} type="order" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.slice(0, 6).map((product) => {
                // Find the specific low stock variants
                const lowVariants = product.variantStock
                  ?.filter(v => v.stock > 0 && v.stock <= 5)
                  .slice(0, 2) || [];

                return (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5"
                  >
                    <img
                      src={product.colors[0]?.image || '/placeholder.svg'}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-destructive">
                        {lowVariants.length > 0
                          ? lowVariants.map(v => `${v.color}-${v.size}: ${v.stock}`).join(', ')
                          : `Only ${product.stock} left`
                        }
                        {lowVariants.length === 2 && product.variantStock?.filter(v => v.stock > 0 && v.stock <= 5).length! > 2 && '...'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/products/${product._id}/edit`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
