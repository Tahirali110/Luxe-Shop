import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Sun,
  Moon,
  Menu,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/context/ThemeContext';
import { useUIStore } from '@/admin/stores/useUIStore';
import { useAuthStore } from '@/admin/stores/useAuthStore';
import { notificationService, Notification as NotifType } from '@/admin/services/notificationService';
import { formatRelativeTime } from '@/admin/utils/formatters';
import { AdminSmartSearch } from '@/admin/components/shared/AdminSmartSearch';

const Header = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useUIStore();
  const { admin, logout } = useAuthStore();
  const [notifications, setNotifications] = useState<NotifType[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  // Fetch real notifications from backend
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: NotifType) => {
    // Mark as read in backend
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    const id = notification.dataId;

    switch (notification.type) {
      case 'order':
        if (id) navigate(`/admin/orders/${id}`);
        break;
      case 'stock':
        if (id) navigate(`/admin/products/${id}/edit`);
        break;
      case 'contact':
        navigate('/admin/inquiries');
        break;
      case 'review':
        navigate(`/admin/reviews`);
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Global Search with Suggestions */}
        <AdminSmartSearch />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* View Store */}
        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
          <Link to="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Store
          </Link>
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </motion.div>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  variant="destructive"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-4 pb-2">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    key={notification._id}
                    className="flex flex-col items-start p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No new notifications</p>
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/notifications" className="justify-center text-primary w-full cursor-pointer py-2 font-medium">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <span className="hidden md:inline font-medium">{admin?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={logout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
