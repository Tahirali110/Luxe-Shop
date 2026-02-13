import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    MapPin,
    Calendar,
    ShoppingBag,
    DollarSign,
    Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/admin/components/layout/PageHeader';
import LoadingSpinner from '@/admin/components/shared/LoadingSpinner';
import { userService } from '@/admin/services/userService';
import { orderService } from '@/admin/services/orderService';
import { User, Order } from '@/admin/types';
import { formatCurrency, formatDate, formatOrderId } from '@/admin/utils/formatters';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (userId: string) => {
        setIsLoading(true);
        try {
            const [userData, allOrders] = await Promise.all([
                userService.getById(userId),
                orderService.getAll()
            ]);
            setUser(userData);

            // Filter orders for this user - handle populated user object
            const userOrders = allOrders.filter(o => {
                let orderUserId: string | null = null;

                if (o.user) {
                    if (typeof o.user === 'object' && o.user !== null) {
                        orderUserId = (o.user as any)._id?.toString() || null;
                    } else {
                        orderUserId = o.user.toString();
                    }
                }

                const isUserIdMatch = orderUserId && orderUserId === userId;
                const isEmailFallback = !orderUserId && userData.email && o.shippingAddress?.email === userData.email;

                return isUserIdMatch || isEmailFallback;
            }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOrders(userOrders);
        } catch (error) {
            console.error('Failed to fetch customer details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-muted-foreground">Customer not found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/customers')}>
                    Back to Customers
                </Button>
            </div>
        );
    }

    const totalSpent = orders
        .filter(o => o.orderStatus !== 'Cancelled' && o.paymentStatus !== 'Failed')
        .reduce((sum, o) => sum + o.totals.total, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/customers')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <PageHeader
                    title="Customer Details"
                    description={`View and manage customer information`}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                        <p className="text-muted-foreground mb-4">{user.email}</p>

                        <div className="w-full space-y-4 text-left mt-4 border-t border-border pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge variant={user.isAdmin ? "secondary" : "outline"}>
                                    {user.isAdmin ? 'Admin' : 'Customer'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Joined</span>
                                <span className="text-sm font-medium">{formatDate(user.createdAt)}</span>
                            </div>
                            <div className="pt-4">
                                <Button className="w-full gap-2" asChild>
                                    <a href={`mailto:${user.email}`}>
                                        <Mail className="h-4 w-4" />
                                        Send Email
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats & Addresses */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Orders</p>
                                    <p className="text-2xl font-bold">{orders.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Spent</p>
                                    <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Addresses */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Saved Addresses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.addresses && user.addresses.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {user.addresses.map((addr, idx) => (
                                        <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">{addr.label || 'Home'}</Badge>
                                                {addr.isDefault && <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">Default</Badge>}
                                            </div>
                                            <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {addr.addressLine1}
                                                {addr.addressLine2 && <><br />{addr.addressLine2}</>}
                                                <br />
                                                {addr.city}, {addr.state} {addr.zipCode}
                                                <br />
                                                {addr.country}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                                <MapPin className="h-3 w-3" />
                                                {addr.phone}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">No saved addresses</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order._id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <Link to={`/admin/orders/${order._id}`} className="font-medium hover:underline">
                                                Order {formatOrderId(order._id)}
                                            </Link>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(order.createdAt)} • {order.items.length} items
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <Badge variant={
                                            order.orderStatus === 'Delivered' ? 'default' :
                                                order.orderStatus === 'Cancelled' ? 'destructive' :
                                                    order.orderStatus === 'Shipped' ? 'secondary' : 'outline'
                                        }>
                                            {order.orderStatus}
                                        </Badge>
                                        <p className="font-bold w-20 text-right">{formatCurrency(order.totals.total)}</p>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to={`/admin/orders/${order._id}`}>View</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No orders placed yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomerDetail;
