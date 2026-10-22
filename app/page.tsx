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

  const handleLocalityFilter = (loc: string) => {
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
        text: "🚩 Har Har Mahadev! Your sacred booking request has been successfully registered. A verified Vedic Purohit proficient in your language and locality will be assigned shortly.",
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

  const handleInitiateDakshinaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setDakshinaNotice(null);

    const amountNum = parseFloat(dakshinaData.amount);
    if (!amountNum || amountNum < 1) {
      setDakshinaNotice({ type: "error", text: "Please enter a valid amount (Minimum ₹1)." });
      return;
    }

    if (!dakshinaData.yajmanName.trim() || !dakshinaData.phone.trim()) {
      setDakshinaNotice({ type: "error", text: "Please provide your Name and Phone Number." });
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setDakshinaNotice({
        type: "error",
        text: "Payment configuration key is missing. Please contact platform support.",
      });
      return;
    }

    setDakshinaProcessing(true);

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      setDakshinaProcessing(false);
      setDakshinaNotice({
        type: "error",
        text: "Unable to load payment gateway. Please check your internet connection.",
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
      name: "PurohitSetu",
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
        color: "#ea580c",
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
            text: `🙏 Shubh Dakshina of ₹${amountNum} received successfully! Ref ID: ${paymentId}. May you receive abundant divine blessings.`,
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
          console.error("Database record error:", dbErr);
          setDakshinaNotice({
            type: "success",
            text: `Payment completed successfully (ID: ${response?.razorpay_payment_id}). Thank you!`,
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
          text: `Payment failed: ${response?.error?.description || "Transaction cancelled."}`,
        });
      });
      rzp.open();
    } catch (err: any) {
      setDakshinaProcessing(false);
      setDakshinaNotice({
        type: "error",
        text: "Could not open payment checkout: " + err.message,
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
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 font-sans selection:bg-orange-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* UNIFIED STICKY HEADER (ZERO OVERLAP COLLISION) */}
      <div className="sticky top-0 z-40 w-full shadow-md">
        {/* Ticker */}
        <div className="bg-gradient-to-r from-red-800 via-orange-600 to-amber-700 text-white text-[11px] sm:text-xs py-1.5 px-3">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
            </span>
            <p className="text-center font-medium leading-tight">
              <strong>North Indian Vedic Pandits in Bangalore:</strong> Hindi, Maithili, Bhojpuri & Kannada Acharyas across all zones
            </p>
          </div>
        </div>

        {/* Navigation Bar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow shrink-0">
                ॐ
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <a href="#home-section" className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-orange-600 to-amber-700 tracking-tight">
                    PurohitSetu
                  </a>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-full border border-amber-300 shrink-0">
                    📍 Bangalore
                  </span>
                </div>
                <p className="text-[9px] font-semibold text-amber-900 tracking-wider uppercase truncate">
                  North Indian & Vedic Purohits
                </p>
              </div>
            </div>

            {/* Desktop Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
              <a href="#home-section" className="hover:text-orange-600 transition">Home</a>
              <a href="#services-section" className="hover:text-orange-600 transition">Puja Services</a>
              <a href="#localities-section" className="hover:text-orange-600 transition">Locations</a>
              <a href="#about-section" className="hover:text-orange-600 transition">About Us</a>
              <a href="#contact-section" className="hover:text-orange-600 transition">Contact</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsDakshinaOpen(true)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg border border-amber-300 transition"
              >
                🪔 Dakshina
              </button>

              <a
                href="#booking-section"
                className="hidden sm:inline-flex bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow transition"
              >
                Book Pandit
              </a>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 text-slate-800 hover:bg-amber-100 transition md:hidden"
              >
                <div className="w-5 h-3.5 flex flex-col justify-between">
                  <span className={`h-0.5 bg-slate-800 rounded transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
                  <span className={`h-0.5 bg-slate-800 rounded transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}></span>
                  <span className={`h-0.5 bg-slate-800 rounded transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="bg-white border-b border-amber-200 shadow-xl px-5 py-4 animate-in fade-in duration-200 md:hidden">
              <div className="flex flex-col gap-3 text-xs font-bold text-slate-800">
                <a href="#home-section" onClick={() => setIsMenuOpen(false)} className="py-1 border-b border-amber-50 flex justify-between">
                  <span>🏠 Home</span>
                  <span className="text-slate-400">→</span>
                </a>
                <a href="#services-section" onClick={() => setIsMenuOpen(false)} className="py-1 border-b border-amber-50 flex justify-between">
                  <span>🪔 Vedic Puja Services</span>
                  <span className="text-slate-400">→</span>
                </a>
                <a href="#localities-section" onClick={() => setIsMenuOpen(false)} className="py-1 border-b border-amber-50 flex justify-between">
                  <span>📍 Bangalore Localities</span>
                  <span className="text-slate-400">→</span>
                </a>
                <a href="#about-section" onClick={() => setIsMenuOpen(false)} className="py-1 border-b border-amber-50 flex justify-between">
                  <span>📜 About PurohitSetu</span>
                  <span className="text-slate-400">→</span>
                </a>
                <a href="#contact-section" onClick={() => setIsMenuOpen(false)} className="py-1 flex justify-between">
                  <span>✉️ Official Contact</span>
                  <span className="text-slate-400">→</span>
                </a>
                <a
                  href="#booking-section"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-1 text-center py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold"
                >
                  Book a Vedic Puja Now
                </a>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* HERO SECTION */}
      <section id="home-section" className="bg-gradient-to-b from-orange-100/70 via-amber-50/50 to-[#FFFDF7] pt-8 pb-10 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-950 border border-orange-300 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span>🪔</span> North Indian Pandit in Bangalore • Verified Acharyas
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-3 tracking-tight">
            Book Verified North Indian & Hindi Pandits in Bangalore <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-amber-600">
              For Griha Pravesh, Vivah, Satyanarayan & Hawan Rituals
            </span>
          </h1>

          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
            Connecting devout families with verified North Indian, Hindi, Maithili, and Bhojpuri speaking Vedic Purohits across Bengaluru. Authentic Shastric Vidhi, certified Samagri kits, and zero superstition.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
            <a
              href="#booking-section"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 text-white font-extrabold text-xs shadow hover:scale-105 transition"
            >
              📅 Schedule Puja Muhurat
            </a>
            <button
              onClick={() => setIsDakshinaOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white border border-orange-300 text-orange-950 font-extrabold text-xs shadow hover:bg-orange-50 transition flex items-center gap-1.5"
            >
              <span>🪔</span> Offer Shubh Dakshina
            </button>
          </div>

          <div className="relative max-w-2xl mx-auto mb-5 shadow-md rounded-2xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
              🔍
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search: 'North Indian Pandit', 'Griha Pravesh in Whitefield', 'Satyanarayan'..."
              className="w-full pl-10 pr-16 py-3 bg-white border border-orange-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition ${
                  selectedCategory === cat
                    ? "bg-orange-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LOCALITIES COVERAGE BAR */}
      <section id="localities-section" className="bg-amber-100/60 py-4 px-3 sm:px-6 border-y border-amber-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 mb-2.5 text-center sm:text-left">
            <span className="text-[11px] font-extrabold text-orange-950 uppercase tracking-wider flex items-center gap-1">
              <span>📍</span> Dedicated Pandit Coverage Across Bengaluru Zones:
            </span>
            <span className="text-[10px] text-slate-500">Tap to select locality</span>
          </div>
          <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
            {BENGALURU_LOCALITIES.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocalityFilter(loc)}
                className="text-[10px] font-semibold bg-white hover:bg-orange-600 hover:text-white text-slate-700 px-2 py-0.5 rounded border border-amber-300 transition"
              >
                Pandit in {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PUJA SERVICES DIRECTORY */}
      <section id="services-section" className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-amber-200/80 pb-3">
          <div>
            <span className="text-orange-600 font-extrabold uppercase tracking-widest text-[10px]">Sanatan Sanskar Directory</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Vedic Pujas, Sanskars & Hawan Ceremonies
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an auspicious ritual to view specifications and book an ordained Acharya.
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full border border-orange-300">
              Showing {filteredPujas.length} Sacred Services
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredPujas.map((puja) => (
            <div
              key={puja.id}
              className="group bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-xs hover:shadow-md hover:border-orange-400 transition flex flex-col justify-between"
            >
              <div className="relative h-44 w-full bg-amber-50 overflow-hidden">
                <img
                  src={puja.img}
                  alt={puja.seoKeyword}
                  title={puja.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-red-600/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {puja.tag}
                </span>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white flex justify-between items-end">
                  <div className="text-[11px] font-bold flex items-center gap-1 text-yellow-300">
                    ★ {puja.rating} <span className="text-slate-300 text-[9px]">({puja.conductedCount})</span>
                  </div>
                  <div className="text-[10px] bg-black/60 px-2 py-0.5 rounded-full text-white font-medium border border-white/20">
                    ⏱ {puja.duration}
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-orange-600 uppercase tracking-widest block mb-0.5">
                    {puja.category}
                  </span>
                  <h3 className="font-black text-sm text-slate-900 mb-1 group-hover:text-orange-600 transition">
                    {puja.name}
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3 line-clamp-3">
                    {puja.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectPujaToBook(puja.name)}
                  className="w-full py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-xs transition active:scale-95"
                >
                  Book Ritual Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about-section" className="bg-gradient-to-br from-amber-100/40 via-orange-50/30 to-amber-100/50 py-12 px-4 border-y border-amber-200 my-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-orange-600 font-extrabold uppercase text-[10px] tracking-widest">
              Sanatan Heritage & Trust
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
              Why Devotees Choose PurohitSetu in Bangalore
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto mt-1 leading-relaxed">
              Authentic Gurukul-ordained North Indian and South Indian Vedic Pandits across Bengaluru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-xl block mb-2">🌿</span>
              <h3 className="text-sm font-black text-slate-900 mb-1">Authentic Sanskrit Chanting & Shastric Vidhi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated strictly to genuine Vedic rituals and Hawans. Zero speculative astrology or commercial horoscope gimmicks.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-xl block mb-2">🕉</span>
              <h3 className="text-sm font-black text-slate-900 mb-1">North Indian, Hindi, Bihari & Maithili Pandits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verified Acharyas from Varanasi, Mithila, Haridwar, and Prayagraj proficient in your family's authentic customs.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-xl block mb-2">🗣</span>
              <h3 className="text-sm font-black text-slate-900 mb-1">Multilingual Ceremony Conduct</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rituals conducted with clear explanation in Hindi, English, Kannada, Telugu, Bhojpuri, or Maithili.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-xl block mb-2">🔥</span>
              <h3 className="text-sm font-black text-slate-900 mb-1">Complete Hawan & Samagri Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our Pandits arrive equipped with authenticated Mango wood, Navagraha herbs, pure cow ghee, and Gangajal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING FORM SECTION */}
      <section id="booking-section" className="py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border-2 border-orange-300 shadow-xl p-5 sm:p-8 relative">
          <div className="text-center mb-6">
            <span className="bg-orange-100 text-orange-900 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Yajman Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Book a Certified Vedic Pandit
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Enter your details to request an ordained Acharya.
            </p>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold mb-4 ${
                statusMsg.type === "success"
                  ? "bg-green-100 text-green-950 border border-green-300"
                  : "bg-red-100 text-red-950 border border-red-300"
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Yajman Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Mobile Contact *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Select Sacred Ritual *</label>
                <select
                  value={formData.pujaName}
                  onChange={(e) => setFormData({ ...formData, pujaName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-xs bg-white"
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
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Preferred Language *</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-xs bg-white"
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
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Bengaluru Locality *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HSR Layout, Whitefield"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="560xxx"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Complete Address *</label>
              <textarea
                rows={2}
                required
                placeholder="Apartment/Villa No., Landmark..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Puja Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Time Slot *</label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-xs bg-white"
                >
                  <option value="Morning (06:00 AM - 09:00 AM)">Pratah (06:00 AM - 09:00 AM)</option>
                  <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 03:00 PM)">Afternoon (12:00 PM - 03:00 PM)</option>
                  <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
              <input
                type="checkbox"
                id="samagri-box"
                checked={formData.samagri}
                onChange={(e) => setFormData({ ...formData, samagri: e.target.checked })}
                className="w-3.5 h-3.5 accent-orange-600 rounded"
              />
              <label htmlFor="samagri-box" className="text-[11px] text-slate-800">
                <strong>Include Complete Hawan & Samagri Kit</strong> (Purohit Ji carries woods, herbs, Gangajal).
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-600 text-white font-black text-xs sm:text-sm shadow hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
            >
              {loading ? "Registering..." : "🚩 Confirm Booking & Request Pandit Ji"}
            </button>
          </form>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact-section" className="bg-white py-8 px-4 border-t border-amber-200 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-orange-600 font-extrabold uppercase text-[10px] tracking-widest">
            Support Desk
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-0.5 mb-1">
            Contact Official Platform Support
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
            For specialized anushthan bookings or muhurat queries across Bengaluru:
          </p>

          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 px-4 py-2 rounded-xl text-xs">
            <span>✉️</span>
            <span className="font-semibold text-slate-700">Official Support Email:</span>
            <a href="mailto:support.purohitsetu@gmail.com" className="font-extrabold text-orange-700 underline">
              support.purohitsetu@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-4 text-xs border-t-4 border-orange-500">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-lg font-bold">ॐ</span>
              <span className="font-extrabold text-white text-sm">PurohitSetu Bengaluru</span>
            </div>

            <div className="flex gap-4 text-xs text-slate-300">
              <a href="/privacy-policy" className="hover:text-amber-400 underline">Privacy Policy</a>
              <a href="/delete-account" className="hover:text-rose-400 underline">Delete Account</a>
              <button onClick={() => setIsDakshinaOpen(true)} className="hover:text-amber-400 underline">Online Dakshina</button>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 space-y-1.5 border-b border-slate-800 pb-3">
            <p className="font-bold text-slate-400">Popular Vedic Ritual Searches in Bangalore:</p>
            <p className="flex flex-wrap gap-1.5 text-slate-400">
              {HIGH_INTENT_KEYWORDS.map((kw, i) => (
                <span key={i}>{kw} {i < HIGH_INTENT_KEYWORDS.length - 1 ? "•" : ""}</span>
              ))}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 text-center sm:text-left">
            <p>© 2026 PurohitSetu. Dedicated Vedic Puja Services • Authentic Shastric Tradition.</p>
            <p className="font-semibold text-amber-500/90">
              Created and Designed by Prince Kumar Pandey | Mob: 7667984349
            </p>
          </div>
        </div>
      </footer>

      {/* DAKSHINA MODAL */}
      {isDakshinaOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-orange-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🪔</span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Shubh Dakshina / Online Pay</h3>
                  <p className="text-[10px] text-slate-500">Official Vedic Ritual Dakshina Portal</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDakshinaOpen(false);
                  setDakshinaNotice(null);
                }}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs"
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

            <form onSubmit={handleInitiateDakshinaPayment} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Yajman Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={dakshinaData.yajmanName}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, yajmanName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={dakshinaData.phone}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <label className="font-bold text-slate-700">Pandit Ji Name</label>
                  <span className="text-[9px] text-slate-400">Optional</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Acharya Prince Pandey"
                  value={dakshinaData.panditName}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, panditName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-stone-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Puja Ritual / Purpose</label>
                <select
                  value={dakshinaData.pujaName}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, pujaName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
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
                  placeholder="Specify ritual..."
                  value={dakshinaData.customPuja}
                  onChange={(e) => setDakshinaData({ ...dakshinaData, customPuja: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Shubh Dakshina (₹)</label>
                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                  {DAKSHINA_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDakshinaData({ ...dakshinaData, amount: amt.toString() })}
                      className={`py-1 rounded-lg font-bold border ${
                        dakshinaData.amount === amt.toString()
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-orange-50 text-slate-700 border-orange-200"
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
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={dakshinaProcessing}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white font-bold shadow disabled:opacity-50"
              >
                {dakshinaProcessing ? "Opening..." : `Proceed to Pay ₹${dakshinaData.amount || 0}`}
              </button>

              <p className="text-[9px] text-center text-slate-400">
                🔒 Secured by Razorpay. Supports PhonePe, GPay, Paytm, Cards & UPI.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}