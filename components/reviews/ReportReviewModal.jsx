import { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Flag } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useSession } from 'next-auth/react';

export default function ReportReviewModal({ isOpen, onClose, review, onReportSubmitted }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const { data: session } = useSession();

  const reasonOptions = [
    { value: 'inappropriate', label: 'Inappropriate or offensive content' },
    { value: 'spam', label: 'Spam or misleading information' },
    { value: 'notRelated', label: 'Not related to your service' },
    { value: 'fake', label: 'Fake or fraudulent review' },
    { value: 'other', label: 'Other concerns' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('Please select a reason for reporting this review');
      return;
    }
    
    if (!session?.user?.id) {
      setError('You must be logged in to report a review');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Insert the report into the review_flags table
      const { data, error } = await supabase
        .from('review_flags')
        .insert({
          review_id: review.id,
          reporter_id: session.user.id,
          reason: reasonOptions.find(r => r.value === selectedReason)?.label || selectedReason,
          details: details,
          status: 'pending'
        });
      
      if (error) {
        console.error('Error reporting review:', error);
        setError('There was an error submitting your report. Please try again.');
      } else {
        setSuccess(true);
        // Wait for 2 seconds before closing the modal to let user see success message
        setTimeout(() => {
          onReportSubmitted();
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="bg-amber-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Flag className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold">Report Review</h2>
          <p className="text-gray-500 text-sm mt-1">
            Let us know why you think this review is inappropriate
          </p>
        </div>
        
        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Thank You for Your Report</h3>
            <p className="text-gray-500">
              We've received your report and will review it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for reporting
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              >
                <option value="">Select a reason</option>
                {reasonOptions.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Please provide more context about why this review should be reviewed..."
              ></textarea>
            </div>
            
            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
            
            <div className="bg-gray-50 border-t border-b p-4 -mx-6 text-sm text-gray-500">
              <p className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  Reports should only be made for reviews that violate our community guidelines. Reviews that simply have low ratings but are otherwise appropriate will not be removed.
                </span>
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}