import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    Check,
    Trash2,
    ShoppingBag,
    Package,
    Star,
    AlertCircle,
    Clock,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notificationService, Notification } from '@/admin/services/notificationService';
import { useAuthStore } from '@/admin/stores/useAuthStore';
import { formatRelativeTime } from '@/admin/utils/formatters';

const Notifications = () => {
    const navigate = useNavigate();
    const { admin } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'stock' | 'review'>('all');

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const data = await notificationService.getAll();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await notificationService.delete(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.isRead) {
            handleMarkAsRead(notif._id);
        }

        const id = notif.dataId;
        switch (notif.type) {
            case 'order':
                if (id) navigate(`/admin/orders/${id}`);
                break;
            case 'stock':
                if (id) navigate(`/admin/products/${id}/edit`);
                break;
            case 'review':
                navigate(`/admin/reviews`);
                break;
            default:
                break;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.isRead;
        return n.type === filter;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingBag className="h-5 w-5 text-blue-500" />;
            case 'stock': return <Package className="h-5 w-5 text-orange-500" />;
            case 'review': return <Star className="h-5 w-5 text-yellow-500" />;
            default: return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground mt-1">Manage all your store notifications and alerts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={!notifications.some(n => !n.isRead) || admin?.role === 'demo_admin'}
                    >
                        <Check className="h-4 w-4 mr-2" />
                        Mark all as read
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setFilter(v as any)}>
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="all" className="rounded-md">All</TabsTrigger>
                    <TabsTrigger value="unread" className="rounded-md relative">
                        Unread
                        {notifications.some(n => !n.isRead) && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="order" className="rounded-md">Orders</TabsTrigger>
                    <TabsTrigger value="stock" className="rounded-md">Inventory</TabsTrigger>
                    <TabsTrigger value="review" className="rounded-md">Reviews</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="space-y-3">
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-xl" />
                    ))
                ) : filteredNotifications.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.map((notif) => (
                            <motion.div
                                key={notif._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group relative overflow-hidden transition-all duration-300 ${!notif.isRead ? 'ring-1 ring-primary/20 bg-primary/5 shadow-sm' : 'bg-card'
                                    } rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-md`}
                            >
                                <div className="p-4 flex gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-primary/10' : 'bg-muted'
                                        }`}>
                                        {getIcon(notif.type)}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-12">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                                                {notif.type}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatRelativeTime(notif.createdAt)}
                                            </span>
                                        </div>

                                        <h3
                                            className={`text-sm md:text-base leading-relaxed cursor-pointer hover:text-primary transition-colors ${!notif.isRead ? 'font-semibold' : 'text-muted-foreground'
                                                }`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            {notif.message}
                                        </h3>
                                    </div>

                                    <div className="absolute top-4 right-4 flex items-center gap-1">
                                        {!notif.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-primary hover:bg-primary/10"
                                                onClick={() => {
                                                    if (admin?.role !== 'demo_admin') {
                                                        handleMarkAsRead(notif._id);
                                                    }
                                                }}
                                                disabled={admin?.role === 'demo_admin'}
                                                title="Mark as read"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                if (admin?.role !== 'demo_admin') {
                                                    handleDelete(notif._id);
                                                }
                                            }}
                                            disabled={admin?.role === 'demo_admin'}
                                            title="Delete notification"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium">No notifications found</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                            {filter === 'unread'
                                ? "You've caught up with everything! No unread notifications."
                                : "Your notification inbox is empty."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
