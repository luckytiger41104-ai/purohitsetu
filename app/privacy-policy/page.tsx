import React from "react";

export default function PublicPrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-amber-200 shadow-sm">
        
        <div className="border-b border-amber-200 pb-6 mb-8">
          <span className="text-orange-600 font-extrabold uppercase text-[11px] tracking-wider">
            Yajman Protection & Trust
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-1">
            Last updated: October 2026 • PurohitSetu (Bengaluru, Karnataka)
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">1. Overview</h2>
            <p>
              PurohitSetu (purohitsetu.in) operates an on-demand marketplace connecting devotees (Yajmans) with verified Vedic Pandits across Bengaluru. We collect only necessary details to schedule and facilitate your sacred ceremonies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">2. Devotee Data Collected</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact Information:</strong> Yajman full name and phone number.</li>
              <li><strong>Venue Details:</strong> Locality, apartment name, full address, and pincode in Bengaluru.</li>
              <li><strong>Ritual Choices:</strong> Puja name, preferred date, time slot, and preferred language (Hindi, Maithili, Bhojpuri, Sanskrit, Kannada, Telugu).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">3. Purpose & Confidentiality</h2>
            <p>
              Your ceremony details are shared exclusively with the allotted Acharya to arrange travel, samagri, and muhurat timings. We never sell, rent, or lease devotee personal data to third-party commercial marketing entities.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">4. Payment Security</h2>
            <p>
              All online service tokens and advance payments are processed directly via RBI-approved payment gateways (Razorpay) using 256-bit SSL encryption. We do not store card numbers, PINs, or UPI credentials.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">5. Support & Contact</h2>
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-xs space-y-1">
              <p><strong>Support Email:</strong> support.purohitsetu@gmail.com</p>
              <p><strong>Operating City:</strong> Bengaluru, Karnataka, India</p>
            </div>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <a href="/" className="text-orange-600 font-bold hover:underline">← Back to Homepage</a>
          <p>© 2026 PurohitSetu</p>
        </div>
      </div>
    </div>
  );
}