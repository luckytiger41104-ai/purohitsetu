"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { triggerNewBookingNotification } from "@/lib/notifyPandits";

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

const BOOKING_TOKEN_PRESETS = [101, 251, 501, 1100, 2100, 5100];
const SUPPORT_PHONE = "9449871293";

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
    area: "Bengaluru",
    date: "",
    samagri: true,
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenData, setTokenData] = useState({
    yajmanName: "",
    phone: "",
    panditName: "",
    pujaName: "General Puja Booking Token",
    customPuja: "",
    amount: "501",
  });
  const [tokenProcessing, setTokenProcessing] = useState(false);
  const [tokenNotice, setTokenNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      desc: "Complete Shodashopachara Lakshmi-Ganesha pujan with Bahi-Khata invocation, Kuber puja, deepak samarpana, and authentic Vedic Aarti.",
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

  const handleDirectWhatsAppBooking = () => {
    const msg = `Namaste PurohitSetu Team, I want to book a Vedic Pandit for ${formData.pujaName || "Puja Ceremony"} in Bengaluru. Please assist me with the muhurat and booking.`;
    window.open(`https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
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
          area: formData.area || "Bengaluru",
          location: formData.area || "Bengaluru",
          date: formData.date,
          samagri: formData.samagri,
          status: "available",
        },
      ]);

      if (error) throw error;

      triggerNewBookingNotification(
        formData.pujaName || "Vedic Ceremony",
        formData.area || "Bengaluru"
      );

      setStatusMsg({
        type: "success",
        text: "Booking request confirmed successfully! A verified Acharya will reach out to you shortly.",
      });

      setFormData({
        name: "",
        phone: "",
        pujaName: "Vedic Vivah Sanskar (Marriage)",
        language: "Hindi",
        area: "Bengaluru",
        date: "",
        samagri: true,
      });
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: "Error submitting booking: " + (err.message || "Please check your network connection."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateTokenPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenNotice(null);

    const amountNum = parseFloat(tokenData.amount);
    if (!amountNum || amountNum < 1) {
      setTokenNotice({ type: "error", text: "Please enter a valid amount (Minimum ₹1)." });
      return;
    }

    if (!tokenData.yajmanName.trim() || !tokenData.phone.trim()) {
      setTokenNotice({ type: "error", text: "Yajman Name and Contact Number are required." });
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setTokenNotice({
        type: "error",
        text: "Payment configuration is currently unavailable. Please contact support.",
      });
      return;
    }

    setTokenProcessing(true);

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      setTokenProcessing(false);
      setTokenNotice({
        type: "error",
        text: "Payment gateway failed to initialize. Please check your internet connection.",
      });
      return;
    }

    const finalPujaName =
      tokenData.pujaName === "Other Custom Ritual"
        ? tokenData.customPuja || "Custom Ritual"
        : tokenData.pujaName;

    const options = {
      key: razorpayKey,
      amount: Math.round(amountNum * 100),
      currency: "INR",
      name: "PurohitSetu Bengaluru",
      description: `Puja Booking Token - ${finalPujaName}`,
      image: "/pandit-logo.png",
      prefill: {
        name: tokenData.yajmanName,
        contact: tokenData.phone,
      },
      notes: {
        pandit_name: tokenData.panditName || "General / Platform Acharya",
        puja_name: finalPujaName,
        service_type: "puja_advance_booking",
      },
      theme: {
        color: "#ea580c",
      },
      handler: async (response: any) => {
        try {
          const paymentId = response?.razorpay_payment_id || "PAY_CONFIRMED";

          await supabase.from("token_transactions").insert({
            pandit_id: tokenData.panditName || "general_booking",
            pandit_phone: tokenData.phone,
            pandit_name: tokenData.panditName || "General Acharya",
            pack_name: `Booking Token: ${finalPujaName}`,
            amount: amountNum,
            tokens_credited: 0,
            razorpay_payment_id: paymentId,
          });

          triggerNewBookingNotification(
            finalPujaName,
            "Bengaluru (Token Booking)"
          );

          setTokenNotice({
            type: "success",
            text: `Booking token of ₹${amountNum} received successfully! Reference ID: ${paymentId}.`,
          });

          setTokenData({
            yajmanName: "",
            phone: "",
            panditName: "",
            pujaName: "General Puja Booking Token",
            customPuja: "",
            amount: "501",
          });
        } catch (dbErr: any) {
          console.error(dbErr);
          setTokenNotice({
            type: "success",
            text: `Payment confirmed (Ref ID: ${response?.razorpay_payment_id}). Thank you!`,
          });
        } finally {
          setTokenProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setTokenProcessing(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setTokenProcessing(false);
        setTokenNotice({
          type: "error",
          text: `Payment failed: ${response?.error?.description || "Transaction cancelled."}`,
        });
      });
      rzp.open();
    } catch (err: any) {
      setTokenProcessing(false);
      setTokenNotice({
        type: "error",
        text: "Could not open payment gateway: " + err.message,
      });
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "PurohitSetu - North Indian Vedic Pandits in Bangalore",
    image: "https://www.purohitsetu.in/pandit-logo.png",
    telephone: `+91-${SUPPORT_PHONE}`,
    email: "support.purohitsetu@gmail.com",
    url: "https://www.purohitsetu.in",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560102",
      addressCountry: "IN",
    },
    description: "Book verified North Indian, Hindi, Bihari, and Maithili Vedic Pandits in Bangalore for Griha Pravesh, Vivah, Satyanarayan Puja, Hawan, and Sanskars.",
    priceRange: "₹₹",
    areaServed: BENGALURU_LOCALITIES,
    keywords: HIGH_INTENT_KEYWORDS.join(", "),
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 font-sans selection:bg-orange-700 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* HEADER */}
      <div className="sticky top-0 z-40 w-full shadow-sm">
        <div className="bg-gradient-to-r from-red-800 via-orange-700 to-amber-800 text-white text-[11px] sm:text-xs py-1.5 px-3 text-center">
          <p className="font-semibold">
            🚩 <strong>North Indian Vedic Pandits in Bangalore:</strong> Hindi, Maithili, Bhojpuri &amp; Kannada Acharyas across all zones
          </p>
        </div>

        <header className="bg-white/95 backdrop-blur-md border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow shrink-0" aria-hidden="true">
                ॐ
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <a href="#home-section" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight" aria-label="PurohitSetu Home">
                    Purohit<span className="text-orange-700">Setu</span>
                  </a>
                  <span className="text-[10px] bg-amber-100 text-amber-950 font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
                    📍 Bangalore
                  </span>
                </div>
                <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest truncate">
                  North Indian &amp; Vedic Purohits
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700 uppercase" aria-label="Main Navigation">
              <a href="#home-section" className="hover:text-orange-700 transition">Home</a>
              <a href="#services-section" className="hover:text-orange-700 transition">Services</a>
              <a href="#localities-section" className="hover:text-orange-700 transition">Localities</a>
              <a href="#about-section" className="hover:text-orange-700 transition">About Us</a>
              <a href="#contact-section" className="hover:text-orange-700 transition">Contact</a>
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTokenModalOpen(true)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-amber-300 transition flex items-center gap-1"
                aria-label="Open Puja Booking Token Modal"
              >
                <span>🪙</span> Puja Token
              </button>

              <a
                href="#booking-section"
                className="hidden sm:inline-flex bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow transition"
              >
                Book Pandit
              </a>

              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle Navigation Menu"
                aria-expanded={isMenuOpen}
                className="md:hidden p-2 rounded-xl border border-amber-300 bg-amber-50"
              >
                <div className="w-5 h-3.5 flex flex-col justify-between">
                  <span className={`h-0.5 bg-slate-800 transition ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
                  <span className={`h-0.5 bg-slate-800 transition ${isMenuOpen ? "opacity-0" : ""}`}></span>
                  <span className={`h-0.5 bg-slate-800 transition ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
                </div>
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-white border-b border-amber-200 px-6 py-4 shadow-xl text-xs font-bold space-y-3">
              <a href="#home-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Home</a>
              <a href="#services-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Puja Directory</a>
              <a href="#localities-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Localities in Bangalore</a>
              <a href="#about-section" onClick={() => setIsMenuOpen(false)} className="block py-1">About Us</a>
              <a href="#contact-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Contact Us</a>
              <a
                href="#booking-section"
                onClick={() => setIsMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl bg-orange-700 text-white font-bold"
              >
                Book a Vedic Pandit Now
              </a>
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
            Book Verified North Indian &amp; Hindi Pandits in Bangalore <br />
            <span className="text-orange-700">
              For Griha Pravesh, Vivah, Satyanarayan &amp; Hawan Rituals
            </span>
          </h1>

          <p className="text-slate-700 text-xs sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed font-normal">
            Connecting devout families with experienced North Indian, Hindi, Maithili, and Bhojpuri speaking Vedic Purohits across Bengaluru. 100% Shastric Vidhi, certified Samagri kits, and zero superstition.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
            <a
              href="#booking-section"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 text-white font-extrabold text-xs shadow hover:scale-105 transition"
            >
              📅 Schedule Puja Muhurat
            </a>
            <button
              type="button"
              onClick={() => setIsTokenModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white border border-orange-300 text-orange-950 font-extrabold text-xs shadow hover:bg-orange-50 transition flex items-center gap-1.5"
            >
              <span>🪙</span> Puja Booking Token
            </button>
            <button
              type="button"
              onClick={handleDirectWhatsAppBooking}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow transition flex items-center gap-1.5"
              aria-label="Direct WhatsApp Booking"
            >
              <span>💬</span> WhatsApp Booking
            </button>
          </div>

          <div className="relative max-w-2xl mx-auto mb-5 shadow-xs">
            <label htmlFor="puja-search-input" className="sr-only">Search Pujas</label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm" aria-hidden="true">
              🔍
            </div>
            <input
              id="puja-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pujas: 'Griha Pravesh', 'Vivah', 'Satyanarayan', 'Whitefield'..."
              className="w-full pl-10 pr-16 py-3 bg-white border border-orange-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 font-medium text-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear Search Input"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition ${
                  selectedCategory === cat
                    ? "bg-orange-700 text-white shadow-xs"
                    : "bg-white text-slate-800 border border-amber-300 hover:bg-amber-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LOCALITIES BAR WITH PROPER INTERNAL LINKS */}
      <section id="localities-section" className="bg-amber-100/70 py-4 px-4 border-y border-amber-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 mb-2 text-center sm:text-left">
            <span className="text-[11px] font-extrabold text-orange-950 uppercase tracking-wider flex items-center gap-1">
              <span>📍</span> Dedicated Pandit Coverage Across Bengaluru Zones:
            </span>
            <span className="text-[10px] text-slate-600 font-medium">Click to view local pandits</span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
            {BENGALURU_LOCALITIES.map((loc) => {
              const slug = loc.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={loc}
                  href={`/pandit/${slug}`}
                  className="text-[10px] font-semibold bg-white hover:bg-orange-700 hover:text-white text-slate-800 px-2.5 py-1 rounded border border-amber-300 transition inline-block"
                >
                  Pandit in {loc}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PUJA SERVICES DIRECTORY */}
      <section id="services-section" className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-amber-200 pb-3">
          <div>
            <span className="text-orange-700 font-extrabold uppercase tracking-widest text-[10px]">Sanatan Sanskar Directory</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Vedic Pujas, Sanskars &amp; Hawan Ceremonies
            </h2>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className="text-[11px] font-bold text-orange-900 bg-orange-100 px-2.5 py-1 rounded-full border border-orange-300">
              Showing {filteredPujas.length} Auspicious Services
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredPujas.map((puja) => (
            <div
              key={puja.id}
              className="group bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-xs hover:shadow-md hover:border-orange-400 transition flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full bg-amber-100 overflow-hidden">
                <Image
                  src={puja.img}
                  alt={puja.seoKeyword}
                  title={puja.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-red-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  {puja.tag}
                </span>
                <div className="absolute bottom-2 left-2 right-2 text-white flex justify-between items-end text-[10px] bg-black/75 px-2 py-1 rounded-xl">
                  <span className="text-yellow-300 font-bold">★ {puja.rating} ({puja.conductedCount})</span>
                  <span>⏱ {puja.duration}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-orange-700 uppercase tracking-widest block mb-0.5">
                    {puja.category}
                  </span>
                  <h3 className="font-black text-sm text-slate-900 mb-1 group-hover:text-orange-700 transition">
                    {puja.name}
                  </h3>
                  <p className="text-[11px] text-slate-700 leading-relaxed mb-3 line-clamp-3">
                    {puja.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPujaToBook(puja.name)}
                  className="w-full py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xs transition active:scale-95"
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
            <span className="text-orange-700 font-extrabold uppercase text-[10px] tracking-widest">
              Sanatan Heritage &amp; Trust
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
              Why Devotees Choose PurohitSetu in Bangalore
            </h2>
            <p className="text-slate-700 text-xs sm:text-sm max-w-xl mx-auto mt-1">
              Authentic Gurukul-ordained North Indian and South Indian Vedic Pandits across Bengaluru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-amber-200">
              <span className="text-2xl block mb-2" aria-hidden="true">🌿</span>
              <h3 className="text-sm font-black text-slate-900 mb-1">Authentic Sanskrit Chanting &amp; Shastric Vidhi</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Dedicated strictly to genuine Vedic rituals and Hawans. Zero speculative astrology or commercial horoscope gimmicks.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200">
              <span className="text-2xl block mb-2" aria-hidden="true">🕉</span>
              <h3 className="text-sm font-black text-slate-900 mb-1">North Indian, Hindi, Bihari &amp; Maithili Pandits</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Verified Acharyas from Varanasi, Mithila, Haridwar, and Prayagraj proficient in your family's authentic customs.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200">
              <span className="text-2xl block mb-2" aria-hidden="true">🗣</span>
              <h3 className="text-sm font-black text-slate-900 mb-1">Multilingual Ceremony Conduct</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Rituals conducted with clear explanation in Hindi, English, Kannada, Telugu, Bhojpuri, or Maithili.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200">
              <span className="text-2xl block mb-2" aria-hidden="true">🔥</span>
              <h3 className="text-sm font-black text-slate-900 mb-1">Complete Hawan &amp; Samagri Management</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Our Pandits arrive equipped with authenticated Mango wood, Navagraha herbs, pure cow ghee, and Gangajal etc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPACT BOOKING FORM SECTION WITH TRUST BAR */}
      <section id="booking-section" className="py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="flex items-start gap-2.5">
              <span className="text-orange-600 text-xl font-bold" aria-hidden="true">🛡️</span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">100% Secure Booking</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Your data is safe with us</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-orange-600 text-xl font-bold" aria-hidden="true">₹</span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">Zero Upfront Cost</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Pay after puja completion</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-orange-600 text-xl font-bold" aria-hidden="true">🏅</span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">Verified Pandits</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Experienced &amp; verified</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-orange-600 text-xl font-bold" aria-hidden="true">🎧</span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">24/7 Support</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">We are here to help you</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-orange-300 shadow-xl p-5 sm:p-7">
            <div className="text-center mb-5">
              <span className="bg-orange-100 text-orange-950 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Fast Booking
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Book a Verified Vedic Pandit
              </h2>
              <p className="text-slate-600 text-xs mt-0.5">
                Fill this quick form or book directly on WhatsApp.
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
                  <label htmlFor="user-name" className="block text-[11px] font-bold text-slate-700 mb-0.5">Your Name *</label>
                  <input
                    id="user-name"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-600 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="user-phone" className="block text-[11px] font-bold text-slate-700 mb-0.5">Mobile Contact *</label>
                  <input
                    id="user-phone"
                    type="tel"
                    required
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-600 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="user-area" className="block text-[11px] font-bold text-slate-700 mb-0.5">Bengaluru Area *</label>
                  <input
                    id="user-area"
                    type="text"
                    required
                    placeholder="Bengaluru (e.g. HSR, Whitefield)"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-600 text-xs bg-orange-50/30 text-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="user-puja-select" className="block text-[11px] font-bold text-slate-700 mb-0.5">Select Sacred Ritual *</label>
                  <select
                    id="user-puja-select"
                    value={formData.pujaName}
                    onChange={(e) => setFormData({ ...formData, pujaName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-600 text-xs bg-white text-slate-900"
                  >
                    {pujaList.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    <option value="Other Custom Vedic Ritual">Other Custom Vedic Ritual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="user-date" className="block text-[11px] font-bold text-slate-700 mb-0.5">Puja Date *</label>
                  <input
                    id="user-date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-600 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="user-lang-select" className="block text-[11px] font-bold text-slate-700 mb-0.5">Preferred Language *</label>
                  <select
                    id="user-lang-select"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-600 text-xs bg-white text-slate-900"
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

              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="samagri-toggle"
                  checked={formData.samagri}
                  onChange={(e) => setFormData({ ...formData, samagri: e.target.checked })}
                  className="w-4 h-4 accent-orange-700 rounded cursor-pointer"
                />
                <label htmlFor="samagri-toggle" className="text-xs text-slate-800 cursor-pointer select-none">
                  <strong>Include Complete Hawan &amp; Samagri Kit</strong> (Acharya carries verified woods, herbs, Gangajal).
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-700 text-white font-black text-xs sm:text-sm shadow hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Book a Pandit →"}
                </button>

                <button
                  type="button"
                  onClick={handleDirectWhatsAppBooking}
                  className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                  aria-label="Book via WhatsApp"
                >
                  <span>💬</span> Book via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* CONTACT & DIRECT PHONE SUPPORT */}
      <section id="contact-section" className="bg-white py-8 px-4 border-t border-amber-200 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          <div>
            <span className="text-orange-700 font-extrabold uppercase text-[10px] tracking-widest">
              24/7 Support Desk
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              Contact Official Platform Support
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:+91${SUPPORT_PHONE}`}
              className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-4 py-2 rounded-xl text-xs font-bold text-orange-950 transition"
              aria-label={`Call or WhatsApp support at ${SUPPORT_PHONE}`}
            >
              <span>📞</span> Call / WhatsApp: +91 {SUPPORT_PHONE}
            </a>

            <a
              href="mailto:support.purohitsetu@gmail.com"
              className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-4 py-2 rounded-xl text-xs font-bold text-orange-950 transition"
              aria-label="Email support at support.purohitsetu@gmail.com"
            >
              <span>✉️</span> support.purohitsetu@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* CLEAN FOOTER WITH HYPERLINKED DIRECTORY */}
      <footer className="bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white py-7 px-4 border-t-2 border-amber-400">
        <div className="max-w-6xl mx-auto space-y-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-orange-50">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-white transition underline underline-offset-4">Privacy Policy</Link>
            <span>•</span>
            <a href="#about-section" className="hover:text-white transition">About Us</a>
            <span>•</span>
            <a href={`https://wa.me/91${SUPPORT_PHONE}`} target="_blank" rel="noreferrer" className="hover:text-white font-bold transition">
              WhatsApp Support ({SUPPORT_PHONE})
            </a>
          </div>

          {/* INTERNAL LOCALITY FOOTER MATRIX */}
          <div className="text-[11px] text-orange-100 max-w-5xl mx-auto leading-relaxed border-t border-orange-600/70 pt-4">
            <p className="font-bold text-white mb-2 text-xs">Vedic Pandits Across Bengaluru Localities:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {BENGALURU_LOCALITIES.map((loc) => {
                const slug = loc.toLowerCase().replace(/\s+/g, "-");
                return (
                  <Link
                    key={loc}
                    href={`/pandit/${slug}`}
                    className="hover:text-amber-200 transition underline underline-offset-2"
                  >
                    Pandit in {loc}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="border-t border-orange-600/70 pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-orange-100 gap-2">
            <p>© 2026 PurohitSetu. Dedicated Vedic Puja Services • Bengaluru</p>
            <div className="bg-black/40 px-3.5 py-1 rounded-full text-white font-semibold border border-white/20">
              Helpline: +91 {SUPPORT_PHONE}
            </div>
          </div>
        </div>
      </footer>

      {/* PUJA BOOKING TOKEN RAZORPAY MODAL */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-orange-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-lg" aria-hidden="true">🪙</span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Puja Booking Token</h3>
                  <p className="text-[10px] text-slate-500">Advance Service Fee &amp; Muhurat Confirmation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTokenModalOpen(false);
                  setTokenNotice(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center justify-center"
                aria-label="Close Token Modal"
              >
                ✕
              </button>
            </div>

            {tokenNotice && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold mb-3 ${
                  tokenNotice.type === "success"
                    ? "bg-green-50 text-green-900 border border-green-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {tokenNotice.text}
              </div>
            )}

            <form onSubmit={handleInitiateTokenPayment} className="space-y-2.5 text-xs">
              <div>
                <label htmlFor="token-yajman-name" className="block font-bold text-slate-700 mb-0.5">Yajman Name *</label>
                <input
                  id="token-yajman-name"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={tokenData.yajmanName}
                  onChange={(e) => setTokenData({ ...tokenData, yajmanName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="token-phone" className="block font-bold text-slate-700 mb-0.5">Mobile Number *</label>
                <input
                  id="token-phone"
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={tokenData.phone}
                  onChange={(e) => setTokenData({ ...tokenData, phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <label htmlFor="token-pandit-name" className="font-bold text-slate-700">Preferred Acharya</label>
                  <span className="text-[9px] text-slate-500">Optional</span>
                </div>
                <input
                  id="token-pandit-name"
                  type="text"
                  placeholder="e.g. Acharya Prince Pandey"
                  value={tokenData.panditName}
                  onChange={(e) => setTokenData({ ...tokenData, panditName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-stone-50 text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="token-puja-select" className="block font-bold text-slate-700 mb-0.5">Puja Ritual / Service</label>
                <select
                  id="token-puja-select"
                  value={tokenData.pujaName}
                  onChange={(e) => setTokenData({ ...tokenData, pujaName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  <option value="General Puja Booking Token">General Puja Booking Token</option>
                  <option value="Griha Pravesh Puja">Griha Pravesh Puja</option>
                  <option value="Satyanarayan Katha">Satyanarayan Katha</option>
                  <option value="Vivah Sanskar (Marriage)">Vivah Sanskar (Marriage)</option>
                  <option value="Navchandi Mahayagya">Navchandi Mahayagya</option>
                  <option value="Rudrabhishek Puja">Rudrabhishek Puja</option>
                  <option value="Mundan Sanskar">Mundan Sanskar</option>
                  <option value="Other Custom Ritual">Other Custom Ritual</option>
                </select>
              </div>

              {tokenData.pujaName === "Other Custom Ritual" && (
                <div>
                  <label htmlFor="token-custom-puja" className="sr-only">Specify Custom Ritual</label>
                  <input
                    id="token-custom-puja"
                    type="text"
                    placeholder="Specify ritual..."
                    value={tokenData.customPuja}
                    onChange={(e) => setTokenData({ ...tokenData, customPuja: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              )}

              <div>
                <span className="block font-bold text-slate-700 mb-1">Select Advance Token Amount (₹)</span>
                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                  {BOOKING_TOKEN_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTokenData({ ...tokenData, amount: amt.toString() })}
                      className={`py-1 rounded-lg font-bold border transition ${
                        tokenData.amount === amt.toString()
                          ? "bg-orange-700 text-white border-orange-700"
                          : "bg-orange-50 text-slate-800 border-orange-200 hover:bg-orange-100"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <label htmlFor="token-amount-input" className="sr-only">Token Amount</label>
                <input
                  id="token-amount-input"
                  type="number"
                  min="1"
                  required
                  value={tokenData.amount}
                  onChange={(e) => setTokenData({ ...tokenData, amount: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={tokenProcessing}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-700 via-amber-700 to-red-700 text-white font-bold shadow disabled:opacity-50"
              >
                {tokenProcessing ? "Opening Gateway..." : `Confirm Booking Token ₹${tokenData.amount || 0}`}
              </button>

              <p className="text-[9px] text-center text-slate-500 font-medium">
                🔒 Secured by Razorpay. Supports PhonePe, GPay, Paytm, Cards & amp; UPI.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}