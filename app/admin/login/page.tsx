'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), purpose: 'admin_forgot' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setMessage('OTP has been generated. Please check your SMS or phone_otps table.');
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          phone: phone.trim(),
          otp: otp.trim(),
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-slate-900"
            >
              {loading ? 'Signing In...' : 'Login'}
            </button>
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setIsForgot(true);
                  setError('');
                  setMessage('');
                }}
                className="text-xs text-amber-400 hover:underline"
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
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="Enter 10-digit mobile number"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || phone.length !== 10}
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-600 font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-slate-900"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs uppercase font-medium text-slate-300">
                      Enter 4-Digit OTP
                    </label>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendOtp}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-center tracking-widest text-lg font-bold"
                    placeholder="••••"
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
                  className="w-full bg-amber-500 hover:bg-amber-600 font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-slate-900"
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
                className="text-xs text-slate-400 hover:text-white"
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