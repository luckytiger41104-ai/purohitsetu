import React, { Suspense } from "react";
import PujaInteractiveClient from "@/components/PujaInteractiveClient";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 font-sans selection:bg-orange-700 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BAR (Direct Server HTML) */}
      <div className="sticky top-0 z-40 w-full shadow-sm">
        <div className="bg-gradient-to-r from-red-800 via-orange-700 to-amber-800 text-white text-[11px] sm:text-xs py-1.5 px-3 text-center">
          <p className="font-semibold">
            🚩 <strong>North Indian Vedic Pandits in Bangalore:</strong> Hindi, Maithili, Bhojpuri &amp; Kannada Acharyas across all zones
          </p>
        </div>
      </div>

      {/* 2. HERO SECTION WITH CRAWLER-VISIBLE STATIC H1 */}
      <section id="home-section" className="bg-[#FFF8EE] pt-8 pb-6 px-4 text-center border-b border-amber-200">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-950 border border-orange-300 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span>🪔</span> North Indian Pandit in Bangalore • Verified Acharyas
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-3 tracking-tight">
            Book Verified North Indian &amp; Hindi Pandits in Bangalore <br />
            <span className="text-orange-700">
              For Griha Pravesh, Vivah, Satyanarayan &amp; Hawan Rituals
            </span>
          </h1>

          <p className="text-slate-700 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            Connecting devout families with experienced North Indian, Hindi, Maithili, and Bhojpuri speaking Vedic Purohits across Bengaluru. 100% Shastric Vidhi, certified Samagri kits, and zero superstition.
          </p>
        </div>
      </section>

      {/* 3. INTERACTIVE CLIENT COMPONENT */}
      <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500 font-medium">Loading Vedic Services...</div>}>
        <PujaInteractiveClient />
      </Suspense>
    </div>
  );
}