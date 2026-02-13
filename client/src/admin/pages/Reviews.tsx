import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, X, Search, Filter, MoreHorizontal, MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/admin/components/layout/PageHeader';
import { productService } from '@/admin/services/productService';
import { useAuthStore } from '@/admin/stores/useAuthStore';
import { Product, Review } from '@/types/product';
import { toast } from 'sonner';

interface ExtendedReview extends Review {
    productName: string;
    productId: string;
    productImage: string;
}

const Reviews = () => {
    const { admin } = useAuthStore();
    const [reviews, setReviews] = useState<ExtendedReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');

    const [replyDialog, setReplyDialog] = useState<{ isOpen: boolean; reviewId: string; productId: string; reply: string }>({
        isOpen: false,
        reviewId: '',
        productId: '',
        reply: '',
    });
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const products = await productService.getAll();

            // Flatten reviews from all products
            const allReviews: ExtendedReview[] = [];
            products.forEach(product => {
                if (product.reviews) {
                    product.reviews.forEach(review => {
                        allReviews.push({
                            ...review,
                            productName: product.name,
                            productId: product._id,
                            productImage: product.colors?.[0]?.image || '',
                        });
                    });
                }
            });

            // Sort by date (newest first)
            allReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setReviews(allReviews);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.productName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = true;

        const matchesRating = ratingFilter === 'all' || Math.floor(review.rating).toString() === ratingFilter;

        return matchesSearch && matchesStatus && matchesRating;
    });

    const handleDeleteReview = async (reviewId: string, productId: string) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            await productService.deleteReview(productId, reviewId);
            toast.success('Review deleted');
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (error) {
            console.error('Failed to delete review:', error);
            toast.error('Failed to delete review');
        }
    };

    const handleReplySubmit = async () => {
        if (!replyDialog.reply.trim()) return;

        setIsSubmittingReply(true);
        try {
            await productService.replyToReview(replyDialog.productId, replyDialog.reviewId, replyDialog.reply);
            toast.success('Reply submitted successfully');
            setReplyDialog(prev => ({ ...prev, isOpen: false }));
            fetchReviews(); // Refresh to show reply
        } catch (error) {
            console.error('Failed to reply to review:', error);
            toast.error('Failed to submit reply');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Reviews"
                description="Manage customer reviews and ratings"
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchReviews}
                        disabled={isLoading}
                        className="h-9 gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                }
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search reviews, products, or customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="1">1 Star</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="w-[40%]">Review</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="animate-pulse h-4 bg-secondary rounded w-full"></div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredReviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                                        <p>No reviews found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReviews.map((review) => (
                                <TableRow key={review._id + review.productId} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-secondary">
                                                <img
                                                    src={review.productImage}
                                                    alt={review.productName}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <span className="font-medium text-sm line-clamp-1 max-w-[150px]" title={review.productName}>
                                                {review.productName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{review.userName}</span>
                                            {review.verified && (
                                                <Badge variant="secondary" className="w-fit text-[10px] h-5 px-1.5 gap-0.5">
                                                    <Check className="h-2 w-2" /> Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3 w-3 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
                                                />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm line-clamp-2 text-muted-foreground" title={review.comment}>
                                                {review.comment}
                                            </p>
                                            {review.adminReply && (
                                                <div className="bg-muted p-2 rounded-lg text-xs">
                                                    <span className="font-semibold text-primary block mb-1">Reply:</span>
                                                    {review.adminReply}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(review.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    disabled={admin?.role === 'demo_admin'}
                                                    onClick={() => {
                                                        if (admin?.role !== 'demo_admin') {
                                                            setReplyDialog({
                                                                isOpen: true,
                                                                reviewId: review._id,
                                                                productId: review.productId,
                                                                reply: review.adminReply || ''
                                                            });
                                                        }
                                                    }}
                                                >
                                                    {review.adminReply ? 'Edit Reply' : 'Reply'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    disabled={admin?.role === 'demo_admin'}
                                                    onClick={() => {
                                                        if (admin?.role !== 'demo_admin') {
                                                            handleDeleteReview(review._id, review.productId);
                                                        }
                                                    }}
                                                >
                                                    Delete Review
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={replyDialog.isOpen} onOpenChange={(val) => setReplyDialog(prev => ({ ...prev, isOpen: val }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reply to Review</DialogTitle>
                        <DialogDescription>
                            Write a response to the customer's review. This will be visible on the product page.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Write your reply here..."
                            value={replyDialog.reply}
                            onChange={(e) => setReplyDialog(prev => ({ ...prev, reply: e.target.value }))}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReplyDialog(prev => ({ ...prev, isOpen: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleReplySubmit} disabled={isSubmittingReply}>
                            {isSubmittingReply ? 'Sending...' : 'Send Reply'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Reviews;
