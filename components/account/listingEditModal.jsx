import { useState } from "react";
import {
    X,
} from 'lucide-react';

export const EditModal = ({ isOpen, onClose, listing, getUserListings, setUserListings }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        id: listing.id,
        departure: new Date(listing.departure),
        seats: listing.seats,
        pricePerSeat: listing.pricePerSeat,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Here you would typically make an API call to update the listing

        const { data, error } = await supabase
            .from('rides')
            .update({
                departure: new Date(listing.departure),
                seats: formData.seats,
                pricePerSeat: formData.pricePerSeat
            })
            .eq('id', formData.id)
            .select()

        const updatedListings = await getUserListings();
        setUserListings(updatedListings);

        if (error) {
            console.error('Error updating listing:', error);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-lg w-full mx-4 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Edit Listing</h2>
                    <div className="mb-4">
                        <div className="font-medium text-gray-800">{listing.startingCity} to {listing.ishaYogaCenter}</div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date and Time
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.departure.toLocaleString('sv-SE').slice(0, 16)}
                                onChange={(e) => setFormData({ ...formData, departure: new Date(e.target.value).toLocaleString('sv-SE').slice(0, 16) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Available Seats
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="6"
                                value={formData.seats}
                                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price per Seat ($)
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={formData.pricePerSeat}
                                onChange={(e) => setFormData({ ...formData, pricePerSeat: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};