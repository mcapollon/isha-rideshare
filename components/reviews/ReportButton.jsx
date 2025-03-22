import { useState, useEffect } from 'react';
import { Flag } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import ReportReviewModal from '@/components/reviews/ReportReviewModal';
import { useSession } from 'next-auth/react';

const ReportButton = ({ review }) => {
  const [hasReported, setHasReported] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();
  const { data: session } = useSession();

  useEffect(() => {
    // Check if the user has already reported this review
    async function checkIfReported() {
      try {
        if (!session?.user?.id) return;
        
        const { data, error } = await supabase
          .from('review_flags')
          .select('id')
          .eq('review_id', review.id)
          .eq('reporter_id', session.user.id)
          .single();
        
        if (data) {
          setHasReported(true);
        }
      } catch (error) {
        // If error is not found, that's fine - user hasn't reported this review
        console.log('Error checking report status:', error);
      }
    }
    
    checkIfReported();
  }, [review.id, supabase, session]);

  const handleReportClick = () => {
    setIsModalOpen(true);
  };

  const handleReportSubmitted = () => {
    setHasReported(true);
  };

  if (hasReported) {
    return (
      <button 
        className="text-gray-400 p-1 rounded-full cursor-not-allowed"
        title="You've already reported this review"
        disabled
      >
        <Flag className="w-4 h-4 fill-gray-200" />
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={handleReportClick}
        className="text-gray-500 p-1 rounded-full hover:bg-gray-100"
        title="Report this review"
      >
        <Flag className="w-4 h-4" />
      </button>

      <ReportReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={review}
        onReportSubmitted={handleReportSubmitted}
      />
    </>
  );
};

export default ReportButton;