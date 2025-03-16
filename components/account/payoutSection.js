"use client"

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { 
  Calendar, Clock, ArrowRightCircle, CreditCard,
  AlertCircle, CheckCircle, HelpCircle, Wallet,
  DollarSign, ExternalLink
} from 'lucide-react';

export default function PayoutsSection() {
  const [payoutData, setPayoutData] = useState({
    pending: [],
    completed: [],
    balance: { available: 0, pending: 0 },
    stats: { pending: 0, completed: 0, totalEarned: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);
  
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchPayouts() {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/stripe/get-driver-payouts');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch payouts');
        }
        
        const data = await response.json();
        console.log('Stripe payout data:', data);
        setPayoutData(data);
      } catch (err) {
        console.log('Error fetching payouts:', err);
        setError(err.message || 'Failed to load payouts');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPayouts();
  }, [session]);

  const formatCurrency = (amount, currency = 'cad') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };
  
  const getPayoutsToDisplay = () => {
    switch (activeTab) {
      case 'pending':
        return payoutData.pending;
      case 'completed':
        return payoutData.completed;
      default:
        return [];
    }
  };

  const openStripeDashboard = async () => {
    try {
      setDashboardLoading(true);
      setDashboardError(null);
      
      const response = await fetch('/api/stripe/create-dashboard-link');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate dashboard link');
      }
      
      // Open the Stripe dashboard in a new tab
      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error opening Stripe dashboard:', err);
      setDashboardError(err.message);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    console.log(error, 'error message')
  }, [error])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Driver Payouts</h1>
        
        {/* Only show button if there's no Stripe-related error (which indicates an account exists) */}
        {!loading && 
         !error?.includes('Stripe') && 
         !error?.includes('stripe') && 
         !error?.includes('connect') && 
         !error?.includes('account') && (
          <button
            onClick={openStripeDashboard}
            disabled={dashboardLoading}
            className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-sm transition-colors duration-200 font-medium"
          >
            {dashboardLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            <span>View Stripe Dashboard</span>
          </button>
        )}
      </div>
      
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(payoutData.balance.available)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Balance</p>
              <p className="text-2xl font-semibold text-amber-600">
                {formatCurrency(payoutData.balance.pending)}
              </p>
            </div>
            <div className="p-2 bg-amber-100 rounded-full">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Earned</p>
              <p className="text-2xl font-semibold text-blue-600">
                {formatCurrency(payoutData.stats.totalEarned)}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Removed scheduled balance card */}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending ({payoutData.stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed ({payoutData.stats.completed})
          </button>
        </nav>
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-2">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
            
            {/* Button stacks on mobile, inline on desktop */}
            {error.includes('Stripe') || error.includes('stripe') || error.includes('connect') || error.includes('account') ? (
              <a 
                href="/driver/onboarding" 
                className="inline-flex items-center px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-medium rounded-md shadow-sm transition-colors duration-200 whitespace-nowrap self-start sm:self-auto"
              >
                Set up your Stripe Connect account
              </a>
            ) : null}
          </div>
        </div>
      ) : getPayoutsToDisplay().length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium text-gray-700 mb-1">No {activeTab} payouts</p>
          <p className="text-sm">
            {activeTab === 'pending' 
              ? "You don't have any pending payouts at the moment."
              : "You haven't received any payouts yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {getPayoutsToDisplay().map((payout) => (
            <div key={payout.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{payout.description}</h3>
                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                      {payout.rideDetails.departureTime && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(payout.rideDetails.departureTime), 'PPP')}
                        </div>
                      )}
                      <div className="flex items-center">
                        <ArrowRightCircle className="w-4 h-4 mr-1" />
                        {payout.rideDetails.departureLocation} to {payout.rideDetails.destination}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-lg">
                      {formatCurrency(payout.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payout.source === 'scheduled' ? (
                        <div className="flex items-center justify-end text-amber-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Scheduled for {format(new Date(payout.arrival_date), 'MMM d')} 
                          <span className="ml-1 text-xs">(3-day hold)</span>
                        </div>
                      ) : payout.status === 'pending' ? (
                        <div className="flex items-center justify-end">
                          <Clock className="w-3 h-3 mr-1" />
                          {payout.arrival_date 
                            ? `Arriving ${format(new Date(payout.arrival_date), 'MMM d')}`
                            : 'Processing'}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid on {format(new Date(payout.created), 'MMM d')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t px-5 py-3 flex justify-between items-center bg-gray-50">
                <div className="text-sm text-gray-600">
                  ID: {payout.id.slice(0, 10)}...
                </div>
                <a 
                  href="https://dashboard.stripe.com/connect/transfers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-amber-600 hover:text-amber-700 flex items-center"
                >
                  View in Stripe
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Help Section */}
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mt-8">
        <h3 className="font-medium text-amber-800 mb-2">About Payouts</h3>
        <p className="text-sm text-amber-700">
          Payouts are automatically processed 3 days after a ride is completed. 
          Funds will be transferred to your connected bank account. Platform fees of 15% are deducted from each payout.
        </p>
      </div>
    </div>
  );
}