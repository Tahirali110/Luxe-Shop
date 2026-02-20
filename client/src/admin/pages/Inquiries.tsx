import { useState, useEffect, useCallback } from 'react';
import { useAdminSearch } from '@/hooks/useAdminSearch';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Search,
    Filter,
    Trash2,
    Mail,
    Clock,
    CheckCircle,
    PhoneCall,
    MoreVertical,
    ChevronRight,
    User,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { contactService, ContactMessage } from '@/admin/services/contactService';
import { useAuthStore } from '@/admin/stores/useAuthStore';
import { formatRelativeTime } from '@/admin/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Inquiries = () => {
    const { admin } = useAuthStore();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'message' | 'call_request'>('all');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await contactService.getAll();
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await contactService.markAsRead(id);
            setMessages(messages.map(m => m._id === id ? { ...m, isRead: true } : m));
            if (selectedMessage?._id === id) {
                setSelectedMessage({ ...selectedMessage, isRead: true });
            }
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            await contactService.delete(id);
            setMessages(messages.filter(m => m._id !== id));
            if (selectedMessage?._id === id) setSelectedMessage(null);
            toast.success('Inquiry deleted');
        } catch (error) {
            toast.error('Failed to delete inquiry');
        }
    };

    // Trie-based prefix search — O(m) per query, O(1) for repeated queries via Map cache
    const getInquiryTokens = useCallback(
        (m: ContactMessage) => [m.name, m.email, m.subject],
        []
    );
    const searchedMessages = useAdminSearch(messages, searchQuery, getInquiryTokens);

    const filteredMessages = searchedMessages.filter(m => {
        const matchesFilter = filter === 'all' || m.type === filter;
        return matchesFilter;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Customer Inquiries</h1>
                    <p className="text-muted-foreground">Manage messages and call requests from customers</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={fetchMessages} variant="outline" size="sm">
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                {/* Messages List */}
                <div className="lg:col-span-5 xl:col-span-4 bg-card rounded-2xl border border-border flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search inquiries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('all')}
                                className="flex-1"
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === 'message' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('message')}
                                className="flex-1"
                            >
                                Messages
                            </Button>
                            <Button
                                variant={filter === 'call_request' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('call_request')}
                                className="flex-1"
                            >
                                Calls
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredMessages.length > 0 ? (
                            <div className="divide-y divide-border">
                                {filteredMessages.map((msg) => (
                                    <button
                                        key={msg._id}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            if (!msg.isRead) handleMarkAsRead(msg._id);
                                        }}
                                        className={`w-full text-left p-4 hover:bg-muted/50 transition-colors relative ${selectedMessage?._id === msg._id ? 'bg-muted' : ''
                                            } ${!msg.isRead ? 'font-medium' : ''}`}
                                    >
                                        {!msg.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm truncate pr-2">{msg.name}</span>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatRelativeTime(msg.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {msg.type === 'call_request' ? (
                                                <PhoneCall className="h-3 w-3 text-blue-500" />
                                            ) : (
                                                <MessageSquare className="h-3 w-3 text-primary" />
                                            )}
                                            <h4 className="text-sm truncate text-foreground">{msg.subject}</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {msg.message}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                <Mail className="h-12 w-12 mb-4 opacity-20" />
                                <p>No inquiries found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-7 xl:col-span-8 bg-card rounded-2xl border border-border flex flex-col overflow-hidden">
                    {selectedMessage ? (
                        <>
                            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${selectedMessage.type === 'call_request' ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'
                                        }`}>
                                        {selectedMessage.type === 'call_request' ? <PhoneCall className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{selectedMessage.name}</h3>
                                        <p className="text-xs text-muted-foreground">{selectedMessage.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            if (admin?.role !== 'demo_admin') {
                                                handleDelete(selectedMessage._id);
                                            }
                                        }}
                                        disabled={admin?.role === 'demo_admin'}
                                        className="text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => window.open(`mailto:${selectedMessage.email}`)}>
                                                Reply via Email
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge variant={selectedMessage.type === 'call_request' ? 'secondary' : 'default'}>
                                            {selectedMessage.type === 'call_request' ? 'Call Request' : 'Customer Message'}
                                        </Badge>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(selectedMessage.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold mb-4">{selectedMessage.subject}</h2>
                                    <div className="bg-muted/50 rounded-2xl p-6 whitespace-pre-wrap text-foreground leading-relaxed">
                                        {selectedMessage.message}
                                    </div>
                                </div>

                                {selectedMessage.type === 'call_request' && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-blue-900">Action Required</h4>
                                            <p className="text-sm text-blue-700">The customer has requested a callback. Please call them at your earliest convenience if a number was provided, or reach out via email.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
                            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="h-10 w-10 opacity-20" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Select an inquiry</h3>
                            <p className="max-w-xs mx-auto">Click on a message from the list to view its contents and take action</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inquiries;
