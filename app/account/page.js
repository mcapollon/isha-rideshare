'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { format, set } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    User,
    CreditCard,
    Car,
    Shield,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Bell,
    Key,
    Wallet,
    Clock,
    Users,
    Edit,
    Trash2,
    X,
    MessageCircle,
    AlertTriangle
} from 'lucide-react';
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

const DeleteModal = ({ isOpen, onClose, listing, getUserListings, setUserListings }) => {
    if (!isOpen) return null;

    const handleDeleteConfirm = async () => {
        // Here you would typically make an API call to delete the listing
        console.log('Deleting listing:', listing);

        const { error } = await supabase
            .from('rides')
            .delete()
            .eq('id', listing.id)

        // After successful deletion, you would refresh the listings
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
                        Are you sure you want to delete your trip from {listing.from} to {listing.to}?
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

const EditModal = ({ isOpen, onClose, listing, getUserListings, setUserListings }) => {
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
        console.log('Updated listing:', formData);


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
        } else {
            console.log('Listing updated:', data);
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

function Page() {
    const { data: session } = useSession()

    useEffect(() => {
        if (!session) {
            redirect("/api/auth/signin")
        }

        console.log(session.user.created_at, 'session')
    }, [session])

    const [activeTab, setActiveTab] = useState('profile');
    const [userListings, setUserListings] = useState([]);
    const [userBookings, setUserBookings] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [loading, setLoading] = useState(false)
    const [profileLoading, setProfileLoading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState('');

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        phone: '+1 (403) 555-0123',
        email: 'john.doe@example.com',
        location: 'Calgary, AB',
        dateOfBirth: 'April 15, 1999'
    });

    useEffect(() => {
        checkProfile()
    }, [])

    useEffect(() => {
        if (activeTab === 'listings') {
            setLoading(true)
            getUserListings().then((listings) => { console.log(listings); setUserListings(listings); setLoading(false) })
        }

        if (activeTab === 'rides') {
            getUserBookings().then((bookings) => { console.log(bookings); setUserBookings(bookings); setLoading(false) }) // Fetch bookings
        }

        if (activeTab === 'profile') {
            fetchUserProfile();
        }
    }, [activeTab])

    const checkProfile = async () => {
        setProfileLoading(true)
        const { data, error } = await supabase.schema('next_auth')
          .from('users')
          .select('phone_number, location, dateOfBirth')
          .eq('id', session.user?.id)
          .single()
    
        if (data?.phone_number && data?.location && data?.dateOfBirth) {
          // If profile is complete, redirect to home
          setProfileLoading(false)
        } else {
            redirect('/auth/new-user')
        }
      }

    async function getUserListings() {
        let { data: rides, error } = await supabase
            .from('rides')
            .select('*')
            .eq('createdByUser', session.user?.id)

        return rides
    }

    async function getUserBookings() {
        let { data: bookings, error } = await supabase
            .from('bookings')
            .select('*, rides(*)')
            .eq('userId', session.user?.id)

            console.log(bookings, 'bookings')
            console.log(error, 'bookings fetch error')

        return bookings
    }

    async function fetchUserProfile() {
        setProfileLoading(true)
        const { data, error } = await supabase.schema('next_auth')
            .from('users')
            .select('*')
            .eq('id', session.user?.id)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
        } else {
            setProfileData({
                phone: data.phone_number || '',
                email: data.email || '',
                location: data.location || '',
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null
            });
            setProfileLoading(false)
        }
    }

    const handleEditClick = (listing, e) => {
        console.log(listing)
        setSelectedListing(listing);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (listing) => {
        setSelectedListing(listing);
        setIsDeleteModalOpen(true);
    };

    const handleProfileEdit = () => {
        setIsEditingProfile(true);
    };

    const uploadProfilePicture = async (file) => {
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `public/${fileName}`

            console.log(filePath, 'file path')
    
            // Upload the file to Supabase storage
            const { data, error } = await supabase.storage
                .from('profile-pictures')
                .upload(filePath, file, {
                    cacheControl: '3600',
                })
    
                if (error) {
                    console.error('Error uploading image:', error)
                    setUploadStatus('error'); // Set status to error
                    return
                }
    
            console.log(data.path, 'image data')
            // Get the public URL
            const { data: publicURL } = supabase
                .storage
                .from('profile-pictures')
                .getPublicUrl(data.path)
    
            // Update profile data with new image URL
            setProfileData({ ...profileData, image: publicURL.publicUrl })
            setUploadStatus('success');
            console.log(publicURL, '    profile image')

            setTimeout(() => {
                setUploadStatus('');
            }, 3000);
    
        } catch (error) {
            console.error('Error in upload:', error)
            setUploadStatus('error');
        }
    }

    const handleProfileSave = async () => {
        // Here you would typically make an API call to update the profile
        console.log('Saving profile:', profileData);

        const { data, error } = await supabase.schema('next_auth')
            .from('users')
            .update({
                phone_number: profileData.phone,
                email: profileData.email,
                location: profileData.location,
                dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.toISOString() : null,
                image: profileData.image
            })
            .eq('id', session.user?.id)
            .select()

        if (error) {
            console.error('Error updating profile:', error);
        } else {
            console.log('Profile updated:', data);
        }

        setIsEditingProfile(false);
    };

    const tabs = [
        { id: 'profile', label: 'Profile & Personal Information', icon: User },
        { id: 'payments', label: 'Payments & Payouts', icon: CreditCard },
        { id: 'rides', label: 'Rides & Bookings', icon: Car },
        { id: 'listings', label: 'My Listings', icon: Users },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        {profileLoading ? (
                            <div className="animate-pulse">
                                <div className="flex items-center space-x-4 mb-8">
                                    <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                                    <div>
                                        <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
                                        <div className="h-4 bg-gray-300 rounded w-48"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                            <div className="w-full">
                                                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                            <div className="w-full">
                                                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                            <div className="w-full">
                                                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                            <div className="w-full">
                                                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center space-x-4 mb-8">
                                    {isEditingProfile ? (
                                            <>  
                                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer relative">
                                                    {uploadStatus === 'uploading' ? (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        </div>
                                                    ) : uploadStatus === 'success' ? (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-50 rounded-full">
                                                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                            </svg>
                                                        </div>
                                                    ) : uploadStatus === 'error' ? (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 rounded-full">
                                                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                                    <div className="relative">
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => { uploadProfilePicture(e.target.files[0]) }}
                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                                                                        />
                                                                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
                                                                            <span className="text-gray-500">Change</span>
                                                                        </div>
                                                                    </div>
                                                    )}
                                                </div>
                                            </>
                                    ) : (
                                        <img
                                            src={profileData.image || session.user?.image}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-bold">{session.user?.name}</h2>
                                        <p className="text-gray-600">Member since {session.user?.created_at ? format(new Date(session.user.created_at), 'PPP') : ''}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Phone</div>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="text"
                                                        value={profileData.phone}
                                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <div className="font-medium">{profileData.phone}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Email</div>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="email"
                                                        value={profileData.email}
                                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <div className="font-medium">{profileData.email}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Location</div>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="text"
                                                        value={profileData.location}
                                                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <div className="font-medium">{profileData.location}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Date of Birth</div>
                                                {isEditingProfile ? (
                                                    <DatePicker
                                                        selected={profileData.dateOfBirth}
                                                        onChange={(date) => setProfileData({ ...profileData, dateOfBirth: date })}
                                                        dateFormat="MMMM d, yyyy"
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <div className="font-medium">
                                                        {profileData.dateOfBirth ? format(new Date(profileData.dateOfBirth), 'MMMM d, yyyy') : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isEditingProfile ? (
                                    <button
                                        onClick={handleProfileSave}
                                        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleProfileEdit}
                                        className="mt-6 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                );

            case 'payments':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                            <div className="flex items-center space-x-4 p-4 border rounded-lg">
                                <CreditCard className="w-8 h-8 text-blue-600" />
                                <div>
                                    <div className="font-medium">Visa ending in 4242</div>
                                    <div className="text-sm text-gray-500">Expires 12/25</div>
                                </div>
                                <button className="ml-auto text-blue-600 hover:text-blue-700">Edit</button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Payout Information</h3>
                            <div className="flex items-center space-x-4 p-4 border rounded-lg">
                                <Wallet className="w-8 h-8 text-green-600" />
                                <div>
                                    <div className="font-medium">Direct Deposit</div>
                                    <div className="text-sm text-gray-500">Account ending in 1234</div>
                                </div>
                                <button className="ml-auto text-blue-600 hover:text-blue-700">Edit</button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <Car className="w-6 h-6 text-gray-400" />
                                            <div>
                                                <div className="font-medium">Calgary to Banff</div>
                                                <div className="text-sm text-gray-500">March {10 + i}, 2024</div>
                                            </div>
                                        </div>
                                        <div className="font-medium text-green-600">$28.00</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'rides':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Upcoming Rides</h3>
                            <div className="space-y-4">
                                {userBookings.length === 0 ? (
                                    <div className="text-center text-gray-500">No upcoming rides found.</div>
                                ) : (
                                    userBookings.filter(booking => new Date(booking.rides.departure) > new Date()).map((booking, i) => (
                                        <div key={i} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-medium">{booking.rides.startingCity} to {booking.rides.ishaYogaCenter}</div>
                                                <div className="text-blue-600">${booking.rides.pricePerSeat}</div>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {format(new Date(booking.rides.departure), 'MMMM d, yyyy')}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {format(new Date(booking.rides.departure), 'p')}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Past Rides</h3>
                            <div className="space-y-4">
                                {userBookings.length === 0 ? (
                                    <div className="text-center text-gray-500">No past rides found.</div>
                                ) : (
                                    userBookings.filter(booking => new Date(booking.rides.departure) <= new Date()).map((booking, i) => (
                                        <div key={i} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-medium">{booking.rides.startingCity} to {booking.rides.ishaYogaCenter}</div>
                                                <div className="text-gray-600">${booking.rides.pricePerSeat}</div>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {format(new Date(booking.rides.departure), 'MMMM d, yyyy')}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {format(new Date(booking.rides.departure), 'p')}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'listings':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">My Posted Rides</h2>
                            <button onClick={() => redirect('/create')} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500">
                                Post New Ride
                            </button>
                        </div>

                        {loading ? (
                            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                                <h3 className="text-lg font-semibold mb-4">Active Listings</h3>
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="border rounded-lg p-4 bg-gray-200">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                                                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                                                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <div className="h-5 w-5 bg-gray-300 rounded"></div>
                                                    <div className="h-5 w-5 bg-gray-300 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between border-t pt-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                                                </div>
                                                <div className="h-4 bg-gray-300 rounded w-16"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) :
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Active Listings</h3>
                                <div className="space-y-4">
                                {userListings.length === 0 ? (
                                    <div className="text-center text-gray-500">No active listings found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {userListings.filter(listing => new Date(listing.departure) > new Date()).map((listing, i) => (
                                            <div key={i} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-medium text-lg">{listing.startingCity} to {listing.ishaYogaCenter}</h4>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                            <div className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                {format(new Date(listing.departure), 'MMMM d, yyyy')}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                {format(new Date(listing.departure), 'p')}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Users className="w-4 h-4 mr-1" />
                                                                {listing.seats} seats available
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => handleEditClick(listing)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(listing)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border-t pt-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-sm">
                                                            <span className="font-medium text-green-600">${listing.pricePerSeat}</span>
                                                            <span className="text-gray-500"> per seat</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                </div>
                            </div>
                        }

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Past Listings</h3>
                            <div className="space-y-4">
                            {userListings.length === 0 ? (
                                    <div className="text-center text-gray-500">No past listings found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {userListings.filter(listing => new Date(listing.departure) <= new Date()).map((listing, i) => (
                                            <div key={i} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">{listing.startingCity} to {listing.ishaYogaCenter}</h4>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                            <div className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                {format(new Date(listing.departure), 'MMMM d, yyyy')}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Users className="w-4 h-4 mr-1" />
                                                                3 seats filled
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-medium text-gray-600">${listing.pricePerSeat * 3}</span>
                                                        <span className="text-gray-500"> earned</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Password</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Key className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="font-medium">Change Password</div>
                                        <div className="text-sm text-gray-500">Last changed 3 months ago</div>
                                    </div>
                                </div>
                                <button className="text-blue-600 hover:text-blue-700">Update</button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Shield className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="font-medium">Enable 2FA</div>
                                        <div className="text-sm text-gray-500">Add an extra layer of security</div>
                                    </div>
                                </div>
                                <button className="text-blue-600 hover:text-blue-700">Setup</button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Login History</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium">Calgary, AB</div>
                                            <div className="text-sm text-gray-500">March {15 - i}, 2024 at 9:30 AM</div>
                                        </div>
                                        <div className="text-sm text-green-600">Successful login</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!session || !session?.user) {
        redirect("/api/auth/signin")
    } else {
        return (
            <div className="min-h-screen bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="md:w-64 flex-shrink-0">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${activeTab === tab.id
                                                    ? 'bg-amber-50 text-amber-600'
                                                    : 'text-slate-700 hover:bg-amber-50'
                                                    }`}
                                                onClick={() => setActiveTab(tab.id)}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span>{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </main>

                {selectedListing && (
                    <>
                        <EditModal
                            isOpen={isEditModalOpen}
                            onClose={() => {
                                setIsEditModalOpen(false);
                                setSelectedListing(null);
                            }}
                            listing={selectedListing}
                            getUserListings={getUserListings}
                            setUserListings={setUserListings}
                        />
                        <DeleteModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => {
                                setIsDeleteModalOpen(false);
                                setSelectedListing(null);
                            }}
                            listing={selectedListing}
                            getUserListings={getUserListings}
                            setUserListings={setUserListings} />
                    </>

                )}
            </div>
        )
    }
}

export default Page