import { Star } from 'lucide-react';
import { useState } from 'react';

export default function StarRating({ 
  rating = 0, 
  maxRating = 5, 
  size = 'medium', 
  interactive = false, 
  onRatingChange = () => {} 
}) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };
  
  const starSize = sizeClasses[size] || sizeClasses.medium;
  
  const handleStarClick = (selectedRating) => {
    if (interactive) {
      onRatingChange(selectedRating);
    }
  };
  
  return (
    <div className="flex">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = interactive 
          ? starValue <= (hoverRating || rating)
          : starValue <= rating;
        
        return (
          <button
            key={index}
            type={interactive ? "button" : undefined}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} p-0.5`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            disabled={!interactive}
          >
            <Star 
              className={`${starSize} ${isFilled 
                ? 'text-amber-500 fill-amber-500' 
                : 'text-gray-300'}`}
            />
          </button>
        );
      })}
    </div>
  );
}