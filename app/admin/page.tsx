'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface SettlementRecord {
  id: string; // pandit_id
  name: string;
  phone: string;
  strikeCount: number;
  isBlocked: boolean;
  latestPujaName?: string;
  conductedOn?: string;
  deadlineHours?: number;
  commissionStatus?: string;
}

export default function AdminSettlementsPage() {
  const [records, setRecords] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch real pandits & their latest puja status from Supabase
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const { data: panditsData } = await supabase
        .from('pandits')
        .select('*')
        .order('strike_count', { ascending: false });

      if (panditsData) {
        const enriched: SettlementRecord[] = await Promise.all(
          panditsData.map(async (p) => {
            // Fetch their latest accepted lead
            const { data: lead } = await supabase
              .from('puja_leads')
              .select('*')
              .eq('accepted_by', p.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            const isSaturday = lead?.conducted_day === 'Saturday';

            return {
              id: p.id,
              name: p.full_name || 'Acharya',
              phone: p.phone,
              strikeCount: Number(p.strike_count || 0),
              isBlocked: Boolean(p.is_blocked),
              latestPujaName: lead?.puja_name || 'No recent puja',
              conductedOn: lead?.conducted_day || 'Weekday',
              deadlineHours: isSaturday ? 48 : 24,
              commissionStatus: lead?.commission_status || 'settled',
            };
          })
        );
        setRecords(enriched);
      }
    } catch (e) {
      console.error('Admin fetch error:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Admin Actions with Real Supabase Update
  const handleIssueStrike = async (panditId: string) => {
    const target = records.find((r) => r.id === panditId);
    if (!target) return;

    const newStrikes = target.strikeCount + 1;
    const shouldBlock = newStrikes >= 2;

    await supabase
      .from('pandits')
      .update({
        strike_count: newStrikes,
        is_blocked: shouldBlock,
      })
      .eq('id', panditId);

    alert(`Strike issued. New count: ${newStrikes} strikes.`);
    loadAdminData();
  };

  const handleCancelStrike = async (panditId: string) => {
    const target = records.find((r) => r.id === panditId);
    if (!target) return;

    const newStrikes = Math.max(0, target.strikeCount - 1);
    const shouldBlock = newStrikes >= 2;

    await supabase
      .from('pandits')
      .update({
        strike_count: newStrikes,
        is_blocked: shouldBlock,
      })
      .eq('id', panditId);

    alert(`Strike cancelled. New count: ${newStrikes} strikes.`);
    loadAdminData();
  };

  const handleUnblock = async (panditId: string) => {
    await supabase
      .from('pandits')
      .update({
        strike_count: 0,
        is_blocked: false,
      })
      .eq('id', panditId);

    alert('Account unblocked successfully and strikes reset to 0.');
    loadAdminData();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Commission & Strike Control Panel</h1>
          <p className="text-sm text-gray-500">
            Settlement Deadlines: 24h standard, 48h for Saturday Pujas. Full manual controls for Strikes, Cancellations, and Unblocking.
          </p>
        </div>
        <button
          onClick={loadAdminData}
          className="border border-gray-300 hover:bg-gray-50 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading live data from Supabase...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No registered pandits found in the database.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-600 font-semibold">
              <tr>
                <th className="p-4">Pandit Details</th>
                <th className="p-4">Latest Puja & Window</th>
                <th className="p-4">Settlement Status</th>
                <th className="p-4">Strikes</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/80">
                  <td className="p-4 font-semibold text-gray-900">
                    {r.name}
                    <span className="block text-xs text-gray-400 font-normal">{r.phone}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-gray-800">{r.latestPujaName}</span>
                    <span className="block text-xs text-orange-600 font-bold">
                      {r.conductedOn} ({r.deadlineHours}h window)
                    </span>
                  </td>
                  <td className="p-4">
                    {r.commissionStatus === 'settled' || r.commissionStatus === 'paid' ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold">
                        ✓ Settled
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold">
                        ⚠️ Pending / Overdue
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`font-bold ${r.strikeCount >= 2 ? 'text-red-600' : 'text-gray-700'}`}>
                      {r.strikeCount} / 2 Strikes
                    </span>
                    {r.isBlocked && (
                      <span className="block text-[11px] text-red-600 font-extrabold uppercase">Suspended</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleIssueStrike(r.id)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Issue Strike
                    </button>
                    <button
                      onClick={() => handleCancelStrike(r.id)}
                      className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Cancel Strike
                    </button>
                    {r.isBlocked && (
                      <button
                        onClick={() => handleUnblock(r.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition cursor-pointer"
                      >
                        🔓 Unblock Account
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}