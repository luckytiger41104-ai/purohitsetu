'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier?: any;
    confirmationResult?: ConfirmationResult;
  }
}

type Mode = 'login' | 'register' | 'forgot';
type Step = 'form' | 'otp';

const cleanNumber = (val: string) => (val || '').replace(/\D/g, '').slice(-10);

const saveSession = (phone: string) => {
  if (typeof window === 'undefined') return;
  const clean = cleanNumber(phone);
  localStorage.setItem('pandit_phone', clean);
  localStorage.setItem('pandit_logged_in', 'true');
  document.cookie = `pandit_phone=${clean}; path=/; max-age=31536000; SameSite=Lax`;
};

const readSavedPhone = (): string => {
  if (typeof window === 'undefined') return '';
  const fromStorage = localStorage.getItem('pandit_phone') || '';
  if (fromStorage) return cleanNumber(fromStorage);

  const match = document.cookie.match(/(^| )pandit_phone=([^;]+)/);
  return match ? cleanNumber(match[2]) : '';
};

const hasAcceptedTerms = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('pandit_terms_accepted') === 'true';
};

const inputBase =
  'w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950';

const primaryButton =
  'w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl text-sm transition shadow-md cursor-pointer';

export default function PanditAuthPage() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('form');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Bengaluru, Karnataka');
  const [experience, setExperience] = useState('10+ Years Vedic Rituals');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Terms and conditions modal state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');

  // Persistent check on app mount
  useEffect(() => {
    const saved = readSavedPhone();
    if (saved.length === 10) {
      if (!hasAcceptedTerms()) {
        setPendingPhone(saved);
        setShowTermsModal(true);
        setCheckingSession(false);
      } else {
        router.replace('/pandit/dashboard');
      }
    } else {
      setCheckingSession(false);
    }
  }, [router]);

  const clearMessages = () => {
    setErrorMsg('');
    setInfoMsg('');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep('form');
    clearMessages();
  };

  const finishLogin = (targetPhone: string) => {
    saveSession(targetPhone);
    if (!hasAcceptedTerms()) {
      setPendingPhone(targetPhone);
      setShowTermsModal(true);
    } else {
      router.replace('/pandit/dashboard');
    }
  };

  const handleAcceptTermsAndProceed = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pandit_terms_accepted', 'true');
    }
    setShowTermsModal(false);
    router.replace('/pandit/dashboard');
  };

  /* ---------- Invisible reCAPTCHA Helper ---------- */
  const initRecaptchaVerifier = () => {
    if (typeof window === 'undefined') return null;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'login-recaptcha-container', {
        size: 'invisible',
      });
    }
    return window.recaptchaVerifier;
  };

  /* ---------- Password login ---------- */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

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
        finishLogin(targetPhone);
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Firebase OTP Send (Register & Forgot Password) ---------- */
  const handleSendOtp = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    clearMessages();

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
      const appVerifier = initRecaptchaVerifier();
      const confirmation = await signInWithPhoneNumber(auth, `+91${targetPhone}`, appVerifier);
      window.confirmationResult = confirmation;
      setInfoMsg(`Verification code sent to +91 ${targetPhone}. Valid for 5 minutes.`);
      setStep('otp');
    } catch (err: any) {
      console.error('Firebase Auth SMS error:', err);
      setErrorMsg(err.message || 'Failed to send SMS verification code. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Firebase OTP Verify & Account Creation / Reset ---------- */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const targetPhone = cleanNumber(phone);
    const targetOtp = otp.trim();

    if (targetOtp.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code sent via SMS.');
      return;
    }

    if (!window.confirmationResult) {
      setErrorMsg('Verification session expired. Please click "Resend SMS Code".');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP with Google Firebase
      await window.confirmationResult.confirm(targetOtp);

      // 2. Save user profile / update password in DB
      const payload: Record<string, string> = {
        phone: targetPhone,
        password: password.trim(),
        firebase_verified: 'true',
      };

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
        setErrorMsg(data.message || 'Account sync failed. Please contact support.');
      } else {
        finishLogin(targetPhone);
      }
    } catch (err: any) {
      console.error('OTP confirmation failed:', err);
      setErrorMsg('Invalid verification code or code expired. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const phoneField = (label: string) => (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
      <div className="flex">
        <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-gray-300 bg-stone-50 text-gray-700 text-sm font-bold">
          +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          required
          maxLength={10}
          placeholder="9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded-r-xl px-3.5 py-2.5 text-sm font-mono tracking-wider font-bold text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
        />
      </div>
    </div>
  );

  const passwordField = (placeholder: string) => (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        required
        placeholder={placeholder}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`${inputBase} pl-3.5 pr-11`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-800 cursor-pointer text-lg select-none"
        title={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? '👁️' : '🙈'}
      </button>
    </div>
  );

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-sm font-semibold text-gray-500 animate-pulse">Loading Acharya Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-stone-100 flex flex-col justify-center items-center p-3 sm:p-4 overflow-x-hidden">
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="login-recaptcha-container"></div>

      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 p-5 sm:p-8 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-orange-500 bg-white p-1 shadow-md flex items-center justify-center">
            <img src="/pandit-logo.png" alt="PurohitSetu Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">PurohitSetu Acharya</h1>
            <p className="text-[11px] sm:text-xs text-gray-500">Verified Vedic Pandits &amp; Purohits Gateway</p>
          </div>

          {mode !== 'forgot' && (
            <div className="flex bg-stone-100 p-1 rounded-2xl mt-3">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mode === 'login' ? 'bg-white text-orange-800 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mode === 'register' ? 'bg-white text-orange-800 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                New Registration
              </button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-2.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
            {errorMsg}
          </div>
        )}
        {infoMsg && (
          <div className="p-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium">
            {infoMsg}
          </div>
        )}

        {/* 1. SIGN IN */}
        {mode === 'login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-3.5">
            {phoneField('Mobile Number')}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">Account Password</label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs text-orange-700 hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              {passwordField('Enter your password')}
            </div>

            <button type="submit" disabled={loading} className={primaryButton}>
              {loading ? 'Signing In...' : 'Sign In with Password'}
            </button>
          </form>
        )}

        {/* 2. REGISTRATION */}
        {mode === 'register' && step === 'form' && (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name (Acharya Name)</label>
              <input
                type="text"
                required
                placeholder="e.g. Acharya Rameshwar Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputBase}
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
                className={inputBase}
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
                className={inputBase}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Set Account Password</label>
              {passwordField('Create a password (min 4 characters)')}
            </div>

            {phoneField('Mobile Number (SMS verification)')}

            <button type="submit" disabled={loading} className={primaryButton}>
              {loading ? 'Sending Code...' : 'Register & Send SMS Code'}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD */}
        {mode === 'forgot' && step === 'form' && (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div className="text-left">
              <h3 className="font-bold text-gray-900 text-sm">Reset Password</h3>
              <p className="text-xs text-gray-500">
                We will send a 6-digit SMS verification code to your registered mobile.
              </p>
            </div>

            {phoneField('Registered Mobile Number')}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Set New Password</label>
              {passwordField('Enter new password')}
            </div>

            <button type="submit" disabled={loading} className={primaryButton}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-xs text-orange-700 font-bold hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* 4. OTP ENTRY */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">Enter 6-digit Verification Code</label>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-xs text-orange-700 hover:underline font-semibold cursor-pointer"
                >
                  Change
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border-2 border-orange-400 rounded-xl py-2.5 text-center font-mono text-2xl font-bold tracking-widest text-gray-950 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:text-gray-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl text-sm transition shadow-md cursor-pointer"
            >
              {loading
                ? 'Verifying...'
                : mode === 'forgot'
                ? 'Verify & Reset Password'
                : 'Confirm & Complete Registration'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
              >
                Resend SMS Code
              </button>
            </div>
          </form>
        )}
      </div>

      {/* MANDATORY TERMS AND CONDITIONS MODAL (UNSKIPPABLE) */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-orange-300 p-6 sm:p-7 space-y-4 max-h-[90vh] flex flex-col justify-between">
            <div className="text-center space-y-1 border-b pb-3 border-amber-200">
              <span className="text-2xl">📜</span>
              <h2 className="text-lg font-black text-gray-900">PurohitSetu Acharya Code of Conduct</h2>
              <p className="text-xs text-gray-500">Terms &amp; Obligations for Verified Vedic Pandits</p>
            </div>

            <div className="overflow-y-auto space-y-3 text-xs text-gray-700 pr-1 leading-relaxed">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-950 mb-1">1. Shastric Vidhi &amp; Ritual Authenticity</p>
                <p>All rituals must be strictly conducted in accordance with authentic Vedic scriptures and traditions without unnecessary shortcuts.</p>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-950 mb-1">2. Punctuality &amp; Devotee Respect</p>
                <p>Pandit Ji must reach the Yajman&apos;s venue at least 20–30 minutes prior to the scheduled auspicious Muhurat.</p>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-950 mb-1">3. Strict Transparency &amp; Dignity</p>
                <p>No extra or unagreed demands should be made during the ceremony. All service arrangements are to be carried out with complete devotion and transparency.</p>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-950 mb-1">4. Direct Devotee Communication</p>
                <p>Upon accepting a booking, your verified Acharya profile and credentials will be shared with the Yajman for mutual verification and smooth coordination.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleAcceptTermsAndProceed}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-extrabold text-sm shadow-lg transition active:scale-98 cursor-pointer"
              >
                I Understand &amp; Accept Acharya Terms →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}