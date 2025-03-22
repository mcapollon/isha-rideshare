import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import StarRating from './StarRating';
import Link from 'next/link';

export default function DriverRatingDisplay({ driverId, showLink = true, size = 'small' }) {
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDriverRating() {
      if (!driverId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('driver_reviews')
          .select('rating')
          .eq('driver_id', driverId);

        if (error) {
          console.error('Error fetching driver rating:', error);
          setError(error);
        } else if (data && data.length > 0) {
          const total = data.reduce((sum, review) => sum + review.rating, 0);
          setRating((total / data.length).toFixed(1));
          setReviewCount(data.length);
        }
      } catch (err) {
        console.error('Unexpected error fetching rating:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDriverRating();
  }, [driverId]);

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading rating...</div>;
  }

  if (error) {
    // Return empty div for errors to avoid UI disruption
    return <div className="text-gray-400 text-sm">Rating unavailable</div>;
  }

  if (reviewCount === 0) {
    return <div className="text-gray-400 text-sm">No reviews yet</div>;
  }

  return (
    <div className="flex items-center">
      <StarRating rating={parseFloat(rating)} size={size} />
      <span className="text-gray-600 ml-1 text-sm">
        {rating} ({reviewCount})
      </span>
      {showLink && (
        <Link 
          href={`/drivers/${driverId}`} 
          className="ml-2 text-amber-600 hover:text-amber-800 text-sm"
        >
          View profile
        </Link>
      )}
    </div>
  );
}