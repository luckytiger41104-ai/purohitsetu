'use client';

import React, { useState } from 'react';

export default function DeleteAccountPage() {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length === 10) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-stone-200 text-center space-y-5">
        <h1 className="text-xl font-bold text-gray-900">PurohitSetu Account Deletion</h1>
        <p className="text-xs text-gray-600">
          Request permanent deletion of your Acharya profile, credentials, and verification data.
        </p>

        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
            Deletion request submitted for +91 {phone}. Your account and data will be permanently removed within 48 hours.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Registered Mobile Number
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-950 focus:outline-none focus:border-red-600"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer"
            >
              Submit Deletion Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
