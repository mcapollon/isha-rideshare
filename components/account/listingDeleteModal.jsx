import {
    AlertTriangle
} from 'lucide-react';

export const DeleteModal = ({ isOpen, onClose, listing, getUserListings, setUserListings, supabase }) => {
    if (!isOpen) return null;

    const handleDeleteConfirm = async () => {
        // 1. Mark ride as cancelled
        const { error } = await supabase
            .from('rides')
            .update({'cancelled': true})
            .eq('id', listing.id);
    
        if (error) {
            console.error('Error cancelling ride:', error);
            return;
        }
        
        // 2. Process refunds
        try {
            const response = await fetch('/api/supabase/functions/process-refunds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rideId: listing.id }),
            });
            
            const result = await response.json();
            if (!result.success) {
                console.error('Refund processing error:', result.error);
            }
        } catch (err) {
            console.error('Failed to call refund API:', err);
        }
        
        // 3. Update UI regardless of refund status
        const updatedListings = await getUserListings();
        setUserListings(updatedListings);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-lg w-full mx-4 relative">
                <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-center mb-2">Delete Listing</h2>
                    <p className="text-gray-600 text-center mb-4">
                        Are you sure you want to delete your trip from {listing.startingPointAddress} to {listing.ishaYogaCenter}?
                    </p>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800">
                            All users who have booked this trip will be automatically reimbursed the full amount of their payment.
                        </p>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                handleDeleteConfirm();
                                onClose();
                            }}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                        >
                            Delete Listing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};