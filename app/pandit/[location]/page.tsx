import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const instant = false;

const ALL_LOCALITIES: Record<string, { name: string; nearby: string[] }> = {
  whitefield: {
    name: "Whitefield",
    nearby: ["marathahalli", "bellandur", "kr-puram", "sarjapur-road"],
  },
  "hsr-layout": {
    name: "HSR Layout",
    nearby: ["koramangala", "bellandur", "btm-layout", "sarjapur-road"],
  },
  koramangala: {
    name: "Koramangala",
    nearby: ["hsr-layout", "indiranagar", "btm-layout", "jayanagar"],
  },
  indiranagar: {
    name: "Indiranagar",
    nearby: ["koramangala", "marathahalli", "hebbal", "malleshwaram"],
  },
  "electronic-city": {
    name: "Electronic City",
    nearby: ["hsr-layout", "bannerghatta-road", "btm-layout", "sarjapur-road"],
  },
  marathahalli: {
    name: "Marathahalli",
    nearby: ["whitefield", "bellandur", "indiranagar", "kr-puram"],
  },
  "sarjapur-road": {
    name: "Sarjapur Road",
    nearby: ["bellandur", "hsr-layout", "whitefield", "electronic-city"],
  },
  bellandur: {
    name: "Bellandur",
    nearby: ["marathahalli", "sarjapur-road", "hsr-layout", "whitefield"],
  },
  "jp-nagar": {
    name: "JP Nagar",
    nearby: ["jayanagar", "btm-layout", "bannerghatta-road", "kanakapura-road"],
  },
  jayanagar: {
    name: "Jayanagar",
    nearby: ["jp-nagar", "btm-layout", "koramangala", "rajajinagar"],
  },
  hebbal: {
    name: "Hebbal",
    nearby: ["yelahanka", "malleshwaram", "indiranagar", "kr-puram"],
  },
  yelahanka: {
    name: "Yelahanka",
    nearby: ["hebbal", "malleshwaram", "kr-puram", "rajajinagar"],
  },
  "btm-layout": {
    name: "BTM Layout",
    nearby: ["hsr-layout", "koramangala", "jp-nagar", "jayanagar"],
  },
  "bannerghatta-road": {
    name: "Bannerghatta Road",
    nearby: ["jp-nagar", "btm-layout", "electronic-city", "kanakapura-road"],
  },
  malleshwaram: {
    name: "Malleshwaram",
    nearby: ["rajajinagar", "hebbal", "indiranagar", "jayanagar"],
  },
  rajajinagar: {
    name: "Rajajinagar",
    nearby: ["malleshwaram", "jayanagar", "hebbal", "jp-nagar"],
  },
  "kanakapura-road": {
    name: "Kanakapura Road",
    nearby: ["jp-nagar", "bannerghatta-road", "jayanagar", "btm-layout"],
  },
  "kr-puram": {
    name: "KR Puram",
    nearby: ["whitefield", "marathahalli", "hebbal", "bellandur"],
  },
};

const POPULAR_RITUALS = [
  { slug: "griha-pravesh-puja", title: "Griha Pravesh & Vastu Shanti" },
  { slug: "satyanarayan-puja", title: "Satyanarayan Bhagwan Katha" },
  { slug: "vedic-marriage-pandit", title: "Vedic Vivah Sanskar (Marriage)" },
  { slug: "navchandi-hawan", title: "Navchandi Mahayagya Hawan" },
  { slug: "rudrabhishek-puja", title: "Rudrabhishek Puja" },
  { slug: "mundan-sanskar", title: "Mundan Sanskar Ceremony" },
  { slug: "kaal-sarp-dosh-nivaran", title: "Kaal Sarp Dosh Nivaran" },
  { slug: "pitra-dosh-puja", title: "Pitra Dosh & Tarpan Shanti" },
];

const SUPPORT_PHONE = "9449871293";

export async function generateStaticParams() {
  return Object.keys(ALL_LOCALITIES).map((slug) => ({
    location: slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locData = ALL_LOCALITIES[resolvedParams.location?.toLowerCase()];
  if (!locData) return {};

  return {
    title: `North Indian Vedic Pandit in ${locData.name}, Bangalore | PurohitSetu`,
    description: `Book verified North Indian, Hindi, Bihari & Maithili Vedic Pandits in ${locData.name}, Bengaluru. Authentic Griha Pravesh, Vivah, Hawan and all Sanskar rituals.`,
    alternates: {
      canonical: `https://www.purohitsetu.in/pandit/${resolvedParams.location}`,
    },
  };
}

export default async function LocalityPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.location?.toLowerCase();
  const locData = ALL_LOCALITIES[slug];

  if (!locData) {
    notFound();
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.purohitsetu.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Pandit in ${locData.name}`,
        item: `https://www.purohitsetu.in/pandit/${slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-amber-200 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center text-sm font-bold">
              ॐ
            </span>
            Purohit<span className="text-orange-700">Setu</span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(
                `Namaste, I want to book a Vedic Pandit in ${locData.name}, Bangalore.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
            >
              💬 WhatsApp
            </a>
            <Link
              href="/#booking-section"
              className="bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
            >
              Book Pandit
            </Link>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <nav className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-500" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-orange-700">Home</Link>
          </li>
          <li>/</li>
          <li>
            <span className="text-slate-400">Bengaluru</span>
          </li>
          <li>/</li>
          <li className="font-semibold text-slate-900">
            {locData.name}
          </li>
        </ol>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-4 py-8 text-center">
        <span className="inline-block bg-orange-100 text-orange-950 border border-orange-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
          📍 Verified Acharyas in {locData.name}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-3">
          North Indian &amp; Vedic Pandit in <span className="text-orange-700">{locData.name}</span>, Bangalore
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed mb-6">
          Book authentic Hindi, Maithili, and Bhojpuri speaking Vedic Purohits in {locData.name}. Experienced in Griha Pravesh, Satyanarayan Puja, Hawan, Vivah Sanskar, and personalized muhurat calculation.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/#booking-section"
            className="px-5 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs shadow transition"
          >
            📅 Schedule Puja in {locData.name}
          </Link>
          <a
            href={`tel:+91${SUPPORT_PHONE}`}
            className="px-5 py-2.5 rounded-xl bg-white border border-orange-300 text-orange-950 font-bold text-xs shadow hover:bg-orange-50 transition"
          >
            📞 Call Acharya: {SUPPORT_PHONE}
          </a>
        </div>
      </section>

      {/* CEREMONIES LIST */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="border-b border-amber-200 pb-2 mb-4">
          <h2 className="text-lg font-black text-slate-900">
            Sacred Ceremonies Conducted in {locData.name}
          </h2>
          <p className="text-xs text-slate-600">All rituals performed with 100% Shastric vidhi and genuine hawan samagri.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {POPULAR_RITUALS.map((ritual) => (
            <div key={ritual.slug} className="bg-white border border-amber-200 rounded-xl p-3 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-orange-600 font-bold text-sm block mb-1">🪔</span>
                <h3 className="text-xs font-bold text-slate-900 mb-1">{ritual.title}</h3>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Full vidhi, sankalp, and hawan in {locData.name}.
                </p>
              </div>
              <Link
                href={`/pandit/${slug}/${ritual.slug}`}
                className="mt-3 inline-block text-[11px] text-orange-700 font-bold hover:underline"
              >
                View {ritual.title} Page →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* NEARBY LOCALITIES */}
      <section className="max-w-5xl mx-auto px-4 py-8 bg-amber-50/60 rounded-2xl border border-amber-200 my-6">
        <h3 className="text-xs font-extrabold text-orange-950 uppercase tracking-wider mb-2">
          Also Serving Localities Near {locData.name}
        </h3>
        <p className="text-[11px] text-slate-600 mb-3">
          Our verified North Indian Pandits travel to apartments and individual houses in adjacent Bengaluru zones:
        </p>
        <div className="flex flex-wrap gap-2">
          {locData.nearby.map((nearSlug) => {
            const nearName = ALL_LOCALITIES[nearSlug]?.name || nearSlug;
            return (
              <Link
                key={nearSlug}
                href={`/pandit/${nearSlug}`}
                className="text-xs bg-white border border-amber-300 text-slate-800 hover:bg-orange-700 hover:text-white px-3 py-1.5 rounded-lg transition font-medium"
              >
                Pandit in {nearName}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ALL BENGALURU LOCALITIES DIRECTORY */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
          Complete Bengaluru Pandit Directory:
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(ALL_LOCALITIES).map(([key, item]) => (
            <Link
              key={key}
              href={`/pandit/${key}`}
              className={`text-[10px] px-2.5 py-1 rounded border transition ${
                key === slug
                  ? "bg-orange-700 text-white border-orange-700 font-bold"
                  : "bg-white text-slate-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white py-6 px-4 text-center text-xs mt-12">
        <p className="font-medium text-orange-100">
          © 2026 PurohitSetu Bengaluru • Authentic North Indian &amp; Vedic Purohit Services in {locData.name}
        </p>
        <div className="mt-2 flex justify-center gap-3 text-[11px] text-orange-200">
          <Link href="/" className="hover:underline">Home</Link>
          <span>•</span>
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <a href={`tel:+91${SUPPORT_PHONE}`} className="hover:underline">Support: +91 {SUPPORT_PHONE}</a>
        </div>
      </footer>
    </div>
  );
}