'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

declare global {
  interface Window {
    Razorpay: any;
    Capacitor?: any;
    OneSignalDeferred?: any[];
  }
}

interface Lead {
  id: string | number;
  yajman_name: string;
  phone: string;
  puja_name: string;
  puja_date: string;
  puja_time: string;
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
  samagri?: boolean;
}

type TabId = 'leads' | 'bookings' | 'missing' | 'wallet' | 'profile' | 'rules';

const TOKEN_COST = 150;
const PRIORITY_WINDOW_SECONDS = 60;
const COMMISSION_PERCENT = 30;

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

const YAJMAN_CANCEL_REASONS = [
  'Yajman cancelled / changed mind',
  'Family out of town / postponed',
  'Puja arranged locally / already conducted',
  'Yajman unreachable / phone switched off',
  'Other Yajman side reason',
];

const PANDIT_CANCEL_REASONS = [
  'Acharya emergency / health issue',
  'Date and time clash with another ceremony',
  'Travel distance / transport unavailable',
  'Dakshina / Samagri misalignment',
  'Other Acharya reason',
];

const cleanPhone = (value: string) => (value || '').replace(/\D/g, '').slice(-10);

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const readSavedPhone = (): string => {
  if (typeof window === 'undefined') return '';
  const saved = localStorage.getItem('pandit_phone') || getCookie('pandit_phone') || '';
  return cleanPhone(saved);
};

const saveSession = (phone: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pandit_phone', phone);
  localStorage.setItem('pandit_logged_in', 'true');
  document.cookie = `pandit_phone=${phone}; path=/; max-age=31536000; SameSite=Lax`;
};

const clearSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('pandit_phone');
  localStorage.removeItem('pandit_logged_in');
  document.cookie = 'pandit_phone=; path=/; max-age=0;';
};

const isNativeApp = (): boolean =>
  typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();

const maskPhone = (raw: string) => {
  if (!raw || raw.length < 6) return '••••••••••';
  return raw.slice(0, 3) + '••••' + raw.slice(-3);
};

const loadRazorpaySDK = (): Promise<boolean> =>
  new Promise((resolve) => {
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

const fileToCompressedDataUrl = (file: File, maxSize = 600, quality = 0.7): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File reading failed.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image failed to open.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

export default function PanditDashboardPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [panditId, setPanditId] = useState('');
  const [panditName, setPanditName] = useState('Acharya');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [baseCity, setBaseCity] = useState('Bengaluru, Karnataka');
  const [experience, setExperience] = useState('12+ Years Vedic Rituals');
  const [bio, setBio] = useState(
    'Specialized in Vedic Karmakand, Griha Pravesh, and authentic ceremonies adhering strictly to Vedic traditions.'
  );
  const [upiId, setUpiId] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);

  const [tokenBalance, setTokenBalance] = useState(0);
  const [earningsBalance, setEarningsBalance] = useState(0);
  const [strikeCount, setStrikeCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('leads');
  const [currentTime, setCurrentTime] = useState(0);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [notifPermissionState, setNotifPermissionState] = useState('default');

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editExp, setEditExp] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editUpi, setEditUpi] = useState('');

  const [activeOtpLead, setActiveOtpLead] = useState<Lead | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [resendingId, setResendingId] = useState<string | number | null>(null);

  const [activeCancelLead, setActiveCancelLead] = useState<Lead | null>(null);
  const [cancelBy, setCancelBy] = useState<'yajman' | 'pandit'>('yajman');
  const [cancelReasonPreset, setCancelReasonPreset] = useState(YAJMAN_CANCEL_REASONS[0]);
  const [cancelCustomReason, setCancelCustomReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Lead[]>([]);
  const [missingLeads, setMissingLeads] = useState<Lead[]>([]);

  /* ---------------- OneSignal Notification Setup ---------------- */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setNotifPermissionState(Notification.permission);
      }

      window.OneSignalDeferred = window.OneSignalDeferred || [];

      if (!document.getElementById('onesignal-sdk-script')) {
        const script = document.createElement('script');
        script.id = 'onesignal-sdk-script';
        script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.defer = true;
        document.head.appendChild(script);
      }

      window.OneSignalDeferred.push(async function (OneSignal: any) {
        try {
          await OneSignal.init({
            appId: 'dcdfe5c2-7b44-42a9-a049-ac65061449be',
            safari_web_id: '',
            notifyButton: { enable: false },
            allowLocalhostAsSecureOrigin: true,
          });

          await OneSignal.User.addTag('user_role', 'acharya');
        } catch (e) {
          console.error('OneSignal initialization error:', e);
        }
      });
    }
  }, []);

  const handleManualNotificationPermission = async () => {
    if (typeof window !== 'undefined') {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal: any) {
        try {
          await OneSignal.Notifications.requestPermission();
          if ('Notification' in window) {
            setNotifPermissionState(Notification.permission);
          }
        } catch (err) {
          console.error('Permission request failed:', err);
        }
      });
    }
  };

  /* ---------------- Session Guard ---------------- */
  useEffect(() => {
    const saved = readSavedPhone();
    if (!saved) {
      router.replace('/pandit/login');
      return;
    }
    setPhone(saved);
    saveSession(saved);
  }, [router]);

  /* ---------------- PWA Prompt ---------------- */
  useEffect(() => {
    if (isNativeApp()) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallBtn(false);
    setDeferredPrompt(null);
  };

  /* ---------------- Timer Sync ---------------- */
  useEffect(() => {
    setCurrentTime(Math.floor(Date.now() / 1000));
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const secondsLeftFor = (lead: Lead) => {
    if (!lead.created_at) return 0;
    const createdMs = new Date(lead.created_at).getTime();
    if (isNaN(createdMs)) return 0;

    const nowMs = currentTime ? currentTime * 1000 : Date.now();
    const elapsedSeconds = Math.floor((nowMs - createdMs) / 1000);

    if (elapsedSeconds >= PRIORITY_WINDOW_SECONDS || elapsedSeconds < 0) {
      return 0;
    }
    return PRIORITY_WINDOW_SECONDS - elapsedSeconds;
  };

  /* ---------------- Data Loader ---------------- */
  const loadDashboardData = useCallback(async () => {
    try {
      const myPhone = phone || readSavedPhone();
      if (!myPhone) return;

      const { data: pData } = await supabase
        .from('pandits')
        .select('*')
        .eq('phone', myPhone)
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
        if (Array.isArray(pData.puja_gallery)) setGallery(pData.puja_gallery);
      }

      const { data: allBookings, error: bError } = await supabase
        .from('bookings')
        .select('*')
        .order('id', { ascending: false })
        .limit(300);

      if (bError || !allBookings) return;

      const formatted: Lead[] = allBookings.map((b: any) => {
        const pDate = b.date || b.event_date || b.puja_date || 'Shubh Muhurat';
        const pTime = b.time_slot || b.time || b.muhurat_time || 'Shubh Muhurat Slot';
        const pLocation = b.area
          ? `${b.area}${b.pincode ? `, ${b.pincode}` : ''}, Bengaluru`
          : (b.location || b.address || 'Bengaluru');

        return {
          id: b.id,
          yajman_name: b.name || b.yajman_name || 'Yajman',
          phone: b.phone || '',
          puja_name: b.puja_name || 'Vedic Ceremony',
          puja_date: pDate,
          puja_time: pTime,
          location: pLocation,
          created_at: b.created_at || new Date().toISOString(),
          status: (b.status || 'available').toLowerCase(),
          accepted_via: b.accepted_via,
          accepted_by: b.accepted_by,
          assigned_to_phone: b.assigned_to_phone,
          completion_otp: b.completion_otp,
          cancellation_reason: b.cancellation_reason,
          cancelled_by: b.cancelled_by,
          refund_status: b.refund_status,
          samagri: b.samagri,
        };
      });

      const isMine = (item: Lead) =>
        item.accepted_by === myPhone || item.assigned_to_phone === myPhone;

      setLeads(
        formatted.filter(
          (item) => item.status === 'available' || item.status === 'pending'
        )
      );

      setConfirmedBookings(
        formatted.filter(
          (item) => (item.status === 'confirmed' || item.status === 'in_progress') && isMine(item)
        )
      );

      setMissingLeads(
        formatted.filter((item) => {
          const claimedByOther =
            ['confirmed', 'in_progress', 'completed'].includes(item.status) && !isMine(item);
          const cancelled = [
            'cancelled_by_yajman',
            'cancelled_by_pandit',
            'cancellation_under_review',
            'cancelled',
          ].includes(item.status);
          return claimedByOther || cancelled;
        })
      );
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    }
  }, [phone]);

  useEffect(() => {
    if (phone) loadDashboardData();
  }, [phone, loadDashboardData]);

  /* ---------------- Claiming ---------------- */
  const claimLead = async (lead: Lead, via: 'token' | 'free'): Promise<boolean> => {
    const { data: currentLead } = await supabase
      .from('bookings')
      .select('status, accepted_by, completion_otp')
      .eq('id', lead.id)
      .maybeSingle();

    if (currentLead && currentLead.accepted_by && currentLead.accepted_by !== phone) {
      alert('This ceremony has already been claimed by another Acharya.');
      await loadDashboardData();
      return false;
    }

    const completionOtp = currentLead?.completion_otp || Math.floor(1000 + Math.random() * 9000).toString();

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        accepted_by: phone,
        accepted_via: via,
        completion_otp: completionOtp,
      })
      .eq('id', lead.id)
      .select();

    if (error) {
      alert('Failed to claim lead: ' + error.message);
      return false;
    }

    if (!data || data.length === 0) {
      alert('Update blocked. Please check your Supabase Row-Level Security policies.');
      return false;
    }

    return true;
  };

  const handleAcceptLead = async (lead: Lead) => {
    if (!phone) return;

    if (isBlocked || strikeCount >= 2) {
      alert('Your account is currently suspended due to active strikes. Please reach out to support.');
      return;
    }

    const secondsLeft = secondsLeftFor(lead);
    const inPriorityWindow = secondsLeft > 0;

    if (inPriorityWindow) {
      if (tokenBalance < TOKEN_COST) {
        alert(
          `This ceremony is inside the priority window (${secondsLeft}s remaining) and requires ${TOKEN_COST} tokens.`
        );
        return;
      }

      const claimed = await claimLead(lead, 'token');
      if (!claimed) return;

      const remaining = tokenBalance - TOKEN_COST;
      await supabase.from('pandits').update({ wallet_balance: remaining }).eq('phone', phone);
      setTokenBalance(remaining);

      alert(`Ceremony claimed successfully! ${TOKEN_COST} priority tokens deducted.`);
    } else {
      const claimed = await claimLead(lead, 'free');
      if (!claimed) return;

      alert(`Ceremony claimed in Open Mode! A ${COMMISSION_PERCENT}% platform fee applies upon completion.`);
    }

    await loadDashboardData();
    setActiveTab('bookings');
  };

  /* ---------------- Direct WhatsApp OTP Dispatch ---------------- */
  const handleSendWhatsAppOtp = async (booking: Lead) => {
    if (resendingId === booking.id) return;
    setResendingId(booking.id);

    try {
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

      // Database me naya OTP save karein
      const { error } = await supabase
        .from('bookings')
        .update({ completion_otp: newOtp })
        .eq('id', booking.id);

      if (error) {
        alert('Failed to update verification code: ' + error.message);
        return;
      }

      // WhatsApp URL prepare karein
      const cleanNum = cleanPhone(booking.phone);
      const text = `🚩 Pranam ${booking.yajman_name || 'Yajman'}, your PurohitSetu completion verification code for ${booking.puja_name || 'Puja'} is: [ ${newOtp} ]. Please share this code with Acharya Ji only after ritual completion.`;
      const waUrl = `https://wa.me/91${cleanNum}?text=${encodeURIComponent(text)}`;

      window.open(waUrl, '_blank');

      alert(`Success! 4-digit code generated and WhatsApp opened for ${booking.yajman_name}.`);
      await loadDashboardData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setResendingId(null);
    }
  };

  /* ---------------- Verify Completion OTP ---------------- */
  const handleVerifyCompletionOtp = async () => {
    if (!activeOtpLead) return;

    const code = enteredOtp.trim();
    if (!code) {
      alert('Please enter the 4-digit verification code.');
      return;
    }
    if (activeOtpLead.completion_otp && code !== activeOtpLead.completion_otp) {
      alert('Invalid verification code. Please confirm the code with Yajman.');
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', activeOtpLead.id);

    if (error) {
      alert('Status update failed: ' + error.message);
      return;
    }

    alert('Ceremony verified and marked as completed successfully.');
    setActiveOtpLead(null);
    setEnteredOtp('');
    await loadDashboardData();
  };

  /* ---------------- Cancellation ---------------- */
  const openCancelModal = (lead: Lead) => {
    setActiveCancelLead(lead);
    setCancelBy('yajman');
    setCancelReasonPreset(YAJMAN_CANCEL_REASONS[0]);
    setCancelCustomReason('');
  };

  const chooseCancelSide = (side: 'yajman' | 'pandit') => {
    setCancelBy(side);
    setCancelReasonPreset(side === 'yajman' ? YAJMAN_CANCEL_REASONS[0] : PANDIT_CANCEL_REASONS[0]);
  };

  const handleConfirmCancellation = async () => {
    if (!activeCancelLead) return;

    const custom = cancelCustomReason.trim();
    const finalReason = custom ? `${cancelReasonPreset}: ${custom}` : cancelReasonPreset;
    const isPriorityClaim = activeCancelLead.accepted_via === 'token';

    let refundStatus = 'No Refund Applicable (Pandit Initiated)';
    if (cancelBy === 'yajman') {
      refundStatus = isPriorityClaim
        ? `Pending Admin Verification (Eligible for +${TOKEN_COST} Token Refund)`
        : 'Pending Admin Verification (0 Refund - Claimed via Free Mode)';
    }

    setCancelSubmitting(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancellation_under_review',
          cancelled_by: cancelBy,
          cancellation_reason: finalReason,
          refund_status: refundStatus,
        })
        .eq('id', activeCancelLead.id);

      if (error) {
        alert('Failed to report cancellation: ' + error.message);
        return;
      }

      alert('Cancellation reported successfully.');
      setActiveCancelLead(null);
      setCancelCustomReason('');
      await loadDashboardData();
      setActiveTab('missing');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setCancelSubmitting(false);
    }
  };

  /* ---------------- Payments ---------------- */
  const handleBuyTokens = async (packName: string, amount: number, tokensCount: number) => {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert('Payment configuration is unavailable. Please reach out to support.');
      return;
    }

    const sdkLoaded = await loadRazorpaySDK();
    if (!sdkLoaded) {
      alert('Payment gateway failed to load. Please check your network connection.');
      return;
    }

    const options = {
      key: razorpayKey,
      amount: amount * 100,
      currency: 'INR',
      name: 'PurohitSetu',
      description: `Recharge: ${packName} (${tokensCount} Tokens)`,
      image: '/pandit-logo.png',
      handler: async (response: any) => {
        const paymentId = response?.razorpay_payment_id || 'RZP_SUCCESS';
        const { data: fresh } = await supabase
          .from('pandits')
          .select('wallet_balance')
          .eq('phone', phone)
          .maybeSingle();

        const currentBalance = Number(fresh?.wallet_balance ?? tokenBalance);
        const newBalance = currentBalance + tokensCount;

        await supabase.from('pandits').update({ wallet_balance: newBalance }).eq('phone', phone);
        await supabase.from('token_transactions').insert({
          pandit_id: panditId || phone || 'unknown',
          pandit_phone: phone || 'unknown',
          pandit_name: panditName || 'Acharya',
          pack_name: packName,
          amount,
          tokens_credited: tokensCount,
          razorpay_payment_id: paymentId,
        });

        setTokenBalance(newBalance);
        setShowRechargeModal(false);
        alert(`Payment Verified (${paymentId}). ${tokensCount} tokens added to your wallet.`);
        await loadDashboardData();
      },
      prefill: { name: panditName, contact: phone },
      theme: { color: '#c2410c' },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert('The payment dialog could not be opened.');
    }
  };

  const handleRequestPayout = async () => {
    if (earningsBalance <= 0) {
      alert('No withdrawable earnings are available right now.');
      return;
    }
    if (!upiId) {
      alert('Please configure your Settlement UPI ID in your Profile tab first.');
      setActiveTab('profile');
      return;
    }
    if (!confirm(`Request payout of ₹${earningsBalance} to UPI ID: ${upiId}?`)) return;

    try {
      const { error } = await supabase.from('withdrawals').insert({
        pandit_id: panditId || 'unknown',
        pandit_name: panditName || 'Acharya',
        pandit_phone: phone || 'unknown',
        upi_id: upiId,
        amount: earningsBalance,
        status: 'pending',
      });

      if (error) alert('Could not submit payout request: ' + error.message);
      else alert(`Payout request for ₹${earningsBalance} submitted successfully.`);
    } catch (err: any) {
      alert('Payout error: ' + err.message);
    }
  };

  /* ---------------- Profile ---------------- */
  const handleSaveProfile = async () => {
    if (!phone) return;

    const { error } = await supabase
      .from('pandits')
      .update({
        full_name: editName,
        city: editCity,
        experience: editExp,
        bio: editBio,
        upi_id: editUpi,
      })
      .eq('phone', phone);

    if (error) {
      alert('Failed to save profile changes: ' + error.message);
      return;
    }

    setPanditName(editName);
    setBaseCity(editCity);
    setExperience(editExp);
    setBio(editBio);
    setUpiId(editUpi);
    setIsEditing(false);
    alert('Profile saved successfully.');
    await loadDashboardData();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !phone) return;

    try {
      const dataUrl = await fileToCompressedDataUrl(file, 500, 0.7);
      const { error } = await supabase.from('pandits').update({ avatar_url: dataUrl }).eq('phone', phone);
      if (error) {
        alert('Could not update avatar: ' + error.message);
        return;
      }
      setProfilePhoto(dataUrl);
      alert('Profile photo updated successfully.');
    } catch (err: any) {
      alert('Avatar upload failed: ' + err.message);
    }
  };

  const handleAddGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !phone) return;

    try {
      const dataUrl = await fileToCompressedDataUrl(file, 800, 0.7);
      const updatedGallery = [dataUrl, ...gallery];
      const { error } = await supabase.from('pandits').update({ puja_gallery: updatedGallery }).eq('phone', phone);
      if (error) {
        alert('Failed to add portfolio picture: ' + error.message);
        return;
      }
      setGallery(updatedGallery);
      alert('Ceremony photo added to your public portfolio.');
    } catch (err: any) {
      alert('Portfolio upload failed: ' + err.message);
    }
  };

  const handleDeleteGalleryImage = async (indexToDelete: number) => {
    if (!confirm('Are you sure you want to remove this photo from your portfolio?')) return;

    const updatedGallery = gallery.filter((_, idx) => idx !== indexToDelete);
    await supabase.from('pandits').update({ puja_gallery: updatedGallery }).eq('phone', phone);
    setGallery(updatedGallery);
  };

  const handleLogout = () => {
    if (!confirm('Are you sure you want to sign out from the Acharya Portal?')) return;
    clearSession();
    router.replace('/pandit/login');
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'leads', label: `🌟 New Leads (${leads.length})` },
    { id: 'bookings', label: `📅 Bookings (${confirmedBookings.length})` },
    { id: 'missing', label: `⏳ Missing (${missingLeads.length})` },
    { id: 'wallet', label: '🪙 Wallet' },
    { id: 'profile', label: '👤 Profile' },
    { id: 'rules', label: '📜 Rules' },
  ];

  return (
    <div className="min-h-screen w-full max-w-full bg-gray-50 pb-24 font-sans text-gray-900 overflow-x-hidden">
      {strikeCount > 0 && (
        <div className="bg-red-600 text-white px-3 py-2 text-center text-xs font-semibold flex items-center justify-center gap-1.5">
          <span>⚠️ Warning: {strikeCount} Strike(s) Active. Two strikes suspend lead access.</span>
        </div>
      )}

      {/* HEADER */}
      <header className="w-full bg-gradient-to-r from-orange-700 via-amber-700 to-orange-800 text-white shadow-md sticky top-0 z-30">
        <div className="w-full max-w-6xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-300 bg-white p-0.5 shrink-0 flex items-center justify-center">
              <img src="/pandit-logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold leading-none truncate">PurohitSetu</h1>
              <p className="text-[10px] sm:text-xs text-orange-200 truncate mt-0.5">{panditName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {notifPermissionState !== 'granted' && (
              <button
                onClick={handleManualNotificationPermission}
                className="bg-amber-400 hover:bg-amber-300 text-gray-950 px-2 py-1 rounded-lg text-[10px] font-extrabold shadow animate-pulse flex items-center gap-1"
                title="Enable Push Notifications"
              >
                <span>🔔</span> Allow Alerts
              </button>
            )}
            {showInstallBtn && (
              <button
                onClick={handleInstallApp}
                className="bg-amber-400 text-gray-950 px-2 py-1 rounded-lg text-[10px] font-bold shadow animate-pulse"
              >
                📲 App
              </button>
            )}
            <button
              onClick={() => setActiveTab('wallet')}
              className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1"
            >
              <span>🪙</span>
              <span>{tokenBalance}</span>
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className="bg-emerald-600 text-white px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm"
            >
              <span>₹</span>
              <span>{earningsBalance}</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-700/80 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-[11px] font-semibold transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="w-full bg-black/25 border-t border-white/10 px-3 py-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-orange-900 shadow-sm'
                  : 'text-orange-100 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-5xl mx-auto p-3 sm:p-5 space-y-4">
        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">Live Requests</h2>
                <p className="text-[11px] text-gray-500">Contact details unlock upon claiming</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadDashboardData}
                  className="text-xs bg-orange-50 text-orange-700 border border-orange-200 font-bold px-2.5 py-1 rounded-lg"
                >
                  🔄 Refresh
                </button>
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  {leads.length}
                </span>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-3xl block mb-2">🪔</span>
                <h3 className="font-bold text-gray-800 text-sm">No Live Ceremonies Right Now</h3>
                <p className="text-xs text-gray-400 mt-1">New ceremony requests will appear here in real time.</p>
              </div>
            ) : (
              leads.map((lead) => {
                const secondsLeft = secondsLeftFor(lead);
                const isExclusive = secondsLeft > 0;
                const hasTokens = tokenBalance >= TOKEN_COST;

                return (
                  <div key={lead.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{lead.puja_name}</h3>
                        <p className="text-xs text-gray-500">Yajman: {lead.yajman_name}</p>
                      </div>
                      {isExclusive ? (
                        <span className="bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 animate-pulse">
                          ⏳ {secondsLeft}s left
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-1 rounded-lg shrink-0">
                          🔓 Free Mode Unlocked
                        </span>
                      )}
                    </div>

                    <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-100 text-xs space-y-1">
                      <p className="text-gray-700">📍 <strong>Location:</strong> {lead.location}</p>
                      <p className="text-gray-700">📅 <strong>Puja Date:</strong> {lead.puja_date}</p>
                      <p className="text-gray-700">⏰ <strong>Time Slot:</strong> {lead.puja_time}</p>
                      {lead.samagri && (
                        <p className="text-orange-800 font-bold">🌿 <strong>Samagri:</strong> Complete Hawan & Samagri Kit Included</p>
                      )}
                      <p className="text-gray-500">🔒 <strong>Phone:</strong> {maskPhone(lead.phone)}</p>
                    </div>

                    <div className="pt-1">
                      {isExclusive ? (
                        !hasTokens ? (
                          <button
                            disabled
                            className="w-full bg-gray-100 text-gray-400 font-bold py-2.5 rounded-xl text-xs border border-gray-200"
                          >
                            Locked ({secondsLeft}s) • Requires {TOKEN_COST} Tokens
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAcceptLead(lead)}
                            className="w-full font-bold py-2.5 rounded-xl text-xs shadow transition text-white bg-orange-600 hover:bg-orange-700"
                          >
                            Claim Priority ({TOKEN_COST} Tokens)
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handleAcceptLead(lead)}
                          className="w-full font-bold py-2.5 rounded-xl text-xs shadow transition text-white bg-emerald-600 hover:bg-emerald-700"
                        >
                          🎉 Claim Ceremony (Free Mode)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* BOOKINGS TAB (ZERO OTP ON CARD - WHATSAPP OTP BUTTON WIRED) */}
        {activeTab === 'bookings' && (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Confirmed Bookings</h2>
                <p className="text-[11px] text-gray-500">Contact Yajman & verify Completion Code after ritual</p>
              </div>
              <button
                onClick={loadDashboardData}
                className="text-xs bg-orange-50 text-orange-700 border border-orange-200 font-bold px-2.5 py-1 rounded-lg"
              >
                🔄 Refresh
              </button>
            </div>

            {confirmedBookings.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400">No active confirmed bookings found.</p>
              </div>
            ) : (
              confirmedBookings.map((b) => (
                <div key={b.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-green-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{b.puja_name}</h3>
                      <span className="text-[11px] text-gray-500">
                        {b.accepted_via === 'token' ? 'Priority (0% commission)' : `Open (${COMMISSION_PERCENT}% platform fee)`}
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-50/70 p-3 rounded-xl border border-green-100 text-xs space-y-1">
                    <p className="text-gray-800">👤 <strong>Yajman:</strong> {b.yajman_name}</p>
                    <p className="text-green-800 font-bold">📞 <strong>Direct:</strong> {b.phone}</p>
                    <p className="text-gray-700">📍 <strong>Address:</strong> {b.location}</p>
                    <p className="text-gray-700">📅 <strong>Puja Date:</strong> {b.puja_date}</p>
                    <p className="text-gray-700">⏰ <strong>Time Slot:</strong> {b.puja_time}</p>
                    {b.samagri && (
                      <p className="text-emerald-900 font-bold">🌿 <strong>Samagri:</strong> Complete Hawan & Samagri Kit Included</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`tel:${b.phone}`}
                      className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm"
                    >
                      📞 Call
                    </a>
                    
                    {/* DIRECT WHATSAPP OTP BUTTON */}
                    <button
                      onClick={() => handleSendWhatsAppOtp(b)}
                      disabled={resendingId === b.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
                    >
                      {resendingId === b.id ? 'Opening...' : '📲 WhatsApp OTP'}
                    </button>

                    <button
                      onClick={() => setActiveOtpLead(b)}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm"
                    >
                      ✓ Complete
                    </button>
                    
                    <button
                      onClick={() => openCancelModal(b)}
                      className="text-xs bg-red-50 text-red-700 border border-red-200 font-bold py-2.5 px-3 rounded-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MISSING & CANCELLED */}
        {activeTab === 'missing' && (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Cancelled / Missed Leads</h2>
              <button
                onClick={loadDashboardData}
                className="text-xs bg-orange-50 text-orange-700 border border-orange-200 font-bold px-2.5 py-1 rounded-lg"
              >
                🔄 Refresh
              </button>
            </div>

            {missingLeads.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400">No cancelled or missed ceremonies recorded.</p>
              </div>
            ) : (
              missingLeads.map((m) => (
                <div key={m.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">{m.puja_name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      {m.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Yajman: {m.yajman_name} • {m.location}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-600 to-green-800 text-white p-5 rounded-2xl shadow flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                  Total Earnings
                </span>
                <h3 className="text-3xl font-extrabold mt-1">₹{earningsBalance}</h3>
                <p className="text-[10px] text-emerald-100 mt-1">Direct Settlement via UPI</p>
              </div>
              <button
                onClick={handleRequestPayout}
                className="bg-white text-emerald-900 font-bold px-4 py-2 rounded-xl text-xs shadow hover:bg-emerald-50"
              >
                Request Payout
              </button>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                  Remaining Tokens
                </span>
                <h3 className="text-3xl font-extrabold mt-1">🪙 {tokenBalance}</h3>
                <p className="text-[10px] text-amber-100 mt-1">150 Tokens = 1 Priority Ceremony</p>
              </div>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="bg-white text-orange-900 font-bold px-4 py-2 rounded-xl text-xs shadow hover:bg-amber-50"
              >
                + Buy Tokens
              </button>
            </div>

            {showRechargeModal && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-orange-200 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-base font-bold text-gray-900">Select Token Package</h3>
                  <button onClick={() => setShowRechargeModal(false)} className="text-gray-400 font-bold p-1">
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto p-1">
                  {TOKEN_PACKS.map((pack) => (
                    <div
                      key={pack.name}
                      className="p-3 rounded-xl border border-gray-200 text-center space-y-1.5 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 block truncate">{pack.name}</span>
                        <p className="text-base font-extrabold text-orange-600">{pack.tokens} Tokens</p>
                        <p className="text-xs font-bold text-gray-900">₹{pack.amount}</p>
                      </div>
                      <button
                        onClick={() => handleBuyTokens(pack.name, pack.amount, pack.tokens)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5 rounded-lg text-xs"
                      >
                        Pay ₹{pack.amount}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-400 bg-orange-50 flex items-center justify-center">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt={panditName}
                          className="w-full h-full object-cover"
                          onError={() => setProfilePhoto('')}
                        />
                      ) : (
                        <span className="text-2xl">🕉️</span>
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-orange-600 text-white p-1 rounded-full cursor-pointer shadow text-xs"
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
                    <h3 className="text-base font-bold text-gray-900">{panditName}</h3>
                    <p className="text-xs text-green-700 font-semibold">✓ Verified Vedic Acharya</p>
                    <p className="text-[11px] text-gray-500 font-mono">+91 {phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-100 text-orange-800 font-bold px-3 py-1.5 rounded-xl text-xs"
                >
                  ✏️ Edit
                </button>
              </div>

              <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100 text-xs">
                <span className="text-[10px] text-orange-800 font-bold uppercase block mb-0.5">Bio</span>
                <p className="text-gray-700 leading-relaxed">{bio}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-xl border">
                  <span className="text-[10px] text-gray-400 font-bold block">Base City</span>
                  <span className="font-bold text-gray-800">{baseCity}</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl border">
                  <span className="text-[10px] text-gray-400 font-bold block">Experience</span>
                  <span className="font-bold text-gray-800">{experience}</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 col-span-2">
                  <span className="text-[10px] text-emerald-700 font-bold block">Settlement UPI ID</span>
                  <span className="font-bold text-emerald-900">{upiId || 'Not Configured'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <a
                  href="/pandit/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-gray-800 underline underline-offset-4"
                >
                  Privacy Policy
                </a>
                <a
                  href="/delete-account"
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-600 hover:text-red-700 font-semibold underline underline-offset-4"
                >
                  Delete Account
                </a>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-gray-900">Rituals Gallery</h3>
                <label
                  htmlFor="gallery-upload"
                  className="bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                >
                  📸 + Add Photo
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
                <div className="p-6 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                  No photos added yet.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((imgUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900">
                      <img
                        src={imgUrl}
                        alt="Ceremony"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <button
                        onClick={() => handleDeleteGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-[10px]"
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

        {/* RULES TAB */}
        {activeTab === 'rules' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Platform Rules & Policies</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Acharya Code of Conduct, Lead Allocation & Service Guidelines</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                <h3 className="text-xs font-bold text-amber-950">1. Priority Window & Token Claims</h3>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  The initial 60 seconds are reserved exclusively for Token holders with 0% platform commission.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <h3 className="text-xs font-bold text-emerald-950">2. Open Access Mode</h3>
                <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                  After 60 seconds, the ceremony becomes accessible to all verified Acharyas with a 30% platform service fee upon completion.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                <h3 className="text-xs font-bold text-blue-950">3. Verification OTP</h3>
                <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                  Upon finishing the ritual, collect the 4-digit completion code directly from the Yajman to verify and close out the ceremony.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50">
                <h3 className="text-xs font-bold text-purple-950">4. Settlement Windows & Account Strikes</h3>
                <p className="text-xs text-purple-900 mt-1 leading-relaxed">
                  Earnings settlements are cleared within 24 hours (48 hours on weekends). Accumulating 2 active strikes temporarily suspends lead allocation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
                <h3 className="text-xs font-bold text-rose-950">5. Cancellation, Token Refunds & Anti-Fraud Policy</h3>
                <ul className="text-xs text-rose-900 mt-1.5 space-y-1 list-disc list-inside leading-relaxed">
                  <li><strong>Priority Lead Cancellation:</strong> If a token-claimed lead is cancelled by the Yajman, 150 priority tokens are credited back to the wallet upon admin review.</li>
                  <li><strong>Free Mode Cancellation:</strong> Ceremonies claimed under Open Free Mode do not carry token refund eligibility.</li>
                  <li><strong>Acharya Cancellation:</strong> Cancellations initiated from the Acharya side due to scheduling clashes or delays are non-refundable.</li>
                  <li><strong>False Reporting Penalty:</strong> Incorrect cancellation submissions will lead to an immediate 7-day account suspension.</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
              <a
                href="/pandit/terms"
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-gray-900 underline underline-offset-4"
              >
                Pandit Partner Terms & Operating Policy
              </a>
              <a
                href="/delete-account"
                target="_blank"
                rel="noreferrer"
                className="text-rose-600 hover:text-rose-700 underline underline-offset-4"
              >
                Request Account Deletion
              </a>
            </div>
          </div>
        )}
      </main>

      {/* CANCELLATION MODAL */}
      {activeCancelLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-gray-900">Cancel Ceremony</h3>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {(['yajman', 'pandit'] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => chooseCancelSide(side)}
                    className={`p-2 rounded-xl border font-bold ${
                      cancelBy === side
                        ? 'border-orange-600 bg-orange-50 text-orange-900'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {side === 'yajman' ? 'Yajman Side' : 'Acharya Side'}
                  </button>
                ))}
              </div>
              <select
                value={cancelReasonPreset}
                onChange={(e) => setCancelReasonPreset(e.target.value)}
                className="w-full border rounded-xl p-2 text-xs bg-white"
              >
                {(cancelBy === 'yajman' ? YAJMAN_CANCEL_REASONS : PANDIT_CANCEL_REASONS).map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActiveCancelLead(null)}
                className="flex-1 border py-2 rounded-xl text-xs font-bold"
              >
                Back
              </button>
              <button
                disabled={cancelSubmitting}
                onClick={handleConfirmCancellation}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY COMPLETION OTP MODAL */}
      {activeOtpLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-4 shadow-xl space-y-3 text-center">
            <span className="text-2xl block">🪔</span>
            <h3 className="text-base font-bold text-gray-900">Enter Completion OTP</h3>
            <p className="text-xs text-gray-500">Collect the 4-digit code sent to Yajman via WhatsApp to complete ceremony</p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              placeholder="4-digit OTP"
              className="w-full text-center font-mono text-xl border rounded-xl py-2"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActiveOtpLead(null)}
                className="flex-1 border py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyCompletionOtp}
                className="flex-1 bg-green-600 text-white py-2 rounded-xl text-xs font-bold"
              >
                Verify & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl space-y-3 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">Edit Profile</h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-0.5">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border rounded-xl p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-0.5">Base City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full border rounded-xl p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-0.5">Experience</label>
                <input
                  type="text"
                  value={editExp}
                  onChange={(e) => setEditExp(e.target.value)}
                  className="w-full border rounded-xl p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-0.5">Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full border rounded-xl p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-0.5">Settlement UPI ID</label>
                <input
                  type="text"
                  value={editUpi}
                  onChange={(e) => setEditUpi(e.target.value)}
                  className="w-full border rounded-xl p-2 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 border py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-orange-600 text-white py-2 rounded-xl text-xs font-bold"
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