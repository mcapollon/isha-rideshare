import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Phone } from 'lucide-react';

const supabase = createClient();

export default function DriverContactInfo({ driverId }) {
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhone() {
      if (!driverId) return;
      setLoading(true);
      const { data, error } = await supabase
        .schema('next_auth')
        .from('users')
        .select('phone_number')
        .eq('id', driverId)
        .single();
      if (!error && data?.phone_number) {
        setPhone(data.phone_number);
      } else {
        setPhone(null);
      }
      setLoading(false);
    }
    fetchPhone();
  }, [driverId]);

  if (loading) return <div className="text-sm text-gray-500">Loading driver contact...</div>;
  if (!phone) return <div className="text-sm text-gray-500">Driver phone not available</div>;

  return (
    <div className="flex items-center mt-2 text-sm text-gray-700">
      <Phone className="w-4 h-4 mr-1 text-amber-600" />
      <span>Driver phone: <span className="font-medium">{phone}</span></span>
    </div>
  );
}
