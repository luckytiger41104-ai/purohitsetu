import React from "react";
import Link from "next/link";

export default function PanditPartnerTerms() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-5 mb-6">
          <span className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider">
            PurohitSetu Acharya Onboarding & Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            Acharya Partner Terms & Operating Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Partner verification rules, 24-hour direct payout guarantee, and operational guidelines for Purohits in Bengaluru
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300">
          
          {/* Section 1: Verification & Collected Data */}
          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              1. Information Collected from Acharya Partners
            </h2>
            <p className="mb-2">
              To guarantee verified, authentic Vedic ritual services to families across Bengaluru, PurohitSetu collects and validates the following partner information during onboarding:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Contact & Authentication:</strong> Full Legal Name, Primary Mobile Number, and Secure One-Time Password (OTP) verification to ensure secure account access.</li>
              <li><strong>Vedic Lineage & Qualifications:</strong> Gurukul education records, Vedic Pathshala certifications, and Shastri/Acharya credentials.</li>
              <li><strong>Years of Ritual Experience:</strong> Documented years of active experience conducting Sanatan Samskaras and scriptural rituals.</li>
              <li><strong>Ritual Specializations:</strong> Proficiencies in specific ceremonies including Griha Pravesh, Vedic Vivah Sanskar, Navchandi Mahayagya, Rudrabhishek, Dosha Shanti, and Antyesti/Garuda Purana last rites.</li>
              <li><strong>Linguistic Competence:</strong> Language fluencies for devotee communication (Hindi, Maithili, Bhojpuri, Sanskrit, Kannada, Telugu).</li>
              <li><strong>Operational Zones:</strong> Preferred geographic coverage areas within Bengaluru (e.g., Whitefield, HSR Layout, Koramangala, Indiranagar, Electronic City).</li>
            </ul>
          </section>

          {/* Section 2: Direct Payment & 24 Hours Payout Guarantee */}
          <section className="bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-amber-400/30">
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              2. 100% Secure Payments & 24-Hour Direct Payout Guarantee
            </h2>
            <p className="mb-2">
              Whenever a Yajman remits a ritual booking advance or the full ceremony fee directly to PurohitSetu through our online platform:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-200">
              <li><strong>24-Hour Settlement:</strong> Following the successful completion of the ritual ceremony, the Pandit's entitled remuneration is directly credited to their registered bank account or verified UPI address <strong>within 24 hours</strong>.</li>
              <li><strong>100% Payment Security:</strong> All digital transactions are processed through RBI-authorized payment aggregators using end-to-end encryption. Your hard-earned ritual fees remain completely protected and free from settlement delays.</li>
              <li><strong>Zero Hidden Charges:</strong> PurohitSetu deducts only the pre-agreed platform facilitation fee. The complete remaining payout is transferred transparently without surprise withholdings.</li>
            </ul>
          </section>

          {/* Section 3: Data Safety */}
          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              3. Data Protection & Partner Confidentiality
            </h2>
            <p>
              An Acharya's phone number, qualifications, and performance metrics are used strictly for service fulfillment, appointment matching, and client coordination. PurohitSetu maintains a strict zero-brokerage policy: we never sell, lease, or monetize registered Pandit data with third-party advertising or marketing agencies.
            </p>
          </section>

          {/* Section 4: Cash Collection & Platform Fee */}
          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              4. Offline Cash Collection & Platform Facilitation Fee (30% Settlement)
            </h2>
            <p>
              In scenarios where the Yajman tenders ceremony remuneration directly to the Acharya in cash at the venue, the Pandit agrees to remit the nominal 30% platform facilitation fee via the "Settle Platform Fee" portal action within 24 hours of ceremony completion to maintain an active standing.
            </p>
          </section>

          {/* Section 5: Conduct & Sanctity */}
          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              5. Professional Code of Conduct & Scriptural Sanctity
            </h2>
            <p>
              Acharyas must reach the designated ceremony venue promptly at the confirmed muhurat, dressed in traditional Vedic attire, carrying authentic and pure samagri. Last-minute cancellations without substantial notice or demanding unauthorized price escalations at the ritual site may result in immediate 15-day profile suspension or permanent de-listing.
            </p>
          </section>

          {/* Section 6: Deactivation */}
          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              6. Account Deactivation & Data Deletion
            </h2>
            <p>
              Acharya partners retain full autonomy to pause or permanently terminate their registered platform profile at any time. Account closure requests may be submitted directly to our partner support desk at <strong className="text-amber-300">support.purohitsetu@gmail.com</strong>.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <Link href="/pandit/dashboard" className="text-amber-400 font-bold hover:underline">
            ← Back to Acharya Dashboard
          </Link>
          <p>© 2026 PurohitSetu Acharya Network • Bengaluru</p>
        </div>

      </div>
    </div>
  );
}