import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 border-b pb-4">
          Privacy Policy - PurohitSetu
        </h1>
        <p className="text-xs text-gray-500">Last updated: October 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            When you register on PurohitSetu (as an Acharya or user), we collect essential details 
            such as your full name, mobile number, city, and ritual experience to enable Vedic 
            puja coordination and account management.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. How We Use Information</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            Your information is used strictly to verify accounts via SMS OTP, match Acharyas with 
            puja inquiries, and deliver service notifications. We do not sell or rent personal information 
            to third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. Data Security & Storage</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            All data transmitted through our web and mobile apps is encrypted using HTTPS. Your records 
            are stored securely on managed cloud databases with restricted access.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">4. Account and Data Deletion</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            Users retain the right to delete their profile and personal records. You can request account 
            deletion at any time through our Account Deletion portal or by contacting our team.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">5. Contact Information</h2>
          <p className="text-sm text-gray-600">
            For privacy inquiries or data requests, contact us at: <a href="mailto:support.purohitsetu@gmail.com" className="font-semibold text-orange-600 underline">support.purohitsetu@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
