import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Phone, User } from 'lucide-react';

const supabase = createClient();

export default function DriverContactInfo({ driverId, showName = false }) {
  const [phone, setPhone] = useState(null);
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDriverInfo() {
      if (!driverId) return;
      setLoading(true);
      const { data, error } = await supabase
        .schema('next_auth')
        .from('users')
        .select('phone_number, name')
        .eq('id', driverId)
        .single();
      if (!error && data) {
        setPhone(data.phone_number || null);
        setName(data.name || null);
      } else {
        setPhone(null);
        setName(null);
      }
      setLoading(false);
    }
    fetchDriverInfo();
  }, [driverId]);

  if (loading) return <div className="text-sm text-gray-500">Loading driver contact...</div>;
  if (!phone && !name) return <div className="text-sm text-gray-500">Driver contact not available</div>;

  return (
    <div className="flex flex-col mt-2 text-sm text-gray-700">
      {showName && name && (
        <div className="flex items-center mb-1">
          <User className="w-4 h-4 mr-1 text-amber-600" />
          <span>Driver: <span className="font-medium">{name}</span></span>
        </div>
      )}
      {phone && (
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-1 text-amber-600" />
          <span>Phone: <a href={`tel:${phone}`} className="font-medium underline hover:text-amber-700">{phone}</a></span>
        </div>
      )}
    </div>
  );
}
