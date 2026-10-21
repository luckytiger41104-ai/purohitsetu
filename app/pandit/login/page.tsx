'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PanditAuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Bengaluru, Karnataka');
  const [experience, setExperience] = useState('10+ Years Vedic Rituals');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const cleanNumber = (val: string) => val.replace(/\D/g, '').slice(-10);

  // Normal Password Login (No OTP)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const targetPhone = cleanNumber(phone);
    if (targetPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetPhone, password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Login failed. Please verify credentials.');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('pandit_phone', targetPhone);
          document.cookie = `pandit_phone=${targetPhone}; path=/; max-age=31536000; SameSite=Lax`;
        }
        router.replace('/pandit/dashboard');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for Register or Forgot Password
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const targetPhone = cleanNumber(phone);
    if (targetPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full Acharya name.');
        return;
      }
      if (!password.trim() || password.length < 4) {
        setErrorMsg('Please set a password with at least 4 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetPhone, purpose: mode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to send verification code.');
      } else {
        setInfoMsg(`Verification code sent to +91 ${targetPhone}. Valid for 5 minutes.`);
        setStep('otp');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP for Registration or Password Reset
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const targetPhone = cleanNumber(phone);
    const targetOtp = otp.trim();

    if (targetOtp.length !== 4) {
      setErrorMsg('Please enter the 4-digit verification code sent via SMS.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { phone: targetPhone, otp: targetOtp, password: password.trim() };
      if (mode === 'register') {
        payload.fullName = fullName;
        payload.city = city;
        payload.experience = experience;
        payload.purpose = 'register';
      } else if (mode === 'forgot') {
        payload.purpose = 'reset';
      }

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Verification failed. Please retry.');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('pandit_phone', targetPhone);
          document.cookie = `pandit_phone=${targetPhone}; path=/; max-age=31536000; SameSite=Lax`;
        }
        router.replace('/pandit/dashboard');
      }
    } catch {
      setErrorMsg('Network error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 p-8 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-orange-500 bg-white p-1 shadow-md flex items-center justify-center">
            <img src="/pandit-logo.png" alt="PurohitSetu Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">PurohitSetu Acharya Portal</h1>
            <p className="text-xs text-gray-500 mt-1">Verified Vedic Pandits & Purohits Gateway</p>
          </div>

          {/* Mode Switcher */}
          {mode !== 'forgot' && (
            <div className="flex bg-stone-100 p-1 rounded-2xl mt-4">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setStep('form');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mode === 'login' ? 'bg-white text-orange-800 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setStep('form');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mode === 'register' ? 'bg-white text-orange-800 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                New Acharya Registration
              </button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
            {errorMsg}
          </div>
        )}
        {infoMsg && (
          <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium">
            {infoMsg}
          </div>
        )}

        {/* 1. SIGN IN (MOBILE + PASSWORD ONLY) */}
        {mode === 'login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-gray-300 bg-stone-50 text-gray-700 text-sm font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-r-xl px-3.5 py-2.5 text-sm font-mono tracking-wider font-bold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">Account Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setStep('form');
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  className="text-xs text-orange-700 hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl text-sm transition shadow-md cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In with Password'}
            </button>
          </form>
        )}

        {/* 2. REGISTRATION (DETAILS + PASSWORD + OTP) */}
        {mode === 'register' && step === 'form' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name (Acharya Name)</label>
              <input
                type="text"
                required
                placeholder="e.g. Acharya Rameshwar Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Base City</label>
              <input
                type="text"
                required
                placeholder="e.g. Bengaluru, Karnataka"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ritual Experience</label>
              <input
                type="text"
                required
                placeholder="e.g. 12+ Years Vedic Rituals"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Set Account Password</label>
              <input
                type="password"
                required
                placeholder="Create a password (min 4 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number (SMS verification)</label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-gray-300 bg-stone-50 text-gray-700 text-sm font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-r-xl px-3.5 py-2.5 text-sm font-mono tracking-wider font-bold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl text-sm transition shadow-md cursor-pointer"
            >
              {loading ? 'Sending Code...' : 'Register & Send SMS Code'}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD (PHONE + NEW PASSWORD) */}
        {mode === 'forgot' && step === 'form' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="text-left">
              <h3 className="font-bold text-gray-900 text-sm">Reset Account Password</h3>
              <p className="text-xs text-gray-500">We will send a 4-digit SMS verification code to your registered mobile.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Registered Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-gray-300 bg-stone-50 text-gray-700 text-sm font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-r-xl px-3.5 py-2.5 text-sm font-mono tracking-wider font-bold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Set New Password</label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl text-sm transition shadow-md cursor-pointer"
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setStep('form');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="text-xs text-orange-700 font-bold hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* 4. OTP ENTRY (REGISTRATION / RESET) */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">Enter 4-Digit Verification Code</label>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-xs text-orange-700 hover:underline font-semibold cursor-pointer"
                >
                  Change Details
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={4}
                placeholder="• • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border-2 border-orange-400 rounded-xl py-3 text-center font-mono text-2xl font-bold tracking-widest text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl text-sm transition shadow-md cursor-pointer"
            >
              {loading ? 'Verifying...' : mode === 'forgot' ? 'Verify & Reset Password' : 'Confirm & Complete Registration'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
              >
                Did not receive SMS? Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}