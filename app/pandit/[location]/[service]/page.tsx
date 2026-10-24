import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const instant = false;

interface LocalityDetails {
  name: string;
  nearby: string[];
  panditCount: string;
  reachTime: string;
  popularApartments: string[];
  localSamagriNote: string;
}

const ALL_LOCALITIES: Record<string, LocalityDetails> = {
  whitefield: {
    name: "Whitefield",
    nearby: ["marathahalli", "bellandur", "kr-puram", "sarjapur-road"],
    panditCount: "14+ Certified Acharyas",
    reachTime: "Within 30–45 Mins",
    popularApartments: ["Prestige Shantiniketan", "Brigade Cosmopolis", "Godrej United", "Assetz Marq"],
    localSamagriNote: "Low-smoke Vedic hawan samidha and fire-safety approved brass hawan kunds used for high-rise flats.",
  },
  "hsr-layout": {
    name: "HSR Layout",
    nearby: ["koramangala", "bellandur", "btm-layout", "sarjapur-road"],
    panditCount: "11+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Sobha Classic", "Purva Vantage", "Salarpuria Serenity", "NCC Urban"],
    localSamagriNote: "Balcony-friendly hawan setups organized with organic desi cow ghee and dry mango wood.",
  },
  koramangala: {
    name: "Koramangala",
    nearby: ["hsr-layout", "indiranagar", "btm-layout", "jayanagar"],
    panditCount: "10+ Certified Acharyas",
    reachTime: "Within 20–30 Mins",
    popularApartments: ["Raheja Residency", "Adarsh Rhythm", "Prestige St. Johns", "Mantri Classic"],
    localSamagriNote: "Fresh Shodashopachara flowers and organic Bilva leaves pre-sourced directly for your ritual.",
  },
  indiranagar: {
    name: "Indiranagar",
    nearby: ["koramangala", "marathahalli", "hebbal", "malleshwaram"],
    panditCount: "8+ Certified Acharyas",
    reachTime: "Within 25–40 Mins",
    popularApartments: ["Defiance Horizon", "Prestige Acropolis", "Chaitanya Samarpan", "Gopalan Grandeur"],
    localSamagriNote: "Customized muhurat analysis performed using Yajman Nakshatra and Panchang calculations.",
  },
  "electronic-city": {
    name: "Electronic City",
    nearby: ["hsr-layout", "bannerghatta-road", "btm-layout", "sarjapur-road"],
    panditCount: "12+ Certified Acharyas",
    reachTime: "Within 35–45 Mins",
    popularApartments: ["Ajmera Infinity", "Godrej E-City", "Salarpuria Sattva Greenage", "Prestige Sunrise Park"],
    localSamagriNote: "Punctual early-morning Brahma Muhurat arrival guaranteed for IT professionals.",
  },
  marathahalli: {
    name: "Marathahalli",
    nearby: ["whitefield", "bellandur", "indiranagar", "kr-puram"],
    panditCount: "15+ Certified Acharyas",
    reachTime: "Within 20–30 Mins",
    popularApartments: ["Purva Riviera", "Rohan Viti", "Sowparnika Flamenco", "Divyasree Republic"],
    localSamagriNote: "Authentic North Indian vidhi in Maithili, Hindi, and Bhojpuri with complete samagri kit.",
  },
  "sarjapur-road": {
    name: "Sarjapur Road",
    nearby: ["bellandur", "hsr-layout", "whitefield", "electronic-city"],
    panditCount: "13+ Certified Acharyas",
    reachTime: "Within 30–40 Mins",
    popularApartments: ["Prestige Lakeside Habitat", "Assetz 63 East", "Godrej 24", "SJR Parkway Homes"],
    localSamagriNote: "Dedicated portable Hawan Kund and Ganga water arranged for villa and apartment handovers.",
  },
  bellandur: {
    name: "Bellandur",
    nearby: ["marathahalli", "sarjapur-road", "hsr-layout", "whitefield"],
    panditCount: "9+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Sobha Jasmine", "Adarsh Palm Retreat", "DN Oxford", "Mantri Espana"],
    localSamagriNote: "Complete samagri carried by our purohits; yajman provides only basic household utensils.",
  },
  "jp-nagar": {
    name: "JP Nagar",
    nearby: ["jayanagar", "btm-layout", "bannerghatta-road", "kanakapura-road"],
    panditCount: "9+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Brigade Millennium", "Purva Coronation", "Sobha Opal", "Elita Promenade"],
    localSamagriNote: "Scriptural Dosh Nivaran and Hawans performed with authentic Navagraha samidha herbs.",
  },
  jayanagar: {
    name: "Jayanagar",
    nearby: ["jp-nagar", "btm-layout", "koramangala", "rajajinagar"],
    panditCount: "8+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Jayanagar 4th Block Homes", "Brigade Petunia", "Prestige Botanique", "Mantri Flora"],
    localSamagriNote: "Traditional Vedic pronunciation with detailed English and Hindi meaning for younger family members.",
  },
  hebbal: {
    name: "Hebbal",
    nearby: ["yelahanka", "malleshwaram", "indiranagar", "kr-puram"],
    panditCount: "9+ Certified Acharyas",
    reachTime: "Within 30–40 Mins",
    popularApartments: ["Godrej Woodsman Estate", "L&T Raintree Boulevard", "Prestige Misty Waters", "Brigade Caladium"],
    localSamagriNote: "Fast transit connectivity via Bellary Road ensuring timely arrival on all auspicious tithis.",
  },
  yelahanka: {
    name: "Yelahanka",
    nearby: ["hebbal", "malleshwaram", "kr-puram", "rajajinagar"],
    panditCount: "7+ Certified Acharyas",
    reachTime: "Within 35–45 Mins",
    popularApartments: ["Prestige Garden Bay", "Purva Venezia", "NCC Urban Aster", "Godrej Avenues"],
    localSamagriNote: "Spacious villa setups and community hall yagyas conducted with full Shastric paraphernalia.",
  },
  "btm-layout": {
    name: "BTM Layout",
    nearby: ["hsr-layout", "koramangala", "jp-nagar", "jayanagar"],
    panditCount: "10+ Certified Acharyas",
    reachTime: "Within 20–30 Mins",
    popularApartments: ["Umiya Oasis", "BTM Stage 2 Residences", "Salarpuria Sattva Melody", "Mantri Terrace"],
    localSamagriNote: "Convenient same-day booking options available for urgent muhurats.",
  },
  "bannerghatta-road": {
    name: "Bannerghatta Road",
    nearby: ["jp-nagar", "btm-layout", "electronic-city", "kanakapura-road"],
    panditCount: "8+ Certified Acharyas",
    reachTime: "Within 30–40 Mins",
    popularApartments: ["Mantri Pinnacle", "Valmark Apas", "Hulimavu Lake View Homes", "Purva Panorama"],
    localSamagriNote: "Authentic Til-Tarpan and sacred herbs sourced for peace and ancestral blessings.",
  },
  malleshwaram: {
    name: "Malleshwaram",
    nearby: ["rajajinagar", "hebbal", "indiranagar", "jayanagar"],
    panditCount: "7+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Salarpuria Sattva Luxuria", "Brigade Gateway", "Mantri Greens", "Renaissance Temple Bells"],
    localSamagriNote: "Traditional Vedic vidhi accompanied by precise planetary peace mantras.",
  },
  rajajinagar: {
    name: "Rajajinagar",
    nearby: ["malleshwaram", "jayanagar", "hebbal", "jp-nagar"],
    panditCount: "8+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Phoenix One Bangalore West", "Sobha Indraprastha", "Brigade Gateway Annex", "Purva Sunflower"],
    localSamagriNote: "Complete brass and copper ritual utensils provided with verified unadulterated ghee.",
  },
  "kanakapura-road": {
    name: "Kanakapura Road",
    nearby: ["jp-nagar", "bannerghatta-road", "jayanagar", "btm-layout"],
    panditCount: "8+ Certified Acharyas",
    reachTime: "Within 35–45 Mins",
    popularApartments: ["Brigade Meadows", "Mantri Tranquil", "Godrej Eternity", "Purva Highland"],
    localSamagriNote: "Environmentally conscious hawan rituals using organic guggal, loban, and samidha.",
  },
  "kr-puram": {
    name: "KR Puram",
    nearby: ["whitefield", "marathahalli", "hebbal", "bellandur"],
    panditCount: "11+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Salarpuria Sattva Celesta", "Monarch Aqua", "Brigade Buena Vista", "Pashmina Waterfront"],
    localSamagriNote: "Early morning Brahma Muhurat Griha Pravesh readiness across Old Madras Road societies.",
  },
};

const SERVICE_NAMES: Record<string, string> = {
  "annaprasan-sanskar-pooja": "Annaprashan Sanskar (First Rice Feeding)",
  "antim-sanskar": "Antim Sanskar (Antyesti Last Rites)",
  "bagulamukhi-anushthan": "Bagalamukhi Anushthan & Hawan",
  "bhoomi-pooja": "Bhoomi Pooja & Foundation Consecration",
  "birthday-ayushya-hawan": "Birthday Ayushya Hawan & Blessing",
  "dhanteras-pooja": "Dhanteras & Lord Dhanvantari Puja",
  "diwali-pooja": "Diwali Maha Lakshmi-Ganesh Pujan",
  "durgasaptsati-path": "Durga Saptashati Path & Pujan",
  "ekadashi-udyapan": "Ekadashi Vrat Udyapan Ceremony",
  "engagement-pooja": "Engagement (Sagai) & Ring Ceremony",
  "gandmool-nakshatra-shanti-pooja": "Gandmool Nakshatra Shanti Pooja",
  "godh-bharai-pooja": "Godh Bharai / Seemantam Blessing",
  "griha-pravesh-puja": "Griha Pravesh & Vastu Shanti Puja",
  "grihpravesh-puja": "Griha Pravesh & Vastu Shanti Puja",
  "kaal-sarp-dosh-pooja": "Kaal Sarp Dosh Nivaran Hawan",
  "karnabhed-sanskar": "Karnavedha Sanskar (Ear Piercing)",
  "mangal-dosh-shanti": "Mangal Dosh Shanti & Hawan",
  "mangalvari-udyapan": "Mangalvari Vrat Udyapan Ceremony",
  "manglik-dosh-shanti-pooja": "Manglik Dosh Shanti Pooja",
  "marriage-pooja": "Marriage (Vedic Vivah Sanskar)",
  "mundan-sanskar": "Mundan Sanskar (Chudakarana Ceremony)",
  "murti-pranpratistha": "Murti Pranapratishtha & Temple Consecration",
  "namkaran-sanskar": "Namkaran Sanskar (Naming Ceremony)",
  "namsanskar-special": "Namkaran Sanskar Special Vidhi",
  "navchandi-hawan": "Navchandi Mahayagya & Hawan",
  "navratri-pooja": "Navratri Ghatasthapana & Devi Pujan",
  "pitra-dosh-shanti": "Pitra Dosh & Tarpan Shanti",
  "pradosh-varat-udyapan": "Pradosh Vrat Udyapan & Shiva Pujan",
  "ramayana-path": "Ramayana (Ramcharitmanas) Akhand Path",
  "rudrabhishek-pooja": "Rudrabhishek Pooja & Shiva Hawan",
  "santan-gopal-jap-and-pooja": "Santan Gopal Japa, Hawan & Pooja",
  "satyanarayan-pooja": "Satyanarayan Bhagwan Katha & Puja",
  "sudarshan-anushthan": "Sudarshan Homa & Maha Anushthan",
  "sundarkand-path": "Sundarkand Recitation & Hawan",
  "terahvin-shanti-shradh": "Terahvin (13th Day) Shanti Shradh Ceremony",
  "upnayan-sanskar": "Upanayana (Janeu) Sanskar Ceremony",
  "vahan-pooja": "Vahan Puja (Vehicle Blessing Ceremony)",
  "vastu-shanti-pooja": "Vastu Shanti & Dosha Nivaran Puja",
  "vishnu-sahasranam-path": "Vishnu Sahasranama Path & Hawan",
  "vrihaspati-udyapan": "Vrihaspati (Jupiter) Vrat Udyapan",
};

const SUPPORT_PHONE = "9449871293";

function formatServiceName(slug: string): string {
  if (SERVICE_NAMES[slug]) return SERVICE_NAMES[slug];
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
    title: `Book Verified ${serviceTitle} in ${locData.name}, Bangalore (${locData.panditCount}) | PurohitSetu`,
    description: `Book verified North Indian Vedic Pandits for ${serviceTitle} in ${locData.name}, Bengaluru. Serving ${locData.popularApartments.slice(0, 3).join(", ")} with ${locData.reachTime} reach time.`,
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
  const bookingUrlWithParams = `/?puja=${encodeURIComponent(serviceTitle)}&area=${encodeURIComponent(locData.name)}#booking-section`;

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
              href={bookingUrlWithParams}
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

      {/* HERO SECTION WITH DYNAMIC HYPERLOCAL BADGES */}
      <section className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <span className="inline-block bg-orange-100 text-orange-950 border border-orange-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            🚩 Verified Vedic Service in {locData.name}
          </span>
          <span className="inline-block bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            👥 {locData.panditCount}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-3">
          Book Verified <span className="text-orange-700">{serviceTitle}</span> in {locData.name}, Bangalore
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed mb-6">
          Experienced North Indian, Hindi, Maithili &amp; Bhojpuri speaking Acharyas for authentic {serviceTitle} rituals across {locData.name}. 100% Shastric Vidhi, certified Hawan Samagri kit, and zero upfront fee.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={bookingUrlWithParams}
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

      {/* LOCAL APARTMENTS & PROTOCOL CARD (UNIQUE VALUE ADD) */}
      <section className="max-w-5xl mx-auto px-4 mb-4">
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-orange-950 mb-2">
            📍 Conducting {serviceTitle} Across {locData.name} Communities:
          </h2>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {locData.popularApartments.map((apt) => (
              <span key={apt} className="text-[11px] bg-white border border-amber-300 px-2 py-0.5 rounded text-slate-800 font-medium">
                🏢 {apt}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong>Transit &amp; Protocol:</strong> {locData.localSamagriNote} Acharyas arrive {locData.reachTime.toLowerCase()} with fully inspected Vedic herbs.
          </p>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-3">
          <h3 className="text-base font-black text-slate-900">
            Key Highlights of {serviceTitle}
          </h3>
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

      {/* CROSS-LINKING SILO: ALL 39 PUJAS IN SAME LOCALITY */}
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