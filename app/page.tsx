"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PujaItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  duration: string;
  rating: string;
  conductedCount: string;
  tag: string;
  img: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pujaName: "Vedic Vivah Sanskar (Marriage)",
    language: "Hindi",
    area: "",
    pincode: "",
    address: "",
    date: "",
    timeSlot: "Morning (08:00 AM - 11:00 AM)",
    samagri: true,
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const categories = [
    "All",
    "Life Sanskars",
    "Festivals",
    "Dosh Nivaran",
    "Antim Sanskar & Shradh",
  ];

  const pujaList: PujaItem[] = [
    // 1. Life Sanskars
    {
      id: "vivah-sanskar",
      name: "Vedic Vivah Sanskar (Marriage)",
      category: "Life Sanskars",
      desc: "Sacred matrimony rituals: Kanyadaan, Saptapadi (Seven Vows), Mangalsutra Dharan, and Vivah Hawan.",
      duration: "Full Ritual",
      rating: "5.0",
      conductedCount: "890+",
      tag: "Sacred Matrimony",
      img: "/poojas/marriage ppoja.jpeg",
    },
    {
      id: "sagai-ceremony",
      name: "Sagai & Ring Engagement Ceremony",
      category: "Life Sanskars",
      desc: "Traditional pre-wedding auspicious ritual including Tilak, Lagna Patrika recitation, and family blessings.",
      duration: "2 Hours",
      rating: "4.8",
      conductedCount: "710+",
      tag: "Pre-Wedding",
      img: "/poojas/engement pooja.jpeg",
    },
    {
      id: "annaprashan",
      name: "Annaprashan Sanskar (First Rice Feeding)",
      category: "Life Sanskars",
      desc: "First solid food offering to the child with divine mantras, Panchamrit tasting, and longevity prayers.",
      duration: "2 Hours",
      rating: "4.9",
      conductedCount: "1,120+",
      tag: "Child Milestone",
      img: "/poojas/annaprasan sanskar pooja.png",
    },
    {
      id: "mundan-sanskar",
      name: "Mundan Sanskar (Chudakarana)",
      category: "Life Sanskars",
      desc: "Sacred first hair removal ritual purifying the child of past life samskaras and promoting health and acuity.",
      duration: "2 Hours",
      rating: "4.8",
      conductedCount: "980+",
      tag: "Purification Rite",
      img: "/poojas/mundan sanskar.jpeg",
    },
    {
      id: "upnayan-sanskar",
      name: "Upanayana / Janeu Sanskar",
      category: "Life Sanskars",
      desc: "Sacred thread investiture ceremony initiating youth into Gayatri Mantra upasana and Vedic student discipline.",
      duration: "4 - 5 Hours",
      rating: "4.9",
      conductedCount: "430+",
      tag: "Spiritual Rebirth",
      img: "/poojas/upnayan sanskar.jpeg",
    },
    {
      id: "karnavedha",
      name: "Karnavedha Sanskar (Ear Piercing)",
      category: "Life Sanskars",
      desc: "Vedic ceremony for ear-piercing aimed at holistic wellbeing, auditory vitality, and intellectual acuity.",
      duration: "1.5 Hours",
      rating: "4.7",
      conductedCount: "350+",
      tag: "Health & Sanskar",
      img: "/poojas/karnbhed sanskar.jpeg",
    },
    {
      id: "godh-bharai",
      name: "Godh Bharai / Seemantam Sanskar",
      category: "Life Sanskars",
      desc: "Joyous Vedic blessing for expectant mothers ensuring spiritual protection and auspiciousness for mother and baby.",
      duration: "2 - 3 Hours",
      rating: "4.9",
      conductedCount: "820+",
      tag: "Maternal Blessing",
      img: "/poojas/godbharai pooja.jpeg",
    },
    {
      id: "birthday-aayushya",
      name: "Janamdin & Aayushya Hawan",
      category: "Life Sanskars",
      desc: "Family birthday blessing invoking Markandeya Rishi and Chiranjeevi deities for robust health and long life.",
      duration: "2 Hours",
      rating: "4.9",
      conductedCount: "1,450+",
      tag: "Longevity & Health",
      img: "/poojas/birthday.jpeg",
    },

    // 2. Festivals
    {
      id: "navratri-puja",
      name: "Navratri Ghatasthapana & Pujan",
      category: "Festivals",
      desc: "Sacred Kalash installation on Pratipada followed by daily Devi aradhana, Akhand Jyot, and Kanya Pujan.",
      duration: "3 Hours",
      rating: "5.0",
      conductedCount: "1,890+",
      tag: "Navratri Special",
      img: "/poojas/navratri pooja.jpeg",
    },
    {
      id: "durga-saptashati",
      name: "Durga Saptashati Path & Pujan",
      category: "Festivals",
      desc: "Authentic recitation of the complete Devi Mahatmya along with Kavach, Argala, and Kilak stotras.",
      duration: "4 - 5 Hours",
      rating: "4.9",
      conductedCount: "670+",
      tag: "Shakti Upasana",
      img: "/poojas/durgasaptsati.jpeg",
    },
    {
      id: "navchandi-yagya",
      name: "Navchandi Mahayagya & Hawan",
      category: "Festivals",
      desc: "Grand sacrificial yagya purifying the atmosphere, dispelling adversities, and bestowing divine grace.",
      duration: "5 Hours",
      rating: "5.0",
      conductedCount: "310+",
      tag: "Grand Anushthan",
      img: "/poojas/navchandi hawan.jpeg",
    },
    {
      id: "diwali-puja",
      name: "Deepawali Lakshmi-Ganesh Pujan",
      category: "Festivals",
      desc: "Complete Shodashopachara Lakshmi-Ganesha pujan with Bahi-Khata invocation, deepak daan, and Aarti.",
      duration: "2 - 3 Hours",
      rating: "5.0",
      conductedCount: "2,980+",
      tag: "Festival of Lights",
      img: "/poojas/diwali pooja.jpeg",
    },
    {
      id: "dhanteras-puja",
      name: "Dhanteras & Lord Dhanvantari Puja",
      category: "Festivals",
      desc: "Invocation of Lord Dhanvantari and Kuber Dev for health, physical healing, and financial harmony.",
      duration: "2 Hours",
      rating: "4.8",
      conductedCount: "1,140+",
      tag: "Health & Wealth",
      img: "/poojas/dhanteras pooja.jpeg",
    },

    // 3. Dosh Nivaran
    {
      id: "kaal-sarp",
      name: "Kaal Sarp Dosh Nivaran Hawan",
      category: "Dosh Nivaran",
      desc: "Vedic Rahu-Ketu pacification ritual using silver Nag-Nagin yantra, specialized herbs, and Sarpa Suktam ahutis.",
      duration: "3 - 4 Hours",
      rating: "4.9",
      conductedCount: "1,210+",
      tag: "Dosha Shanti",
      img: "/poojas/kaalsarp dosh pooja.jpeg",
    },
    {
      id: "mangal-dosh",
      name: "Mangal Dosh Shanti & Hawan",
      category: "Dosh Nivaran",
      desc: "Scriptural Mars pacification ceremony honoring Lord Angaraka to mitigate obstacles in marriage and career.",
      duration: "2.5 Hours",
      rating: "4.8",
      conductedCount: "1,450+",
      tag: "Manglik Relief",
      img: "/poojas/mangaldosh.jpeg",
    },
    {
      id: "pitra-dosh",
      name: "Pitra Dosh Shanti & Tarpan Puja",
      category: "Dosh Nivaran",
      desc: "Propitiation of ancestral spirits through Til-Tarpan and Brahmana Bhojan to bring peace and relief from doshas.",
      duration: "3 Hours",
      rating: "4.9",
      conductedCount: "1,320+",
      tag: "Ancestral Harmony",
      img: "/poojas/pitrishanti.jpeg",
    },

    // 4. Antim Sanskar & Shradh
    {
      id: "antim-sanskar",
      name: "Antyesti / Last Rites Vedic Rituals",
      category: "Antim Sanskar & Shradh",
      desc: "Solemn scriptural cremation and Vedic transition guidance strictly in accordance with Garuda Purana rites.",
      duration: "As Prescribed",
      rating: "5.0",
      conductedCount: "580+",
      tag: "Sacred Final Journey",
      img: "/poojas/antaimsanskar.jpeg",
    },
    {
      id: "terahvin-shanti",
      name: "Terahvin & Shanti Hawan Ceremony",
      category: "Antim Sanskar & Shradh",
      desc: "Thirteenth-day culmination ritual concluding mourning rites with Shanti Hawan and parivarik blessings.",
      duration: "3 Hours",
      rating: "4.9",
      conductedCount: "820+",
      tag: "Parivarik Shanti",
      img: "/poojas/terhvi sradhy.jpeg",
    },
  ];

  const filteredPujas = pujaList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectPujaToBook = (pujaTitle: string) => {
    setFormData((prev) => ({ ...prev, pujaName: pujaTitle }));
    const element = document.getElementById("booking-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const { error } = await supabase.from("bookings").insert([
        {
          name: formData.name,
          phone: formData.phone,
          puja_name: formData.pujaName,
          language: formData.language,
          area: formData.area,
          pincode: formData.pincode,
          address: formData.address,
          date: formData.date,
          time_slot: formData.timeSlot,
          samagri: formData.samagri,
        },
      ]);

      if (error) throw error;

      setStatusMsg({
        type: "success",
        text: "🚩 Har Har Mahadev! Your sacred booking request has been successfully registered. A verified Vedic Purohit proficient in your language and locality will be assigned immediately.",
      });

      setFormData({
        name: "",
        phone: "",
        pujaName: "Vedic Vivah Sanskar (Marriage)",
        language: "Hindi",
        area: "",
        pincode: "",
        address: "",
        date: "",
        timeSlot: "Morning (08:00 AM - 11:00 AM)",
        samagri: true,
      });
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: "Booking submission failed: " + (err.message || "Please check your network and try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 font-sans selection:bg-orange-600 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-gradient-to-r from-red-800 via-orange-600 to-amber-700 text-white text-xs sm:text-sm font-medium py-2 px-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
          </span>
          <p className="tracking-wide text-center">
            <strong>Auspicious Muhurat Allocation Active:</strong> Certified Vedic Acharyas available across all zones in Bengaluru • 100% Authentic Shastric Rituals
          </p>
        </div>
      </div>

      {/* 2. GRAND HEADER WITH HAMBURGER MENU */}
      <header className="bg-white/95 backdrop-blur-md border-b border-amber-200 sticky top-8 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex justify-between items-center">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-orange-300">
              ॐ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <a href="#home-section" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-orange-600 to-amber-700 tracking-tight">
                  PurohitSetu
                </a>
                <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                  📍 Bengaluru
                </span>
              </div>
              <p className="text-[10px] font-semibold text-amber-900 tracking-wider uppercase">
                Sacred Vedic Rituals • Shastric Discipline
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-700">
            <a href="#home-section" className="hover:text-orange-600 transition">Home</a>
            <a href="#services-section" className="hover:text-orange-600 transition">Puja Services</a>
            <a href="#about-section" className="hover:text-orange-600 transition">About Us</a>
            <a href="#contact-section" className="hover:text-orange-600 transition">Contact Us</a>
          </nav>

          {/* Right Action & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <a
              href="#booking-section"
              className="hidden sm:inline-flex bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition transform hover:scale-105"
            >
              Book Puja Now
            </a>

            {/* Three-Line Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="p-2 rounded-xl border border-amber-300 bg-amber-50 text-slate-800 hover:bg-amber-100 transition focus:outline-none"
            >
              <div className="w-6 h-4 flex flex-col justify-between">
                <span className={`h-0.5 bg-slate-800 rounded transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
                <span className={`h-0.5 bg-slate-800 rounded transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}></span>
                <span className={`h-0.5 bg-slate-800 rounded transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMenuOpen && (
          <div className="bg-white border-b border-amber-200 shadow-xl px-6 py-5 animate-in fade-in duration-200">
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-800">
              <a
                href="#home-section"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-orange-600 py-1 border-b border-amber-50 flex items-center justify-between"
              >
                <span>🏠 Home</span>
                <span className="text-xs text-slate-400">→</span>
              </a>
              <a
                href="#services-section"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-orange-600 py-1 border-b border-amber-50 flex items-center justify-between"
              >
                <span>🪔 Vedic Puja Services</span>
                <span className="text-xs text-slate-400">→</span>
              </a>
              <a
                href="#about-section"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-orange-600 py-1 border-b border-amber-50 flex items-center justify-between"
              >
                <span>📜 About PurohitSetu</span>
                <span className="text-xs text-slate-400">→</span>
              </a>
              <a
                href="#contact-section"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-orange-600 py-1 flex items-center justify-between"
              >
                <span>✉️ Official Contact</span>
                <span className="text-xs text-slate-400">→</span>
              </a>
              <a
                href="#booking-section"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 text-center py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold"
              >
                Book a Vedic Puja Now
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section id="home-section" className="bg-gradient-to-b from-orange-100/70 via-amber-50/50 to-[#FFFDF7] pt-12 pb-14 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-950 border border-orange-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
            <span>🪔</span> Authentic Vedic Tradition • Gurukul-Trained Acharyas
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
            Perform Sacred Vedic Rituals At Home <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-amber-600">
              With Reverence, Purity & Scriptural Precision
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Bengaluru’s dedicated platform connecting devout Yajmans directly with verified Vedic Purohits. Zero superstitions, no commercial horoscopes — strictly pure, authentic Sanskars performed according to Shastras.
          </p>

          {/* Interactive Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6 shadow-xl rounded-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-base">
              🔍
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pujas: 'Vivah', 'Navratri', 'Dhanteras', 'Kaal Sarp'..."
              className="w-full pl-12 pr-20 py-4 bg-white border-2 border-orange-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-4 py-2 rounded-full transition duration-200 ${
                  selectedCategory === cat
                    ? "bg-orange-600 text-white shadow-md shadow-orange-500/25"
                    : "bg-white text-slate-700 border border-amber-200 hover:bg-amber-100/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PUJA SERVICES DIRECTORY */}
      <section id="services-section" className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-amber-200/80 pb-4">
          <div>
            <span className="text-orange-600 font-extrabold uppercase tracking-widest text-xs">Sanatan Sanskar Suchi</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Vedic Pujas & Hawan Ceremonies
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select an auspicious ritual to view specifications and book an ordained Pandit Ji.
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full border border-orange-300">
              Showing {filteredPujas.length} Sacred Services
            </span>
          </div>
        </div>

        {/* Puja Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPujas.map((puja) => (
            <div
              key={puja.id}
              className="group bg-white rounded-3xl border border-amber-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-400 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 w-full bg-amber-50 overflow-hidden">
                <img
                  src={puja.img}
                  alt={puja.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <span className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                  {puja.tag}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white flex justify-between items-end">
                  <div className="text-xs font-bold flex items-center gap-1 text-yellow-300">
                    ★ {puja.rating} <span className="text-slate-300 text-[10px]">({puja.conductedCount})</span>
                  </div>
                  <div className="text-[11px] bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-white font-medium border border-white/20">
                    ⏱ {puja.duration}
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
                    {puja.category}
                  </span>
                  <h4 className="font-black text-base text-slate-900 mb-2 group-hover:text-orange-600 transition">
                    {puja.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {puja.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectPujaToBook(puja.name)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow transition-all duration-200 active:scale-95 flex items-center justify-center gap-1"
                >
                  Book Ritual Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ABOUT US SECTION */}
      <section id="about-section" className="bg-gradient-to-br from-amber-100/40 via-orange-50/30 to-amber-100/50 py-16 px-4 sm:px-8 border-y border-amber-200 my-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-600 font-extrabold uppercase text-xs tracking-widest">
              Sanatan Heritage & Trust
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
              About PurohitSetu
            </h3>
            <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto mt-2 leading-relaxed">
              Preserving Vedic authenticity and restoring the sacred sanctity of Hindu Sanskars for urban families across Bengaluru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-7 rounded-3xl border border-amber-200 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xl mb-4">
                🌿
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">Purity in Shastras, Zero Gimmicks</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                PurohitSetu is solely dedicated to legitimate Vedic ceremonies and Hawans. We intentionally exclude speculative astrology, fortune telling, and commercial matchmaking to keep our worship pure and grounded in devotion.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-amber-200 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xl mb-4">
                🕉
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">Gurukul-Ordained Vedic Acharyas</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every Purohit Ji on our platform has verified credentials in Vedic pathshala traditions, ensuring precise Sanskrit mantra pronunciation, thorough vidhi knowledge, and utmost spiritual reverence.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-amber-200 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xl mb-4">
                🗣
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">Regional Languages & Traditions</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every family’s ancestral rituals are unique. We connect you with Purohits conversant in Hindi, Maithili, Bhojpuri, Sanskrit, Kannada, and Telugu so your family completely comprehends the sacred rites.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-amber-200 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xl mb-4">
                🔥
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2">Complete Hawan Samagri Management</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                No more running around finding specialized herbs and woods. Our ordained Purohits arrive on time equipped with authenticated puja kits, Gangajal, and Hawan essentials.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl border border-amber-300 p-6 text-center max-w-3xl mx-auto shadow-sm">
            <h5 className="font-black text-slate-900 text-sm sm:text-base mb-1">
              "यतो धर्मस्ततो जयः — Where there is Dharma, there is Divine Victory"
            </h5>
            <p className="text-xs text-slate-600">
              Our continuous goal is making high-standard Vedic rituals accessible, dignified, and uncomplicated for every home in Bengaluru.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BOOKING FORM SECTION */}
      <section id="booking-section" className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border-2 border-orange-300 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500"></div>

          <div className="text-center mb-8">
            <span className="bg-orange-100 text-orange-900 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Yajman Ritual Request Portal
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Book a Certified Vedic Purohit
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Fill in your ritual details below. Your reservation is routed to our verified Pandit Ji system.
            </p>
          </div>

          {statusMsg && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold mb-6 ${
                statusMsg.type === "success"
                  ? "bg-green-100 text-green-950 border border-green-300"
                  : "bg-red-100 text-red-950 border border-red-300"
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Yajman Name (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact (WhatsApp Enabled) *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Sacred Ritual / Puja *</label>
                <select
                  value={formData.pujaName}
                  onChange={(e) => setFormData({ ...formData, pujaName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm bg-white"
                >
                  {pujaList.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                  <option value="Other Custom Vedic Ritual">Other Custom Vedic Ritual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purohit Preferred Language *</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm bg-white"
                >
                  <option value="Hindi">Hindi</option>
                  <option value="Maithili">Maithili</option>
                  <option value="Bhojpuri">Bhojpuri</option>
                  <option value="Sanskrit">Sanskrit (Pure Vedic)</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Telugu">Telugu</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bengaluru Zone / Locality *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HSR Layout, Whitefield, Koramangala"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bengaluru Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="560xxx"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Complete Address / Venue Details *</label>
              <textarea
                rows={2}
                required
                placeholder="Apartment/Villa No., Society Name, Landmark..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Puja Date (Auspicious Tithi) *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Auspicious Time Slot *</label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm bg-white"
                >
                  <option value="Morning (06:00 AM - 09:00 AM)">Pratah Kaal (06:00 AM - 09:00 AM)</option>
                  <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 03:00 PM)">Afternoon (12:00 PM - 03:00 PM)</option>
                  <option value="Evening (05:00 PM - 08:00 PM)">Sandhya / Evening (05:00 PM - 08:00 PM)</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex items-center gap-3">
              <input
                type="checkbox"
                id="samagri-box"
                checked={formData.samagri}
                onChange={(e) => setFormData({ ...formData, samagri: e.target.checked })}
                className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
              />
              <label htmlFor="samagri-box" className="text-xs sm:text-sm text-slate-800 font-medium cursor-pointer">
                <strong>Include Complete Sacred Hawan & Puja Samagri Kit</strong> (Purohit Ji will carry all consecrated woods, herbs, Gangajal, and ritual items).
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-600 text-white font-black text-sm sm:text-base shadow-xl shadow-orange-500/25 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
            >
              {loading ? "Registering Sacred Booking..." : "🚩 Confirm Booking & Request Pandit Ji"}
            </button>
          </form>
        </div>
      </section>

      {/* 7. OFFICIAL CONTACT US SECTION */}
      <section id="contact-section" className="bg-white py-12 px-4 border-t border-amber-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-orange-600 font-extrabold uppercase text-xs tracking-widest">
            Direct Coordination & Queries
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1 mb-2">
            Contact Official Support
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-6">
            For specific ritual customisations, special anushthan consultations, or booking status inquiries, reach out to our team.
          </p>

          <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-amber-50 border border-amber-300 px-6 py-4 rounded-2xl shadow-sm">
            <span className="text-xl">✉️</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Official Support Email:</span>
            <a
              href="mailto:support.purohitsetu@gmail.com"
              className="text-xs sm:text-sm font-extrabold text-orange-700 hover:text-red-700 underline"
            >
              support.purohitsetu@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 text-center text-xs border-t-4 border-orange-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-lg">ॐ</span>
            <span className="font-extrabold text-white text-sm">PurohitSetu Bengaluru</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Dedicated Vedic Puja Services • Authentic Tradition • No Astrological Gimmicks
          </p>
          <p>© 2026 PurohitSetu. Sarve Bhavantu Sukhinah.</p>
        </div>
      </footer>
    </div>
  );
}