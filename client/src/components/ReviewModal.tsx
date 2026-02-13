import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Camera, ImageOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import reviewService from '@/services/reviewService';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    orderId: string;
    onSuccess?: () => void;
    initialData?: {
        rating: number;
        comment: string;
        images: string[];
    };
    isEdit?: boolean;
}

const ReviewModal = ({ isOpen, onClose, productId, productName, orderId, onSuccess, initialData, isEdit }: ReviewModalProps) => {
    const [rating, setRating] = useState(initialData?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(initialData?.comment || '');
    // For images, handling existing URLs vs new Files is tricky.
    // If we have initialData.images, those are URLs.
    // We should probably keep them as "uploadedImageUrls" state separately or handle mix.
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuthStore();

    const handleRatingClick = (value: number) => setRating(value);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length + existingImages.length > 5) {
            toast.error('You can only upload up to 5 images.');
            return;
        }

        setImages((prev) => [...prev, ...files]);
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeImage = (index: number, isExisting: boolean) => {
        if (isExisting) {
            setExistingImages((prev) => prev.filter((_, i) => i !== index));
        } else {
            setImages((prev) => prev.filter((_, i) => i !== index));
            setImagePreviews((prev) => {
                URL.revokeObjectURL(prev[index]);
                return prev.filter((_, i) => i !== index);
            });
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating.');
            return;
        }
        if (comment.trim().length < 5) {
            toast.error('Comment must be at least 5 characters long.');
            return;
        }
        if (!user) {
            toast.error('You must be logged in to submit a review.');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload images one by one
            const uploadedImageUrls: string[] = [];
            for (const file of images) {
                const url = await reviewService.uploadReviewImage(file);
                uploadedImageUrls.push(url);
            }

            // Combine existing (remaining) images with newly uploaded ones
            const finalImages = [...existingImages, ...uploadedImageUrls];

            // 2. Create or Update review
            if (isEdit) {
                await reviewService.updateReview(
                    productId,
                    {
                        rating,
                        comment,
                        images: finalImages,
                        orderId,
                    },
                    user.token
                );
                toast.success('Review updated successfully!');
            } else {
                await reviewService.createReview(
                    productId,
                    {
                        rating,
                        comment,
                        images: finalImages,
                        orderId,
                    },
                    user.token
                );
                toast.success('Thank you for your review!');
            }

            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Review submission failed:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display font-bold">Write a Review</DialogTitle>
                    <DialogDescription>
                        Share your experience with <strong>{productName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    key={star}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleRatingClick(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 focus:outline-none"
                                >
                                    <Star
                                        size={36}
                                        className={`transition-colors ${star <= (hoverRating || rating)
                                            ? 'fill-primary text-primary'
                                            : 'text-muted-foreground'
                                            }`}
                                    />
                                </motion.button>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Average'}
                            {rating === 4 && 'Good'}
                            {rating === 5 && 'Excellent'}
                            {!rating && 'Select stars'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Your Review</h4>
                        <Textarea
                            placeholder="What did you like or dislike? How was the quality?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[120px] rounded-2xl resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center justify-between">
                            Photos <span>{images.length}/5</span>
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            <AnimatePresence>
                                {/* Render existing images */}
                                {existingImages.map((src, index) => (
                                    <motion.div
                                        key={`existing-${src}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group"
                                    >
                                        <img src={src} alt="Existing" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(index, true)}
                                            className="absolute top-1 right-1 bg-background/80 p-1 rounded-full text-foreground/80 hover:bg-background hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </motion.div>
                                ))}
                                {/* Render new image previews */}
                                {imagePreviews.map((src, index) => (
                                    <motion.div
                                        key={src}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group"
                                    >
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(index, false)}
                                            className="absolute top-1 right-1 bg-background/80 p-1 rounded-full text-foreground/80 hover:bg-background hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {images.length + existingImages.length < 5 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                                >
                                    <Camera size={24} />
                                    <span className="text-[10px] mt-1">Add Photo</span>
                                </motion.button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 rounded-2xl bg-primary text-primary-foreground"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Review'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewModal;
