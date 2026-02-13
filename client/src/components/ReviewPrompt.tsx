import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

const ReviewPrompt = () => {
    const navigate = useNavigate();
    const { orders, fetchOrders } = useOrderStore();
    const { user } = useAuthStore();
    const hasPrompted = useRef(false);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, fetchOrders]);

    useEffect(() => {
        if (!user || orders.length === 0 || hasPrompted.current) return;

        // Find delivered orders that have at least one unreviewed item
        const pendingReviewOrder = orders.find(order =>
            order.orderStatus === 'Delivered' &&
            order.items.some(item => !item.isReviewed)
        );

        if (pendingReviewOrder) {
            hasPrompted.current = true;
            const unreviewedCount = pendingReviewOrder.items.filter(item => !item.isReviewed).length;
            const firstUnreviewed = pendingReviewOrder.items.find(item => !item.isReviewed);

            if (firstUnreviewed) {
                toast('Share your feedback!', {
                    description: `You have ${unreviewedCount} items from your recent order waiting for a review.`,
                    icon: <Star className="text-primary fill-primary" size={18} />,
                    action: {
                        label: 'Review Now',
                        onClick: () => navigate(`/profile?tab=orders&action=review&orderId=${pendingReviewOrder._id}&productId=${firstUnreviewed.productId}&productName=${encodeURIComponent(firstUnreviewed.name)}`),
                    },
                    duration: 10000,
                });
            }
        }
    }, [user, orders, navigate]);

    return null;
};

export default ReviewPrompt;
