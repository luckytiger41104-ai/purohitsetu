import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

const SERVICE_NAMES: Record<string, string> = {
  "griha-pravesh-puja": "Griha Pravesh Puja",
  "satyanarayan-puja": "Satyanarayan Puja",
  "vedic-marriage-pandit": "Vedic Marriage Pandit",
  "navchandi-hawan": "Navchandi Hawan",
  "rudrabhishek-puja": "Rudrabhishek Puja",
  "vastu-shanti-puja": "Vastu Shanti Puja",
  "mundan-sanskar": "Mundan Sanskar",
  "antim-sanskar": "Antim Sanskar Rites",
  "terahvin-shanti-hawan": "Terahvin Shanti Hawan",
  "kaal-sarp-dosh-nivaran": "Kaal Sarp Dosh Nivaran",
  "mangal-dosh-shanti": "Mangal Dosh Shanti",
  "pitra-dosh-puja": "Pitra Dosh Puja",
  "godh-bharai-seemantam": "Godh Bharai Sanskar",
  "upanayana-janeu": "Upanayana Janeu Sanskar",
};

const SUPPORT_PHONE = "9449871293";

function formatServiceName(slug: string): string {
  if (SERVICE_NAMES[slug]) return SERVICE_NAMES[slug];
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Next.js 16 build ke liye parameters predefine karna zaroori hai
export async function generateStaticParams() {
  const params: { location: string; service: string }[] = [];
  const locations = Object.keys(ALL_LOCALITIES);
  const services = Object.keys(SERVICE_NAMES);

  for (const loc of locations) {
    for (const serv of services) {
      params.push({ location: loc, service: serv });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string; service: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locKey = resolvedParams.location?.toLowerCase() || "";
  const servKey = resolvedParams.service?.toLowerCase() || "";

  const locData = ALL_LOCALITIES[locKey];
  const serviceTitle = formatServiceName(servKey);

  if (!locData) return {};

  return {
    title: `${serviceTitle} in ${locData.name}, Bangalore | Verified Vedic Pandits`,
    description: `Book verified North Indian Vedic Pandits for ${serviceTitle} in ${locData.name}, Bengaluru. Authentic Gurukul chanting, complete hawan samagri, and zero upfront fee.`,
    alternates: {
      canonical: `https://www.purohitsetu.in/pandit/${locKey}/${servKey}`,
    },
  };
}

export default async function HyperlocalServicePage({
  params,
}: {
  params: Promise<{ location: string; service: string }>;
}) {
  const resolvedParams = await params;
  const locKey = resolvedParams.location?.toLowerCase() || "";
  const servKey = resolvedParams.service?.toLowerCase() || "";

  const locData = ALL_LOCALITIES[locKey];
  if (!locData) {
    notFound();
  }

  const serviceTitle = formatServiceName(servKey);

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
        name: `Pandits in ${locData.name}`,
        item: `https://www.purohitsetu.in/pandit/${locKey}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${serviceTitle} in ${locData.name}`,
        item: `https://www.purohitsetu.in/pandit/${locKey}/${servKey}`,
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
                `Namaste, I want to book ${serviceTitle} in ${locData.name}, Bangalore.`
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
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link href="/" className="hover:text-orange-700">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/pandit/${locKey}`} className="hover:text-orange-700">
              {locData.name}
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-slate-900">
            {serviceTitle}
          </li>
        </ol>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-4 py-8 text-center">
        <span className="inline-block bg-orange-100 text-orange-950 border border-orange-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
          🚩 Verified Vedic Service in {locData.name}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-3">
          Book Verified <span className="text-orange-700">{serviceTitle}</span> in {locData.name}, Bangalore
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed mb-6">
          Experienced North Indian, Hindi, Maithili &amp; Bhojpuri speaking Acharyas for authentic {serviceTitle} rituals in {locData.name}. 100% Shastric Vidhi, verified Hawan Samagri kit, and zero upfront fee.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/#booking-section"
            className="px-5 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs shadow transition"
          >
            📅 Schedule {serviceTitle}
          </Link>
          <a
            href={`tel:+91${SUPPORT_PHONE}`}
            className="px-5 py-2.5 rounded-xl bg-white border border-orange-300 text-orange-950 font-bold text-xs shadow hover:bg-orange-50 transition"
          >
            📞 Helpline: +91 {SUPPORT_PHONE}
          </a>
        </div>
      </section>

      {/* CEREMONY HIGHLIGHTS */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-3">
          <h2 className="text-base font-black text-slate-900">
            Key Highlights of {serviceTitle}
          </h2>
          <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
            <li>Conducted strictly according to Vedic scriptures by Gurukul-trained Acharyas.</li>
            <li>Customized muhurat calculation based on your family&apos;s Nakshatra and Rashi.</li>
            <li>Complete Hawan wood (Mango), Gangajal, Navagraha samidha, and pure desi cow ghee provided upon request.</li>
            <li>Available in Hindi, Sanskrit, Maithili, Bhojpuri, Kannada, and English explanation.</li>
          </ul>
        </div>
      </section>

      {/* CROSS-LINKING SILO: SAME SERVICE IN NEARBY LOCALITIES */}
      <section className="max-w-5xl mx-auto px-4 py-8 bg-amber-50/60 rounded-2xl border border-amber-200 my-6">
        <h3 className="text-xs font-extrabold text-orange-950 uppercase tracking-wider mb-2">
          {serviceTitle} in Nearby Bengaluru Localities:
        </h3>
        <p className="text-[11px] text-slate-600 mb-3">
          Our Acharyas travel across neighboring residential areas:
        </p>
        <div className="flex flex-wrap gap-2">
          {locData.nearby.map((nearSlug) => {
            const nearName = ALL_LOCALITIES[nearSlug]?.name || nearSlug;
            return (
              <Link
                key={nearSlug}
                href={`/pandit/${nearSlug}/${servKey}`}
                className="text-xs bg-white border border-amber-300 text-slate-800 hover:bg-orange-700 hover:text-white px-3 py-1.5 rounded-lg transition font-medium"
              >
                {serviceTitle} in {nearName}
              </Link>
            );
          })}
        </div>
      </section>

      {/* CROSS-LINKING SILO: OTHER RITUALS IN SAME LOCALITY */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
          Other Auspicious Pujas Conducted in {locData.name}:
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SERVICE_NAMES).map(([sKey, sTitle]) => (
            <Link
              key={sKey}
              href={`/pandit/${locKey}/${sKey}`}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                sKey === servKey
                  ? "bg-orange-700 text-white border-orange-700 font-bold"
                  : "bg-white text-slate-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              {sTitle} in {locData.name}
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white py-6 px-4 text-center text-xs mt-12">
        <p className="font-medium text-orange-100">
          © 2026 PurohitSetu Bengaluru • {serviceTitle} in {locData.name}
        </p>
        <div className="mt-2 flex justify-center gap-3 text-[11px] text-orange-200">
          <Link href="/" className="hover:underline">Home</Link>
          <span>•</span>
          <Link href={`/pandit/${locKey}`} className="hover:underline">All Pujas in {locData.name}</Link>
          <span>•</span>
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}