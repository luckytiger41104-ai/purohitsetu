"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  seoKeyword: string;
}

const DAKSHINA_PRESETS = [101, 251, 501, 1100, 2100, 5100];

const BENGALURU_LOCALITIES = [
  "Whitefield",
  "HSR Layout",
  "Koramangala",
  "Indiranagar",
  "Electronic City",
  "Marathahalli",
  "Sarjapur Road",
  "Bellandur",
  "JP Nagar",
  "Jayanagar",
  "Hebbal",
  "Yelahanka",
  "BTM Layout",
  "Bannerghatta Road",
  "Malleshwaram",
  "Rajajinagar",
  "Kanakapura Road",
  "KR Puram",
];

const HIGH_INTENT_KEYWORDS = [
  "North Indian Pandit in Bangalore",
  "Hindi Pandit in Bengaluru",
  "Bihari Pandit in Bangalore",
  "Maithili Purohit Bengaluru",
  "Bhojpuri Pandit Ji Bangalore",
  "Pandit for Griha Pravesh in Bangalore",
  "Satyanarayan Puja Pandit near me",
  "Vedic Marriage Pandit Bangalore",
  "Navchandi Hawan Acharya Bengaluru",
  "Rudrabhishek Puja Pandit",
  "Vastu Shanti Puja Bangalore",
  "Mundan Sanskar Pandit in Bengaluru",
  "Antim Sanskar Last Rites Pandit Bangalore",
  "Terahvin Shanti Hawan Purohit",
  "Kaal Sarp Dosh Nivaran Bangalore",
  "Mangal Dosh Shanti Acharya",
  "Pitra Dosh Puja Pandit Bangalore",
  "Godh Bharai Seemantam Pandit",
  "Upanayana Janeu Sanskar Bangalore",
  "Kannada Vedic Purohit",
  "Telugu Purohit in Bengaluru",
  "Best Vedic Pandit near me",
  "Vedic Hawan Samagri Kit Bangalore",
  "Book North Indian Pandit Online",
  "Genuine Shastric Acharyas Bengaluru",
  "PurohitSetu Pandit Portal",
  "Apartment Griha Pravesh Bangalore",
  "Authentic Gurukul Ordained Pandits",
  "Deepawali Lakshmi Puja Pandit",
  "Navratri Ghatasthapana Acharya",
];

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Booking Form State
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

  // Dakshina State
  const [isDakshinaOpen, setIsDakshinaOpen] = useState(false);
  const [dakshinaData, setDakshinaData] = useState({
    yajmanName: "",
    phone: "",
    panditName: "",
    pujaName: "General Vedic Dakshina",
    customPuja: "",
    amount: "501",
  });
  const [dakshinaProcessing, setDakshinaProcessing] = useState(false);
  const [dakshinaNotice, setDakshinaNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const categories = [
    "All",
    "Life Sanskars",
    "Festivals",
    "Dosh Nivaran",
    "Antim Sanskar & Shradh",
  ];

  const pujaList: PujaItem[] = [
    {
      id: "vivah-sanskar",
      name: "Vedic Vivah Sanskar (Marriage)",
      category: "Life Sanskars",
      desc: "Sacred matrimony rituals: Kanyadaan, Saptapadi (Seven Vows), Mangalsutra Dharan, and Vivah Hawan conducted strictly by experienced Vedic Acharyas.",
      duration: "Full Ritual",
      rating: "5.0",
      conductedCount: "890+",
      tag: "Sacred Matrimony",
      img: "/poojas/marriage ppoja.jpeg",
      seoKeyword: "Vedic Vivah Marriage Pandit in Bangalore North Indian Style",
    },
    {
      id: "sagai-ceremony",
      name: "Sagai & Ring Engagement Ceremony",
      category: "Life Sanskars",
      desc: "Traditional pre-wedding auspicious ritual including Tilak, Lagna Patrika recitation, and family blessings with authentic Vedic chanting.",
      duration: "2 Hours",
      rating: "4.8",
      conductedCount: "710+",
      tag: "Pre-Wedding",
      img: "/poojas/engement pooja.jpeg",
      seoKeyword: "Sagai Engagement Pandit in Bangalore Hindi Purohit",
    },
    {
      id: "annaprashan",
      name: "Annaprashan Sanskar (First Rice Feeding)",
      category: "Life Sanskars",
      desc: "First solid food offering to the child with divine mantras, Panchamrit tasting, and longevity prayers for physical vitality.",
      duration: "2 Hours",
      rating: "4.9",
      conductedCount: "1,120+",
      tag: "Child Milestone",
      img: "/poojas/annaprasan sanskar pooja.png",
      seoKeyword: "Annaprashan Pandit Bangalore First Feeding Ceremony",
    },
    {
      id: "mundan-sanskar",
      name: "Mundan Sanskar (Chudakarana)",
      category: "Life Sanskars",
      desc: "Sacred first hair removal ritual purifying the child of past life samskaras and promoting health, longevity, and intellectual acuity.",
      duration: "2 Hours",
      rating: "4.8",
      conductedCount: "980+",
      tag: "Purification Rite",
      img: "/poojas/mundan sanskar.jpeg",
      seoKeyword: "Mundan Sanskar Pandit in Bangalore North Indian Vidhi",
    },
    {
      id: "upnayan-sanskar",
      name: "Upanayana / Janeu Sanskar",
      category: "Life Sanskars",
      desc: "Sacred thread investiture ceremony initiating youth into Gayatri Mantra upasana, Brahmacharya discipline, and Vedic studies.",
      duration: "4 - 5 Hours",
      rating: "4.9",
      conductedCount: "430+",
      tag: "Spiritual Rebirth",
      img: "/poojas/upnayan sanskar.jpeg",
      seoKeyword: "Janeu Sanskar Upanayana Purohit Bangalore",
    },
    {
      id: "karnavedha",
      name: "Karnavedha Sanskar (Ear Piercing)",
      category: "Life Sanskars",
      desc: "Vedic ceremony for ear-piercing aimed at holistic wellbeing, auditory vitality, nervous system balance, and scriptural compliance.",
      duration: "1.5 Hours",
      rating: "4.7",
      conductedCount: "350+",
      tag: "Health & Sanskar",
      img: "/poojas/karnbhed sanskar.jpeg",
      seoKeyword: "Karnavedha Sanskar Pandit Ji Bangalore",
    },
    {
      id: "godh-bharai",
      name: "Godh Bharai / Seemantam Sanskar",
      category: "Life Sanskars",
      desc: "Joyous Vedic blessing for expectant mothers ensuring spiritual protection, peace of mind, and auspiciousness for mother and baby.",
      duration: "2 - 3 Hours",
      rating: "4.9",
      conductedCount: "820+",
      tag: "Maternal Blessing",
      img: "/poojas/godbharai pooja.jpeg",
      seoKeyword: "Godh Bharai Baby Shower Pandit Bengaluru",
    },
    {
      id: "birthday-aayushya",
      name: "Janamdin & Aayushya Hawan",
      category: "Life Sanskars",
      desc: "Family birthday blessing invoking Markandeya Rishi and Chiranjeevi deities for robust health, protection, and longevity.",
      duration: "2 Hours",
      rating: "4.9",
      conductedCount: "1,450+",
      tag: "Longevity & Health",
      img: "/poojas/birthday.jpeg",
      seoKeyword: "Ayushya Hawan Birthday Puja Pandit Bangalore",
    },
    {
      id: "navratri-puja",
      name: "Navratri Ghatasthapana & Pujan",
      category: "Festivals",
      desc: "Sacred Kalash installation on Pratipada followed by daily Devi aradhana, Akhand Jyot setup, Durga Saptashati path, and Kanya Pujan.",
      duration: "3 Hours",
      rating: "5.0",
      conductedCount: "1,890+",
      tag: "Navratri Special",
      img: "/poojas/navratri pooja.jpeg",
      seoKeyword: "Navratri Ghatasthapana Pandit Bangalore Durga Puja",
    },
    {
      id: "durga-saptashati",
      name: "Durga Saptashati Path & Pujan",
      category: "Festivals",
      desc: "Authentic recitation of the complete Devi Mahatmya along with Kavach, Argala, and Kilak stotras for divine protection and victory.",
      duration: "4 - 5 Hours",
      rating: "4.9",
      conductedCount: "670+",
      tag: "Shakti Upasana",
      img: "/poojas/durgasaptsati.jpeg",
      seoKeyword: "Durga Saptashati Path Pandit Bangalore",
    },
    {
      id: "navchandi-yagya",
      name: "Navchandi Mahayagya & Hawan",
      category: "Festivals",
      desc: "Grand sacrificial yagya purifying the home atmosphere, dispelling intense adversities, and bestowing divine grace and abundance.",
      duration: "5 Hours",
      rating: "5.0",
      conductedCount: "310+",
      tag: "Grand Anushthan",
      img: "/poojas/navchandi hawan.jpeg",
      seoKeyword: "Navchandi Mahayagya Hawan Acharya Bengaluru",
    },
    {
      id: "diwali-puja",
      name: "Deepawali Lakshmi-Ganesh Pujan",
      category: "Festivals",
      desc: "Complete Shodashopachara Lakshmi-Ganesha pujan with Bahi-Khata invocation, Kuber puja, deepak daan, and authentic Vedic Aarti.",
      duration: "2 - 3 Hours",
      rating: "5.0",
      conductedCount: "2,980+",
      tag: "Festival of Lights",
      img: "/poojas/diwali pooja.jpeg",
      seoKeyword: "Diwali Lakshmi Ganesh Pujan Pandit Bangalore",
    },
    {
      id: "satyanarayan-puja",
      name: "Shri Satyanarayan Bhagwan Katha & Puja",
      category: "Life Sanskars",
      desc: "Sacred storytelling, Hawan, and prayers dedicated to Lord Vishnu for family harmony, business success, and overcoming obstacles.",
      duration: "2 - 2.5 Hours",
      rating: "4.9",
      conductedCount: "2,450+",
      tag: "Peace & Prosperity",
      img: "/poojas/satyanarayan pooja.jpeg",
      seoKeyword: "Satyanarayan Katha Puja Pandit Bangalore North Indian",
    },
    {
      id: "griha-pravesh-puja",
      name: "Griha Pravesh & Vastu Shanti Puja",
      category: "Life Sanskars",
      desc: "Sacred housewarming ceremony with Vastu Shanti, Navagraha Homa, and Ganapati Puja to purify your new apartment or villa.",
      duration: "3 - 3.5 Hours",
      rating: "4.9",
      conductedCount: "3,120+",
      tag: "Most Auspicious",
      img: "/poojas/griha pravesh.jpeg",
      seoKeyword: "Griha Pravesh Pandit in Bangalore Housewarming Puja",
    },
    {
      id: "vastu-shanti-puja",
      name: "Vastu Shanti & Dosha Nivaran Puja",
      category: "Dosh Nivaran",
      desc: "Sacred Vedic ritual and Hawan to harmonize directional energies, nullify architectural Vastu doshas, and invite peace.",
      duration: "2.5 - 3 Hours",
      rating: "4.9",
      conductedCount: "1,890+",
      tag: "Dosha Nivaran",
      img: "/poojas/vastu shanti.jpeg",
      seoKeyword: "Vastu Shanti Puja Pandit in Bangalore Dosha Nivaran",
    },
    {
      id: "vahan-puja",
      name: "Vahan Puja & Vehicle Blessing",
      category: "Life Sanskars",
      desc: "Sacred consecration for new vehicles with Lord Ganesha invocation, Navagraha blessings, and Ayushya mantras for safe travel.",
      duration: "45 Mins - 1 Hour",
      rating: "4.9",
      conductedCount: "1,620+",
      tag: "Protection & Safety",
      img: "/poojas/vahan pooja.jpeg",
      seoKeyword: "Vahan Puja Vehicle Blessing Pandit Bengaluru",
    },
    {
      id: "dhanteras-puja",
      name: "Dhanteras & Lord Dhanvantari Puja",
      category: "Festivals",
      desc: "Invocation of Lord Dhanvantari and Kuber Dev for health, physical healing, and financial harmony in your household.",
      duration: "2 Hours",
      rating: "4.8",
      conductedCount: "1,140+",
      tag: "Health & Wealth",
      img: "/poojas/dhanteras pooja.jpeg",
      seoKeyword: "Dhanteras Dhanvantari Puja Pandit Bangalore",
    },
    {
      id: "kaal-sarp",
      name: "Kaal Sarp Dosh Nivaran Hawan",
      category: "Dosh Nivaran",
      desc: "Scriptural Rahu-Ketu pacification ritual using silver Nag-Nagin yantra, specialized herbs, and Sarpa Suktam ahutis.",
      duration: "3 - 4 Hours",
      rating: "4.9",
      conductedCount: "1,210+",
      tag: "Dosha Shanti",
      img: "/poojas/kaalsarp dosh pooja.jpeg",
      seoKeyword: "Kaal Sarp Dosh Nivaran Puja Bangalore Pandit",
    },
    {
      id: "mangal-dosh",
      name: "Mangal Dosh Shanti & Hawan",
      category: "Dosh Nivaran",
      desc: "Scriptural Mars pacification ceremony honoring Lord Angaraka to mitigate obstacles in marriage, relationships, and career.",
      duration: "2.5 Hours",
      rating: "4.8",
      conductedCount: "1,450+",
      tag: "Manglik Relief",
      img: "/poojas/mangaldosh.jpeg",
      seoKeyword: "Mangal Dosh Shanti Hawan Pandit Bangalore",
    },
    {
      id: "pitra-dosh",
      name: "Pitra Dosh Shanti & Tarpan Puja",
      category: "Dosh Nivaran",
      desc: "Propitiation of ancestral spirits through Til-Tarpan and scriptural prayers to invite peace and generational blessings.",
      duration: "3 Hours",
      rating: "4.9",
      conductedCount: "1,320+",
      tag: "Ancestral Harmony",
      img: "/poojas/pitrishanti.jpeg",
      seoKeyword: "Pitra Dosh Shanti Tarpan Pandit Bangalore",
    },
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
      seoKeyword: "Antim Sanskar Last Rites Pandit Bangalore Cremation Rites",
    },
    {
      id: "terahvin-shanti",
      name: "Terahvin & Shanti Hawan Ceremony",
      category: "Antim Sanskar & Shradh",
      desc: "Thirteenth-day culmination ritual concluding mourning rites with Shanti Hawan, Brahmana Bhojan, and family purification.",
      duration: "3 Hours",
      rating: "4.9",
      conductedCount: "820+",
      tag: "Parivarik Shanti",
      img: "/poojas/terhvi sradhy.jpeg",
      seoKeyword: "Terahvin Shanti Hawan Shradh Pandit Bangalore",
    },
  ];

  const filteredPujas = pujaList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seoKeyword.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleLocalityClick = (loc: string) => {
    setFormData((prev) => ({ ...prev, area: loc }));
    setSearchQuery(loc);
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
        text: "🚩 Har Har Mahadev! Aapka anurodh safalta-poorvak darj ho gaya hai. Shastron ke gyata Vedic Pandit Ji aapse jald hi sampark karenge.",
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
        text: "Booking me truti aayi: " + (err.message || "Network check karein."),
      });
    } finally {
      setLoading(false);
    }
  };

  // Real Razorpay Dakshina
  const handleInitiateDakshinaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setDakshinaNotice(null);

    const amountNum = parseFloat(dakshinaData.amount);
    if (!amountNum || amountNum < 1) {
      setDakshinaNotice({ type: "error", text: "Kripya sahi rashi chunein (Kam se kam ₹1)." });
      return;
    }

    if (!dakshinaData.yajmanName.trim() || !dakshinaData.phone.trim()) {
      setDakshinaNotice({ type: "error", text: "Yajman Naam aur Phone Number zaroori hai." });
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setDakshinaNotice({
        type: "error",
        text: "Payment configuration pending hai. Support se sampark karein.",
      });
      return;
    }

    setDakshinaProcessing(true);

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      setDakshinaProcessing(false);
      setDakshinaNotice({
        type: "error",
        text: "Payment gateway load nahi ho paya. Internet connection dekhein.",
      });
      return;
    }

    const finalPujaName =
      dakshinaData.pujaName === "Other Custom Ritual"
        ? dakshinaData.customPuja || "Custom Ritual"
        : dakshinaData.pujaName;

    const options = {
      key: razorpayKey,
      amount: Math.round(amountNum * 100),
      currency: "INR",
      name: "PurohitSetu Bengaluru",
      description: `Shubh Dakshina - ${finalPujaName}`,
      image: "/pandit-logo.png",
      prefill: {
        name: dakshinaData.yajmanName,
        contact: dakshinaData.phone,
      },
      notes: {
        pandit_name: dakshinaData.panditName || "General / Platform Acharya",
        puja_name: finalPujaName,
      },
      theme: {
        color: "#c2410c",
      },
      handler: async (response: any) => {
        try {
          const paymentId = response?.razorpay_payment_id || "PAY_CONFIRMED";

          await supabase.from("token_transactions").insert({
            pandit_id: dakshinaData.panditName || "general_dakshina",
            pandit_phone: dakshinaData.phone,
            pandit_name: dakshinaData.panditName || "General Acharya",
            pack_name: `Dakshina: ${finalPujaName}`,
            amount: amountNum,
            tokens_credited: 0,
            razorpay_payment_id: paymentId,
          });

          setDakshinaNotice({
            type: "success",
            text: `🙏 Shubh Dakshina ₹${amountNum} safalta se prapt hui! Payment ID: ${paymentId}. Har Har Mahadev!`,
          });

          setDakshinaData({
            yajmanName: "",
            phone: "",
            panditName: "",
            pujaName: "General Vedic Dakshina",
            customPuja: "",
            amount: "501",
          });
        } catch (dbErr: any) {
          console.error(dbErr);
          setDakshinaNotice({
            type: "success",
            text: `Payment safal raha (Ref ID: ${response?.razorpay_payment_id}). Dhanyawad!`,
          });
        } finally {
          setDakshinaProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setDakshinaProcessing(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setDakshinaProcessing(false);
        setDakshinaNotice({
          type: "error",
          text: `Payment asafal raha: ${response?.error?.description || "Radd kar diya gaya."}`,
        });
      });
      rzp.open();
    } catch (err: any) {
      setDakshinaProcessing(false);
      setDakshinaNotice({
        type: "error",
        text: "Gateway open karne me truti: " + err.message,
      });
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "PurohitSetu - North Indian Vedic Pandits in Bangalore",
    "image": "https://www.purohitsetu.in/pandit-logo.png",
    "telephone": "+91-7667984349",
    "email": "support.purohitsetu@gmail.com",
    "url": "https://www.purohitsetu.in",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bengaluru",
      "addressRegion": "Karnataka",
      "postalCode": "560102",
      "addressCountry": "IN"
    },
    "description": "Book verified North Indian, Hindi, Bihari, and Maithili Vedic Pandits in Bangalore for Griha Pravesh, Vivah, Satyanarayan Puja, Hawan, and Sanskars.",
    "priceRange": "₹₹",
    "areaServed": BENGALURU_LOCALITIES,
    "keywords": HIGH_INTENT_KEYWORDS.join(", ")
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-stone-900 font-sans selection:bg-orange-700 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 1. ROYAL INTEGRATED HEADER (COLLISION-FREE) */}
      <header className="sticky top-0 z-50 w-full bg-[#FCFBF7]/90 backdrop-blur-md border-b border-amber-900/15 shadow-sm">
        {/* Sanskrit Banner */}
        <div className="bg-gradient-to-r from-[#7f1d1d] via-[#9a3412] to-[#7f1d1d] text-amber-100 py-1.5 px-3 text-[11px] sm:text-xs font-serif text-center tracking-wide border-b border-amber-500/20">
          <span>ॐ यतो धर्मस्ततो जयः • North Indian Vedic Pandits in Bangalore • Pure Shastric Vidhi</span>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <a href="#home-section" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-800 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-orange-950/20 group-hover:scale-105 transition">
              ॐ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-serif text-stone-900 tracking-tight">
                  Purohit<span className="text-orange-700">Setu</span>
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                  Bengaluru
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-stone-500 font-semibold">
                Authentic Vedic Rituals
              </p>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-stone-700">
            <a href="#home-section" className="hover:text-orange-700 transition">Mukhya Prishth</a>
            <a href="#services-section" className="hover:text-orange-700 transition">Vedic Pujas</a>
            <a href="#localities-section" className="hover:text-orange-700 transition">Locations</a>
            <a href="#about-section" className="hover:text-orange-700 transition">About Us</a>
            <a href="#contact-section" className="hover:text-orange-700 transition">Contact</a>
          </nav>

          {/* Header Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDakshinaOpen(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <span>🪔</span> Shubh Dakshina
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Navigation Toggle"
              className="md:hidden p-2 rounded-xl border border-stone-300 bg-white text-stone-800"
            >
              <div className="w-5 h-3.5 flex flex-col justify-between">
                <span className={`h-0.5 bg-stone-800 transition ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
                <span className={`h-0.5 bg-stone-800 transition ${isMenuOpen ? "opacity-0" : ""}`}></span>
                <span className={`h-0.5 bg-stone-800 transition ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#FCFBF7] border-b border-amber-900/10 px-6 py-4 shadow-xl text-xs font-bold uppercase space-y-3">
            <a href="#home-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Home</a>
            <a href="#services-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Vedic Puja Directory</a>
            <a href="#localities-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Bangalore Zones</a>
            <a href="#about-section" onClick={() => setIsMenuOpen(false)} className="block py-1">About Us</a>
            <a href="#contact-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Official Support</a>
            <a
              href="#booking-section"
              onClick={() => setIsMenuOpen(false)}
              className="block text-center py-2.5 rounded-xl bg-orange-700 text-white font-extrabold uppercase"
            >
              Book Certified Pandit Ji
            </a>
          </div>
        )}
      </header>

      {/* 2. ROYAL HERO SECTION */}
      <section id="home-section" className="relative pt-10 pb-16 px-4 overflow-hidden border-b border-amber-900/10">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-950 border border-amber-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
            <span>✨</span> North Indian Pandit in Bangalore • 100% Shastric Vidhi
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 leading-tight mb-4 tracking-tight">
            Perform Sacred Vedic Rituals At Home <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-700 via-amber-600 to-red-800">
              With Gurukul-Trained Acharyas in Bengaluru
            </span>
          </h1>

          <p className="text-stone-600 text-xs sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
            Dedicated platform connecting devotees with verified North Indian, Hindi, Maithili, and Bhojpuri Purohits. Authentic mantras, verified Hawan Samagri, and zero commercial astrology.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <a
              href="#booking-section"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-800 via-orange-700 to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition"
            >
              📅 Schedule Puja Muhurat
            </a>
            <a
              href="#services-section"
              className="px-6 py-3 rounded-xl bg-white border border-stone-300 hover:border-orange-600 text-stone-800 font-bold text-xs sm:text-sm shadow-xs transition"
            >
              📜 Explore 22 Sacred Pujas
            </a>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6 shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 text-sm">
              🔍
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pujas: 'Vivah', 'Griha Pravesh', 'Whitefield', 'Satyanarayan'..."
              className="w-full pl-11 pr-16 py-3.5 bg-white border border-stone-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full transition ${
                  selectedCategory === cat
                    ? "bg-stone-900 text-amber-200 shadow-sm"
                    : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BENGALURU LOCALITIES CLOUD */}
      <section id="localities-section" className="bg-amber-50/50 py-5 px-4 border-b border-amber-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 mb-2 text-center sm:text-left">
            <span className="text-xs font-serif font-bold text-stone-900 flex items-center gap-1">
              <span>📍</span> Verified North Indian Pandits Available Across Bangalore Localities:
            </span>
            <span className="text-[10px] text-stone-500">Click to autofill booking locality</span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
            {BENGALURU_LOCALITIES.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocalityClick(loc)}
                className="text-[11px] font-medium bg-white hover:bg-orange-700 hover:text-white text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition"
              >
                Pandit in {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SACRED PUJA DIRECTORY (ALL 22 PUJAS) */}
      <section id="services-section" className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-stone-200 pb-4">
          <div>
            <span className="text-orange-700 font-extrabold uppercase tracking-widest text-[10px]">
              Vedic Sanskar Suchi
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              Sacred Vedic Ceremonies & Hawans
            </h2>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
              Showing {filteredPujas.length} Auspicious Rituals
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPujas.map((puja) => (
            <div
              key={puja.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-amber-500 transition flex flex-col justify-between"
            >
              <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                <img
                  src={puja.img}
                  alt={puja.seoKeyword}
                  title={puja.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {puja.tag}
                </span>
                <div className="absolute bottom-2 left-2 right-2 text-white flex justify-between items-end text-[11px] font-medium bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                  <span className="text-amber-300">★ {puja.rating} ({puja.conductedCount})</span>
                  <span>⏱ {puja.duration}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest block mb-0.5">
                    {puja.category}
                  </span>
                  <h3 className="font-serif font-bold text-base text-stone-900 mb-1.5">
                    {puja.name}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4 line-clamp-3">
                    {puja.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectPujaToBook(puja.name)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-stone-900 hover:bg-orange-700 text-white transition active:scale-95 flex items-center justify-center gap-1"
                >
                  Book Ritual Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ABOUT US / VEDIC AUTHENTICITY */}
      <section id="about-section" className="bg-white py-16 px-4 border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-orange-700 font-extrabold uppercase text-[10px] tracking-widest">
              Sanatan Heritage & Trust
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 mt-1">
              About PurohitSetu Bengaluru
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm max-w-xl mx-auto mt-2">
              Preserving Vedic integrity for North Indian and South Indian households in Bengaluru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-900/10">
              <span className="text-2xl block mb-2">🌿</span>
              <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
                Zero Astrology Gimmicks
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                We focus strictly on authentic Vedic Sanskars and Hawans. No speculative commercial astrology or horoscope products.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-900/10">
              <span className="text-2xl block mb-2">🕉</span>
              <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
                Gurukul-Trained Pandits
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Verified Acharyas from Varanasi, Mithila, Haridwar, and Prayagraj adept in pure Sanskrit pronounciation and family customs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-900/10">
              <span className="text-2xl block mb-2">🗣</span>
              <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
                Multilingual Understanding
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Mantra meanings explained clearly in Hindi, Maithili, Bhojpuri, English, Kannada, or Telugu so family members stay connected.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-900/10">
              <span className="text-2xl block mb-2">🔥</span>
              <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
                Certified Hawan Samagri
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Purohit Ji arrives equipped with pure Mango wood, Navagraha herbs, pure cow ghee, Gangajal, and authentic ritual kits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOOKING FORM SECTION */}
      <section id="booking-section" className="py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-stone-300 shadow-xl p-6 sm:p-10">
          <div className="text-center mb-6">
            <span className="bg-amber-100 text-amber-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Yajman Portal
            </span>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mt-2">
              Book a Certified Vedic Pandit
            </h2>
            <p className="text-stone-500 text-xs mt-1">
              Select your ritual and location details in Bengaluru.
            </p>
          </div>

          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold mb-4 ${
                statusMsg.type === "success"
                  ? "bg-green-100 text-green-950 border border-green-300"
                  : "bg-red-100 text-red-950 border border-red-300"
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Yajman Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Contact *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-600 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Sacred Puja / Hawan *</label>
                <select
                  value={formData.pujaName}
                  onChange={(e) => setFormData({ ...formData, pujaName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-600 text-xs bg-white"
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
                <label className="block text-xs font-bold text-stone-700 mb-1">Preferred Language *</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-600 text-xs bg-white"
                >
                  <option value="Hindi">Hindi (North Indian)</option>
                  <option value="Maithili">Maithili (Mithila)</option>
                  <option value="Bhojpuri">Bhojpuri</option>
                  <option value="Sanskrit">Sanskrit (Pure Vedic)</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Telugu">Telugu</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Bengaluru Zone *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HSR Layout, Whitefield"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="560xxx"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-600 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Complete Address *</label>
              <textarea
                rows={2}
                required
                placeholder="Apartment/Villa No., Society Name, Landmark..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-600 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Auspicious Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Muhurat Slot *</label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-600 text-xs bg-white"
                >
                  <option value="Morning (06:00 AM - 09:00 AM)">Pratah (06:00 AM - 09:00 AM)</option>
                  <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 03:00 PM)">Afternoon (12:00 PM - 03:00 PM)</option>
                  <option value="Evening (05:00 PM - 08:00 PM)">Sandhya (05:00 PM - 08:00 PM)</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-900/10 flex items-center gap-2.5">
              <input
                type="checkbox"
                id="samagri-box"
                checked={formData.samagri}
                onChange={(e) => setFormData({ ...formData, samagri: e.target.checked })}
                className="w-4 h-4 accent-orange-700 rounded"
              />
              <label htmlFor="samagri-box" className="text-xs text-stone-800">
                <strong>Include Complete Hawan & Puja Samagri Kit</strong> (Purohit Ji carries woods, herbs, Gangajal).
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-800 via-orange-700 to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md hover:brightness-105 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? "Registering Request..." : "🚩 Confirm Booking & Request Pandit Ji"}
            </button>
          </form>
        </div>
      </section>

      {/* 7. OFFICIAL CONTACT SUPPORT */}
      <section id="contact-section" className="bg-white py-10 px-4 border-t border-stone-200 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-orange-700 font-extrabold uppercase text-[10px] tracking-widest">
            Direct Coordination
          </span>
          <h2 className="text-xl font-serif font-bold text-stone-900 mt-1 mb-2">
            PurohitSetu Support Desk
          </h2>
          <p className="text-xs text-stone-600 mb-4">
            For specific anushthan rituals or booking inquiries in Bengaluru:
          </p>

          <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 text-xs">
            <span>✉️</span>
            <span className="font-semibold text-stone-700">Official Support Email:</span>
            <a href="mailto:support.purohitsetu@gmail.com" className="font-bold text-orange-700 underline">
              support.purohitsetu@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* 8. FOOTER WITH CLEAN BADGE & ZERO OVERLAP */}
      <footer className="bg-stone-950 text-stone-400 py-10 px-4 text-xs border-t-2 border-amber-600/40">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-800 pb-5 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-lg">ॐ</span>
              <span className="font-serif font-bold text-white text-base">PurohitSetu Bengaluru</span>
            </div>

            <div className="flex gap-4 text-xs text-stone-300">
              <a href="/privacy-policy" className="hover:text-amber-400 underline underline-offset-4">Privacy Policy</a>
              <a href="/delete-account" className="hover:text-rose-400 underline underline-offset-4">Delete Account</a>
              <button onClick={() => setIsDakshinaOpen(true)} className="hover:text-amber-400 underline underline-offset-4">Online Dakshina</button>
            </div>
          </div>

          <div className="text-[10px] text-stone-500 space-y-2 border-b border-stone-800 pb-4">
            <p className="font-bold text-stone-400">Popular Vedic Ritual Searches in Bangalore:</p>
            <p className="flex flex-wrap gap-1.5 text-stone-400">
              {HIGH_INTENT_KEYWORDS.map((kw, i) => (
                <span key={i}>{kw} {i < HIGH_INTENT_KEYWORDS.length - 1 ? "•" : ""}</span>
              ))}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500 text-center sm:text-left">
            <p>© 2026 PurohitSetu. Dedicated Vedic Puja Services • Authentic Shastric Tradition.</p>
            <div className="bg-stone-900 border border-stone-800 px-3 py-1 rounded-full text-amber-400 font-semibold inline-block">
              Created and Designed by Prince Kumar Pandey | Mob: 7667984349
            </div>
          </div>
        </div>
      </footer>

      {/* 9. SHUBH DAKSHINA RAZORPAY MODAL */}
      {isDakshinaOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪔</span>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm">Shubh Dakshina</h3>
                  <p className="text-[10px] text-stone-500">Official Vedic Ritual Dakshina Portal</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDakshinaOpen(false);
                  setDakshinaNotice(null);
                }}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {dakshinaNotice && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold mb-3 ${
                  dakshinaNotice.type === "success"
                    ? "bg-green-50 text-green-900 border border-green-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {dakshinaNotice.text}
              </div>
            )}

            <form onSubmit={handleInitiateDakshinaPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-0.5">Yajman Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={dakshinaData.yajmanName}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, yajmanName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-0.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={dakshinaData.phone}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, phone: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <label className="font-bold text-stone-700">Pandit Ji Name</label>
                  <span className="text-[10px] text-stone-400">Optional</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Acharya Prince Pandey"
                  value={dakshinaData.panditName}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, panditName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-0.5">Puja Ritual / Purpose</label>
                <select
                  value={dakshinaData.pujaName}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, pujaName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="General Vedic Dakshina">General Vedic Dakshina</option>
                  <option value="Griha Pravesh Puja">Griha Pravesh Puja</option>
                  <option value="Satyanarayan Katha">Satyanarayan Katha</option>
                  <option value="Vivah Sanskar (Marriage)">Vivah Sanskar (Marriage)</option>
                  <option value="Navchandi Mahayagya">Navchandi Mahayagya</option>
                  <option value="Rudrabhishek Puja">Rudrabhishek Puja</option>
                  <option value="Mundan Sanskar">Mundan Sanskar</option>
                  <option value="Other Custom Ritual">Other Custom Ritual</option>
                </select>
              </div>

              {dakshinaData.pujaName === "Other Custom Ritual" && (
                <input
                  type="text"
                  placeholder="Ritual purpose..."
                  value={dakshinaData.customPuja}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, customPuja: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300"
                />
              )}

              <div>
                <label className="block font-bold text-stone-700 mb-1">Select Shubh Dakshina (₹)</label>
                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                  {DAKSHINA_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDakshinaData({ ...dakshinaData, amount: amt.toString() })}
                      className={`py-1.5 rounded-xl font-bold border transition ${
                        dakshinaData.amount === amt.toString()
                          ? "bg-orange-700 text-white border-orange-700"
                          : "bg-amber-50/50 text-stone-700 border-amber-200"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  min="1"
                  required
                  value={dakshinaData.amount}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, amount: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={dakshinaProcessing}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-red-800 via-orange-700 to-amber-700 text-white font-bold shadow-md disabled:opacity-50"
              >
                {dakshinaProcessing ? "Opening Gateway..." : `Proceed to Pay ₹${dakshinaData.amount || 0}`}
              </button>

              <p className="text-[10px] text-center text-stone-400">
                🔒 Secured by Razorpay. Supports PhonePe, GPay, Paytm, Cards & UPI.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}