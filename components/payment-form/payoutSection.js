"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSession } from 'next-auth/react';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, Clock, ArrowRightCircle, CreditCard,
  AlertCircle, CheckCircle, HelpCircle, Wallet
} from 'lucide-react';

export default function PayoutsSection() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    totalEarned: 0
  });
  
  const supabase = createClient();
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchPayouts() {
      if (!session?.user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('payouts')
          .select('*, rides(*)')
          .eq('driver_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPayouts(data || []);
        
        // Calculate stats
        const pending = data.filter(p => ['scheduled', 'pending'].includes(p.status));
        const completed = data.filter(p => p.status === 'paid');
        
        setStats({
          pending: pending.length,
          completed: completed.length,
          totalEarned: completed.reduce((sum, p) => sum + p.amount, 0)
        });
      } catch (err) {
        console.error('Error fetching payouts:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPayouts();
  }, [session]);

  const filteredPayouts = payouts.filter(payout => {
    if (activeTab === 'pending') {
      return ['scheduled', 'pending'].includes(payout.status);
    } else if (activeTab === 'completed') {
      return payout.status === 'paid';
    } else if (activeTab === 'failed') {
      return payout.status === 'failed';
    }
    return true;
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-blue-100 text-blue-800', icon: <HelpCircle className="w-3 h-3 mr-1" /> },
      scheduled: { color: 'bg-amber-100 text-amber-800', icon: <Clock className="w-3 h-3 mr-1" /> },
      paid: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      failed: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3 h-3 mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Your Payouts</h3>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Your Payouts</h3>
        <Wallet className="h-6 w-6 text-amber-600" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="text-amber-600 text-sm font-medium">Pending Payouts</div>
          <div className="text-2xl font-bold mt-2">{stats.pending}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-600 text-sm font-medium">Total Paid</div>
          <div className="text-2xl font-bold mt-2">{stats.completed}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-blue-600 text-sm font-medium">Total Earnings</div>
          <div className="text-2xl font-bold mt-2">${(stats.totalEarned / 100).toFixed(2)}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('failed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'failed' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Failed
          </button>
        </nav>
      </div>

      {/* Payouts List */}
      {filteredPayouts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No {activeTab} payouts found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayouts.map((payout) => (
            <div key={payout.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="space-y-2">
                  <div className="font-medium flex items-center">
                    <span>{payout.rides?.startingCity || 'Unknown'}</span>
                    <ArrowRightCircle className="inline-block mx-1 h-4 w-4 text-gray-400" />
                    <span>{payout.rides?.ishaYogaCenter || 'Unknown'}</span>
                  </div>

                  <div className="flex space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{payout.rides?.departure ? format(parseISO(payout.rides.departure), 'MMM d, yyyy') : 'Unknown'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{payout.rides?.departure ? format(parseISO(payout.rides.departure), 'h:mm a') : 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <StatusBadge status={payout.status} />
                    
                    {payout.status === 'scheduled' && (
                      <span className="text-xs text-gray-500">
                        Scheduled for {format(parseISO(payout.scheduled_for), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right mt-4 md:mt-0">
                  <div className="flex items-center justify-end space-x-1">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-semibold">${(payout.amount / 100).toFixed(2)}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Platform fee: ${(payout.platform_fee / 100).toFixed(2)}
                  </div>
                  
                  {payout.transfer_id && (
                    <div className="text-xs text-gray-400 mt-1">
                      Transfer ID: {payout.transfer_id.substring(0, 8)}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Help Text */}
      <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium mb-2">About Payouts</p>
        <p>Funds are automatically transferred to your bank account 3 days after each ride is completed. This delay allows time for any passenger issues to be resolved.</p>
        <p className="mt-2">Having trouble with a payout? <a href="/help" className="text-amber-600 hover:text-amber-700">Contact Support</a></p>
      </div>
    </div>
  );
}