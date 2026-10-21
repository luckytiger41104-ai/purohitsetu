'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Pandit {
  id: string;
  phone: string;
  full_name: string;
  city?: string;
  experience?: string;
  bio?: string;
  upi_id?: string;
  wallet_balance?: number;
  earnings_balance?: number;
  strike_count?: number;
  is_blocked?: boolean;
  is_verified?: boolean;
  avatar_url?: string;
  created_at?: string;
  suspended_until?: string;
}

interface BookingLead {
  id: number;
  name: string;
  phone: string;
  puja_name: string;
  event_date: string;
  location: string;
  pincode?: string;
  language?: string;
  status: string;
  accepted_by?: string;
  assigned_to_name?: string;
  assigned_to_phone?: string;
  is_admin_handled?: boolean;
  completion_otp?: string;
  created_at: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  refund_status?: string;
}

interface TokenTx {
  id: number;
  pandit_name: string;
  pandit_phone: string;
  pack_name: string;
  amount: number;
  tokens_credited: number;
  razorpay_payment_id: string;
  created_at: string;
}

interface YajmanPayment {
  id: number;
  yajman_name: string;
  yajman_phone: string;
  puja_name: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  razorpay_payment_id?: string;
  created_at: string;
}

interface Withdrawal {
  id: number;
  pandit_id: string;
  pandit_name: string;
  pandit_phone: string;
  upi_id: string;
  amount: number;
  status: string;
  created_at: string;
  processed_at?: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'pandits' | 'tokens' | 'yajman' | 'withdrawals'>('requests');

  const [bookings, setBookings] = useState<BookingLead[]>([]);
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [tokenTxs, setTokenTxs] = useState<TokenTx[]>([]);
  const [yajmanPayments, setYajmanPayments] = useState<YajmanPayment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedPanditForLead, setSelectedPanditForLead] = useState<{ [bookingId: number]: string }>({});

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const { data: bData, error: bErr } = await supabase
        .from('bookings')
        .select('*')
        .order('id', { ascending: false });
      if (bData) {
        setBookings(
          bData.map((b: any) => ({
            id: b.id,
            name: b.name || b.yajman_name || 'Yajman',
            phone: b.phone || '',
            puja_name: b.puja_name || 'Vedic Ritual',
            event_date: b.event_date || 'Shubh Muhurat',
            location: b.location || 'Bengaluru',
            pincode: b.pincode,
            language: b.language,
            status: b.status || 'available',
            accepted_by: b.accepted_by,
            assigned_to_name: b.assigned_to_name,
            assigned_to_phone: b.assigned_to_phone,
            is_admin_handled: b.is_admin_handled,
            completion_otp: b.completion_otp,
            created_at: b.created_at || new Date().toISOString(),
            cancellation_reason: b.cancellation_reason,
            cancelled_by: b.cancelled_by,
            refund_status: b.refund_status,
          }))
        );
      }
      if (bErr) console.error('Error fetching bookings:', bErr.message);

      const { data: pData } = await supabase
        .from('pandits')
        .select('*')
        .order('id', { ascending: false });
      if (pData) setPandits(pData);

      const { data: tData } = await supabase
        .from('token_transactions')
        .select('*')
        .order('id', { ascending: false });
      if (tData) setTokenTxs(tData);

      const { data: yData } = await supabase
        .from('yajman_payments')
        .select('*')
        .order('id', { ascending: false });
      if (yData) setYajmanPayments(yData);

      const { data: wData } = await supabase
        .from('withdrawals')
        .select('*')
        .order('id', { ascending: false });
      if (wData) setWithdrawals(wData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAdminClaimLead = async (booking: BookingLead) => {
    if (confirm(`Accept booking for "${booking.puja_name}" (${booking.name}) as Admin?`)) {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          accepted_by: 'Admin Team',
          is_admin_handled: true,
        })
        .eq('id', booking.id);

      if (error) {
        alert('Error claiming lead: ' + error.message);
      } else {
        alert('Booking successfully claimed by Admin!');
        loadAdminData();
      }
    }
  };

  const handleAdminAssignPandit = async (bookingId: number) => {
    const targetPanditPhone = selectedPanditForLead[bookingId];
    if (!targetPanditPhone) {
      alert('Please select an Acharya from the dropdown first.');
      return;
    }

    const targetPandit = pandits.find((p) => p.phone === targetPanditPhone);
    const pName = targetPandit?.full_name || 'Assigned Acharya';

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        accepted_by: targetPandit?.id || targetPanditPhone,
        assigned_to_name: pName,
        assigned_to_phone: targetPanditPhone,
        accepted_via: 'admin_assigned',
      })
      .eq('id', bookingId);

    if (error) {
      alert('Error assigning lead: ' + error.message);
    } else {
      alert(`Puja successfully assigned to ${pName} (${targetPanditPhone})!`);
      loadAdminData();
    }
  };

  // Cancellation Flow 1: Approve Token Refund (+150 Tokens to Pandit Ji)
  const handleApproveTokenRefund = async (booking: BookingLead) => {
    const targetPhone = booking.assigned_to_phone || booking.accepted_by;
    if (!targetPhone) {
      alert('Could not determine Pandit phone number for this ceremony.');
      return;
    }

    const cleanPhone = targetPhone.replace(/\D/g, '').slice(-10);
    const confirmApprove = confirm(
      `Approve refund for this ceremony?\n\nThis will credit +150 Tokens back to Pandit (+91 ${cleanPhone})'s wallet.`
    );
    if (!confirmApprove) return;

    try {
      // 1. Fetch current balance
      const { data: pData } = await supabase
        .from('pandits')
        .select('wallet_balance')
        .eq('phone', cleanPhone)
        .maybeSingle();

      const currentBalance = Number(pData?.wallet_balance || 0);
      const updatedBalance = currentBalance + 150;

      // 2. Add tokens
      await supabase
        .from('pandits')
        .update({ wallet_balance: updatedBalance })
        .eq('phone', cleanPhone);

      // 3. Update Booking
      await supabase
        .from('bookings')
        .update({
          status: 'cancelled_by_yajman',
          refund_status: 'Refund Approved (+150 Tokens Restored)',
        })
        .eq('id', booking.id);

      alert(`Success: 150 Tokens restored to Pandit Ji (+91 ${cleanPhone}).`);
      loadAdminData();
    } catch (err: any) {
      alert('Failed to process token refund: ' + err.message);
    }
  };

  // Cancellation Flow 2: Reject Claim & Suspend Pandit for 7 Days (False Report Penalty)
  const handleRejectAndSuspendPandit = async (booking: BookingLead) => {
    const targetPhone = booking.assigned_to_phone || booking.accepted_by;
    if (!targetPhone) {
      alert('Could not determine Pandit phone number.');
      return;
    }

    const cleanPhone = targetPhone.replace(/\D/g, '').slice(-10);
    const confirmSuspend = confirm(
      `Reject cancellation as FALSE CLAIM and suspend this Pandit (+91 ${cleanPhone}) for 7 days?`
    );
    if (!confirmSuspend) return;

    try {
      const suspendedUntilDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: pData } = await supabase
        .from('pandits')
        .select('strike_count')
        .eq('phone', cleanPhone)
        .maybeSingle();

      const newStrikes = (Number(pData?.strike_count) || 0) + 1;

      // Suspend account and add strike
      await supabase
        .from('pandits')
        .update({
          is_blocked: true,
          suspended_until: suspendedUntilDate,
          strike_count: newStrikes,
        })
        .eq('phone', cleanPhone);

      // Update booking
      await supabase
        .from('bookings')
        .update({
          status: 'cancelled_by_pandit',
          refund_status: 'Rejected (False Report - Account Suspended 7 Days)',
        })
        .eq('id', booking.id);

      alert(`Penalty Applied: Pandit (+91 ${cleanPhone}) has been suspended for 7 days with +1 Strike added. 0 Tokens refunded.`);
      loadAdminData();
    } catch (err: any) {
      alert('Failed to apply suspension: ' + err.message);
    }
  };

  const toggleVerifyPandit = async (id: string, currentStatus: boolean | undefined) => {
    const newStatus = !currentStatus;
    await supabase.from('pandits').update({ is_verified: newStatus }).eq('id', id);
    setPandits(pandits.map((p) => (p.id === id ? { ...p, is_verified: newStatus } : p)));
    alert(`Pandit status: ${newStatus ? 'VERIFIED' : 'UNVERIFIED'}`);
  };

  const toggleBlockPandit = async (id: string, currentBlocked: boolean | undefined) => {
    const newStatus = !currentBlocked;
    await supabase.from('pandits').update({ is_blocked: newStatus }).eq('id', id);
    setPandits(pandits.map((p) => (p.id === id ? { ...p, is_blocked: newStatus } : p)));
    alert(`Pandit ${newStatus ? 'BLOCKED' : 'UNBLOCKED'}`);
  };

  const updateStrikes = async (id: string, currentStrikes: number, change: number) => {
    const updated = Math.max(0, currentStrikes + change);
    await supabase.from('pandits').update({ strike_count: updated }).eq('id', id);
    setPandits(pandits.map((p) => (p.id === id ? { ...p, strike_count: updated } : p)));
  };

  const handleApproveWithdrawal = async (w: Withdrawal) => {
    if (confirm(`Confirm payout of ₹${w.amount} to UPI: ${w.upi_id}?`)) {
      await supabase
        .from('withdrawals')
        .update({
          status: 'paid',
          processed_at: new Date().toISOString(),
        })
        .eq('id', w.id);

      const p = pandits.find((item) => item.id === w.pandit_id);
      if (p && (p.earnings_balance || 0) >= w.amount) {
        const newBal = (p.earnings_balance || 0) - w.amount;
        await supabase.from('pandits').update({ earnings_balance: newBal }).eq('id', p.id);
      }

      alert('Withdrawal marked as PAID successfully.');
      loadAdminData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-24">
      <header className="bg-gray-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-black text-xl text-white shadow">
              P
            </div>
            <div>
              <h1 className="text-lg font-bold">PurohitSetu Admin Center</h1>
              <p className="text-xs text-gray-400">Master Operations & Lead Routing</p>
            </div>
          </div>
          <button
            onClick={loadAdminData}
            className="text-xs font-bold bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh Data
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 bg-gray-950 flex overflow-x-auto gap-2 py-2 border-t border-gray-800">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'requests' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            🪔 Puja Requests ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('pandits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pandits' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            🕉️ Pandit Verification ({pandits.length})
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'tokens' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            🪙 Token Recharges ({tokenTxs.length})
          </button>
          <button
            onClick={() => setActiveTab('yajman')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'yajman' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            💳 Yajman Ledger ({yajmanPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'withdrawals' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            💸 Payout Requests ({withdrawals.filter((w) => w.status === 'pending').length} Pending)
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {loading && (
          <div className="bg-white p-6 rounded-2xl text-center text-sm font-bold text-gray-500 shadow-sm animate-pulse">
            Syncing database records...
          </div>
        )}

        {/* TAB 1: ALL PUJA REQUESTS & LEAD ASSIGNMENT */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-gray-900">All Incoming Puja Requests & Assignments</h2>
                <p className="text-xs text-gray-500">
                  Accept leads directly if no Pandit claims them, or manually assign to any verified Acharya.
                </p>
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full self-start md:self-auto">
                Total Requests: {bookings.length}
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl text-gray-400 text-xs">
                No Puja booking requests found in database yet.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => {
                  const isClaimable =
                    b.status === 'available' ||
                    !b.status ||
                    b.status === 'pending' ||
                    b.status.toLowerCase() === 'pending';

                  const isUnderReview = b.status === 'cancellation_under_review';

                  return (
                    <div
                      key={b.id}
                      className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col space-y-3 ${
                        isUnderReview ? 'border-amber-400 bg-amber-50/20' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">
                              #{b.id}
                            </span>
                            <h3 className="font-bold text-base text-gray-900">{b.puja_name}</h3>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                b.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : isUnderReview
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold animate-pulse'
                                  : b.status.startsWith('cancelled')
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {b.status.replace(/_/g, ' ')}
                            </span>
                            {b.completion_otp && (
                              <span className="text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg">
                                OTP: <span className="font-mono font-black">{b.completion_otp}</span>
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 pt-1">
                            <p>👤 <strong>Yajman:</strong> {b.name}</p>
                            <p>📞 <strong>Phone:</strong> {b.phone}</p>
                            <p>📍 <strong>Location:</strong> {b.location} {b.pincode ? `(${b.pincode})` : ''}</p>
                            <p>🕒 <strong>Muhurat:</strong> {b.event_date}</p>
                          </div>

                          {b.assigned_to_name && (
                            <p className="text-xs text-green-700 bg-green-50 p-2 rounded-xl border border-green-200 font-semibold inline-block">
                              ✓ Assigned to Acharya: <strong>{b.assigned_to_name}</strong> ({b.assigned_to_phone})
                            </p>
                          )}
                        </div>

                        {/* Action Buttons for Normal Leads */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                          {isClaimable ? (
                            <>
                              <button
                                onClick={() => handleAdminClaimLead(b)}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow cursor-pointer transition whitespace-nowrap"
                              >
                                ⚡ Claim as Admin
                              </button>

                              <div className="flex items-center gap-1.5">
                                <select
                                  value={selectedPanditForLead[b.id] || ''}
                                  onChange={(e) =>
                                    setSelectedPanditForLead({ ...selectedPanditForLead, [b.id]: e.target.value })
                                  }
                                  className="border border-gray-300 rounded-xl px-2.5 py-2 text-xs bg-gray-50 focus:bg-white text-gray-800"
                                >
                                  <option value="">Assign to Pandit...</option>
                                  {pandits
                                    .filter((p) => !p.is_blocked)
                                    .map((p) => (
                                      <option key={p.id} value={p.phone}>
                                        {p.full_name || 'Acharya'} ({p.phone})
                                      </option>
                                    ))}
                                </select>
                                <button
                                  onClick={() => handleAdminAssignPandit(b.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow cursor-pointer transition whitespace-nowrap"
                                >
                                  Assign
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="text-right">
                              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                Accepted by: {b.accepted_by || b.assigned_to_name || 'Acharya'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CANCELLATION UNDER REVIEW ADMIN ACTIONS PANEL */}
                      {isUnderReview && (
                        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2.5 text-xs mt-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <p className="text-amber-950 font-bold">
                              📝 <strong>Reported Cancellation Reason:</strong>{' '}
                              <span className="font-medium text-gray-900">{b.cancellation_reason || 'No detailed reason provided'}</span>
                            </p>
                            <span className="bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full font-bold self-start sm:self-auto text-[11px]">
                              Initiator: {b.cancelled_by === 'yajman' ? 'Yajman Side' : 'Acharya Side'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200">
                            <button
                              onClick={() => handleApproveTokenRefund(b)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow cursor-pointer"
                            >
                              ✓ Verify Genuine & Refund 150 Tokens
                            </button>

                            <button
                              onClick={() => handleRejectAndSuspendPandit(b)}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow cursor-pointer"
                            >
                              ✕ False Report (Suspend Pandit 7 Days & 0 Refund)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display Refund/Resolution Info if already resolved */}
                      {b.refund_status && !isUnderReview && (
                        <div className="p-2.5 bg-stone-50 border rounded-xl text-xs text-gray-700 flex items-center justify-between">
                          <span>
                            <strong>Resolution Status:</strong> {b.refund_status}
                          </span>
                          <span className="text-gray-500 font-mono text-[11px]">
                            Reason: {b.cancellation_reason || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PANDIT VERIFICATION */}
        {activeTab === 'pandits' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-gray-900">Registered Vedic Acharyas</h2>
                <p className="text-xs text-gray-500">Approve credentials, monitor strikes, and manage access.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pandits.map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-orange-300 bg-orange-50 shrink-0">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-2xl">🕉️</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{p.full_name || 'Acharya'}</h3>
                      <p className="text-xs text-gray-500">📞 {p.phone}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          p.is_verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.is_verified ? '✓ Verified Acharya' : '⏳ Pending Verification'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-xl text-xs space-y-1 text-gray-700 border border-gray-100">
                    <p>📍 <strong>City:</strong> {p.city || 'Bangalore'}</p>
                    <p>🎓 <strong>Experience:</strong> {p.experience || 'Vedic Trained'}</p>
                    <p>🪙 <strong>Tokens:</strong> {p.wallet_balance || 0} | <strong>Earnings:</strong> ₹{p.earnings_balance || 0}</p>
                    <p className="truncate">🆔 <strong>UPI:</strong> {p.upi_id || 'Not added'}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-gray-600">
                      Strikes: <span className="text-red-600 font-black">{p.strike_count || 0}/2</span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateStrikes(p.id, p.strike_count || 0, 1)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded text-xs font-bold border border-red-200 cursor-pointer"
                        title="Add Strike"
                      >
                        + Strike
                      </button>
                      <button
                        onClick={() => updateStrikes(p.id, p.strike_count || 0, -1)}
                        className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded text-xs font-bold cursor-pointer"
                        title="Reset/Reduce Strike"
                      >
                        - Strike
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      onClick={() => toggleVerifyPandit(p.id, p.is_verified)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        p.is_verified
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {p.is_verified ? 'Unverify' : 'Verify & Approve'}
                    </button>
                    <button
                      onClick={() => toggleBlockPandit(p.id, p.is_blocked)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                        p.is_blocked
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {p.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TOKEN PURCHASE HISTORY */}
        {activeTab === 'tokens' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">Pandit Token Recharge Log</h2>
              <p className="text-xs text-gray-500">Every Razorpay payment executed by Acharyas for lead access tokens.</p>
            </div>

            {tokenTxs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl text-gray-400 text-xs">
                No token purchase transactions recorded yet.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b text-gray-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Acharya</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Pack Details</th>
                      <th className="p-3">Tokens Credited</th>
                      <th className="p-3">Amount Paid</th>
                      <th className="p-3">Razorpay ID</th>
                      <th className="p-3">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tokenTxs.map((t) => (
                      <tr key={t.id} className="hover:bg-orange-50/30">
                        <td className="p-3 font-bold text-gray-900">{t.pandit_name}</td>
                        <td className="p-3 text-gray-600">{t.pandit_phone}</td>
                        <td className="p-3"><span className="bg-orange-100 text-orange-900 px-2 py-0.5 rounded-full font-bold">{t.pack_name}</span></td>
                        <td className="p-3 font-bold text-amber-700">+{t.tokens_credited} 🪙</td>
                        <td className="p-3 font-bold text-green-700">₹{t.amount}</td>
                        <td className="p-3 font-mono text-[11px] text-gray-500">{t.razorpay_payment_id || 'Direct'}</td>
                        <td className="p-3 text-gray-500">{new Date(t.created_at).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: YAJMAN PAYMENTS HISTORY */}
        {activeTab === 'yajman' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">Yajman Booking & Payment Ledger</h2>
              <p className="text-xs text-gray-500">Tracks Online Advance payments vs Cash On Puja reservations.</p>
            </div>

            {yajmanPayments.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl text-gray-400 text-xs">
                No Yajman payments logged yet.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b text-gray-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Yajman Name</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Puja Ceremony</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Transaction ID</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {yajmanPayments.map((y) => (
                      <tr key={y.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{y.yajman_name}</td>
                        <td className="p-3 text-gray-600">{y.yajman_phone}</td>
                        <td className="p-3 font-medium text-gray-800">{y.puja_name}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              y.payment_method === 'online'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {y.payment_method === 'online' ? 'Online (Razorpay)' : 'Cash on Puja'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              y.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {y.payment_status}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-gray-900">₹{y.amount}</td>
                        <td className="p-3 font-mono text-[11px] text-gray-500">{y.razorpay_payment_id || 'N/A (Cash)'}</td>
                        <td className="p-3 text-gray-500">{new Date(y.created_at).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PANDIT WITHDRAWAL REQUESTS */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">Pandit Payout & Withdrawal Requests</h2>
              <p className="text-xs text-gray-500">Pay out Acharyas directly via their specified UPI ID and mark completed.</p>
            </div>

            {withdrawals.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl text-gray-400 text-xs">
                No withdrawal requests at this moment.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b text-gray-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Acharya</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Settlement UPI ID</th>
                      <th className="p-3">Payout Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Requested At</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{w.pandit_name}</td>
                        <td className="p-3 text-gray-600">{w.pandit_phone}</td>
                        <td className="p-3 font-mono text-emerald-800 font-bold">{w.upi_id || 'N/A'}</td>
                        <td className="p-3 font-extrabold text-gray-900 text-sm">₹{w.amount}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              w.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {w.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">{new Date(w.created_at).toLocaleString('en-IN')}</td>
                        <td className="p-3">
                          {w.status === 'pending' ? (
                            <button
                              onClick={() => handleApproveWithdrawal(w)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-xl text-xs shadow cursor-pointer transition"
                            >
                              ✓ Mark as Paid
                            </button>
                          ) : (
                            <span className="text-gray-400 font-semibold text-xs">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}