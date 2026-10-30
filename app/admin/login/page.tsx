'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

declare global {
  interface Window {
    adminRecaptchaVerifier?: any;
    adminConfirmationResult?: ConfirmationResult;
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 3 Attempts & 1-Minute Lockout Logic ---
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockTimer, setLockTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setFailedAttempts(0); // 1 minute complete hone par counter wapas 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockTimer]);

  /* ---------- Invisible reCAPTCHA Helper ---------- */
  const initAdminRecaptcha = () => {
    if (typeof window === 'undefined') return null;
    if (!window.adminRecaptchaVerifier) {
      window.adminRecaptchaVerifier = new RecaptchaVerifier(auth, 'admin-recaptcha-container', {
        size: 'invisible',
      });
    }
    return window.adminRecaptchaVerifier;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockTimer > 0) return;

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'login', 
          email: email.trim(), 
          password: password.trim() 
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 3) {
          setLockTimer(60); // 3 attempts ke baad 1 minute ka lock
          throw new Error('Too many failed attempts! Try again after 1 minute.');
        } else {
          throw new Error(`${data.error || 'Login failed'}. (${3 - nextAttempts} attempt(s) remaining)`);
        }
      }

      setFailedAttempts(0);
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Firebase OTP Send ---------- */
  const handleSendOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    try {
      const appVerifier = initAdminRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, `+91${clean}`, appVerifier);
      window.adminConfirmationResult = confirmation;

      setMessage(`6-digit OTP sent to +91 ${clean} via SMS.`);
      setStep('otp');
    } catch (err: any) {
      console.error('Firebase OTP error:', err);
      setError(err.message || 'Failed to send OTP. Please check the phone number and retry.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Firebase OTP Verify & Password Reset ---------- */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const clean = phone.replace(/\D/g, '').slice(-10);
    const code = otp.trim();

    if (code.length !== 6) {
      setError('Please enter the 6-digit OTP sent via SMS.');
      return;
    }

    if (!window.adminConfirmationResult) {
      setError('Session expired. Please click "Resend OTP".');
      return;
    }

    setLoading(true);

    try {
      // 1. Verify OTP with Google Firebase
      await window.adminConfirmationResult.confirm(code);

      // 2. Update password on server
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          phone: clean,
          otp: code,
          firebase_verified: true,
          newPassword: newPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed');

      setMessage('Password updated successfully. Please login.');
      setIsForgot(false);
      setStep('phone');
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Invalid or expired OTP. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="admin-recaptcha-container"></div>

      <div className="bg-slate-800 border border-slate-700 w-full max-w-md p-6 rounded-2xl shadow-xl text-white">
        <h1 className="text-2xl font-bold text-center mb-2">Admin Portal</h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          {isForgot ? 'Password Recovery' : 'Sign in to access admin dashboard'}
        </p>

        {error && (
          <div className="p-3 mb-4 bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-lg">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 mb-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm rounded-lg">
            {message}
          </div>
        )}

        {!isForgot ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                disabled={lockTimer > 0}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                placeholder="Enter admin email"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                disabled={lockTimer > 0}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              disabled={loading || lockTimer > 0}
              className="w-full bg-amber-500 hover:bg-amber-600 font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-slate-900 cursor-pointer"
            >
              {lockTimer > 0 
                ? `Please wait ${lockTimer}s` 
                : loading ? 'Signing In...' : 'Login'}
            </button>
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setIsForgot(true);
                  setError('');
                  setMessage('');
                }}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {step === 'phone' ? (
              <div>
                <label className="block text-xs uppercase font-medium text-slate-300 mb-1">
                  Registered Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                  placeholder="Enter 10-digit mobile number"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || phone.replace(/\D/g, '').length !== 10}
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-600 font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-slate-900 cursor-pointer"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs uppercase font-medium text-slate-300">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendOtp}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-center tracking-widest text-lg font-bold font-mono"
                    placeholder="••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-medium text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="Enter new password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-slate-900 cursor-pointer"
                >
                  {loading ? 'Updating...' : 'Set New Password'}
                </button>
              </form>
            )}
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setIsForgot(false);
                  setStep('phone');
                  setError('');
                  setMessage('');
                }}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}