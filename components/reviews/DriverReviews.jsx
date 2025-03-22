import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { Flag } from 'lucide-react';
import ReportReviewModal from './ReportReviewModal';

export default function DriverReviews({ driverId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reportedReviews, setReportedReviews] = useState({});
  const supabase = createClient();

  useEffect(() => {
    async function fetchReviews() {
      if (!driverId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Simplified approach: fetch the reviews without complex joins
        const { data, error } = await supabase
          .from('driver_reviews')
          .select('*')
          .eq('driver_id', driverId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          setError(error);
          return;
        }
        
        setReviews(data || []);
        
        // Calculate average rating
        if (data && data.length > 0) {
          const total = data.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating((total / data.length).toFixed(1));
          
          // Now fetch reviewer information for each review
          const reviewsWithUsers = await Promise.all(
            data.map(async (review) => {
              try {
                const { data: userData, error: userError } = await supabase
                  .schema('next_auth')
                  .from('users')
                  .select('name, image')
                  .eq('id', review.reviewer_id)
                  .single();
                
                if (userError) {
                  return { ...review, reviewer: null };
                }
                
                return { ...review, reviewer: userData };
              } catch (err) {
                console.error('Error fetching reviewer data:', err);
                return { ...review, reviewer: null };
              }
            })
          );
          
          setReviews(reviewsWithUsers);
        }

        // Fetch which reviews have already been reported by this driver
        const { data: flaggedData, error: flaggedError } = await supabase
          .from('review_flags')
          .select('review_id')
          .eq('reporter_id', driverId);

        if (!flaggedError && flaggedData) {
          const flaggedReviews = {};
          flaggedData.forEach(flag => {
            flaggedReviews[flag.review_id] = true;
          });
          setReportedReviews(flaggedReviews);
        }
      } catch (err) {
        console.error('Error in fetchReviews:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [driverId, supabase]);

  const handleReportClick = (review) => {
    setSelectedReview(review);
    setReportModalOpen(true);
  };

  const handleReportSubmitted = () => {
    // Mark this review as reported
    setReportedReviews(prev => ({
      ...prev,
      [selectedReview.id]: true
    }));
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    // Show a less intrusive error message
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Driver Reviews</h3>
        <p className="text-gray-500 italic text-center py-4">
          Unable to load reviews at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Driver Reviews</h3>
      
      {reviews.length > 0 ? (
        <>
          <div className="flex items-center mb-6">
            <div className="mr-4">
              <span className="text-3xl font-bold text-amber-600">{averageRating}</span>
              <span className="text-gray-500 ml-1">/ 5</span>
            </div>
            <div>
              <StarRating rating={parseFloat(averageRating)} />
              <p className="text-sm text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                      {review.reviewer?.image ? (
                        <img 
                          src={review.reviewer.image} 
                          alt={review.reviewer.name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-800 font-medium">
                          {(review.reviewer?.name || 'U').charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{review.reviewer?.name || 'Anonymous'}</p>
                      <div className="flex items-center">
                        <StarRating rating={review.rating} size="small" />
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Only show flag/report button for the driver's own reviews in their account page */}
                  {review.driver_id === driverId && (
                    <button 
                      onClick={() => handleReportClick(review)}
                      disabled={reportedReviews[review.id]}
                      className={`text-gray-500 p-1 rounded-full hover:bg-gray-100 ${
                        reportedReviews[review.id] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={reportedReviews[review.id] ? "You've already reported this review" : "Report this review"}
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {review.comment && (
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500 italic text-center py-4">No reviews yet</p>
      )}

      {selectedReview && (
        <ReportReviewModal 
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setSelectedReview(null);
          }}
          review={selectedReview}
          onReportSubmitted={handleReportSubmitted}
        />
      )}
    </div>
  );
}