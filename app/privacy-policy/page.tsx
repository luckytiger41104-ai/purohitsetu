import React from "react";
import Link from "next/link";

export default function PublicPrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-amber-200 shadow-sm">
        
        {/* Header */}
        <div className="border-b border-amber-200 pb-6 mb-8">
          <span className="text-orange-600 font-extrabold uppercase text-[11px] tracking-wider">
            Consumer Protection & Service Trust
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Privacy Policy - PurohitSetu
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Effective Date: October 2026 • PurohitSetu (Bengaluru, Karnataka)
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">
              1. Platform Nature & Overview
            </h2>
            <p>
              PurohitSetu (accessible via purohitsetu.in) operates a commercial online marketplace connecting devotees (Yajmans) with verified, ordained Vedic Purohits and Acharyas across Bengaluru. PurohitSetu operates purely as an on-demand ritual service coordination platform and does not operate as a religious trust or charitable entity.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">
              2. Information We Collect from Yajmans
            </h2>
            <p className="mb-2">
              When scheduling a ceremony or placing an inquiry on our platform, we collect only necessary logistical and coordination details:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact Details:</strong> Full Name, Primary Mobile Number, and Email Address.</li>
              <li><strong>Ceremony Venue Details:</strong> Residential address, society/apartment name, Bengaluru locality, and postal PIN code.</li>
              <li><strong>Ritual Preferences:</strong> Selected ceremony (e.g., Griha Pravesh, Satyanarayan Puja, Rudrabhishek), preferred date, auspicious time slot, and linguistic requirement (Hindi, Maithili, Bhojpuri, Kannada, Sanskrit, etc.).</li>
              <li><strong>Samagri Logistics:</strong> Delivery instructions if sacred ritual materials are arranged via the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">
              3. Purpose & Legitimate Use of Data
            </h2>
            <p className="mb-2">Your information is used strictly to fulfill your requested ceremony booking:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To confirm your appointment and assign an ordained Purohit to your specified venue.</li>
              <li>To transmit scheduling reminders, muhurat confirmations, and booking status alerts via SMS and WhatsApp.</li>
              <li>To coordinate ritual preparation directly with the allocated Purohit.</li>
              <li><strong>Zero Commercial Brokering:</strong> We never sell, lease, or monetize customer contact data with third-party marketing networks or advertisers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">
              4. Service Booking Fees & Secure Payments
            </h2>
            <p>
              All online transactions conducted on PurohitSetu are commercial service advance booking tokens and platform facilitation fees. We do not collect religious donations or unverified dakshina. Payments are processed securely via RBI-licensed payment aggregators (Razorpay) using end-to-end 256-bit SSL encryption. PurohitSetu does not store credit/debit card numbers, CVVs, or bank authentication credentials on its databases.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">
              5. Data Security & Storage
            </h2>
            <p>
              Devotee records are stored inside encrypted, managed cloud environments protected by industry-standard authentication policies. Access to customer contact details is restricted solely to authorized operational staff and the allocated Acharya handling the ceremony.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">
              6. Account & Data Deletion Rights
            </h2>
            <p>
              Devotees possess the right to review, modify, or permanently purge their personal booking records from our databases. Deletion requests can be initiated at any time by contacting our grievance and support desk.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-1.5">
              7. Grievance Redressal & Official Contact
            </h2>
            <p className="mb-2">
              For any questions regarding your booking, customer data safety, or platform terms, contact our support desk:
            </p>
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-xs space-y-1">
              <p><strong>Platform:</strong> PurohitSetu (Vedic Ritual Booking Service)</p>
              <p><strong>Support Email:</strong> <a href="mailto:support.purohitsetu@gmail.com" className="text-orange-700 font-bold underline">support.purohitsetu@gmail.com</a></p>
              <p><strong>Operational City:</strong> Bengaluru, Karnataka, India</p>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <Link href="/" className="text-orange-600 font-bold hover:underline">
            ← Return to PurohitSetu Homepage
          </Link>
          <p>© 2026 PurohitSetu. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}