import { X, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const BookingDetailsModal = ({ isOpen, onClose, listing }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full mx-4 relative max-h-[90vh] overflow-auto">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">
                        Booking Details: {listing.startingCity} to {listing.ishaYogaCenter}
                    </h2>
                    <div className="text-sm text-gray-500 mb-6">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(listing.departure), 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(listing.departure), 'p')}</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">Booking Summary</h3>
                            <span className="text-sm bg-amber-100 text-amber-800 py-1 px-2 rounded-full">
                                {listing.bookedSeats} of {listing.seats} seats booked
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div 
                                className="h-2 bg-amber-600 rounded-full" 
                                style={{ width: `${(listing.bookedSeats / listing.seats) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {listing.bookings && listing.bookings.length > 0 ? (
                        <div className="space-y-4 mt-6">
                            <h3 className="font-medium text-lg">Passengers</h3>
                            <div className="border rounded-lg divide-y">
                                {listing.bookings.map((booking, index) => (
                                    <div key={index} className="p-4 flex items-center">
                                        <div className="flex-shrink-0 mr-4">
                                            <img
                                                src={booking.user?.image || '/default-user-icon.png'}
                                                alt={booking.user?.name || 'Passenger'}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{booking.user?.name || 'Anonymous User'}</div>
                                            <div className="text-sm text-gray-500">{booking.user?.email || 'No email provided'}</div>
                                            <div className="text-sm text-gray-500">{booking.user?.phone_number || 'No phone provided'}</div>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                            <div className="text-amber-600 font-medium">
                                                {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}
                                            </div>
                                            <div className="text-sm text-gray-500">${booking.totalPrice}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            No bookings yet for this ride.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};