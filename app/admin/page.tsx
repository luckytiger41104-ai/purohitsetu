'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Booking {
  id: string;
  created_at?: string;
  puja_name?: string;
  yajman_name?: string;
  yajman_phone?: string;
  language_code?: string;
  area?: string;
  pincode?: string;
  house_address?: string;
  puja_date?: string;
  time_slot?: string;
  with_samagri?: boolean;
  status?: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error.message);
    } else if (data) {
      setBookings(data as Booking[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PurohitSetu Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Live Pooja Bookings & Leads Management</p>
          </div>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-medium">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-medium">No bookings found yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3">Booked At (Time)</th>
                  <th className="px-4 py-3">Yajman Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Puja Name</th>
                  <th className="px-4 py-3">Ritual Date & Slot</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Samagri</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-600 font-medium whitespace-nowrap">
                      {formatDateTime(item.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.yajman_name || '-'}
                      <div className="text-xs text-gray-400 font-normal">
                        Lang: {item.language_code || 'hi'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {item.yajman_phone ? (
                        <a
                          href={`tel:${item.yajman_phone}`}
                          className="text-amber-700 font-semibold hover:underline"
                        >
                          {item.yajman_phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        {item.puja_name || 'Puja'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.puja_date || '-'}</div>
                      <div className="text-xs text-gray-500">{item.time_slot || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <div className="font-medium text-gray-800">
                        {item.area || '-'} ({item.pincode || '-'})
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {item.house_address || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.with_samagri ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                        {item.status || 'OPEN'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}