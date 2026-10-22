import React from "react";
import Link from "next/link";

export default function PanditPartnerTerms() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 mb-8">
          <span className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider">
            Acharya Partner Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            Pandit Partner Terms & Operating Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Governing rules for verified Acharyas and Purohits on PurohitSetu • Bengaluru
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300">
          
          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              1. Verified Leads & Allocation
            </h2>
            <p>
              PurohitSetu connects registered Vedic Acharyas with genuine puja requests from devotees across Bengaluru zones. Leads are allocated strictly based on geographic proximity, linguistic alignment, and ritual expertise.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              2. Platform Facilitation Fee (30% Settlement)
            </h2>
            <p>
              Upon successful completion of the ritual and receipt of the service booking amount from the Yajman, the Pandit agrees to remit the 30% platform facilitation fee through the official settlement button in the Pandit portal within 24 hours of ceremony completion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              3. Code of Conduct & Punctuality
            </h2>
            <p>
              Acharyas must arrive at the scheduled muhurat time dressed in traditional Vedic attire, carrying pure, unadulterated samagri. Demanding unauthorized additional charges or cancelling at the last moment without prior notice may result in account suspension for up to 15 days or permanent de-listing.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              4. Account Closure & Data Removal
            </h2>
            <p>
              Acharyas retain the right to deactivate their registered profile at any time. Account closure requests can be submitted directly through the support desk at <strong className="text-amber-300">support.purohitsetu@gmail.com</strong>.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <Link href="/pandit/dashboard" className="text-amber-400 font-bold hover:underline">
            ← Return to Pandit Dashboard
          </Link>
          <p>© 2026 PurohitSetu Partner Network</p>
        </div>

      </div>
    </div>
  );
}