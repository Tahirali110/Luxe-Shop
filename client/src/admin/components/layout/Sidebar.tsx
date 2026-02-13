import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Crown,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUIStore } from '@/admin/stores/useUIStore';
import { useAuthStore } from '@/admin/stores/useAuthStore';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { logout, admin } = useAuthStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-screen bg-card border-r border-border flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Crown className="h-8 w-8 text-primary" />
              <span className="text-xl font-display font-bold">Luxe Admin</span>
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarCollapsed && (
          <Crown className="h-8 w-8 text-primary mx-auto" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          const linkContent = (
            <Link
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );

          if (sidebarCollapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.path}>{linkContent}</div>;
        })}
      </nav>

      {/* User & Collapse */}
      <div className="border-t border-border p-3 space-y-2">
        {/* User info */}
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && admin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2 rounded-lg bg-muted/50"
            >
              <p className="text-sm font-medium truncate">{admin.name}</p>
              <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start text-muted-foreground hover:text-destructive',
                sidebarCollapsed && 'justify-center px-0'
              )}
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">Logout</span>}
            </Button>
          </TooltipTrigger>
          {sidebarCollapsed && (
            <TooltipContent side="right">Logout</TooltipContent>
          )}
        </Tooltip>

        {/* Collapse toggle */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
