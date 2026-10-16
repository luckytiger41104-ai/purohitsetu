'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function PanditLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Helper to read cookie
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  // Auto-login: Check both localStorage & permanent cookie
  useEffect(() => {
    const savedPhone = localStorage.getItem('pandit_phone') || getCookie('pandit_phone');
    if (savedPhone) {
      const cleanPhone = savedPhone.replace(/\D/g, '').slice(-10);
      localStorage.setItem('pandit_phone', cleanPhone);
      document.cookie = `pandit_phone=${cleanPhone}; path=/; max-age=31536000; SameSite=Lax`;
      router.replace('/pandit/dashboard');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Kripya apna 10 anko ka mobile number enter karein.');
      return;
    }

    setLoading(true);
    try {
      const { data: existingPandit } = await supabase
        .from('pandits')
        .select('*')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (!existingPandit) {
        await supabase.from('pandits').insert({
          phone: cleanPhone,
          full_name: 'Acharya Ji',
          wallet_balance: 0,
          earnings_balance: 0,
          strike_count: 0,
          is_blocked: false,
        });
      }

      setStep('otp');
      alert(`Vedic Verification OTP: 1234 (Testing OTP) sent to +91 ${cleanPhone}`);
    } catch (err: any) {
      alert('OTP bhejne me samasya aayi: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim() !== '1234' && otp.trim() !== '1111') {
      alert('Galat OTP. Kripya 1234 enter karein.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);

    // Save permanently in both LocalStorage & 1-Year Cookie
    localStorage.setItem('pandit_phone', cleanPhone);
    document.cookie = `pandit_phone=${cleanPhone}; path=/; max-age=31536000; SameSite=Lax`;

    router.replace('/pandit/dashboard');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-orange-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-amber-200 text-sm font-semibold">PurohitSetu Acharya Portal Load Ho Raha Hai...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-900 via-amber-950 to-neutral-950 flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-6 border border-orange-200">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 border-2 border-orange-400 p-1 flex items-center justify-center shadow-md">
            <img src="/pandit-logo.png" alt="PurohitSetu" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Acharya Portal</h2>
          <p className="text-xs text-orange-800 font-semibold">
            PurohitSetu • Vedic Pandit Lead Claim & Management
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Registered Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm text-gray-400 font-bold">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl text-base font-semibold focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold py-3 rounded-xl text-sm shadow-md transition cursor-pointer"
            >
              {loading ? 'Kripya Pratiksha Karein...' : 'OTP Bhejein'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Enter 4-Digit Verification OTP
              </label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                className="w-full text-center text-2xl tracking-widest font-mono py-2.5 border border-orange-400 rounded-xl focus:outline-none focus:border-orange-600"
                required
              />
              <p className="text-[11px] text-gray-500 text-center mt-1.5">
                OTP sent to <strong>+91 {phone}</strong> (Test OTP: <strong>1234</strong>)
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-bold py-3 rounded-xl text-sm shadow-md transition cursor-pointer"
            >
              Verify OTP & Enter Dashboard
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-xs text-orange-700 font-semibold hover:underline text-center cursor-pointer"
            >
              ← Mobile Number Badlein
            </button>
          </form>
        )}
      </div>
    </div>
  );
}