'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PanditAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Form fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI states
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const clearAlerts = () => {
    setError('');
    setMessage('');
  };

  // 1. Pandit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed. Please check your credentials.');

      localStorage.setItem('pandit_phone', phone.trim());
      if (data.session_token) {
        localStorage.setItem('pandit_token', data.session_token);
      }

      router.push('/pandit/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Pandit Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      localStorage.setItem('pandit_phone', phone.trim());
      router.push('/pandit/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Send OTP (Forgot Password)
  const handleSendOtp = async () => {
    clearAlerts();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          purpose: 'forgot',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');

      setMessage('OTP has been sent to your mobile number.');
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');

      setMessage('Password updated successfully. Please login.');
      setMode('login');
      setStep('request');
      setPassword('');
      setOtp('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        
        {/* Header with Pandit Partner Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl overflow-hidden mb-3 border border-amber-500/40 shadow-lg shadow-amber-500/20 bg-slate-950 p-1">
            <img 
              src="/logo.png" 
              alt="PurohitSetu Pandit Partner" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "https://www.purohitsetu.in/logo.png";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PurohitSetu</h1>
          <p className="text-sm text-amber-400 font-medium mt-1">Pandit Partner Portal</p>
        </div>

        {/* Mode Selector */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl mb-6 border border-slate-700/60">
            <button
              type="button"
              onClick={() => { setMode('login'); clearAlerts(); }}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); clearAlerts(); }}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl">
            {message}
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                maxLength={10}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                placeholder="10-digit mobile number"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 font-semibold text-slate-950 rounded-xl transition duration-150 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('forgot'); clearAlerts(); setStep('request'); }}
                className="text-xs text-amber-400 hover:text-amber-300 transition"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                placeholder="Acharya / Pandit Name"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                maxLength={10}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                placeholder="10-digit mobile number"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                Set Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                placeholder="Create password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 font-semibold text-slate-950 rounded-xl transition duration-150 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <h2 className="text-lg font-bold text-white">Reset Password</h2>
              <p className="text-xs text-slate-400">Enter your registered mobile number</p>
            </div>

            {step === 'request' ? (
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                  placeholder="10-digit mobile number"
                />

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || phone.length !== 10}
                  className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 font-semibold text-slate-950 rounded-xl transition duration-150 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                      4-Digit OTP
                    </label>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendOtp}
                      className="text-xs text-amber-400 hover:text-amber-300"
                    >
                      Resend
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-center font-bold tracking-widest text-base focus:outline-none focus:border-amber-500"
                    placeholder="••••"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                    placeholder="Enter new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 4}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 font-semibold text-slate-950 rounded-xl transition duration-150 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); clearAlerts(); }}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}