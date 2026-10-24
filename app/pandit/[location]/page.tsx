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
  communityVibe: string;
  localSamagriNote: string;
}

const ALL_LOCALITIES: Record<string, LocalityDetails> = {
  whitefield: {
    name: "Whitefield",
    nearby: ["marathahalli", "bellandur", "kr-puram", "sarjapur-road"],
    panditCount: "14+ Certified Acharyas",
    reachTime: "Within 30–45 Mins",
    popularApartments: ["Prestige Shantiniketan", "Brigade Cosmopolis", "Godrej United", "Assetz Marq"],
    communityVibe: "Major IT corridor housing a large North Indian tech diaspora preferring authentic Bihari, UP & Maithili Vedic rituals.",
    localSamagriNote: "Pure mango wood (Aam ki lakdi) and Ganga jal pre-arranged directly for high-rise apartment safety guidelines.",
  },
  "hsr-layout": {
    name: "HSR Layout",
    nearby: ["koramangala", "bellandur", "btm-layout", "sarjapur-road"],
    panditCount: "11+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Sobha Classic", "Purva Vantage", "Salarpuria Serenity", "NCC Urban"],
    communityVibe: "Vibrant residential hub with strong North Indian cultural associations hosting regular Satyanarayan Katha & Hawans.",
    localSamagriNote: "Eco-friendly hawan kund setups customized for apartment balconies with low-smoke Vedic samidha.",
  },
  koramangala: {
    name: "Koramangala",
    nearby: ["hsr-layout", "indiranagar", "btm-layout", "jayanagar"],
    panditCount: "10+ Certified Acharyas",
    reachTime: "Within 20–30 Mins",
    popularApartments: ["Raheja Residency", "Adarsh Rhythm", "Prestige St. Johns", "Mantri Classic"],
    communityVibe: "Central cosmopolitan locality with established families seeking traditional Gurukul-trained Purohits for Griha Pravesh & Sanskars.",
    localSamagriNote: "Complete Shodashopachara dravyas sourced fresh on puja morning including lotus and durva.",
  },
  indiranagar: {
    name: "Indiranagar",
    nearby: ["koramangala", "marathahalli", "hebbal", "malleshwaram"],
    panditCount: "8+ Certified Acharyas",
    reachTime: "Within 25–40 Mins",
    popularApartments: ["Defiance Horizon", "Prestige Acropolis", "Chaitanya Samarpan", "Gopalan Grandeur"],
    communityVibe: "Prominent heritage and modern zone with executives looking for punctual, English and Hindi fluent Acharyas.",
    localSamagriNote: "Customized muhurat consultations provided according to Yajman's specific Janma Nakshatra.",
  },
  "electronic-city": {
    name: "Electronic City",
    nearby: ["hsr-layout", "bannerghatta-road", "btm-layout", "sarjapur-road"],
    panditCount: "12+ Certified Acharyas",
    reachTime: "Within 35–45 Mins",
    popularApartments: ["Ajmera Infinity", "Godrej E-City", "Salarpuria Sattva Greenage", "Prestige Sunrise Park"],
    communityVibe: "Dense tech professional base requiring weekend Griha Pravesh and early morning Brahma Muhurat pujan.",
    localSamagriNote: "Smoke-safe Vedic samagri kit prepared specifically conforming to automated fire alarm restrictions.",
  },
  marathahalli: {
    name: "Marathahalli",
    nearby: ["whitefield", "bellandur", "indiranagar", "kr-puram"],
    panditCount: "15+ Certified Acharyas",
    reachTime: "Within 20–30 Mins",
    popularApartments: ["Purva Riviera", "Rohan Viti", "Sowparnika Flamenco", "Divyasree Republic of Whitefield"],
    communityVibe: "High concentration of families from Bihar, Jharkhand, and UP seeking traditional Maithili and Bhojpuri purohits.",
    localSamagriNote: "Full hawans conducted with pure cow ghee and authentic Navagraha samidha woods.",
  },
  "sarjapur-road": {
    name: "Sarjapur Road",
    nearby: ["bellandur", "hsr-layout", "whitefield", "electronic-city"],
    panditCount: "13+ Certified Acharyas",
    reachTime: "Within 30–40 Mins",
    popularApartments: ["Prestige Lakeside Habitat", "Assetz 63 East", "Godrej 24", "SJR Parkway Homes"],
    communityVibe: "Fast-expanding residential belt with newly handed over gated villas and high-rises requiring Vastu Shanti and Griha Pravesh.",
    localSamagriNote: "Copper Hawan Kund and ceremonial brass utensils carried by our Purohits.",
  },
  bellandur: {
    name: "Bellandur",
    nearby: ["marathahalli", "sarjapur-road", "hsr-layout", "whitefield"],
    panditCount: "9+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Sobha Jasmine", "Adarsh Palm Retreat", "DN Oxford", "Mantri Espana"],
    communityVibe: "Lake-side IT families requesting authentic Hindi and Sanskrit chanting with crystal-clear explanation of mantras.",
    localSamagriNote: "Hassle-free complete samagri service: flowers, sweets, fruits, and pure bilva leaves included on request.",
  },
  "jp-nagar": {
    name: "JP Nagar",
    nearby: ["jayanagar", "btm-layout", "bannerghatta-road", "kanakapura-road"],
    panditCount: "9+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Brigade Millennium", "Purva Coronation", "Sobha Opal", "Elita Promenade"],
    communityVibe: "Serene south Bangalore zone with multi-lingual families seeking traditional Sanskars like Mundan and Janeu.",
    localSamagriNote: "Traditional Vedic vidhi accompanied by precise planetary peace mantras.",
  },
  jayanagar: {
    name: "Jayanagar",
    nearby: ["jp-nagar", "btm-layout", "koramangala", "rajajinagar"],
    panditCount: "8+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Jayanagar 4th Block Homes", "Brigade Petunia", "Prestige Botanique", "Mantri Flora"],
    communityVibe: "Culturally rich community appreciating pure Sanskrit recitations and disciplined Gurukul traditions.",
    localSamagriNote: "Complete authentic puja thali setup assistance provided on site.",
  },
  hebbal: {
    name: "Hebbal",
    nearby: ["yelahanka", "malleshwaram", "indiranagar", "kr-puram"],
    panditCount: "9+ Certified Acharyas",
    reachTime: "Within 30–40 Mins",
    popularApartments: ["Godrej Woodsman Estate", "L&T Raintree Boulevard", "Prestige Misty Waters", "Brigade Caladium"],
    communityVibe: "North Bengaluru hub connecting Manyata tech park professionals seeking verified Purohits for prompt weekend rituals.",
    localSamagriNote: "Certified Shastric hawan samagri supplied directly from authentic Varanasi vendors.",
  },
  yelahanka: {
    name: "Yelahanka",
    nearby: ["hebbal", "malleshwaram", "kr-puram", "rajajinagar"],
    panditCount: "7+ Certified Acharyas",
    reachTime: "Within 35–45 Mins",
    popularApartments: ["Prestige Garden Bay", "Purva Venezia", "NCC Urban Aster", "Godrej Avenues"],
    communityVibe: "Spacious suburban gated societies with families hosting full-scale Navchandi and Rudrabhishek Hawans.",
    localSamagriNote: "Full support for large community and villa premises hawan setups.",
  },
  "btm-layout": {
    name: "BTM Layout",
    nearby: ["hsr-layout", "koramangala", "jp-nagar", "jayanagar"],
    panditCount: "10+ Certified Acharyas",
    reachTime: "Within 20–30 Mins",
    popularApartments: ["Umiya Oasis", "BTM Stage 2 Residences", "Salarpuria Sattva Melody", "Mantri Terrace"],
    communityVibe: "Active hub with young couples organizing first Griha Pravesh, Vahan Puja, and Satyanarayan Kathas.",
    localSamagriNote: "Quick availability for urgent muhurat dates and emergency pujan requests.",
  },
  "bannerghatta-road": {
    name: "Bannerghatta Road",
    nearby: ["jp-nagar", "btm-layout", "electronic-city", "kanakapura-road"],
    panditCount: "8+ Certified Acharyas",
    reachTime: "Within 30–40 Mins",
    popularApartments: ["Mantri Pinnacle", "Valmark Apas", "Hulimavu Lake View Homes", "Purva Panorama"],
    communityVibe: "Prominent residential belt preferring complete Shastric vidhi for Dosh Nivaran and Ancestral Shradh ceremonies.",
    localSamagriNote: "Pavitra ganga jal and authentic kush grass mats provided for seated family sankalp.",
  },
  malleshwaram: {
    name: "Malleshwaram",
    nearby: ["rajajinagar", "hebbal", "indiranagar", "jayanagar"],
    panditCount: "7+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Salarpuria Sattva Luxuria", "Brigade Gateway", "Mantri Greens", "Renaissance Temple Bells"],
    communityVibe: "Vedic heritage center where devotees seek deep spiritual accuracy and pure ritualistic discipline.",
    localSamagriNote: "Traditional Vedic muhurat calculation provided complimentary with every booking.",
  },
  rajajinagar: {
    name: "Rajajinagar",
    nearby: ["malleshwaram", "jayanagar", "hebbal", "jp-nagar"],
    panditCount: "8+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Phoenix One Bangalore West", "Sobha Indraprastha", "Brigade Gateway Annex", "Purva Sunflower"],
    communityVibe: "Esteemed commercial and residential hub hosting festive Hawans, Vivah Sanskar, and Annaprashan ceremonies.",
    localSamagriNote: "Complete copper Homa vessels and high-purity Ghee ensured for sacred fire rites.",
  },
  "kanakapura-road": {
    name: "Kanakapura Road",
    nearby: ["jp-nagar", "bannerghatta-road", "jayanagar", "btm-layout"],
    panditCount: "8+ Certified Acharyas",
    reachTime: "Within 35–45 Mins",
    popularApartments: ["Brigade Meadows", "Mantri Tranquil", "Godrej Eternity", "Purva Highland"],
    communityVibe: "Quiet township developments with spiritual residents prioritizing authentic Vedic chanting and Meditation rituals.",
    localSamagriNote: "Balcony-friendly portable hawan kunds with minimum smoke generation available.",
  },
  "kr-puram": {
    name: "KR Puram",
    nearby: ["whitefield", "marathahalli", "hebbal", "bellandur"],
    panditCount: "11+ Certified Acharyas",
    reachTime: "Within 25–35 Mins",
    popularApartments: ["Salarpuria Sattva Celesta", "Monarch Aqua", "Brigade Buena Vista", "Pashmina Waterfront"],
    communityVibe: "Crucial eastern residential nexus where North Indian migrants seek Hindi, Bihari, and Maithili Purohits.",
    localSamagriNote: "Round-the-clock availability for auspicious Griha Pravesh muhurats including early dawn.",
  },
};

const ALL_PUJAS_LIST = [
  { slug: "annaprasan-sanskar-pooja", title: "Annaprashan Sanskar (First Rice Feeding)" },
  { slug: "antim-sanskar", title: "Antim Sanskar (Antyesti Last Rites)" },
  { slug: "bagulamukhi-anushthan", title: "Bagalamukhi Anushthan & Hawan" },
  { slug: "bhoomi-pooja", title: "Bhoomi Pooja & Foundation Consecration" },
  { slug: "birthday-ayushya-hawan", title: "Birthday Ayushya Hawan & Blessing" },
  { slug: "dhanteras-pooja", title: "Dhanteras & Lord Dhanvantari Puja" },
  { slug: "diwali-pooja", title: "Diwali Maha Lakshmi-Ganesh Pujan" },
  { slug: "durgasaptsati-path", title: "Durga Saptashati Path & Pujan" },
  { slug: "ekadashi-udyapan", title: "Ekadashi Vrat Udyapan Ceremony" },
  { slug: "engagement-pooja", title: "Engagement (Sagai) & Ring Ceremony" },
  { slug: "gandmool-nakshatra-shanti-pooja", title: "Gandmool Nakshatra Shanti Pooja" },
  { slug: "godh-bharai-pooja", title: "Godh Bharai / Seemantam Blessing" },
  { slug: "griha-pravesh-puja", title: "Griha Pravesh & Vastu Shanti Puja" },
  { slug: "kaal-sarp-dosh-pooja", title: "Kaal Sarp Dosh Nivaran Hawan" },
  { slug: "karnabhed-sanskar", title: "Karnavedha Sanskar (Ear Piercing)" },
  { slug: "mangal-dosh-shanti", title: "Mangal Dosh Shanti & Hawan" },
  { slug: "mangalvari-udyapan", title: "Mangalvari Vrat Udyapan Ceremony" },
  { slug: "manglik-dosh-shanti-pooja", title: "Manglik Dosh Shanti Pooja" },
  { slug: "marriage-pooja", title: "Marriage (Vedic Vivah Sanskar)" },
  { slug: "mundan-sanskar", title: "Mundan Sanskar (Chudakarana Ceremony)" },
  { slug: "murti-pranpratistha", title: "Murti Pranapratishtha & Temple Consecration" },
  { slug: "namkaran-sanskar", title: "Namkaran Sanskar (Naming Ceremony)" },
  { slug: "namsanskar-special", title: "Namkaran Sanskar Special Vidhi" },
  { slug: "navchandi-hawan", title: "Navchandi Mahayagya & Hawan" },
  { slug: "navratri-pooja", title: "Navratri Ghatasthapana & Devi Pujan" },
  { slug: "pitra-dosh-shanti", title: "Pitra Dosh & Tarpan Shanti" },
  { slug: "pradosh-varat-udyapan", title: "Pradosh Vrat Udyapan & Shiva Pujan" },
  { slug: "ramayana-path", title: "Ramayana (Ramcharitmanas) Akhand Path" },
  { slug: "rudrabhishek-pooja", title: "Rudrabhishek Pooja & Shiva Hawan" },
  { slug: "santan-gopal-jap-and-pooja", title: "Santan Gopal Japa, Hawan & Pooja" },
  { slug: "satyanarayan-pooja", title: "Satyanarayan Bhagwan Katha & Puja" },
  { slug: "sudarshan-anushthan", title: "Sudarshan Homa & Maha Anushthan" },
  { slug: "sundarkand-path", title: "Sundarkand Recitation & Hawan" },
  { slug: "terahvin-shanti-shradh", title: "Terahvin (13th Day) Shanti Shradh Ceremony" },
  { slug: "upnayan-sanskar", title: "Upanayana (Janeu) Sanskar Ceremony" },
  { slug: "vahan-pooja", title: "Vahan Puja (Vehicle Blessing Ceremony)" },
  { slug: "vastu-shanti-pooja", title: "Vastu Shanti & Dosha Nivaran Puja" },
  { slug: "vishnu-sahasranam-path", title: "Vishnu Sahasranama Path & Hawan" },
  { slug: "vrihaspati-udyapan", title: "Vrihaspati (Jupiter) Vrat Udyapan" },
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
    title: `North Indian Vedic Pandit in ${locData.name}, Bangalore (${locData.panditCount}) | PurohitSetu`,
    description: `Book verified North Indian, Hindi, Bihari & Maithili Vedic Pandits in ${locData.name}, Bengaluru. ${locData.panditCount} available with ${locData.reachTime} reach time across ${locData.popularApartments.slice(0, 2).join(", ")}.`,
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

  const bookingUrlForArea = `/?area=${encodeURIComponent(locData.name)}#booking-section`;

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
              href={bookingUrlForArea}
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

      {/* HERO SECTION WITH DYNAMIC HYPERLOCAL BADGES */}
      <section className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <span className="inline-block bg-orange-100 text-orange-950 border border-orange-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            📍 {locData.panditCount} in {locData.name}
          </span>
          <span className="inline-block bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            ⚡ Avg Reach: {locData.reachTime}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-3">
          North Indian &amp; Vedic Pandit in <span className="text-orange-700">{locData.name}</span>, Bangalore
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed mb-6">
          {locData.communityVibe} Experienced Acharyas proficient in Hindi, Maithili, and Bhojpuri for all 39 Vedic rituals.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={bookingUrlForArea}
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

      {/* UNIQUE LOCALITY INTEL (GOOGLE-FRIENDLY HYPERLOCAL SECTION) */}
      <section className="max-w-5xl mx-auto px-4 mb-6">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-orange-950 mb-3 flex items-center gap-1.5">
            <span>🏛️</span> Local Service Footprint in {locData.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            <div>
              <strong className="block text-slate-900 mb-1">Frequently Served Societies &amp; High-Rises:</strong>
              <div className="flex flex-wrap gap-1.5">
                {locData.popularApartments.map((apt) => (
                  <span key={apt} className="bg-white border border-amber-300 px-2 py-0.5 rounded text-[11px] font-medium text-slate-800">
                    🏢 {apt}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong className="block text-slate-900 mb-1">Local Samagri &amp; Safety Protocol:</strong>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {locData.localSamagriNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLETE CEREMONIES DIRECTORY */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="border-b border-amber-200 pb-2 mb-4 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Sacred Ceremonies Conducted in {locData.name}
            </h2>
            <p className="text-xs text-slate-600">All rituals performed with 100% Shastric vidhi and genuine hawan samagri.</p>
          </div>
          <span className="text-xs font-bold text-orange-800 bg-orange-100 px-2.5 py-1 rounded-full">
            {ALL_PUJAS_LIST.length} Rituals Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {ALL_PUJAS_LIST.map((ritual) => (
            <div key={ritual.slug} className="bg-white border border-amber-200 rounded-xl p-3 shadow-xs flex flex-col justify-between hover:border-orange-400 transition">
              <div>
                <span className="text-orange-600 font-bold text-sm block mb-1">🪔</span>
                <h3 className="text-xs font-bold text-slate-900 mb-1">{ritual.title}</h3>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Authentic sankalp, mantras, and hawan in {locData.name}.
                </p>
              </div>
              <Link
                href={`/pandit/${slug}/${ritual.slug}`}
                className="mt-3 inline-block text-[11px] text-orange-700 font-bold hover:underline"
              >
                View {ritual.title} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CROSS-LINKING SILO: NEARBY LOCALITIES */}
      <section className="max-w-5xl mx-auto px-4 py-8 bg-amber-50/60 rounded-2xl border border-amber-200 my-6">
        <h3 className="text-xs font-extrabold text-orange-950 uppercase tracking-wider mb-2">
          Also Serving Localities Near {locData.name}
        </h3>
        <p className="text-[11px] text-slate-600 mb-3">
          Our verified North Indian Pandits travel to apartments and individual houses in adjacent zones:
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

      {/* ALL BENGALURU LOCALITIES */}
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
        
        {/* DEVELOPER CREDIT */}
        <div className="mt-3 pt-3 border-t border-orange-700/50 text-[10px] text-orange-200/90 font-medium">
          Created and Designed by <span className="font-bold text-amber-300">Prince Pandey</span> • Mob:{" "}
          <a href="tel:+917667984349" className="hover:text-white underline underline-offset-2 font-bold">
            +91 7667984349
          </a>
        </div>
      </footer>
    </div>
  );
}