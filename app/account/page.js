'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { format, set } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Autocomplete from "react-google-autocomplete";
import {
    User,
    CreditCard,
    Car,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Wallet,
    Clock,
    Users,
    Edit,
    Trash2,
    Search,
    Loader2,
    AlertCircle,
    Star,
} from 'lucide-react';
import { createClient } from "@/utils/supabase/client"
import { useSearchParams } from 'next/navigation'
import { BookingDetailsModal } from '@/components/account/bookingDetailsModal';
import { DeleteModal } from '@/components/account/listingDeleteModal';
import { EditModal } from '@/components/account/listingEditModal';
import PayoutsSection from '@/components/account/payoutSection';

const supabase = createClient()

function Page() {
    const { data: session, update } = useSession()

    useEffect(() => {
        if (!session) {
            redirect("/auth/sign-in")
        }
    }, [session])

    const [activeTab, setActiveTab] = useState('profile');
    const [userListings, setUserListings] = useState([]);
    const [userBookings, setUserBookings] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBookingDetailsModalOpen, setIsBookingDetailsModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [loading, setLoading] = useState(false)
    const [profileLoading, setProfileLoading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState('');

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({
        phone: '',
        email: '',
        location: ''
    });

    // Add these states for driver reviews at the top level
    const [driverReviews, setDriverReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);

    const searchParams = useSearchParams()

    useEffect(() => {
        checkProfile()
        checkUrlTab()
    }, [])

    useEffect(() => {
        if (activeTab === 'listings') {
            setLoading(true)
            getUserListings().then((listings) => { setUserListings(listings); setLoading(false) })
        }

        if (activeTab === 'rides') {
            getUserBookings().then((bookings) => { setUserBookings(bookings); setLoading(false) }) // Fetch bookings
        }

        if (activeTab === 'payments') {
            setLoading(true);
            getUserBookings().then((bookings) => {
                setUserBookings(bookings);
                setLoading(false);
            });
        }

        if (activeTab === 'profile') {
            fetchUserProfile();
        }
        
        if (activeTab === 'reviews') {
            fetchDriverReviews();
        }
    }, [activeTab, session?.user?.id])

    // Move the fetchDriverReviews function outside of the renderTabContent
    async function fetchDriverReviews() {
        if (!session?.user?.id) return;
        
        setReviewsLoading(true);
        try {
            // Fetch reviews for the driver
            const { data, error } = await supabase
                .from('driver_reviews')
                .select('*')
                .eq('driver_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching driver reviews:', error);
                setReviewsLoading(false);
                return;
            }
            
            // Calculate average rating
            if (data && data.length > 0) {
                const total = data.reduce((sum, review) => sum + review.rating, 0);
                setAverageRating((total / data.length).toFixed(1));
                
                // Fetch reviewer details for each review
                const reviewsWithUsers = await Promise.all(
                    data.map(async (review) => {
                        try {
                            const { data: userData, error: userError } = await supabase
                                .schema('next_auth')
                                .from('users')
                                .select('name, image')
                                .eq('id', review.reviewer_id)
                                .single();
                            
                            return {
                                ...review,
                                reviewer: userError ? null : userData
                            };
                        } catch (err) {
                            console.error('Error fetching reviewer data:', err);
                            return { ...review, reviewer: null };
                        }
                    })
                );
                
                setDriverReviews(reviewsWithUsers);
            } else {
                setDriverReviews([]);
            }
        } catch (err) {
            console.error('Error in fetchDriverReviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    }

    const checkUrlTab = () => {
        
        const urlTab = searchParams.get('tab')
        
        if (urlTab) {
            setActiveTab(urlTab)
        }
    }

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
            .neq('cancelled', true)

        if (error) {
            console.error('Error fetching rides:', error)
            return []
        }
        
        // Get booking information for each ride
        const ridesWithBookings = await Promise.all(rides.map(async (ride) => {
            // Use a simpler approach - fetch bookings first, then users separately
            const { data: bookings, error: bookingError } = await supabase
                .from('bookings')
                .select('*')
                .eq('ride_id', ride.id)
            
            if (bookingError) {
                console.error('Error fetching bookings for ride:', bookingError)
                return {...ride, bookings: [], bookedSeats: 0}
            }
            
            // For each booking, fetch user details
            const bookingsWithUsers = await Promise.all(bookings.map(async (booking) => {
                if (!booking.userId) return booking;
                
                const { data: user } = await supabase.schema('next_auth')
                    .from('users')
                    .select('name, email, phone_number, image')
                    .eq('id', booking.userId)
                    .single()
                    
                return {
                    ...booking,
                    user: user || null
                }
            }))
            
            // Calculate total booked seats
            const bookedSeats = bookings?.reduce((total, booking) => 
                total + (booking.seats_booked || 0), 0) || 0
            
            return {
                ...ride,
                bookings: bookingsWithUsers || [],
                bookedSeats: bookedSeats
            }
        }))
        
        return ridesWithBookings
    }

    async function getUserBookings() {
        let { data: bookings, error } = await supabase
            .from('bookings')
            .select('*, rides(*)')
            .eq('userId', session.user?.id)

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
            setUploadStatus('uploading');
            const fileExt = file.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `public/${fileName}`
    
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
    
            // Get the public URL
            const { data: publicURL } = supabase
                .storage
                .from('profile-pictures')
                .getPublicUrl(data.path)
    
            // Update profile data with new image URL
            setProfileData({ ...profileData, image: publicURL.publicUrl })
            setUploadStatus('success');

            // Add this line to update the session
            await update({
                ...session,
                user: {
                    ...session.user,
                    image: publicURL.publicUrl
                }
            });

            setTimeout(() => {
                setUploadStatus('');
            }, 3000);
    
        } catch (error) {
            setUploadStatus('error');
        }
    }

    const validateForm = () => {
        let isValid = true;
        const errors = {
            phone: '',
            email: '',
            location: '',
            dateOfBirth: ''
        };
        
        // Phone validation - basic check for non-empty and numeric
        if (!profileData.phone) {
            errors.phone = 'Phone number is required';
            isValid = false;
        } else if (!/^\d{10,15}$/.test(profileData.phone.replace(/[^0-9]/g, ''))) {
            errors.phone = 'Please enter a valid phone number (10-15 digits)';
            isValid = false;
        }
        
        // Email validation
        if (!profileData.email) {
            errors.email = 'Email address is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }
        
        // Location validation
        if (!profileData.location) {
            errors.location = 'Location is required';
            isValid = false;
        }
        
        // Date of Birth validation
        if (!profileData.dateOfBirth) {
            errors.dateOfBirth = 'Date of birth is required';
            isValid = false;
        } else {
            // Check if user is at least 16 years old
            const today = new Date();
            const minAgeDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
            if (profileData.dateOfBirth > minAgeDate) {
                errors.dateOfBirth = 'You must be at least 16 years old';
                isValid = false;
            }
        }
        
        setFormErrors(errors);
        return isValid;
    };

    const handleProfileSave = async () => {
        // Validate form before saving
        if (!validateForm()) {
            return; // Stop if validation fails
        }
        
        setIsSaving(true);
        
        try {
            // Update the user profile in the database
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
                // Handle specific error cases if needed
                if (error.code === '23505') { // Unique constraint violation (e.g., duplicate email)
                    setFormErrors(prev => ({...prev, email: 'This email is already in use'}));
                }
            } else {
                // Update the session with the new user data
                await update({
                    ...session,
                    user: {
                        ...session.user,
                        name: profileData.name,
                        image: profileData.image,
                        email: profileData.email
                    }
                });
                setIsEditingProfile(false);
            }
        } catch (error) {
            console.error('Unexpected error saving profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile & Personal Information', icon: User },
        { id: 'payments', label: 'Payments & Payouts', icon: CreditCard },
        { id: 'rides', label: 'Rides & Bookings', icon: Car },
        { id: 'listings', label: 'My Listings', icon: Users },
        { id: 'reviews', label: 'My Reviews', icon: Star },
        {id: 'payouts', label: 'Driver Payouts', icon: Wallet}
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
                                            src={profileData?.image  ? profileData.image : session.user?.image || '/default-user-icon.png'}
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
                                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${formErrors.phone ? 'border-red-500' : ''}`}
                                                    />
                                                ) : (
                                                    <div className="font-medium">{profileData?.phone}</div>
                                                )}
                                                {isEditingProfile && formErrors.phone && (
                                                    <div className="text-red-500 text-sm mt-1 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {formErrors.phone}
                                                    </div>
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
                                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${formErrors.email ? 'border-red-500' : ''}`}
                                                    />
                                                ) : (
                                                    <div className="font-medium">{profileData?.email}</div>
                                                )}
                                                {isEditingProfile && formErrors.email && (
                                                    <div className="text-red-500 text-sm mt-1 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {formErrors.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Location</div>
                                                {isEditingProfile ? (
                                                    <div className="relative">
                                                        <Autocomplete
                                                            value={profileData.location}
                                                            placeholder="Please enter a city"
                                                            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS}
                                                            onPlaceSelected={(place) => {
                                                                // Extract the city name from the selected place
                                                                if (place && place.address_components) {
                                                                    const cityName = place.address_components[0].long_name;
                                                                    setProfileData({ ...profileData, location: cityName });
                                                                }
                                                            }}
                                                            onChange={(e) => {
                                                                if (e.target.value === '') {
                                                                    setProfileData({ ...profileData, location: '' });
                                                                } else {
                                                                    setProfileData({ ...profileData, location: e.target.value });
                                                                }
                                                            }}
                                                            className={`flex h-10 w-full rounded-md border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${formErrors.location ? 'border-red-500' : ''}`}
                                                            options={{
                                                                types: ['locality'],
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="font-medium">{profileData?.location}</div>
                                                )}
                                                {isEditingProfile && formErrors.location && (
                                                    <div className="text-red-500 text-sm mt-1 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {formErrors.location}
                                                    </div>
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
                                                    <div>
                                                        <DatePicker
                                                            selected={profileData.dateOfBirth}
                                                            onChange={(date) => setProfileData({ ...profileData, dateOfBirth: date })}
                                                            dateFormat="MMMM d, yyyy"
                                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${formErrors.dateOfBirth ? 'border-red-500' : ''}`}
                                                        />
                                                        {isEditingProfile && formErrors.dateOfBirth && (
                                                            <div className="text-red-500 text-sm mt-1 flex items-center">
                                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                                {formErrors.dateOfBirth}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="font-medium">
                                                        {profileData?.dateOfBirth ? format(new Date(profileData.dateOfBirth), 'MMMM d, yyyy') : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isEditingProfile ? (
                                    <div className="flex space-x-3 mt-6">
                                        <button
                                            onClick={handleProfileSave}
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 flex items-center disabled:opacity-70"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingProfile(false);
                                                fetchUserProfile(); // Reload original data to discard changes
                                                setFormErrors({     // Reset form errors
                                                    phone: '',
                                                    email: '',
                                                    location: '',
                                                    dateOfBirth: ''
                                                });
                                            }}
                                            disabled={isSaving}
                                            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-70"
                                        >
                                            Cancel
                                        </button>
                                    </div>
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

                        {/* <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Payout Information</h3>
                            <div className="flex items-center space-x-4 p-4 border rounded-lg">
                                <Wallet className="w-8 h-8 text-green-600" />
                                <div>
                                    <div className="font-medium">Direct Deposit</div>
                                    <div className="text-sm text-gray-500">Account ending in 1234</div>
                                </div>
                                <button className="ml-auto text-blue-600 hover:text-blue-700">Edit</button>
                                <PayoutsSection />
                            </div>
                        </div> */}

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                            <div className="space-y-4">
                                {loading ? (
                                    // Loading state
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                                <div>
                                                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                                    <div className="h-3 w-32 bg-gray-200 rounded mt-2"></div>
                                                </div>
                                            </div>
                                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                        </div>
                                    ))
                                ) : !userBookings || userBookings.length === 0 ? (
                                    <div className="text-center text-gray-500 py-4">
                                        No transactions found
                                    </div>
                                ) : (
                                    userBookings.map((booking, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <Car className="w-6 h-6 text-gray-400" />
                                                <div>
                                                    <div className="font-medium">
                                                        {booking.rides?.startingCity} to {booking.rides?.ishaYogaCenter}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.rides?.departure && 
                                                            format(new Date(booking.rides.departure), 'MMMM d, yyyy p')}
                                                    </div>
                                                    <div className="text-xs text-slate-900 pt-2">
                                                        {booking.payment_intent &&
                                                            'Payment ID: ' + booking.payment_intent}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-medium text-green-600">
                                                ${booking.totalPrice}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );
            
            case 'payouts':
            return <PayoutsSection />

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
                                    {userListings && userListings.length === 0 ? (
                                        <div className="text-center text-gray-500">No active listings found.</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userListings.filter(listing => new Date(listing.departure) > new Date()).map((listing, i) => (
                                                <div key={i} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4
                                                                className="font-medium text-lg hover:text-amber-600 cursor-pointer"
                                                                onClick={() => {
                                                                    setSelectedListing(listing);
                                                                    setIsBookingDetailsModalOpen(true);
                                                                }}
                                                            >
                                                                {listing.startingCity} to {listing.ishaYogaCenter}
                                                            </h4>
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
                                                                    <span className="text-amber-600 font-medium mr-1">{listing.bookedSeats}</span> / {listing.seats} seats
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
                                                            {listing.bookings?.length > 0 && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedListing(listing);
                                                                        setIsBookingDetailsModalOpen(true);
                                                                    }}
                                                                    className="text-sm text-amber-600 hover:text-amber-500"
                                                                >
                                                                    View {listing.bookings.length} booking{listing.bookings.length !== 1 ? 's' : ''}
                                                                </button>
                                                            )}
                                                        </div>
                                                        {listing.bookings?.length > 0 && (
                                                            <div className="text-sm">
                                                                <span className="font-medium text-green-600">${listing.pricePerSeat * listing.bookedSeats}</span>
                                                                <span className="text-gray-500"> total earnings</span>
                                                            </div>
                                                        )}
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
                                {!userListings || userListings.length === 0 ? (
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

            case 'reviews':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-semibold mb-6">My Reviews & Ratings</h3>
                            
                            {reviewsLoading ? (
                                <div className="animate-pulse space-y-6">
                                    <div className="flex items-center mb-6">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-6 bg-gray-200 rounded w-32"></div>
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        </div>
                                    </div>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="border-b pb-4">
                                            <div className="flex space-x-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : driverReviews.length > 0 ? (
                                <>
                                    <div className="flex items-center mb-8">
                                        <div className="bg-amber-50 p-4 rounded-lg text-center mr-6">
                                            <div className="text-3xl font-bold text-amber-600">{averageRating}</div>
                                            <div className="text-sm text-gray-500">out of 5</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center mb-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-5 h-5 ${
                                                            star <= Math.round(parseFloat(averageRating))
                                                                ? 'text-amber-500 fill-amber-500'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Based on {driverReviews.length} review{driverReviews.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {driverReviews.map((review) => (
                                            <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                                <div className="flex items-start">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-4 flex-shrink-0">
                                                        {review.reviewer?.image ? (
                                                            <img
                                                                src={review.reviewer.image}
                                                                alt={review.reviewer.name || 'Reviewer'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-800">
                                                                {(review.reviewer?.name || 'A')[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{review.reviewer?.name || 'Anonymous'}</div>
                                                        <div className="flex items-center mt-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-4 h-4 ${
                                                                        star <= review.rating
                                                                            ? 'text-amber-500 fill-amber-500'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                            <span className="text-xs text-gray-500 ml-2">
                                                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="mt-2 text-gray-700">{review.comment}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 border rounded-lg bg-gray-50">
                                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Reviews Yet</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        You haven't received any reviews yet. Reviews will appear here after passengers rate their experience with you.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!session || !session?.user) {
        redirect("/auth/sign-in")
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
                            setUserListings={setUserListings}
                            supabase={supabase} />
                        <BookingDetailsModal
                            isOpen={isBookingDetailsModalOpen}
                            onClose={() => {
                                setIsBookingDetailsModalOpen(false);
                                setSelectedListing(null);
                            }}
                            listing={selectedListing}
                        />
                    </>
                    

                )}

                {
                    isChangePasswordModalOpen && (
                        <ChangePasswordModal
                            isOpen={isChangePasswordModalOpen}
                            onClose={() => setIsChangePasswordModalOpen(false)}
                        />
                    )
                }
            </div>
        )
    }
}

export default Page
