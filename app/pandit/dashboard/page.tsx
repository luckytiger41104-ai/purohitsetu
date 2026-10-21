'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Lead {
  id: string | number;
  yajman_name: string;
  phone: string;
  puja_name: string;
  event_date: string;
  location: string;
  created_at: string;
  status: string;
  accepted_via?: 'token' | 'free' | 'admin_assigned';
  accepted_by?: string;
  assigned_to_phone?: string;
  completion_otp?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  refund_status?: string;
}

const TOKEN_COST = 150;

const TOKEN_PACKS = [
  { name: 'Micro Trial', tokens: 35, amount: 50, tag: '' },
  { name: 'Trial Pack', tokens: 75, amount: 100, tag: '' },
  { name: 'Starter Pack', tokens: 110, amount: 150, tag: '' },
  { name: 'Base Pack', tokens: 150, amount: 200, tag: 'Popular' },
  { name: 'Purohit Plus', tokens: 225, amount: 300, tag: '' },
  { name: 'Double Pack', tokens: 300, amount: 400, tag: '' },
  { name: 'Bronze Acharya', tokens: 375, amount: 500, tag: '' },
  { name: 'Silver Acharya', tokens: 450, amount: 600, tag: '' },
  { name: 'Gold Acharya', tokens: 600, amount: 800, tag: '' },
  { name: 'Platinum Pack', tokens: 800, amount: 1000, tag: '🎁 +50 Bonus' },
  { name: 'Diamond Shastri', tokens: 1125, amount: 1500, tag: '' },
  { name: 'Royal Shastri', tokens: 1600, amount: 2000, tag: '🎁 +100 Bonus' },
  { name: 'Vedic Samrat', tokens: 2400, amount: 3000, tag: '🎁 +150 Bonus' },
  { name: 'Brahmarishi Pack', tokens: 3200, amount: 4000, tag: '🎁 +200 Bonus' },
  { name: 'Maharishi Crown', tokens: 4050, amount: 5000, tag: '👑 +300 Bonus Free' },
];

const loadRazorpaySDK = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PanditDashboardPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [panditId, setPanditId] = useState<string>('');
  const [panditName, setPanditName] = useState<string>('Acharya');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [baseCity, setBaseCity] = useState<string>('Bengaluru, Karnataka');
  const [experience, setExperience] = useState<string>('12+ Years Vedic Rituals');
  const [bio, setBio] = useState<string>(
    'Specialized in Vedic Karmakand, Griha Pravesh, and authentic ceremonies adhering strictly to Vedic traditions.'
  );
  const [upiId, setUpiId] = useState<string>('');
  const [gallery, setGallery] = useState<string[]>([]);

  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [earningsBalance, setEarningsBalance] = useState<number>(0);
  const [strikeCount, setStrikeCount] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'leads' | 'bookings' | 'missing' | 'wallet' | 'profile' | 'rules'>('leads');
  const [currentTime, setCurrentTime] = useState<number>(0);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(panditName);
  const [editCity, setEditCity] = useState<string>(baseCity);
  const [editExp, setEditExp] = useState<string>(experience);
  const [editBio, setEditBio] = useState<string>(bio);
  const [editUpi, setEditUpi] = useState<string>(upiId);

  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [activeOtpLead, setActiveOtpLead] = useState<Lead | null>(null);
  const [enteredOtp, setEnteredOtp] = useState<string>('');

  // Cancellation State
  const [activeCancelLead, setActiveCancelLead] = useState<Lead | null>(null);
  const [cancelBy, setCancelBy] = useState<'yajman' | 'pandit'>('yajman');
  const [cancelReasonPreset, setCancelReasonPreset] = useState<string>('Yajman changed plan or cancelled date');
  const [cancelCustomReason, setCancelCustomReason] = useState<string>('');
  const [cancelSubmitting, setCancelSubmitting] = useState<boolean>(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Lead[]>([]);
  const [missingLeads, setMissingLeads] = useState<Lead[]>([]);

  const maskPhone = (rawPhone: string) => {
    if (!rawPhone || rawPhone.length < 6) return '••••••••••';
    return rawPhone.slice(0, 3) + '••••' + rawPhone.slice(-3);
  };

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  // 1. Session Guard
  useEffect(() => {
    const savedPhone = (typeof window !== 'undefined' ? localStorage.getItem('pandit_phone') : null) || getCookie('pandit_phone');
    if (!savedPhone) {
      router.replace('/pandit/login');
    } else {
      const clean = savedPhone.replace(/\D/g, '').slice(-10);
      setPhone(clean);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pandit_phone', clean);
        document.cookie = `pandit_phone=${clean}; path=/; max-age=31536000; SameSite=Lax`;
      }
    }
  }, [router]);

  // 2. Install App Listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBtn(false);
      }
      setDeferredPrompt(null);
    }
  };

  // 3. Heartbeat Timer (Hydrated)
  useEffect(() => {
    setCurrentTime(Math.floor(Date.now() / 1000));
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Load Dashboard Data
  const loadDashboardData = async () => {
    try {
      const activePhone = phone || (typeof window !== 'undefined' ? localStorage.getItem('pandit_phone') || '' : '') || getCookie('pandit_phone') || '';
      const cleanPhone = activePhone.replace(/\D/g, '').slice(-10);
      if (!cleanPhone) return;

      const { data: pData } = await supabase
        .from('pandits')
        .select('*')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (pData) {
        setPanditId(String(pData.id));
        if (pData.full_name) {
          setPanditName(pData.full_name);
          setEditName(pData.full_name);
        }
        if (pData.wallet_balance !== undefined) setTokenBalance(Number(pData.wallet_balance));
        if (pData.earnings_balance !== undefined) setEarningsBalance(Number(pData.earnings_balance));
        if (pData.strike_count !== undefined) setStrikeCount(Number(pData.strike_count));
        if (pData.is_blocked !== undefined) setIsBlocked(Boolean(pData.is_blocked));
        if (pData.city) {
          setBaseCity(pData.city);
          setEditCity(pData.city);
        }
        if (pData.experience) {
          setExperience(pData.experience);
          setEditExp(pData.experience);
        }
        if (pData.bio) {
          setBio(pData.bio);
          setEditBio(pData.bio);
        }
        if (pData.upi_id) {
          setUpiId(pData.upi_id);
          setEditUpi(pData.upi_id);
        }
        if (pData.avatar_url) setProfilePhoto(pData.avatar_url);
        if (pData.puja_gallery && Array.isArray(pData.puja_gallery)) setGallery(pData.puja_gallery);
      }

      const { data: allBookings, error: bError } = await supabase
        .from('bookings')
        .select('*')
        .order('id', { ascending: false });

      if (bError) {
        console.error('Error fetching bookings:', bError.message);
      } else if (allBookings) {
        const formatted: Lead[] = allBookings.map((b: any) => ({
          id: b.id,
          yajman_name: b.name || b.yajman_name || 'Yajman',
          phone: b.phone || '',
          puja_name: b.puja_name || 'Vedic Ceremony',
          event_date: b.event_date || 'As per Shubh Muhurat',
          location: b.location || 'Bengaluru',
          created_at: b.created_at || new Date().toISOString(),
          status: b.status || 'available',
          accepted_via: b.accepted_via,
          accepted_by: b.accepted_by,
          assigned_to_phone: b.assigned_to_phone,
          completion_otp: b.completion_otp,
          cancellation_reason: b.cancellation_reason,
          cancelled_by: b.cancelled_by,
          refund_status: b.refund_status,
        }));

        setLeads(
          formatted.filter(
            (item) =>
              item.status === 'available' ||
              !item.status ||
              item.status.toLowerCase() === 'pending'
          )
        );

       const myIdentifier = cleanPhone;

        // Sirf wahi confirmed bookings jo is login pandit ji ne claim ki hain
        setConfirmedBookings(
          formatted.filter(
            (item) =>
              (item.status === 'confirmed' || item.status === 'in_progress') &&
              (item.accepted_by === myIdentifier || item.assigned_to_phone === myIdentifier)
          )
        );

        // Missing leads: Jo kisi aur ne le li YA cancel ho gayi
        setMissingLeads(
          formatted.filter((item) => {
            const isClaimedByOther =
              (item.status === 'confirmed' || item.status === 'in_progress' || item.status === 'completed') &&
              item.accepted_by !== myIdentifier &&
              item.assigned_to_phone !== myIdentifier;

            const isCancelled =
              item.status === 'cancelled_by_yajman' ||
              item.status === 'cancelled_by_pandit' ||
              item.status === 'cancellation_under_review' ||
              item.status === 'cancelled';

            return isClaimedByOther || isCancelled;
          })
        );
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    if (phone) {
      loadDashboardData();
    }
  }, [phone]);

  // 5. Accept Lead Flow
  const handleAcceptLead = async (lead: Lead) => {
    if (isBlocked || strikeCount >= 2) {
      alert('Your account is currently suspended due to active strikes. Please contact support.');
      return;
    }

    const cleanPhone = phone || (typeof window !== 'undefined' ? localStorage.getItem('pandit_phone') || '' : '') || getCookie('pandit_phone') || '';
    const currentPanditIdentifier = cleanPhone || panditId || 'Acharya';
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const cleanCreatedAt = lead.created_at.endsWith('Z') ? lead.created_at : lead.created_at + 'Z';
    const createdSec = Math.floor(new Date(cleanCreatedAt).getTime() / 1000);
    const effectiveCurrent = currentTime || Math.floor(Date.now() / 1000);
    const elapsed = Math.max(0, effectiveCurrent - createdSec);
    const isWithin60s = elapsed < 60;

    if (isWithin60s) {
      if (tokenBalance < TOKEN_COST) {
        alert(`This ceremony is in the priority window (${Math.max(0, 60 - elapsed)}s remaining). It requires ${TOKEN_COST} tokens.`);
        return;
      }

      const remainingTokens = tokenBalance - TOKEN_COST;
      if (cleanPhone) {
        await supabase.from('pandits').update({ wallet_balance: remainingTokens }).eq('phone', cleanPhone);
      }
      setTokenBalance(remainingTokens);

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          accepted_by: currentPanditIdentifier,
          accepted_via: 'token',
          completion_otp: generatedOtp,
        })
        .eq('id', lead.id);

      if (error) {
        alert('Could not claim ceremony: ' + error.message);
        return;
      }

      alert(`Ceremony Claimed Successfully! ${TOKEN_COST} priority tokens deducted. Direct contact unlocked.`);
      await loadDashboardData();
      setActiveTab('bookings');
    } else {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          accepted_by: currentPanditIdentifier,
          accepted_via: 'free',
          completion_otp: generatedOtp,
        })
        .eq('id', lead.id);

      if (error) {
        alert('Could not claim ceremony: ' + error.message);
        return;
      }

      alert('Ceremony Claimed in Open Mode! Direct contact unlocked.');
      await loadDashboardData();
      setActiveTab('bookings');
    }
  };

  // 6. Verify OTP
  const handleVerifyCompletionOtp = async () => {
    if (!activeOtpLead) return;

    if (!enteredOtp || enteredOtp.trim() === '') {
      alert('Please enter the 4-digit verification code provided by the Yajman.');
      return;
    }

    if (activeOtpLead.completion_otp && enteredOtp.trim() !== activeOtpLead.completion_otp) {
      alert('Invalid verification code. Please confirm the correct 4-digit code with the Yajman.');
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'completed',
      })
      .eq('id', activeOtpLead.id);

    if (error) {
      alert('Error updating ceremony status: ' + error.message);
    } else {
      alert('Ceremony marked as completed and verified successfully.');
      setActiveOtpLead(null);
      setEnteredOtp('');
      await loadDashboardData();
    }
  };

  // 7. Cancellation Submission Handler
  const handleConfirmCancellation = async () => {
    if (!activeCancelLead) return;

    const finalReason = cancelCustomReason.trim()
      ? `${cancelReasonPreset}: ${cancelCustomReason.trim()}`
      : cancelReasonPreset;

    setCancelSubmitting(true);
    try {
      const newStatus = 'cancellation_under_review';
      const refundStatus =
        cancelBy === 'yajman'
          ? 'Pending Admin Verification (Eligible for +150 Token Refund)'
          : 'No Refund Applicable (Pandit Initiated)';

      const { error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          cancelled_by: cancelBy,
          cancellation_reason: finalReason,
          refund_status: refundStatus,
        })
        .eq('id', activeCancelLead.id);

      if (error) {
        alert('Failed to report cancellation: ' + error.message);
      } else {
        alert(
          cancelBy === 'yajman'
            ? 'Cancellation reported. Admin is reviewing this case with the Yajman. Once verified genuine, 150 Tokens will be credited back to your wallet.'
            : 'Cancellation reported. Please note that cancellations caused by the Acharya do not qualify for a token refund.'
        );
        setActiveCancelLead(null);
        setCancelCustomReason('');
        await loadDashboardData();
        setActiveTab('missing');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setCancelSubmitting(false);
    }
  };

  // 8. Token Purchase & Recharge
  const recordTokenTransaction = async (packName: string, amount: number, tokensCount: number, razorpayId: string) => {
    try {
      await supabase.from('token_transactions').insert({
        pandit_id: panditId || phone || 'unknown',
        pandit_phone: phone || 'unknown',
        pandit_name: panditName || 'Acharya',
        pack_name: packName,
        amount: amount,
        tokens_credited: tokensCount,
        razorpay_payment_id: razorpayId,
      });
    } catch (err) {
      console.error('Error logging token transaction:', err);
    }
  };

  const handleBuyTokens = async (packName: string, amount: number, tokensCount: number) => {
    const isLoaded = await loadRazorpaySDK();

    if (!isLoaded) {
      alert('Payment gateway failed to load. Please verify your internet connection.');
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_purohitsetu',
      amount: amount * 100,
      currency: 'INR',
      name: 'PurohitSetu',
      description: `Recharge: ${packName} (${tokensCount} Tokens)`,
      image: '/pandit-logo.png',
      handler: async function (response: any) {
        const newTokens = tokenBalance + tokensCount;
        setTokenBalance(newTokens);
        if (phone) {
          await supabase.from('pandits').update({ wallet_balance: newTokens }).eq('phone', phone);
        }
        await recordTokenTransaction(packName, amount, tokensCount, response?.razorpay_payment_id || 'RZP_SUCCESS');
        setShowRechargeModal(false);
        alert(`Payment Verified (${response.razorpay_payment_id || 'Success'}). ${tokensCount} tokens added to your wallet.`);
        await loadDashboardData();
      },
      prefill: {
        name: panditName,
        contact: phone,
      },
      theme: {
        color: '#c2410c',
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert('Payment Failed: ' + response.error.description);
      });
      rzp.open();
    } catch {
      const newTokens = tokenBalance + tokensCount;
      setTokenBalance(newTokens);
      if (phone) {
        await supabase.from('pandits').update({ wallet_balance: newTokens }).eq('phone', phone);
      }
      await recordTokenTransaction(packName, amount, tokensCount, 'DIRECT_OFFLINE');
      setShowRechargeModal(false);
      alert(`Tokens Credited: ${tokensCount} tokens added to wallet.`);
    }
  };

  // 9. Request Payout
  const handleRequestPayout = async () => {
    if (earningsBalance <= 0) {
      alert('No withdrawable ceremony earnings available right now.');
      return;
    }
    if (!upiId) {
      alert('Please configure your Settlement UPI ID in your Profile tab first.');
      setActiveTab('profile');
      return;
    }

    const confirmReq = confirm(`Request payout of ₹${earningsBalance} to UPI ID: ${upiId}?`);
    if (!confirmReq) return;

    try {
      const { error } = await supabase.from('withdrawals').insert({
        pandit_id: panditId || 'unknown',
        pandit_name: panditName || 'Acharya',
        pandit_phone: phone || 'unknown',
        upi_id: upiId,
        amount: earningsBalance,
        status: 'pending',
      });

      if (error) {
        alert('Could not submit payout request: ' + error.message);
      } else {
        alert(`Payout request for ₹${earningsBalance} submitted successfully. Disbursal will be processed to ${upiId} within 3-4 hours.`);
      }
    } catch (err: any) {
      alert('Error requesting payout: ' + err.message);
    }
  };

  // 10. Profile Save
  const handleSaveProfile = async () => {
    const activePhone = phone || (typeof window !== 'undefined' ? localStorage.getItem('pandit_phone') || '' : '') || getCookie('pandit_phone') || '';
    const cleanPhone = activePhone.replace(/\D/g, '').slice(-10);

    if (!cleanPhone) {
      alert('Active mobile session not detected. Please sign in again.');
      return;
    }

    const payload = {
      phone: cleanPhone,
      full_name: editName,
      city: editCity,
      experience: editExp,
      bio: editBio,
      upi_id: editUpi,
      avatar_url: profilePhoto,
    };

    const { error } = await supabase
      .from('pandits')
      .upsert(payload, { onConflict: 'phone' });

    if (error) {
      const { error: updateError } = await supabase
        .from('pandits')
        .update(payload)
        .eq('phone', cleanPhone);

      if (updateError) {
        alert('Failed to save profile changes: ' + updateError.message);
        return;
      }
    }

    setPanditName(editName);
    setBaseCity(editCity);
    setExperience(editExp);
    setBio(editBio);
    setUpiId(editUpi);
    setIsEditing(false);
    alert('Profile updated and saved successfully.');
    await loadDashboardData();
  };

  // 11. Photo Uploads
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setProfilePhoto(base64String);
        const cleanPhone = phone || (typeof window !== 'undefined' ? localStorage.getItem('pandit_phone') || '' : '') || getCookie('pandit_phone') || '';
        if (cleanPhone) {
          await supabase.from('pandits').update({ avatar_url: base64String }).eq('phone', cleanPhone);
        }
        alert('Profile photo updated successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const updatedGallery = [base64String, ...gallery];
        setGallery(updatedGallery);
        const cleanPhone = phone || (typeof window !== 'undefined' ? localStorage.getItem('pandit_phone') || '' : '') || getCookie('pandit_phone') || '';
        if (cleanPhone) {
          await supabase.from('pandits').update({ puja_gallery: updatedGallery }).eq('phone', cleanPhone);
        }
        alert('Ceremony photo added to your public portfolio.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteGalleryImage = async (indexToDelete: number) => {
    if (confirm('Are you sure you want to delete this photo from your portfolio?')) {
      const updatedGallery = gallery.filter((_, idx) => idx !== indexToDelete);
      setGallery(updatedGallery);
      const cleanPhone = phone || (typeof window !== 'undefined' ? localStorage.getItem('pandit_phone') || '' : '') || getCookie('pandit_phone') || '';
      if (cleanPhone) {
        await supabase.from('pandits').update({ puja_gallery: updatedGallery }).eq('phone', cleanPhone);
      }
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out from the Acharya Portal?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pandit_phone');
        document.cookie = 'pandit_phone=; path=/; max-age=0;';
      }
      router.replace('/pandit/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900 relative">
      {strikeCount > 0 && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <span>⚠️</span>
          <span>Account Alert: {strikeCount} Active Strike(s). Two strikes will automatically suspend lead access.</span>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-gradient-to-r from-orange-700 via-amber-700 to-orange-800 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-amber-300 bg-white p-0.5 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/pandit-logo.png"
                alt="PurohitSetu Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold leading-tight tracking-wide">PurohitSetu</h1>
              <p className="text-xs text-orange-200">Acharya Portal • {panditName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showInstallBtn && (
              <button
                onClick={handleInstallApp}
                className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow cursor-pointer animate-pulse"
              >
                📲 Install App
              </button>
            )}

            <button
              onClick={() => setActiveTab('wallet')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>🪙</span> {tokenBalance} Tokens
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <span>₹</span> {earningsBalance} Balance
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className="bg-red-700/60 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-6xl mx-auto px-4 bg-black/20 backdrop-blur border-t border-white/10 flex overflow-x-auto gap-2 py-1.5">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'leads' ? 'bg-white text-orange-800 shadow' : 'text-orange-100 hover:bg-white/10'
            }`}
          >
            🌟 New Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings' ? 'bg-white text-orange-800 shadow' : 'text-orange-100 hover:bg-white/10'
            }`}
          >
            📅 Confirmed Bookings ({confirmedBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('missing')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'missing' ? 'bg-white text-orange-800 shadow' : 'text-orange-100 hover:bg-white/10'
            }`}
          >
            ⏳ Missing / Cancelled ({missingLeads.length})
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'wallet' ? 'bg-white text-orange-800 shadow' : 'text-orange-100 hover:bg-white/10'
            }`}
          >
            🪙 Tokens & Wallet
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'profile' ? 'bg-white text-orange-800 shadow' : 'text-orange-100 hover:bg-white/10'
            }`}
          >
            👤 Profile & Portfolio
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'rules' ? 'bg-amber-400 text-gray-950 font-bold shadow' : 'text-amber-200 hover:bg-white/10'
            }`}
          >
            📜 Platform Rules
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* TAB 1: NEW LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Live Ceremony Requests</h2>
                <p className="text-xs text-gray-500">
                  Privacy Protected: Yajman contact number unlocks once you claim the ceremony.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadDashboardData}
                  className="text-xs bg-orange-50 text-orange-700 border border-orange-200 font-bold px-3 py-1 rounded-lg hover:bg-orange-100 cursor-pointer"
                >
                  🔄 Refresh
                </button>
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
                  {leads.length} Available
                </span>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 shadow-sm">
                <span className="text-4xl block mb-2">🪔</span>
                <h3 className="font-bold text-gray-800 text-base">No Live Ceremonies Right Now</h3>
                <p className="text-xs text-gray-500 mt-1">
                  New ceremony requests will appear here in real time.
                </p>
              </div>
            ) : (
              leads.map((lead) => {
                const cleanCreatedAt = lead.created_at.endsWith('Z') ? lead.created_at : lead.created_at + 'Z';
                const createdSec = Math.floor(new Date(cleanCreatedAt).getTime() / 1000);
                const effectiveCurrent = currentTime || Math.floor(Date.now() / 1000);
                const elapsed = Math.max(0, effectiveCurrent - createdSec);
                const secondsLeft = Math.max(0, 60 - elapsed);
                const isExclusive = secondsLeft > 0;
                const hasTokens = tokenBalance >= TOKEN_COST;

                return (
                  <div key={lead.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{lead.puja_name}</h3>
                        <p className="text-xs text-gray-500">Yajman: {lead.yajman_name}</p>
                      </div>

                      {isExclusive ? (
                        <span className="bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto animate-pulse">
                          <span>⏳</span> Priority Window: {secondsLeft}s remaining
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl self-start sm:self-auto">
                          🔓 Open for All (30% Platform Fee)
                        </span>
                      )}
                    </div>

                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-sm space-y-1">
                      <p className="text-gray-700">📍 <strong>Location:</strong> {lead.location}</p>
                      <p className="text-gray-700">🕒 <strong>Auspicious Muhurat:</strong> {lead.event_date}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        🔒 <strong>Phone Number:</strong> {maskPhone(lead.phone)} (Hidden until claimed)
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <p className="text-xs text-gray-500">
                        {isExclusive ? (
                          <span className="text-orange-700 font-semibold">
                            Priority Access: Requires {TOKEN_COST} tokens. 0% platform commission.
                          </span>
                        ) : (
                          <span className="text-gray-600">
                            Open Mode: No tokens required. 30% platform commission applies upon completion.
                          </span>
                        )}
                      </p>

                      {isExclusive && !hasTokens ? (
                        <button
                          disabled
                          className="bg-gray-100 text-gray-400 font-bold px-6 py-2.5 rounded-xl text-sm cursor-not-allowed border border-gray-200"
                        >
                          Locked ({secondsLeft}s) • Requires Tokens
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAcceptLead(lead)}
                          className={`font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition cursor-pointer text-white ${
                            isExclusive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          {isExclusive ? `Claim Priority (${TOKEN_COST} Tokens)` : 'Claim Ceremony (Free Mode)'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: CONFIRMED BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Confirmed Bookings</h2>
                <p className="text-xs text-gray-500">
                  Direct client contacts unlocked. Complete the ritual and enter the OTP, or report cancellation if required.
                </p>
              </div>
              <button
                onClick={loadDashboardData}
                className="text-xs bg-orange-50 text-orange-700 border border-orange-200 font-bold px-3 py-1 rounded-lg hover:bg-orange-100 cursor-pointer"
              >
                🔄 Refresh
              </button>
            </div>
            {confirmedBookings.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-400">No active confirmed bookings yet. Claim an available lead to begin.</p>
              </div>
            ) : (
              confirmedBookings.map((b) => (
                <div key={b.id} className="bg-white p-6 rounded-2xl border border-green-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{b.puja_name}</h3>
                      <span className="text-xs font-semibold text-gray-500">
                        Claimed via: {b.accepted_via === 'token' ? 'Priority Token (0% fee)' : 'Open Mode'}
                      </span>
                    </div>
                    {b.accepted_via === 'admin_assigned' && (
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                        Direct Admin Assigned
                      </span>
                    )}
                  </div>

                  <div className="bg-green-50/60 p-4 rounded-xl border border-green-100 space-y-1.5 text-sm">
                    <p className="text-gray-800">👤 <strong>Yajman Name:</strong> {b.yajman_name}</p>
                    <p className="text-green-800 font-bold">📞 <strong>Direct Mobile:</strong> {b.phone}</p>
                    <p className="text-gray-700">📍 <strong>Address:</strong> {b.location}</p>
                    <p className="text-gray-700">🕒 <strong>Timing:</strong> {b.event_date}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${b.phone}`}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                      >
                        📞 Call Yajman
                      </a>

                      <button
                        onClick={() => setActiveOtpLead(b)}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        ✓ Complete & Enter OTP
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setActiveCancelLead(b);
                        setCancelBy('yajman');
                        setCancelReasonPreset('Yajman cancelled / changed mind');
                        setCancelCustomReason('');
                      }}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-2 px-3.5 rounded-xl transition cursor-pointer"
                    >
                      ✕ Report Cancellation
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: MISSING & CANCELLED LEADS */}
        {activeTab === 'missing' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Cancelled & Missed Requests</h2>
                <p className="text-xs text-gray-500">
                  Cancellation reason breakdown, initiator details, and token refund tracking.
                </p>
              </div>
              <button
                onClick={loadDashboardData}
                className="text-xs bg-orange-50 text-orange-700 border border-orange-200 font-bold px-3 py-1 rounded-lg hover:bg-orange-100 cursor-pointer"
              >
                🔄 Refresh
              </button>
            </div>

            {missingLeads.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-400">No cancelled records found.</p>
              </div>
            ) : (
              missingLeads.map((m) => (
                <div key={m.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{m.puja_name}</h3>
                      <p className="text-xs text-gray-500">Yajman: {m.yajman_name} • {m.location}</p>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                        m.status === 'cancellation_under_review'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : m.cancelled_by === 'yajman'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-red-100 text-red-900 border border-red-300'
                      }`}
                    >
                      {m.status === 'cancellation_under_review'
                        ? '⏳ Under Admin Review'
                        : m.cancelled_by === 'yajman'
                        ? 'Cancelled by Yajman'
                        : 'Cancelled by Pandit'}
                    </span>
                  </div>

                  {/* CANCELLATION EXPLANATION BREAKDOWN SECTION */}
                  <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs space-y-1.5">
                    <p className="text-gray-700">
                      <strong>Cancellation Reason:</strong> {m.cancellation_reason || 'Reason not specified.'}
                    </p>
                    <p className="text-gray-700">
                      <strong>Reported Initiator:</strong> {m.cancelled_by ? (m.cancelled_by === 'yajman' ? 'Yajman Side' : 'Pandit Ji Side') : 'Direct'}
                    </p>
                    <div className="pt-1">
                      <span className="font-bold text-gray-900">Token Refund Status: </span>
                      <span
                        className={`font-semibold ${
                          m.refund_status?.includes('+150') || m.refund_status?.includes('Refund Approved')
                            ? 'text-emerald-700'
                            : m.refund_status?.includes('No Refund') || m.cancelled_by === 'pandit'
                            ? 'text-red-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {m.refund_status || (m.cancelled_by === 'yajman' ? 'Eligible for Token Refund (Admin Verification Pending)' : 'No Refund Applicable')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: WALLET & RECHARGE */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full font-bold">
                  Withdrawable Ceremony Earnings
                </span>
                <h3 className="text-4xl font-extrabold mt-3">₹{earningsBalance}</h3>
                <p className="text-xs text-emerald-100 mt-2">
                  Payout SLA: Dispatched within 3-4 hours directly to your verified UPI ID ({upiId || 'Configure in profile'}).
                </p>
              </div>
              <button
                onClick={handleRequestPayout}
                className="bg-white text-emerald-900 font-bold px-6 py-3 rounded-2xl text-sm shadow-lg hover:bg-emerald-50 transition cursor-pointer self-start md:self-auto"
              >
                Request Payout
              </button>
            </div>

            <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full font-bold">
                  Priority Tokens
                </span>
                <h3 className="text-4xl font-extrabold mt-3">🪙 {tokenBalance} Tokens</h3>
                <p className="text-xs text-amber-100 mt-2">
                  Standard Rate: 150 Tokens = ₹200. High-value packs include bonus promotional tokens.
                </p>
              </div>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="bg-white text-orange-900 font-bold px-6 py-3 rounded-2xl text-sm shadow-lg hover:bg-amber-50 transition cursor-pointer self-start md:self-auto"
              >
                + Buy Priority Tokens
              </button>
            </div>

            {/* RECHARGE PACKS MODAL */}
            {showRechargeModal && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-orange-200 shadow-2xl space-y-5">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900">Select Priority Token Package</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      15 curated packages from ₹50 up to ₹5,000. Higher tiers include extra complimentary tokens.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRechargeModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 max-h-[65vh] overflow-y-auto p-1">
                  {TOKEN_PACKS.map((pack, idx) => {
                    const isTopTier = pack.amount === 5000;
                    const hasBonus = pack.tag.includes('Bonus');
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl text-center space-y-2 hover:border-orange-500 transition shadow-sm flex flex-col justify-between relative ${
                          isTopTier
                            ? 'border-2 border-orange-600 bg-gradient-to-b from-orange-50/80 to-amber-50/40 shadow-md ring-2 ring-orange-400/30'
                            : hasBonus
                            ? 'border-2 border-amber-300 bg-amber-50/30'
                            : 'border border-gray-200 bg-white'
                        }`}
                      >
                        {pack.tag && (
                          <span
                            className={`absolute -top-2.5 right-2 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs ${
                              isTopTier
                                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white animate-pulse'
                                : hasBonus
                                ? 'bg-emerald-600 text-white'
                                : 'bg-orange-100 text-orange-900'
                            }`}
                          >
                            {pack.tag}
                          </span>
                        )}
                        <div>
                          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                            {pack.name}
                          </span>
                          <p className={`text-xl font-black mt-1 ${isTopTier ? 'text-orange-700' : hasBonus ? 'text-emerald-700' : 'text-orange-600'}`}>
                            {pack.tokens} Tokens
                          </p>
                          <p className="text-sm font-extrabold text-gray-900">
                            ₹{pack.amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleBuyTokens(pack.name, pack.amount, pack.tokens)}
                          className={`w-full font-bold py-2 rounded-xl text-xs transition cursor-pointer text-white shadow-xs ${
                            isTopTier
                              ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 font-black'
                              : hasBonus
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-orange-600 hover:bg-orange-700'
                          }`}
                        >
                          Pay ₹{pack.amount.toLocaleString('en-IN')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROFILE & PORTFOLIO */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-6">
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <div className="w-22 h-22 rounded-full overflow-hidden border-2 border-orange-400 bg-orange-50 flex items-center justify-center shadow-md">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt={panditName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">🕉️</span>
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full cursor-pointer shadow-lg border-2 border-white transition transform hover:scale-110"
                      title="Upload Profile Photo"
                    >
                      📷
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{panditName}</h3>
                    <p className="text-sm text-green-700 font-semibold flex items-center gap-1">
                      <span>✓</span> Verified Vedic Acharya
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      📱 Logged In Mobile: <strong>+91 {phone}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold px-5 py-2.5 rounded-xl text-sm cursor-pointer transition"
                >
                  ✏️ Edit Profile
                </button>
              </div>

              <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-1">
                <span className="text-xs text-orange-800 uppercase font-bold tracking-wider">Vedic Bio & Specialties</span>
                <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-2xl border">
                  <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Registered Phone</span>
                  <span className="font-bold text-gray-800 font-mono">+91 {phone}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border">
                  <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Base Location</span>
                  <span className="font-bold text-gray-800">{baseCity}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border">
                  <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Ritual Experience</span>
                  <span className="font-bold text-gray-800">{experience}</span>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-xs text-emerald-700 uppercase font-bold block mb-1">Settlement UPI ID</span>
                  <span className="font-bold text-emerald-900">{upiId || 'Not Configured'}</span>
                </div>
              </div>
            </div>

            {/* Portfolio Gallery */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Vedic Rituals & Ceremonies Portfolio</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showcase genuine photos of ceremonies, havans, and rituals conducted by you.
                  </p>
                </div>

                <label
                  htmlFor="gallery-upload"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition self-start sm:self-auto"
                >
                  <span>📸</span> + Add Ceremony Photo
                </label>
                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAddGalleryImage}
                  className="hidden"
                />
              </div>

              {gallery.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 space-y-2">
                  <span className="text-4xl block">🖼️</span>
                  <p className="text-sm font-bold text-gray-700">No Ceremony Photos Added Yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {gallery.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-neutral-900"
                    >
                      <img
                        src={imgUrl}
                        alt={`Ceremony Portfolio ${index + 1}`}
                        className="w-full h-full object-cover transition transform group-hover:scale-105"
                      />
                      <button
                        onClick={() => handleDeleteGalleryImage(index)}
                        title="Delete Photo"
                        className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full text-xs shadow opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: RULES */}
        {activeTab === 'rules' && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">PurohitSetu Operating Guidelines & Standards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="p-5 rounded-2xl border border-orange-200 bg-orange-50/40">
                <h4 className="font-bold text-gray-900 mb-1">1. Priority Window & Token Claims</h4>
                <p className="text-xs text-gray-600">The first 60 seconds are reserved exclusively for Token Holders with 0% platform commission.</p>
              </div>
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40">
                <h4 className="font-bold text-gray-900 mb-1">2. Open Access Mode</h4>
                <p className="text-xs text-gray-600">After 60 seconds, ceremonies are opened for all Acharyas with a 30% platform service fee upon completion.</p>
              </div>
              <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40">
                <h4 className="font-bold text-gray-900 mb-1">3. Completion Verification</h4>
                <p className="text-xs text-gray-600">Always collect the 4-digit verification code directly from the Yajman once rituals conclude.</p>
              </div>
              <div className="p-5 rounded-2xl border border-red-200 bg-red-50/40">
                <h4 className="font-bold text-gray-900 mb-1">4. Settlement Windows & Account Strikes</h4>
                <p className="text-xs text-gray-600">Settlements are cleared within 24 hours (48 hours for Saturdays). Reaching two strikes will pause lead assignments.</p>
              </div>
              <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/40 md:col-span-2">
                <h4 className="font-bold text-gray-900 mb-1">5. Cancellation, Token Refunds & Anti-Fraud Policy</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  • <strong>Yajman Cancellation:</strong> If a ceremony is cancelled by the Yajman (e.g. postponed or cancelled plan), 150 priority tokens are credited back to the Acharya’s wallet following admin confirmation.<br />
                  • <strong>Pandit Cancellation:</strong> If a ceremony is cancelled due to an Acharya issue (dakshina disputes, delays, unprofessional conduct), no token refund is provided.<br />
                  • <strong>False Claim Penalty:</strong> Reporting false cancellation claims to gain illicit refunds will result in an immediate <strong>7-Day Platform Account Suspension</strong> upon review.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CANCELLATION REPORTING MODAL */}
      {activeCancelLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Report Ceremony Cancellation</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeCancelLead.puja_name} for Yajman {activeCancelLead.yajman_name}
              </p>
            </div>

            <div className="space-y-3.5 text-xs text-left">
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Who initiated this cancellation?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCancelBy('yajman');
                      setCancelReasonPreset('Yajman cancelled / changed mind');
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                      cancelBy === 'yajman'
                        ? 'border-orange-600 bg-orange-50 text-orange-900'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Yajman Side
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCancelBy('pandit');
                      setCancelReasonPreset('Acharya schedule clash / emergency');
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                      cancelBy === 'pandit'
                        ? 'border-orange-600 bg-orange-50 text-orange-900'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Acharya Side
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Cancellation Reason</label>
                <select
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-orange-600"
                >
                  {cancelBy === 'yajman' ? (
                    <>
                      <option value="Yajman cancelled / changed mind">Yajman cancelled / changed mind</option>
                      <option value="Family out of town / postphoned">Family out of town / postponed</option>
                      <option value="Puja arranged locally / already conducted">Puja arranged locally / already conducted</option>
                      <option value="Yajman unreachable / phone switched off">Yajman unreachable / phone switched off</option>
                      <option value="Other Yajman side reason">Other Yajman side reason</option>
                    </>
                  ) : (
                    <>
                      <option value="Acharya emergency / health issue">Acharya emergency / health issue</option>
                      <option value="Date and time clash with another ceremony">Date and time clash with another ceremony</option>
                      <option value="Travel distance / transport unavailable">Travel distance / transport unavailable</option>
                      <option value="Dakshina / Samagri misalignment">Dakshina / Samagri misalignment</option>
                      <option value="Other Acharya reason">Other Acharya reason</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Additional Details (Optional)</label>
                <textarea
                  rows={2}
                  value={cancelCustomReason}
                  onChange={(e) => setCancelCustomReason(e.target.value)}
                  placeholder="Explain briefly what happened..."
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-orange-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <p className="font-bold">⚠️ Platform Dispute & Token Policy:</p>
                <p>
                  • If verified genuine on Yajman&apos;s side, 150 priority tokens will be restored.
                  <br />
                  • Reporting false claims to improperly claim tokens will incur an immediate <strong>7-Day Platform Suspension</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveCancelLead(null)}
                className="flex-1 border text-gray-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={cancelSubmitting}
                onClick={handleConfirmCancellation}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-2.5 rounded-xl text-xs shadow cursor-pointer transition"
              >
                {cancelSubmitting ? 'Submitting...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP VERIFICATION MODAL */}
      {activeOtpLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <span className="text-3xl block">🪔</span>
            <h3 className="text-lg font-bold text-gray-900">Verify Ceremony Completion</h3>
            <p className="text-xs text-gray-500">
              Please enter the 4-digit completion code provided by Yajman <strong>{activeOtpLead.yajman_name}</strong>.
            </p>

            <input
              type="text"
              maxLength={4}
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              placeholder="e.g. 4821"
              className="w-full text-center font-mono text-2xl tracking-widest border-2 border-orange-400 rounded-2xl py-3 focus:outline-none focus:border-orange-600"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setActiveOtpLead(null);
                  setEnteredOtp('');
                }}
                className="flex-1 border text-gray-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyCompletionOtp}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs shadow cursor-pointer transition"
              >
                Confirm & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Edit Acharya Profile</h3>
            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Registered Phone Number</label>
                <input
                  type="text"
                  disabled
                  value={`+91 ${phone}`}
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-gray-100 text-gray-600 font-mono cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Base City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ritual Experience</label>
                <input
                  type="text"
                  value={editExp}
                  onChange={(e) => setEditExp(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vedic Bio & Specialization</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Settlement UPI ID</label>
                <input
                  type="text"
                  value={editUpi}
                  placeholder="e.g. 9876543210@upi"
                  onChange={(e) => setEditUpi(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 border text-gray-600 font-bold py-2.5 rounded-xl text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-sm shadow cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}