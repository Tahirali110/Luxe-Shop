import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Users,
    CreditCard,
    Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/admin/components/layout/PageHeader';
import { orderService } from '@/admin/services/orderService';
import { productService } from '@/admin/services/productService';
import { userService } from '@/admin/services/userService';
import { Product, Order, User } from '@/admin/types';
import StatsCard from '@/admin/components/shared/StatsCard';

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [salesData, setSalesData] = useState<{ name: string; total: number }[]>([]);
    const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [ordersData, productsData, usersData] = await Promise.all([
                    orderService.getAll(),
                    productService.getAll(),
                    userService.getAll()
                ]);

                setOrders(ordersData);
                setProducts(productsData);
                setUsers(usersData);

                // 1. Calculate Sales Data (Last 7 Days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d;
                });

                const sales = last7Days.map(date => {
                    const dateStr = date.toLocaleDateString();
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                    const total = ordersData
                        .filter(o => new Date(o.createdAt).toLocaleDateString() === dateStr && o.paymentStatus !== 'Failed')
                        .reduce((sum, o) => sum + o.totals.total, 0);

                    return { name: dayName, total };
                });
                setSalesData(sales);

                // 2. Calculate Category Distribution
                const categories: Record<string, number> = {};
                productsData.forEach(p => {
                    categories[p.category] = (categories[p.category] || 0) + 1;
                });

                const totalProducts = productsData.length || 1;
                const catData = Object.entries(categories).map(([name, count]) => ({
                    name,
                    value: Math.round((count / totalProducts) * 100)
                })).sort((a, b) => b.value - a.value).slice(0, 5);

                setCategoryData(catData);

            } catch (error) {
                console.error('Failed to fetch analytics data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const totalRevenue = orders
        .filter(o => o.paymentStatus !== 'Failed' && o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + o.totals.total, 0);

    const recentTransactions = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageHeader
                    title="Analytics"
                    description="Detailed insights and performance metrics"
                />
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Select Date
                    </Button>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 3 months</SelectItem>
                            <SelectItem value="1y">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue)}
                    icon={DollarSign}
                    change={12.5}
                    changeLabel="vs last month"
                    loading={isLoading}
                />
                <StatsCard
                    title="Orders"
                    value={orders.length.toString()}
                    icon={ShoppingBag}
                    change={8.2}
                    changeLabel="vs last month"
                    loading={isLoading}
                />
                <StatsCard
                    title="Active Users"
                    value={users.length.toString()}
                    icon={Users}
                    change={15.3}
                    changeLabel="vs last month"
                    loading={isLoading}
                />
                <StatsCard
                    title="Inventory"
                    value={products.length.toString()}
                    icon={TrendingUp}
                    change={3.1}
                    changeLabel="vs last month"
                    loading={isLoading}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Daily revenue for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    formatter={(value) => [`$${value}`, 'Revenue']}
                                    contentStyle={{ borderRadius: '8px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#8884d8"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Sales by Category</CardTitle>
                        <CardDescription>Distribution of sales across product categories</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-4">
                            {categoryData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-sm font-medium">{entry.name} ({entry.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest financial activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((order) => (
                                    <div key={order._id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <ShoppingBag className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Order #{order._id.slice(-6).toUpperCase()}</p>
                                                <p className="text-xs text-muted-foreground">{order.orderStatus}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">+{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.totals.total)}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top Traffic Sources</CardTitle>
                        <CardDescription>Where your specific customers come from</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: 'Direct', value: 45, color: 'bg-blue-500' },
                                { name: 'Social Media', value: 32, color: 'bg-purple-500' },
                                { name: 'Organic Search', value: 18, color: 'bg-green-500' },
                                { name: 'Referral', value: 5, color: 'bg-orange-500' },
                            ].map((item) => (
                                <div key={item.name} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-muted-foreground">{item.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color}`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
