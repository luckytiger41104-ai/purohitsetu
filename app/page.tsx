import React, { Suspense } from "react";
import dynamicImport from "next/dynamic";

const PujaInteractiveClient = dynamicImport(
  () => import("@/components/PujaInteractiveClient"),
  {
    loading: () => (
      <div className="py-16 text-center text-xs text-slate-400 font-medium animate-pulse">
        Loading Vedic Services &amp; Muhurat Directory...
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 font-sans selection:bg-orange-700 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="sticky top-0 z-40 w-full shadow-xs bg-white">
        <div className="bg-gradient-to-r from-red-800 via-orange-700 to-amber-800 text-white text-[11px] sm:text-xs py-1.5 px-3 text-center">
          <p className="font-semibold">
            🚩 <strong>North Indian Vedic Pandits in Bangalore:</strong> Hindi, Maithili, Bhojpuri &amp; Kannada Acharyas across all zones
          </p>
        </div>

        {/* Minimal Static Nav for Instant First Paint */}
        <header className="border-b border-amber-200/80 bg-white/95 px-4 sm:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-red-600 flex items-center justify-center text-white text-lg font-bold shadow-xs">
                ॐ
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                Purohit<span className="text-orange-700">Setu</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-950 font-bold px-1.5 py-0.5 rounded-full border border-amber-300 ml-1">
                📍 Bangalore
              </span>
            </div>
            <a
              href="#booking-section"
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs"
            >
              Book Pandit
            </a>
          </div>
        </header>
      </div>

      {/* 2. HERO SECTION (LCP ELEMENT - ULTRA FAST STATIC PAINT) */}
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

      {/* 3. INTERACTIVE DIRECTORY & CLIENT LOGIC */}
      <Suspense fallback={null}>
        <PujaInteractiveClient />
      </Suspense>
    </div>
  );
}