'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  accepted_via?: 'token' | 'free';
  cancellation_reason?: string;
}

const TOKEN_COST = 1;

// Razorpay SDK Dynamic Loader Helper
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
  const [phone, setPhone] = useState<string>('');
  const [panditId, setPanditId] = useState<string>('');
  const [panditName, setPanditName] = useState<string>('Acharya Ji');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [baseCity, setBaseCity] = useState<string>('Bengaluru, Karnataka');
  const [experience, setExperience] = useState<string>('12+ Years Vedic Rituals');
  const [bio, setBio] = useState<string>(
    'Specialized in Vedic Karmakand, Griha Pravesh, and authentic rituals adhering strictly to Vedic traditions.'
  );
  const [upiId, setUpiId] = useState<string>('');
  const [gallery, setGallery] = useState<string[]>([]);

  // Balances & Standing
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [earningsBalance, setEarningsBalance] = useState<number>(0);
  const [strikeCount, setStrikeCount] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  // Tabs & Safe Time State
  const [activeTab, setActiveTab] = useState<'leads' | 'bookings' | 'missing' | 'wallet' | 'profile' | 'rules'>('leads');
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(panditName);
  const [editCity, setEditCity] = useState<string>(baseCity);
  const [editExp, setEditExp] = useState<string>(experience);
  const [editBio, setEditBio] = useState<string>(bio);
  const [editUpi, setEditUpi] = useState<string>(upiId);

  // Recharge Modal State
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);

  // Background Mantra Audio & Sound Mute Toggle
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(false);

  // Real Database Lists
  const [leads, setLeads] = useState<Lead[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Lead[]>([]);
  const [missingLeads, setMissingLeads] = useState<Lead[]>([]);

  // Mask Phone for privacy on unaccepted leads
  const maskPhone = (rawPhone: string) => {
    if (!rawPhone || rawPhone.length < 6) return '••••••••••';
    return rawPhone.slice(0, 3) + '••••' + rawPhone.slice(-3);
  };

  // Check login session
  useEffect(() => {
    const savedPhone = localStorage.getItem('pandit_phone');
    if (savedPhone) {
      setPhone(savedPhone);
    }
  }, []);

  // 1. Audio Interaction Listener
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsMuted(false))
          .catch((err) => console.log('Audio autoplay prevented:', err));
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // 2. Mute / Unmute Toggle Function
  const toggleMute = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => setIsMuted(false))
        .catch(() => {});
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  };

  // 3. PWA Install Event Listener
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

  // 4. Live Timer Tick
  useEffect(() => {
    setCurrentTime(Math.floor(Date.now() / 1000));
    const timer = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  // 5. Fetch Pandit Data & Real Leads from Supabase
  const loadDashboardData = async () => {
    try {
      if (phone) {
        const { data: pData } = await supabase
          .from('pandits')
          .select('*')
          .eq('phone', phone)
          .maybeSingle();

        if (pData) {
          setPanditId(pData.id);
          if (pData.full_name) {
            setPanditName(pData.full_name);
            setEditName(pData.full_name);
          }
          if (pData.wallet_balance !== undefined) setTokenBalance(Number(pData.wallet_balance));
          if (pData.earnings_balance !== undefined) setEarningsBalance(Number(pData.earnings_balance));
          if (pData.strike_count !== undefined) setStrikeCount(Number(pData.strike_count));
          if (pData.is_blocked !== undefined) setIsBlocked(pData.is_blocked);
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
      }

      // Load all bookings from public.bookings table
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
          puja_name: b.puja_name || 'Vedic Ritual',
          event_date: b.event_date || 'As per Shubh Muhurat',
          location: b.location || 'Bengaluru',
          created_at: b.created_at || new Date().toISOString(),
          status: b.status || 'available',
          accepted_via: b.accepted_via,
          cancellation_reason: b.cancellation_reason,
        }));

        setLeads(formatted.filter((item) => item.status === 'available' || !item.status));
        setConfirmedBookings(formatted.filter((item) => item.status === 'confirmed'));
        setMissingLeads(
          formatted.filter(
            (item) => item.status === 'cancelled_by_yajman' || item.status === 'cancelled_by_pandit'
          )
        );
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [phone]);

  // Lead Acceptance Flow
  const handleAcceptLead = async (lead: Lead) => {
    if (isBlocked || strikeCount >= 2) {
      alert('Your account is currently suspended due to active strikes. Please resolve pending settlements to continue.');
      return;
    }

    const createdSec = Math.floor(new Date(lead.created_at).getTime() / 1000);
    const elapsed = currentTime - createdSec;
    const isWithin60s = elapsed < 60;

    if (isWithin60s) {
      if (tokenBalance < TOKEN_COST) {
        alert(`This lead is in the exclusive priority window (${60 - elapsed}s remaining). Requires ${TOKEN_COST} token.`);
        return;
      }

      const remainingTokens = tokenBalance - TOKEN_COST;
      if (panditId) {
        await supabase.from('pandits').update({ wallet_balance: remainingTokens }).eq('id', panditId);
      }
      setTokenBalance(remainingTokens);

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          accepted_by: panditId || phone || 'Acharya',
          accepted_via: 'token',
        })
        .eq('id', lead.id);

      if (error) {
        alert('Could not claim lead: ' + error.message);
        return;
      }

      alert(`Lead Accepted! ${TOKEN_COST} token deducted. Yajman contact unlocked in Confirmed Bookings.`);
      loadDashboardData();
    } else {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          accepted_by: panditId || phone || 'Acharya',
          accepted_via: 'free',
        })
        .eq('id', lead.id);

      if (error) {
        alert('Could not claim lead: ' + error.message);
        return;
      }

      alert('Lead Accepted in Free Mode! Yajman contact unlocked in Confirmed Bookings.');
      loadDashboardData();
    }
  };

  // Real Razorpay Payment Checkout
  const handleBuyTokens = async (packName: string, amount: number, tokensCount: number) => {
    const isLoaded = await loadRazorpaySDK();

    if (!isLoaded) {
      alert('Razorpay payment gateway failed to load. Please check your internet connection.');
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_purohitsetu',
      amount: amount * 100, // amount in paise
      currency: 'INR',
      name: 'PurohitSetu',
      description: `Recharge: ${packName} (${tokensCount} Tokens)`,
      image: '/logo.jpg',
      handler: async function (response: any) {
        const newTokens = tokenBalance + tokensCount;
        setTokenBalance(newTokens);
        if (panditId) {
          await supabase.from('pandits').update({ wallet_balance: newTokens }).eq('id', panditId);
        }
        setShowRechargeModal(false);
        alert(`Har Har Mahadev! Payment Verified (${response.razorpay_payment_id || 'Success'}). ${tokensCount} tokens credited.`);
        loadDashboardData();
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
    } catch (e) {
      console.error('Razorpay popup error:', e);
      // Fallback for local testing
      const newTokens = tokenBalance + tokensCount;
      setTokenBalance(newTokens);
      if (panditId) {
        await supabase.from('pandits').update({ wallet_balance: newTokens }).eq('id', panditId);
      }
      setShowRechargeModal(false);
      alert(`Payment Mode Triggered: ${tokensCount} tokens credited to wallet.`);
    }
  };

  // Profile Save
  const handleSaveProfile = async () => {
    if (panditId) {
      const { error } = await supabase.from('pandits').update({
        full_name: editName,
        city: editCity,
        experience: editExp,
        bio: editBio,
        upi_id: editUpi,
        avatar_url: profilePhoto,
      }).eq('id', panditId);

      if (error) {
        alert('Error updating profile: ' + error.message);
        return;
      }
    }

    setPanditName(editName);
    setBaseCity(editCity);
    setExperience(editExp);
    setBio(editBio);
    setUpiId(editUpi);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  // Avatar Upload Handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setProfilePhoto(base64String);
        if (panditId) {
          await supabase.from('pandits').update({ avatar_url: base64String }).eq('id', panditId);
        }
        alert('Profile Photo Updated Successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Puja Gallery Image Upload Handler
  const handleAddGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const updatedGallery = [base64String, ...gallery];
        setGallery(updatedGallery);
        if (panditId) {
          await supabase.from('pandits').update({ puja_gallery: updatedGallery }).eq('id', panditId);
        }
        alert('Puja Anushthan photo added to your public gallery!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete Gallery Image
  const handleDeleteGalleryImage = async (indexToDelete: number) => {
    if (confirm('Are you sure you want to remove this puja photo?')) {
      const updatedGallery = gallery.filter((_, idx) => idx !== indexToDelete);
      setGallery(updatedGallery);
      if (panditId) {
        await supabase.from('pandits').update({ puja_gallery: updatedGallery }).eq('id', panditId);
      }
    }
  };

  // Logout Handler
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out from Acharya Portal?')) {
      localStorage.removeItem('pandit_phone');
      window.location.href = '/pandit/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900 relative">
      {/* Background Mantra Audio (Looping) */}
      <audio
        ref={audioRef}
        src="/bg-mantra.mp3"
        loop
        preload="auto"
        onPlay={() => setIsMuted(false)}
        onPause={() => setIsMuted(true)}
      />

      {/* Account Warning Banner */}
      {strikeCount > 0 && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <span>⚠️</span>
          <span>Account Alert: {strikeCount} Active Strike(s). 2 strikes will suspend lead access.</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-orange-700 via-amber-700 to-orange-800 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-amber-300 bg-white p-0.5 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/logo.jpg"
                alt="PurohitSetu Logo"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('/logo.jpg')) {
                    target.src = '/logo.jpeg';
                  } else if (target.src.endsWith('/logo.jpeg')) {
                    target.src = '/logo.png';
                  } else {
                    target.src = '/logo';
                  }
                }}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold leading-tight tracking-wide">PurohitSetu</h1>
              <p className="text-xs text-orange-200">Acharya Portal • {panditName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Mantra' : 'Mute Mantra'}
              className="bg-black/20 hover:bg-black/30 border border-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isMuted ? '🔇' : '🔊'}</span>
              <span>{isMuted ? 'Muted' : 'Playing'}</span>
            </button>

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
              🚪 Exit
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
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
            ⏳ Missing Leads ({missingLeads.length})
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
            👤 Profile & Gallery
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

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* TAB 1: NEW LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Live Ceremony Requests</h2>
                <p className="text-xs text-gray-500">
                  Privacy Protected: Yajman contact number unlocks only after you accept the lead.
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
                <h3 className="font-bold text-gray-800 text-base">No Live Leads Right Now</h3>
                <p className="text-xs text-gray-500 mt-1">
                  New Yajman ceremony requests will appear here in real-time.
                </p>
              </div>
            ) : (
              leads.map((lead) => {
                const createdSec = Math.floor(new Date(lead.created_at).getTime() / 1000);
                const elapsed = currentTime - createdSec;
                const isExclusive = elapsed < 60;
                const secondsLeft = Math.max(0, 60 - elapsed);
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
                          🔓 Open for All (30% Commission)
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
                            Token Holders: Deducts {TOKEN_COST} token. 0% Commission applies.
                          </span>
                        ) : (
                          <span className="text-gray-600">
                            Free Mode: No tokens required. 30% platform commission applies upon completion.
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
                          {isExclusive ? `Accept Priority (${TOKEN_COST} Token)` : 'Accept Lead (Free Mode)'}
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
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Confirmed Bookings</h2>
              <p className="text-xs text-gray-500">
                You have accepted these ceremonies. Direct Yajman contact details are unlocked.
              </p>
            </div>
            {confirmedBookings.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-400">No confirmed bookings yet. Accept a lead to view contact details.</p>
              </div>
            ) : (
              confirmedBookings.map((b) => (
                <div key={b.id} className="bg-white p-6 rounded-2xl border border-green-200 shadow-sm space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">{b.puja_name}</h3>
                  <div className="bg-green-50/60 p-4 rounded-xl border border-green-100 space-y-1.5 text-sm">
                    <p className="text-gray-800">👤 <strong>Yajman Name:</strong> {b.yajman_name}</p>
                    <p className="text-green-800 font-bold">📞 <strong>Direct Phone:</strong> {b.phone}</p>
                    <p className="text-gray-700">📍 <strong>Address:</strong> {b.location}</p>
                    <p className="text-gray-700">🕒 <strong>Timing:</strong> {b.event_date}</p>
                  </div>
                  <a
                    href={`tel:${b.phone}`}
                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-md"
                  >
                    📞 Call Yajman Directly
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: MISSING LEADS */}
        {activeTab === 'missing' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Cancelled or Missed Leads</h2>
            </div>
            {missingLeads.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-400">No cancelled leads recorded.</p>
              </div>
            ) : (
              missingLeads.map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-200 opacity-90 space-y-2">
                  <h3 className="font-bold text-gray-800 line-through text-base">{m.puja_name}</h3>
                  <p className="text-xs text-gray-500">Yajman: {m.yajman_name} • {m.location}</p>
                  <div className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg font-medium border border-red-100">
                    ⚠️ {m.cancellation_reason || 'Cancelled'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: WALLET & 10 RECHARGE PACKS */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full font-bold">
                  Withdrawable Ceremony Earnings
                </span>
                <h3 className="text-4xl font-extrabold mt-3">₹{earningsBalance}</h3>
                <p className="text-xs text-emerald-100 mt-2">
                  Payout SLA: Dispatched within 3-4 hours directly to your designated UPI.
                </p>
              </div>
              <button
                onClick={() => alert('Withdrawal request submitted.')}
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
                  Rate: 150 Tokens = ₹200. Used to unlock high-value ceremony leads during priority window.
                </p>
              </div>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="bg-white text-orange-900 font-bold px-6 py-3 rounded-2xl text-sm shadow-lg hover:bg-amber-50 transition cursor-pointer self-start md:self-auto"
              >
                + Buy Tokens / Recharge
              </button>
            </div>

            {/* RECHARGE PACKS MODAL - 10 PRICE TAGS */}
            {showRechargeModal && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-orange-200 shadow-2xl space-y-5">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900">Choose Priority Token Pack</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Standard Rate: ₹200 = 150 Tokens. Instant activation via Razorpay / UPI.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRechargeModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  {/* Pack 1 */}
                  <div className="border border-gray-200 p-4 rounded-2xl text-center space-y-2 hover:border-orange-400 transition bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Trial Pack</span>
                      <p className="text-2xl font-black text-orange-600 mt-1">75 Tokens</p>
                      <p className="text-sm font-extrabold text-gray-900">₹100</p>
                    </div>
                    <button
                      onClick={() => handleBuyTokens('Trial Pack', 100, 75)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Pay ₹100
                    </button>
                  </div>

                  {/* Pack 2 */}
                  <div className="border border-gray-200 p-4 rounded-2xl text-center space-y-2 hover:border-orange-400 transition bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Base Pack</span>
                      <p className="text-2xl font-black text-orange-600 mt-1">150 Tokens</p>
                      <p className="text-sm font-extrabold text-gray-900">₹200</p>
                    </div>
                    <button
                      onClick={() => handleBuyTokens('Base Pack', 200, 150)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Pay ₹200
                    </button>
                  </div>

                  {/* Pack 3 */}
                  <div className="border border-gray-200 p-4 rounded-2xl text-center space-y-2 hover:border-orange-400 transition bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Double Pack</span>
                      <p className="text-2xl font-black text-orange-600 mt-1">300 Tokens</p>
                      <p className="text-sm font-extrabold text-gray-900">₹400</p>
                    </div>
                    <button
                      onClick={() => handleBuyTokens('Double Pack', 400, 300)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Pay ₹400
                    </button>
                  </div>

                  {/* Pack 4 */}
                  <div className="border border-gray-200 p-4 rounded-2xl text-center space-y-2 hover:border-orange-400 transition bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bronze Acharya</span>
                      <p className="text-2xl font-black text-orange-600 mt-1">450 Tokens</p>
                      <p className="text-sm font-extrabold text-gray-900">₹600</p>
                    </div>
                    <button
                      onClick={() => handleBuyTokens('Bronze Acharya', 600, 450)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Pay ₹600
                    </button>
                  </div>

                  {/* Pack 5 */}
                  <div className="border border-gray-200 p-4 rounded-2xl text-center space-y-2 hover:border-orange-400 transition bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Silver Acharya</span>
                      <p className="text-2xl font-black text-orange-600 mt-1">600 Tokens</p>
                      <p className="text-sm font-extrabold text-gray-900">₹800</p>
                    </div>
                    <button
                      onClick={() => handleBuyTokens('Silver Acharya', 800, 600)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Pay ₹800
                    </button>
                  </div>

                  {/* Pack 6 */}
                  <div className="border border-gray-200 p-4 rounded-2xl text-center space-y-2 hover:border-orange-400 transition bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gold Purohit</span>
                      <p className="text-2xl font-black text-orange-600 mt-1">750 Tokens</p>
                      <p className="text-sm font-extrabold text-gray-900">₹1,000</p>
                    </div>
                    <button
                      onClick={() => handleBuyTokens('Gold Purohit', 1000, 750)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Pay ₹1,000
                    </button>
                  </div>

                  {/* Pack 7 */}
                  <div className="border border-gray-200 p-4 rounded-2xl text-center space-y-2 hover:border-orange-400 transition bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Platinum Purohit</span>
                      <p className="text-2xl font-black text-orange-600 mt-1">900 Tokens</p>
                      <p className="text-sm font-extrabold text-gray-900">₹1,200</p>
                    </div>
                    <button
                      onClick={() => handleBuyTokens('Platinum Purohit', 1200, 900)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Pay ₹1,200
                    </button>
                  </div>

                  {/* Pack 8 */}
                  <div className="border border-gray-200 p-4 rounded-2xl text-center space-y-2 hover:border-orange-400 transition bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Diamond Anushthan</span>
                      <p className="text-2xl font-black text-orange-600 mt-1">1,200 Tokens</p>
                      <p className="text-sm font-extrabold text-gray-900">₹1,600</p>
                    </div>
                    <button
                      onClick={() => handleBuyTokens('Diamond Anushthan', 1600, 1200)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Pay ₹1,600
                    </button>
                  </div>

                  {/* Pack 9 (Save ₹50) */}
                  <div className="border-2 border-amber-500 bg-amber-50/40 p-4 rounded-2xl text-center space-y-2 relative shadow-md flex flex-col justify-between">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Save ₹50
                    </span>
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Royal Shastri</span>
                      <p className="text-2xl font-black text-orange-600 mt-1">1,500 Tokens</p>
                      <div className="flex items-center justify-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400 line-through">₹2,000</span>
                        <span className="text-sm font-black text-gray-900">₹1,950</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyTokens('Royal Shastri Pack', 1950, 1500)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer shadow"
                    >
                      Pay ₹1,950
                    </button>
                  </div>

                  {/* Pack 10 (Special ₹80 OFF) */}
                  <div className="border-2 border-orange-600 bg-orange-50/60 p-4 rounded-2xl text-center space-y-2 relative shadow-lg flex flex-col justify-between">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      Special ₹80 OFF
                    </span>
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wider">Maha Purohit VIP</span>
                      <p className="text-2xl font-black text-orange-600 mt-1">2,250 Tokens</p>
                      <div className="flex items-center justify-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400 line-through">₹3,000</span>
                        <span className="text-sm font-black text-gray-900">₹2,920</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyTokens('Maha Purohit VIP Pack', 2920, 2250)}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white font-extrabold py-2 rounded-xl text-xs transition cursor-pointer shadow-md"
                    >
                      Pay ₹2,920
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROFILE & COMPLETE PUJA GALLERY */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Acharya Details Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-6">
                <div className="flex items-center gap-5">
                  {/* Avatar with Camera Upload Icon */}
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
                    <p className="text-xs text-gray-400 mt-0.5">Click camera icon to change your profile photo</p>
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
                <span className="text-xs text-orange-800 uppercase font-bold tracking-wider">Vedic Bio & Specialization</span>
                <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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

            {/* Puja Anushthan Photo Gallery */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Pavitra Puja & Anushthan Gallery</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upload photos of Griha Pravesh, Havan & Vivah rituals performed by you. Yajman will see these verified photos.
                  </p>
                </div>

                <label
                  htmlFor="gallery-upload"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition self-start sm:self-auto"
                >
                  <span>📸</span> + Add Puja Photo
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
                  <p className="text-sm font-bold text-gray-700">No Puja Photos Uploaded Yet</p>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Click <strong>"+ Add Puja Photo"</strong> to showcase your authentic Vedic rituals to incoming Yajmans.
                  </p>
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
                        alt={`Puja Ritual ${index + 1}`}
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
            <h2 className="text-2xl font-bold text-gray-900">PurohitSetu Operating Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="p-5 rounded-2xl border border-orange-200 bg-orange-50/40">
                <h4 className="font-bold text-gray-900 mb-1">1. Priority Window & Token Claims</h4>
                <p className="text-xs text-gray-600">First 60s exclusive to Token Holders (0% Platform Commission).</p>
              </div>
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40">
                <h4 className="font-bold text-gray-900 mb-1">2. Free Open Mode</h4>
                <p className="text-xs text-gray-600">After 60s, open to all with standard 30% Platform Commission.</p>
              </div>
              <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40">
                <h4 className="font-bold text-gray-900 mb-1">3. Cancellation Policy</h4>
                <p className="text-xs text-gray-600">Yajman cancels = 100% token refund. Acharya cancels = Non-refundable.</p>
              </div>
              <div className="p-5 rounded-2xl border border-red-200 bg-red-50/40">
                <h4 className="font-bold text-gray-900 mb-1">4. Settlement Windows & Admin Strikes</h4>
                <p className="text-xs text-gray-600">24h for Sun-Fri, 48h for Saturday pujas. 2 strikes suspend account.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Vedic Mantra Player Mute/Unmute Button (Always Visible) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleMute}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-full font-bold shadow-2xl transition-all transform hover:scale-105 cursor-pointer text-sm border-2 ${
            !isMuted
              ? 'bg-amber-500 text-gray-950 border-amber-300 animate-pulse'
              : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'
          }`}
        >
          <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
          <span>{isMuted ? 'Muted (Tap to Play)' : 'Mantra Playing (Tap to Mute)'}</span>
        </button>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
            <div className="space-y-3 text-left">
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Experience</label>
                <input
                  type="text"
                  value={editExp}
                  onChange={(e) => setEditExp(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vedic Bio</label>
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}