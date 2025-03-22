import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import StarRating from './StarRating';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/Toast';

export default function CreateReview({ driverId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const { toast, Toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      return;
    }
    
    if (!rating) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }
    
    if (driverId === session.user.id) {
      toast({
        title: "Cannot review yourself",
        description: "You cannot leave a review for your own account",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const { data, error } = await supabase
      .from('driver_reviews')
      .upsert({
        driver_id: driverId,
        reviewer_id: session.user.id,
        rating,
        comment: comment.trim() || null
      }, {
        onConflict: 'driver_id,reviewer_id'
      });
      
    setIsSubmitting(false);
    
    if (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {Toast}
      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <StarRating 
            rating={rating} 
            interactive={true} 
            onRatingChange={setRating} 
            size="large"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            placeholder="Share your experience with this driver..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !session?.user?.id}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        
        {!session?.user?.id && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            Please sign in to leave a review
          </p>
        )}
      </form>
    </div>
  );
}