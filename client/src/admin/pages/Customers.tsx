import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Ban,
  Users as UsersIcon,
  ShoppingBag,
  DollarSign,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import PageHeader from '@/admin/components/layout/PageHeader';
import EmptyState from '@/admin/components/shared/EmptyState';
import LoadingSpinner from '@/admin/components/shared/LoadingSpinner';
import { userService } from '@/admin/services/userService';
import { orderService } from '@/admin/services/orderService';
import { useAuthStore } from '@/admin/stores/useAuthStore';
import { User } from '@/admin/types';
import { formatCurrency, formatDate } from '@/admin/utils/formatters';

// Removed mockUsers fallback for real working implementation

const Customers = () => {
  const navigate = useNavigate();
  const { admin } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<string>('name');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [usersData, ordersData] = await Promise.all([
        userService.getAll(),
        orderService.getAll()
      ]);

      const enrichedUsers = usersData.map(u => {
        const userOrders = ordersData.filter(o => {
          // Handle populated user object (from .populate()) or direct ID
          let orderUserId: string | null = null;

          if (o.user) {
            if (typeof o.user === 'object' && o.user !== null) {
              // Populated user object: { _id: "...", name: "...", email: "..." }
              orderUserId = (o.user as any)._id?.toString() || null;
            } else {
              // Direct ID string
              orderUserId = o.user.toString();
            }
          }

          // Match by user ID (primary check) OR by shipping email (fallback for guest checkout)
          const isUserIdMatch = orderUserId && orderUserId === u._id.toString();
          // Only use email as fallback when there's no user ID on the order
          const isEmailFallback = !orderUserId && o.shippingAddress?.email === u.email;

          return (isUserIdMatch || isEmailFallback) && o.orderStatus !== 'Cancelled';
        });
        return {
          ...u,
          totalOrders: userOrders.length,
          totalSpent: userOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0)
        };
      });

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => !u.isAdmin); // Only show customers, not admins

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'orders':
          return (b.totalOrders || 0) - (a.totalOrders || 0);
        case 'spent':
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [users, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description={`${filteredUsers.length} registered customers`}
        breadcrumbs={[{ label: 'Customers' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
            className="h-9 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'name' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            Name
          </Button>
          <Button
            variant={sortBy === 'orders' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('orders')}
          >
            Orders
          </Button>
          <Button
            variant={sortBy === 'spent' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('spent')}
          >
            Spent
          </Button>
          <Button
            variant={sortBy === 'date' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('date')}
          >
            Joined
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No customers found"
          description={
            searchQuery
              ? 'Try adjusting your search'
              : 'Customers will appear here after they register'
          }
        />
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Customer</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user._id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <span>{user.totalOrders || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatCurrency(user.totalSpent || 0)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/customers/${user._id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${user.email}`}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={admin?.role === 'demo_admin'}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Disable Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{' '}
                {filteredUsers.length} customers
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
    </div>
  );
};

export default Customers;
