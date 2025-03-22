'use client'

import { useState, useEffect, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Star, Calendar, MapPin } from 'lucide-react';
import DriverReviews from '@/components/reviews/DriverReviews';
import CreateReview from '@/components/reviews/CreateReview';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

export default function DriverProfile({ params }) {
  // Use React.use() to unwrap the params promise
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [driver, setDriver] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const { data: session } = useSession();
  const { toast, Toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function fetchDriverData() {
      try {
        setLoading(true);
        
        // Fetch driver info
        const { data: userData, error: userError } = await supabase
          .schema('next_auth')
          .from('users')
          .select('id, name, email, image, location, dateOfBirth')
          .eq('id', id)
          .single();
        
        if (userError) {
          console.error('Error fetching driver:', userError);
          return;
        } else {
          setDriver(userData);
        }
        
        // Fetch recent rides - try both field names that might link to the driver
        let { data: ridesData, error: ridesError } = await supabase
          .from('rides')
          .select('*')
          .eq('createdByUser', id)
          .order('departure', { ascending: false })
          .limit(5);
          
        if (ridesError || !ridesData || ridesData.length === 0) {
          // If the first query fails or returns no data, try with driver_id
          const secondAttempt = await supabase
            .from('rides')
            .select('*')
            .eq('driver_id', id)
            .order('departure', { ascending: false })
            .limit(5);
            
          ridesData = secondAttempt.data || [];
          ridesError = secondAttempt.error;
        }
          
        if (ridesError) {
          console.error('Error fetching rides:', ridesError);
        } else if (ridesData && ridesData.length > 0) {
          // Process the ride data to handle various field name patterns
          const processedRides = ridesData.map(ride => ({
            ...ride,
            id: ride.id,
            starting_point: ride.startingCity || ride.startingPoint || ride.starting_point || '',
            destination: ride.ishaYogaCenter || ride.destination || '',
            departure_time: ride.departure || ride.departure_time || new Date().toISOString()
          }));
          setRides(processedRides);
        } else {
          setRides([]);
        }
      } catch (error) {
        console.error('Error in fetchDriverData:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchDriverData();
    }
  }, [id, supabase]);
  
  const handleReviewSubmitted = () => {
    setRefreshReviews(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Driver Not Found</h1>
        <p className="text-gray-600">The driver profile you're looking for doesn't exist or has been removed.</p>
        <Link href="/" className="mt-6 inline-block bg-amber-600 text-white px-4 py-2 rounded-md">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {Toast}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="bg-amber-50 p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4 sm:mb-0 sm:mr-6">
              {driver.image ? (
                <img src={driver.image} alt={driver.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-800 text-2xl font-medium">
                  {driver.name ? driver.name.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-800">{driver.name}</h1>
              {driver.location && (
                <div className="flex items-center justify-center sm:justify-start text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{driver.location}</span>
                </div>
              )}
              {driver.dateOfBirth && (
                <div className="flex items-center justify-center sm:justify-start text-gray-600 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Member since {format(new Date(driver.dateOfBirth), 'MMMM yyyy')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <DriverReviews driverId={id} key={refreshReviews} />
          
          {/* Only show rider's recent trips if the driver has some */}
          {rides.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mt-8">
              <h3 className="text-lg font-medium mb-4">Recent Rides</h3>
              <div className="space-y-4">
                {rides.map(ride => (
                  <div key={ride.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{ride.starting_point} to {ride.destination}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(ride.departure_time), 'PPP')} at {format(new Date(ride.departure_time), 'p')}
                        </p>
                      </div>
                      <Link 
                        href={`/rides/${ride.id}`}
                        className="text-sm text-amber-600 hover:text-amber-800"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="md:col-span-1">
          {session?.user && session.user.id !== id && (
            <CreateReview driverId={id} onReviewSubmitted={handleReviewSubmitted} />
          )}
        </div>
      </div>
    </div>
  );
}