"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  mahatva: string;
  duration: string;
  rating: string;
  conductedCount: string;
  tag: string;
  img: string;
  seoKeyword: string;
}

const BOOKING_TOKEN_PRESETS = [101, 251, 501, 1100, 2100, 5100];
const SUPPORT_PHONE = "9449871293";
const SUPPORT_EMAIL = "support.purohitsetu@gmail.com";

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

const RAW_PUJA_LIST: PujaItem[] = [
  {
    id: "annaprashan",
    name: "Annaprashan Sanskar (First Rice Feeding)",
    category: "Life Sanskars",
    desc: "Sacred rite of introducing first cooked solid grain nourishment to the infant with Vedic chanting and honey-curd tasting.",
    mahatva: "Invokes Goddess Annapurna and Lord Vishnu for digestive vigor, holistic physical vitality, and noble cognitive development.",
    duration: "2 Hours",
    rating: "4.9",
    conductedCount: "1,120+",
    tag: "Child Milestone",
    img: "/poojas/annaprasan sanskar pooja.png",
    seoKeyword: "Annaprashan Pandit Bangalore First Feeding Ceremony",
  },
  {
    id: "antim-sanskar",
    name: "Antim Sanskar (Antyesti Last Rites)",
    category: "Antim Sanskar & Shradh",
    desc: "Solemn scriptural cremation and Vedic transition rites strictly conducted in accordance with ancient Garuda Purana ordinances.",
    mahatva: "Assists the departed soul in traversing toward higher realms peacefully while ensuring spiritual decontamination and solace for grieving kins.",
    duration: "As Prescribed",
    rating: "5.0",
    conductedCount: "580+",
    tag: "Sacred Final Journey",
    img: "/poojas/antaimsanskar.jpeg",
    seoKeyword: "Antim Sanskar Last Rites Pandit Bangalore Cremation Rites",
  },
  {
    id: "bagalamukhi-anushthan",
    name: "Bagalamukhi Anushthan & Hawan",
    category: "Anushthan & Sadhana",
    desc: "Vedic invocation of Goddess Peetambara utilizing yellow turmeric oblations, protective mantras, and fierce evil-quelling rites.",
    mahatva: "Paralyzes enemy hostility, ensures triumph in complex litigations, and erects an impenetrable shield against malicious planetary strikes.",
    duration: "4 - 5 Hours",
    rating: "5.0",
    conductedCount: "310+",
    tag: "Enemy Victory",
    img: "/poojas/Bagulamukhi Anushthan.png",
    seoKeyword: "Bagalamukhi Anushthan Hawan Acharya Bengaluru",
  },
  {
    id: "bhoomi-pooja",
    name: "Bhoomi Pooja & Foundation Consecration",
    category: "Life Sanskars",
    desc: "Sacred earth veneration invoking Mother Earth, Varun Dev, and Vastu Purusha prior to site excavation or construction commencement.",
    mahatva: "Seeks maternal forgiveness for geological excavation, subdues subterranean negative forces, and guarantees safe, accident-free construction.",
    duration: "2 - 2.5 Hours",
    rating: "4.9",
    conductedCount: "540+",
    tag: "Construction Milestone",
    img: "/poojas/Bhoomi Pooja.png",
    seoKeyword: "Bhoomi Pooja Pandit in Bangalore Foundation Ceremony",
  },
  {
    id: "birthday-aayushya",
    name: "Birthday Ayushya Hawan & Blessing",
    category: "Life Sanskars",
    desc: "Traditional birthday consecration invoking Markandeya Rishi and Chiranjeevi deities for robust vitality and disease defense.",
    mahatva: "Neutralizes annual planetary transitions (Varshaphala doshas), infusing cellular strength, cognitive brightness, and longevity.",
    duration: "2 Hours",
    rating: "4.9",
    conductedCount: "1,450+",
    tag: "Longevity & Health",
    img: "/poojas/birthday.jpeg",
    seoKeyword: "Ayushya Hawan Birthday Puja Pandit Bangalore",
  },
  {
    id: "dhanteras-puja",
    name: "Dhanteras & Lord Dhanvantari Puja",
    category: "Festivals",
    desc: "Invocation of Lord Dhanvantari and Lord Kubera for physical rejuvenation, protection against chronic illness, and commercial wealth.",
    mahatva: "Blesses the family with therapeutic healing grace, shields against untimely mortality, and anchors stable material resources.",
    duration: "2 Hours",
    rating: "4.8",
    conductedCount: "1,140+",
    tag: "Health & Wealth",
    img: "/poojas/dhanteras pooja.jpeg",
    seoKeyword: "Dhanteras Dhanvantari Puja Pandit Bangalore",
  },
  {
    id: "diwali-puja",
    name: "Diwali Maha Lakshmi-Ganesh Pujan",
    category: "Festivals",
    desc: "Complete Shodashopachara Lakshmi-Ganesha adoration featuring account-book sanctification, Kuber yantra worship, and Vedic aarti.",
    mahatva: "Welcomes permanent prosperity into domestic and commercial spaces while dispelling debt, stagnation, and darkness.",
    duration: "2 - 3 Hours",
    rating: "5.0",
    conductedCount: "2,980+",
    tag: "Festival of Lights",
    img: "/poojas/diwali pooja.jpeg",
    seoKeyword: "Diwali Lakshmi Ganesh Pujan Pandit Bangalore",
  },
  {
    id: "durga-saptashati",
    name: "Durga Saptashati Path & Pujan",
    category: "Festivals",
    desc: "Flawless recitation of the 700 sacred shlokas from Markandeya Purana along with Kavach, Argala, and Kilak stotras for divine protection.",
    mahatva: "Destroys acute adversity, neutralizes invisible evil eyes, and draws the unreserved protective grace of Supreme Mother Mahamaya.",
    duration: "4 - 5 Hours",
    rating: "4.9",
    conductedCount: "670+",
    tag: "Shakti Upasana",
    img: "/poojas/durgasaptsati.jpeg",
    seoKeyword: "Durga Saptashati Path Pandit Bangalore",
  },
  {
    id: "ekadashi-udyapan",
    name: "Ekadashi Vrat Udyapan Ceremony",
    category: "Vrat & Path",
    desc: "Formal culmination of the 24/26 fortnightly Ekadashi vows per Haribhaktivilasa with Brahmana feeding and golden Tulsi archana.",
    mahatva: "Eliminates past spiritual demerits, multiplies the transcendental rewards of fasting, and secures profound inner liberation.",
    duration: "3 Hours",
    rating: "5.0",
    conductedCount: "410+",
    tag: "Vishnu Param Vrat",
    img: "/poojas/Ekadashi udyapan.png",
    seoKeyword: "Ekadashi Vrat Udyapan Purohit Bangalore",
  },
  {
    id: "engagement-sagai",
    name: "Engagement (Sagai) & Ring Ceremony",
    category: "Life Sanskars",
    desc: "Pre-nuptial Vedic celebration marking formal matrimonial commitment with Tilak, Lagna Patrika reading, and family blessings.",
    mahatva: "Harmonizes astral temperaments of both families and lays an auspicious foundation for an obstacle-free future marriage.",
    duration: "2 Hours",
    rating: "4.8",
    conductedCount: "710+",
    tag: "Pre-Wedding",
    img: "/poojas/engement pooja.jpeg",
    seoKeyword: "Sagai Engagement Pandit in Bangalore Hindi Purohit",
  },
  {
    id: "gandmool-shanti",
    name: "Gandmool Nakshatra Shanti Pooja",
    category: "Dosh Nivaran",
    desc: "Remedial Shastric ceremony for births under Ashwini, Ashlesha, Magha, Jyeshtha, Moola, or Revati using 27 sacred waters and herbs.",
    mahatva: "Pacifies inauspicious planetary forces, safeguarding child and parents from psychological distress and physical vulnerability.",
    duration: "3 - 3.5 Hours",
    rating: "4.9",
    conductedCount: "730+",
    tag: "Nakshatra Shanti",
    img: "/poojas/Gandmool Nakshatra shanti Pooja.png",
    seoKeyword: "Gandmool Shanti Puja Pandit in Bangalore 27 Nakshatra",
  },
  {
    id: "godh-bharai",
    name: "Godh Bharai / Seemantam Blessing",
    category: "Life Sanskars",
    desc: "Reverential Vedic baby shower bestowing health, spiritual tranquility, and protective aura upon expectant mother and fetus.",
    mahatva: "Surrounds the womb with auspicious vibrations, shielding the child from negativity and ensuring safe, comfortable childbirth.",
    duration: "2 - 3 Hours",
    rating: "4.9",
    conductedCount: "820+",
    tag: "Maternal Blessing",
    img: "/poojas/godbharai pooja.jpeg",
    seoKeyword: "Godh Bharai Baby Shower Pandit Bengaluru",
  },
  {
    id: "griha-pravesh-puja",
    name: "Griha Pravesh & Vastu Shanti Puja",
    category: "Life Sanskars",
    desc: "Consecration of a newly built residence or flat with Vastu devata invocation, Navagraha homa, milk boiling, and Ganapati puja.",
    mahatva: "Dispels residual construction flaws, pacifies cardinal directions, and installs lasting tranquility, health, and wealth in the home.",
    duration: "3 - 3.5 Hours",
    rating: "4.9",
    conductedCount: "3,120+",
    tag: "Most Auspicious",
    img: "/poojas/griha pravesh.jpeg",
    seoKeyword: "Griha Pravesh Pandit in Bangalore Housewarming Puja",
  },
  {
    id: "kaal-sarp",
    name: "Kaal Sarp Dosh Nivaran Hawan",
    category: "Dosh Nivaran",
    desc: "Scriptural Rahu-Ketu pacification ritual using consecrated silver Nag-Nagin yantra, Sarpa Suktam ahutis, and planetary oblations.",
    mahatva: "Dissolves persistent impediments in career, marital life, and health caused by planetary entrapment between the lunar nodes.",
    duration: "3 - 4 Hours",
    rating: "4.9",
    conductedCount: "1,210+",
    tag: "Dosha Shanti",
    img: "/poojas/kaalsarp dosh pooja.jpeg",
    seoKeyword: "Kaal Sarp Dosh Nivaran Puja Bangalore Pandit",
  },
  {
    id: "karnavedha",
    name: "Karnavedha Sanskar (Ear Piercing)",
    category: "Life Sanskars",
    desc: "Traditional Vedic ear-lobe piercing ceremony performed with mantra chanting for systemic harmony and auditory wellness.",
    mahatva: "Harmonizes acupuncture meridians, sharpens memory and hearing, and fulfills scriptural bodily purification sacraments.",
    duration: "1.5 Hours",
    rating: "4.7",
    conductedCount: "350+",
    tag: "Health & Sanskar",
    img: "/poojas/karnbhed sanskar.jpeg",
    seoKeyword: "Karnavedha Sanskar Pandit Ji Bangalore",
  },
  {
    id: "mangal-dosh",
    name: "Mangal Dosh Shanti & Hawan",
    category: "Dosh Nivaran",
    desc: "Mars pacification honoring Lord Angaraka with red coral archana and shastriya ahutis to overcome marital discord.",
    mahatva: "Subdues aggressive Martian heat, dispels matrimonial obstacles, and fosters enduring understanding between spouses.",
    duration: "2.5 Hours",
    rating: "4.8",
    conductedCount: "1,450+",
    tag: "Manglik Relief",
    img: "/poojas/mangaldosh.jpeg",
    seoKeyword: "Mangal Dosh Shanti Hawan Pandit Bangalore",
  },
  {
    id: "mangalvari-udyapan",
    name: "Mangalvari Vrat Udyapan Ceremony",
    category: "Vrat & Path",
    desc: "Conclusion ceremony for Tuesday vows honoring Lord Hanuman with vermillion, modak offerings, and consecrated ahutis.",
    mahatva: "Eliminates blood ailments, pacifies property conflicts, and instills profound fearless courage and victory over obstacles.",
    duration: "2 Hours",
    rating: "4.8",
    conductedCount: "390+",
    tag: "Sankat Mochan",
    img: "/poojas/Mangalvari udyapan.png",
    seoKeyword: "Mangalwar Vrat Udyapan Pandit Bangalore",
  },
  {
    id: "manglik-dosh-shanti",
    name: "Manglik Dosh Shanti Pooja",
    category: "Dosh Nivaran",
    desc: "Extensive planetary remedy balancing Mars placement in 1st, 4th, 7th, 8th, or 12th house with Navagraha peace rituals.",
    mahatva: "Prevents marital delays, transforms disruptive planetary tendencies into harmony, and preserves life partnership longevity.",
    duration: "2.5 Hours",
    rating: "4.9",
    conductedCount: "860+",
    tag: "Manglik Rectification",
    img: "/poojas/Manglik dosh shanti pooja.png",
    seoKeyword: "Manglik Dosh Puja in Bangalore North Indian Pandit",
  },
  {
    id: "vivah-sanskar",
    name: "Marriage (Vedic Vivah Sanskar)",
    category: "Life Sanskars",
    desc: "Solemn traditional wedding incorporating Kanyadaan, Saptapadi (Seven Vows), Mangalsutra Dharan, and sacred Vivah Hawan.",
    mahatva: "Scriptural convergence of two souls for Dharma, Artha, Kama, and Moksha, establishing lifelong matrimonial unity.",
    duration: "Full Ritual",
    rating: "5.0",
    conductedCount: "890+",
    tag: "Sacred Matrimony",
    img: "/poojas/marriage ppoja.jpeg",
    seoKeyword: "Vedic Vivah Marriage Pandit in Bangalore North Indian Style",
  },
  {
    id: "mundan-sanskar",
    name: "Mundan Sanskar (Chudakarana Ceremony)",
    category: "Life Sanskars",
    desc: "Sacred tonsure rite removing prenatal hair to purge karmic remnants and stimulate robust neural and hair follicles.",
    mahatva: "Purifies past life impressions, cools the brain center, and bestows longevity, sharp intellectual acumen, and health.",
    duration: "2 Hours",
    rating: "4.8",
    conductedCount: "980+",
    tag: "Purification Rite",
    img: "/poojas/mundan sanskar.jpeg",
    seoKeyword: "Mundan Sanskar Pandit in Bangalore North Indian Vidhi",
  },
  {
    id: "murti-pranpratistha",
    name: "Murti Pranapratishtha & Temple Consecration",
    category: "Life Sanskars",
    desc: "Sacred infusion of cosmic divine life-force (Prana) into deity idols per Vedic Agama texts utilizing Shodashopachara puja.",
    mahatva: "Transforms metal or stone forms into living divine embodiments, making household or temple altars fountains of spiritual energy.",
    duration: "3 - 4 Hours",
    rating: "5.0",
    conductedCount: "260+",
    tag: "Consecration Rite",
    img: "/poojas/Murti  pranpratistha.png",
    seoKeyword: "Murti Pranpratistha Pandit Bangalore Temple Consecration",
  },
  {
    id: "namkaran-sanskar",
    name: "Namkaran Sanskar (Naming Ceremony)",
    category: "Life Sanskars",
    desc: "Vedic ceremony conferring a meaningful, astrology-aligned name based on the infant's birth Nakshatra quarter and ascendant.",
    mahatva: "Awakens auspicious identity resonance, strengthens vital destiny paths, and invokes divine protection from family deities.",
    duration: "1.5 - 2 Hours",
    rating: "4.9",
    conductedCount: "780+",
    tag: "Child Milestone",
    img: "/poojas/Namkaran sanskar.png",
    seoKeyword: "Namkaran Sanskar Pandit in Bangalore Naming Ceremony",
  },
  {
    id: "namsanskar-alternate",
    name: "Namkaran Sanskar Special Vidhi",
    category: "Life Sanskars",
    desc: "Elaborate naming sacrament with planetary propitiation, Ayushya Suktam recitation, and ancestral Gotra invocation.",
    mahatva: "Infuses the child with planetary harmony and social respect, creating an auspicious vibrational shield for life.",
    duration: "2 Hours",
    rating: "4.9",
    conductedCount: "430+",
    tag: "Special Vedic Rite",
    img: "/poojas/namsanskar.jpeg",
    seoKeyword: "Vedic Namkaran Sanskar Ceremony Bangalore",
  },
  {
    id: "navchandi-yagya",
    name: "Navchandi Mahayagya & Hawan",
    category: "Anushthan & Sadhana",
    desc: "Sacrificial fire yagya invoking Goddess Durga with complete Saptashati paths, 1008 ahutis, and extensive environmental purification.",
    mahatva: "Wipes out acute family tribulations, nullifies dark negative energies, and showers all-encompassing peace and triumph.",
    duration: "5 Hours",
    rating: "5.0",
    conductedCount: "310+",
    tag: "Grand Anushthan",
    img: "/poojas/navchandi hawan.jpeg",
    seoKeyword: "Navchandi Mahayagya Hawan Acharya Bengaluru",
  },
  {
    id: "navratri-puja",
    name: "Navratri Ghatasthapana & Devi Pujan",
    category: "Festivals",
    desc: "Holy Kalash establishment on Pratipada followed by continuous Akhand Jyot setup, daily Durga aradhana, and Kanya pujan.",
    mahatva: "Attracts the cosmic maternal presence of the Nine Durgas, cleansing residential aura and quelling ancestral grievances.",
    duration: "3 Hours",
    rating: "5.0",
    conductedCount: "1,890+",
    tag: "Navratri Special",
    img: "/poojas/navratri pooja.jpeg",
    seoKeyword: "Navratri Ghatasthapana Pandit Bangalore Durga Puja",
  },
  {
    id: "pitra-dosh",
    name: "Pitra Dosh Shanti & Tarpan Puja",
    category: "Dosh Nivaran",
    desc: "Solemn propitiation of ancestors via Til-Tarpan, Pinda Daan prayers, and Garuda Purana rituals for ancestral contentment.",
    mahatva: "Relieves departed ancestors of unrest, unlocks hindered generational growth, and eliminates recurring familial hardships.",
    duration: "3 Hours",
    rating: "4.9",
    conductedCount: "1,320+",
    tag: "Ancestral Harmony",
    img: "/poojas/pitrishanti.jpeg",
    seoKeyword: "Pitra Dosh Shanti Tarpan Pandit Bangalore",
  },
  {
    id: "pradosh-varat-udyapan",
    name: "Pradosh Vrat Udyapan & Shiva Pujan",
    category: "Vrat & Path",
    desc: "Sacred completion rituals for the Trayodashi Pradosh vow honoring Lord Shiva and Mother Parvati during twilight Sandhya.",
    mahatva: "Fosters prompt relief from debt, protects against sudden mishaps, and guarantees lasting mental peace and longevity.",
    duration: "2.5 Hours",
    rating: "4.9",
    conductedCount: "480+",
    tag: "Shiva Blessing",
    img: "/poojas/Pradosh varat udyapan.png",
    seoKeyword: "Pradosh Vrat Udyapan Pandit in Bangalore",
  },
  {
    id: "ramayana-path",
    name: "Ramayana (Ramcharitmanas) Akhand Path",
    category: "Vrat & Path",
    desc: "Continuous devotion-infused recitation of Goswami Tulsidas's epic describing Lord Rama's virtuous life and noble victories.",
    mahatva: "Elevates household energy, cleanses moral ambience, and fosters righteousness, mutual affection, and auspicious fortune.",
    duration: "Custom / Full Day",
    rating: "5.0",
    conductedCount: "340+",
    tag: "Vedic Recitation",
    img: "/poojas/Ramayana path.png",
    seoKeyword: "Ramcharitmanas Akhand Path Acharya Bengaluru",
  },
  {
    id: "rudrabhishek-puja",
    name: "Rudrabhishek Pooja & Shiva Hawan",
    category: "Dosh Nivaran",
    desc: "Ceremonial bathing of Shiva Lingam using 11 consecrated dravyas accompanied by Sri Rudram and Chamakam chanting.",
    mahatva: "Annihilates chronic health afflictions, alleviates planetary grief, and grants supreme inner silence and material well-being.",
    duration: "2.5 - 3 Hours",
    rating: "5.0",
    conductedCount: "2,210+",
    tag: "Mahadev Kripa",
    img: "/poojas/Rudraabhishek pooja.png",
    seoKeyword: "Rudrabhishek Puja Pandit in Bangalore Vedic Shambho",
  },
  {
    id: "santan-gopal",
    name: "Santan Gopal Japa, Hawan & Pooja",
    category: "Anushthan & Sadhana",
    desc: "Vedic invocation of Bal Gopal featuring targeted mantra repetition and hawan for prospective parents longing for children.",
    mahatva: "Eliminates biological, psychological, and astrological impediments to childbirth, blessing families with noble, healthy offspring.",
    duration: "3 - 4 Hours",
    rating: "5.0",
    conductedCount: "680+",
    tag: "Progeny Blessing",
    img: "/poojas/santan gopal jap and pooja.png",
    seoKeyword: "Santan Gopal Jap and Hawan Pandit Bangalore",
  },
  {
    id: "satyanarayan-puja",
    name: "Satyanarayan Bhagwan Katha & Puja",
    category: "Vrat & Path",
    desc: "Sacred storytelling, panchamrit offering, and hawan dedicated to Lord Vishnu for family joy and righteous triumphs.",
    mahatva: "Promotes truth, eradicates chronic hurdles, resolves marital strains, and fills the residence with spiritual abundance.",
    duration: "2 - 2.5 Hours",
    rating: "4.9",
    conductedCount: "2,450+",
    tag: "Peace & Prosperity",
    img: "/poojas/satyanarayan pooja.jpeg",
    seoKeyword: "Satyanarayan Katha Puja Pandit Bangalore North Indian",
  },
  {
    id: "sudarshan-anushthan",
    name: "Sudarshan Homa & Maha Anushthan",
    category: "Anushthan & Sadhana",
    desc: "Invocation of Lord Vishnu's infallible discus (Sudarshan Chakra) to dismantle psychic hostility, curses, and unseen blockages.",
    mahatva: "Forms a resilient divine armor around family and business, neutralizing toxic jealousy and shielding overall vitality.",
    duration: "3 Hours",
    rating: "5.0",
    conductedCount: "420+",
    tag: "Divine Protection",
    img: "/poojas/Sudarshan Anushthan.png",
    seoKeyword: "Sudarshan Homa Anushthan Purohit Bangalore",
  },
  {
    id: "sundarkand-path",
    name: "Sundarkand Recitation & Hawan",
    category: "Vrat & Path",
    desc: "Spirited devotional chanting of Sundarkand with Hanuman Chalisa and Sankat Mochan stotra to awaken faith and grit.",
    mahatva: "Wards off chronic anxieties, protects against malevolent spirits, and turns seemingly impossible difficulties into victories.",
    duration: "2.5 - 3 Hours",
    rating: "5.0",
    conductedCount: "1,670+",
    tag: "Hanuman Grace",
    img: "/poojas/Sundarkand path.png",
    seoKeyword: "Sundarkand Path Pandit in Bangalore Hanuman Chalisa Hawan",
  },
  {
    id: "terahvin-shanti",
    name: "Terahvin (13th Day) Shanti Shradh Ceremony",
    category: "Antim Sanskar & Shradh",
    desc: "Culmination ceremony concluding mourning periods with Shanti Hawan, Brahmana Bhojan, and family re-purification.",
    mahatva: "Concludes ashaucha impurity, guides the soul to peaceful transcendence, and reinstates spiritual sanctity in the residence.",
    duration: "3 Hours",
    rating: "4.9",
    conductedCount: "820+",
    tag: "Universal Peace",
    img: "/poojas/terhvi sradhy.jpeg",
    seoKeyword: "Terahvin Shanti Hawan Shradh Pandit Bangalore",
  },
  {
    id: "upnayan-sanskar",
    name: "Upanayana (Janeu) Sanskar Ceremony",
    category: "Life Sanskars",
    desc: "Sacred thread investiture initiating young youth into Brahmacharya discipline, Vedic study, and daily Gayatri meditation.",
    mahatva: "Represents spiritual rebirth (Dvija), awakening inner spiritual discernment, concentration, and deep scriptural comprehension.",
    duration: "4 - 5 Hours",
    rating: "4.9",
    conductedCount: "430+",
    tag: "Spiritual Rebirth",
    img: "/poojas/upnayan sanskar.jpeg",
    seoKeyword: "Janeu Sanskar Upanayana Purohit Bangalore",
  },
  {
    id: "vahan-puja",
    name: "Vahan Puja (Vehicle Blessing Ceremony)",
    category: "Life Sanskars",
    desc: "Sacred consecration for new vehicles with Lord Ganesha invocation, Navagraha blessings, and Ayushya mantras.",
    mahatva: "Eliminates negative astral influences, prevents road accidents, and blesses travelers with safe, prosperous journeys.",
    duration: "45 Mins - 1 Hour",
    rating: "4.9",
    conductedCount: "1,620+",
    tag: "Protection & Safety",
    img: "/poojas/vahan pooja.jpeg",
    seoKeyword: "Vahan Puja Vehicle Blessing Pandit Bengaluru",
  },
  {
    id: "vastu-shanti-puja",
    name: "Vastu Shanti & Dosha Nivaran Puja",
    category: "Dosh Nivaran",
    desc: "Vedic ceremony and hawan reconciling spatial directions, directional deities, and subduing structural imbalances.",
    mahatva: "Restores elemental balance without destructive civil demolition, cultivating positive vibration, peace, and commercial progress.",
    duration: "2.5 - 3 Hours",
    rating: "4.9",
    conductedCount: "1,890+",
    tag: "Dosha Nivaran",
    img: "/poojas/vastu shanti.jpeg",
    seoKeyword: "Vastu Shanti Puja Pandit in Bangalore Dosha Nivaran",
  },
  {
    id: "vishnu-sahasranam",
    name: "Vishnu Sahasranama Path & Hawan",
    category: "Vrat & Path",
    desc: "Recitation of the thousand divine names of Supreme Lord Vishnu with sacred Tulsi leaves and consecrated oblations.",
    mahatva: "Pacifies all adverse planetary afflictions, dissolves karmic debts, relieves mental stress, and brings spiritual serenity.",
    duration: "2 Hours",
    rating: "4.9",
    conductedCount: "520+",
    tag: "Vishnu Upasana",
    img: "/poojas/Viahnu Sahsranam path.png",
    seoKeyword: "Vishnu Sahasranam Path Pandit Bangalore",
  },
  {
    id: "brihaspati-udyapan",
    name: "Vrihaspati (Jupiter) Vrat Udyapan",
    category: "Vrat & Path",
    desc: "Conclusion of Thursday Guru fasting vow utilizing yellow blossoms, Gram pulse offerings, and Navagraha oblations.",
    mahatva: "Overcomes matrimonial delays, improves academic and intellectual growth, and attracts the benevolent grace of Devaguru Brihaspati.",
    duration: "2 - 2.5 Hours",
    rating: "4.9",
    conductedCount: "640+",
    tag: "Guru Blessing",
    img: "/poojas/Vrihaspati udyapan.png",
    seoKeyword: "Brihaspati Vrat Udyapan Pandit Bangalore",
  },
];

const CATEGORIES = [
  "All",
  "Life Sanskars",
  "Festivals",
  "Dosh Nivaran",
  "Vrat & Path",
  "Anushthan & Sadhana",
  "Antim Sanskar & Shradh",
];

// 40+ Structured Local High-Intent SEO Keywords for Bangalore
const SEO_FOOTER_KEYWORDS = [
  "North Indian Pandit in Bangalore",
  "Hindi Pandit in Bangalore",
  "Bihari Pandit in Bangalore",
  "Maithili Pandit in Bangalore",
  "Griha Pravesh Puja Pandit in Whitefield",
  "Satyanarayan Puja in HSR Layout",
  "Vedic Vivah Pandit in Koramangala",
  "Vastu Shanti Puja in Indiranagar",
  "Rudrabhishek Puja in Electronic City",
  "Bhoomi Puja Pandit in Sarjapur Road",
  "Mundan Sanskar Pandit in Marathahalli",
  "Janeu Sanskar Upanayana in Bellandur",
  "Kaal Sarp Dosh Hawan in JP Nagar",
  "Manglik Dosh Shanti in Jayanagar",
  "Santan Gopal Hawan in Hebbal",
  "Navchandi Mahayagya in Yelahanka",
  "Sundarkand Path Pandit in BTM Layout",
  "Ramayana Akhand Path in Bannerghatta Road",
  "Ekadashi Udyapan Pandit in Malleshwaram",
  "Brihaspati Vrat Udyapan in Rajajinagar",
  "Pitra Dosh Shanti Tarpan in KR Puram",
  "Antim Sanskar Last Rites Pandit in Bangalore",
  "Terahvin Shanti Hawan Bangalore",
  "Namkaran Sanskar Pandit Bangalore",
  "Annaprashan First Feeding Pandit Bengaluru",
  "Godh Bharai Baby Shower Pandit Bengaluru",
  "Vahan Puja Pandit Bangalore",
  "Murti Pranapratishtha Temple Consecration Bangalore",
  "Maa Bagalamukhi Hawan Bangalore",
  "Maha Sudarshan Homa Bangalore",
  "Vishnu Sahasranama Hawan Bangalore",
  "Dhanteras Kuber Puja Bangalore",
  "Diwali Lakshmi Ganesh Pujan Bangalore",
  "Durga Saptashati Path Bangalore",
  "Pradosh Vrat Udyapan Bangalore",
  "Mangalwar Vrat Udyapan Bangalore",
  "Karnavedha Ear Piercing Pandit Bangalore",
  "Gandmool Nakshatra Shanti Hawan Bangalore",
  "Gurukul Vedic Acharya in Bangalore",
  "Authentic Hawan Samagri Kit Bangalore",
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

function HomeContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pujaName: "Griha Pravesh & Vastu Shanti Puja",
    customPujaInput: "",
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

  useEffect(() => {
    const pujaParam = searchParams.get("puja");
    const areaParam = searchParams.get("area");

    if (pujaParam || areaParam) {
      setFormData((prev) => ({
        ...prev,
        ...(pujaParam ? { pujaName: pujaParam } : {}),
        ...(areaParam ? { area: areaParam } : {}),
      }));

      // Smooth scroll direct to form container
      setTimeout(() => {
        const formEl = document.getElementById("booking-section");
        if (formEl) {
          formEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    }
  }, [searchParams]);

  const filteredPujas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return RAW_PUJA_LIST.filter((p) => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.desc.toLowerCase().includes(query) ||
        p.mahatva.toLowerCase().includes(query) ||
        p.seoKeyword.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectPujaToBook = useCallback((pujaTitle: string) => {
    setFormData((prev) => ({ ...prev, pujaName: pujaTitle }));
    const element = document.getElementById("booking-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleDirectWhatsAppBooking = useCallback(() => {
    const finalName =
      formData.pujaName === "Other Custom Vedic Ritual"
        ? formData.customPujaInput || "Custom Ritual"
        : formData.pujaName;
    const msg = `Namaste PurohitSetu Team, I want to book a Vedic Pandit for ${finalName} in ${formData.area || "Bengaluru"}. Please assist me with the muhurat and booking.`;
    window.open(`https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const chosenPuja =
      formData.pujaName === "Other Custom Vedic Ritual"
        ? formData.customPujaInput.trim() || "Custom Vedic Ritual"
        : formData.pujaName;

    try {
      const { error } = await supabase.from("bookings").insert([
        {
          name: formData.name,
          phone: formData.phone,
          puja_name: chosenPuja,
          language: formData.language,
          area: formData.area || "Bengaluru",
          location: formData.area || "Bengaluru",
          date: formData.date,
          samagri: formData.samagri,
          status: "available",
        },
      ]);

      if (error) throw error;

      triggerNewBookingNotification(chosenPuja, formData.area || "Bengaluru");

      setStatusMsg({
        type: "success",
        text: "Booking request confirmed successfully! A verified Acharya will reach out to you shortly.",
      });

      setFormData({
        name: "",
        phone: "",
        pujaName: "Griha Pravesh & Vastu Shanti Puja",
        customPujaInput: "",
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

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 font-sans selection:bg-orange-700 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="sticky top-0 z-40 w-full shadow-sm">
        <div className="bg-gradient-to-r from-red-800 via-orange-700 to-amber-800 text-white text-[11px] sm:text-xs py-1.5 px-3 text-center">
          <p className="font-semibold">
            🚩 <strong>North Indian Vedic Pandits in Bangalore:</strong> Hindi, Maithili, Bhojpuri &amp; Kannada Acharyas across all zones
          </p>
        </div>

        {/* 2. NAVIGATION BAR */}
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
              <a href="#why-choose-us" className="hover:text-orange-700 transition">Why Us</a>
              <a href="#localities-section" className="hover:text-orange-700 transition">Localities</a>
              <a href="#faq-section" className="hover:text-orange-700 transition">FAQ</a>
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
              <a href="#why-choose-us" onClick={() => setIsMenuOpen(false)} className="block py-1">Why Choose Us</a>
              <a href="#localities-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Localities in Bangalore</a>
              <a href="#faq-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Frequently Asked Questions</a>
              <a href="#contact-section" onClick={() => setIsMenuOpen(false)} className="block py-1">Contact &amp; Support</a>
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

      {/* 3. HERO SECTION */}
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
              placeholder="Search pujas: 'Sundarkand', 'Rudrabhishek', 'Vastu Shanti', 'Brihaspati'..."
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
            {CATEGORIES.map((cat) => (
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

      {/* 4. TRUST BADGES & VALUE METRICS */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-amber-200 p-3.5 rounded-2xl text-center shadow-xs">
            <span className="text-2xl block mb-1">🎓</span>
            <strong className="text-xs sm:text-sm text-slate-900 block font-black">Gurukul Trained</strong>
            <p className="text-[10px] text-slate-600">Varanasi, Haridwar &amp; Mithila Vidvat Acharyas</p>
          </div>
          <div className="bg-white border border-amber-200 p-3.5 rounded-2xl text-center shadow-xs">
            <span className="text-2xl block mb-1">🌿</span>
            <strong className="text-xs sm:text-sm text-slate-900 block font-black">100% Shastric Samagri</strong>
            <p className="text-[10px] text-slate-600">Pure Ghee, Mango Wood, and Herbs included</p>
          </div>
          <div className="bg-white border border-amber-200 p-3.5 rounded-2xl text-center shadow-xs">
            <span className="text-2xl block mb-1">⏰</span>
            <strong className="text-xs sm:text-sm text-slate-900 block font-black">Punctual Muhurat</strong>
            <p className="text-[10px] text-slate-600">Guaranteed on-time arrival across Bengaluru</p>
          </div>
          <div className="bg-white border border-amber-200 p-3.5 rounded-2xl text-center shadow-xs">
            <span className="text-2xl block mb-1">💳</span>
            <strong className="text-xs sm:text-sm text-slate-900 block font-black">Transparent Dakshina</strong>
            <p className="text-[10px] text-slate-600">Zero hidden fees, pay after ritual completion</p>
          </div>
        </div>
      </section>

      {/* 5. LOCALITIES BAR */}
      <section id="localities-section" className="bg-amber-100/70 py-4 px-4 border-y border-amber-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 mb-2 text-center sm:text-left">
            <span className="text-[11px] font-extrabold text-orange-950 uppercase tracking-wider flex items-center gap-1">
              <span>📍</span> Dedicated Pandit Coverage Across Bengaluru Zones:
            </span>
            <span className="text-[10px] text-slate-600 font-medium">Click any area for local purohits</span>
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

      {/* 6. PUJA SERVICES DIRECTORY (39 RITUALS) */}
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
          {filteredPujas.map((puja, index) => (
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
                  priority={index < 2}
                  loading={index < 2 ? "eager" : "lazy"}
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
                  <p className="text-[11px] text-slate-700 leading-relaxed mb-2 line-clamp-2">
                    {puja.desc}
                  </p>
                  
                  <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2 mb-3">
                    <span className="text-[9px] font-extrabold text-amber-900 uppercase tracking-wider block mb-0.5">
                      📖 Scriptural Significance:
                    </span>
                    <p className="text-[10px] text-slate-800 leading-relaxed line-clamp-3 italic">
                      &quot;{puja.mahatva}&quot;
                    </p>
                  </div>
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

      {/* 7. WHY CHOOSE PUROHITSETU */}
      <section id="why-choose-us" className="bg-gradient-to-br from-amber-50 to-orange-50 border-y border-amber-200 py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-orange-700 font-extrabold uppercase tracking-widest text-[10px]">
              Authentic Vedic Traditions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Why Bengaluru Families Trust PurohitSetu
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              We bridge the gap between busy metropolitan lifestyles and pristine scriptural rites, preserving holy Sanatan traditions across Bengaluru apartments and residences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs">
              <span className="text-3xl block mb-2">📜</span>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Traditional Shastric Vidhi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rituals conducted in strict accordance with the Grihya Sutras, Vedas, and authentic Sanatan Shastras. No commercial shortcuts or fabricated rituals.
              </p>
            </div>
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs">
              <span className="text-3xl block mb-2">🗣️</span>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Linguistic Familiarity</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with revered Acharyas fluent in North Indian languages—Hindi, Maithili, Bhojpuri, and Sanskrit—along with clear English explanations for younger generations.
              </p>
            </div>
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs">
              <span className="text-3xl block mb-2">🛡️</span>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Complete Verified Samagri</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We take care of the entire preparation. From certified dry mango wood, Navagraha samidha, pure desi cow ghee, to consecrated Ganga jal—everything is arranged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAST BOOKING FORM CONTAINER (With Exact Scroll Target) */}
      <section id="booking-section" className="py-12 px-4 scroll-mt-24">
        <div className="max-w-3xl mx-auto space-y-4">
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
                    {RAW_PUJA_LIST.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    <option value="Other Custom Vedic Ritual">Other / Custom Vedic Ritual</option>
                  </select>
                </div>
              </div>

              {formData.pujaName === "Other Custom Vedic Ritual" && (
                <div>
                  <label htmlFor="custom-puja-input" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Specify Custom Ritual Name *
                  </label>
                  <input
                    id="custom-puja-input"
                    type="text"
                    required
                    placeholder="e.g. Chandi Hawan, Specialized Grah Shanti..."
                    value={formData.customPujaInput}
                    onChange={(e) => setFormData({ ...formData, customPujaInput: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-orange-300 focus:ring-2 focus:ring-orange-600 text-xs bg-white text-slate-900"
                  />
                </div>
              )}

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
                  <strong>Include Complete Hawan &amp; Samagri Kit</strong> (Acharya brings verified woods, herbs, and holy water).
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

      {/* 9. FAQ SECTION */}
      <section id="faq-section" className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <span className="text-orange-700 font-extrabold uppercase tracking-widest text-[10px]">
            Devotee Assistance
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">Q: How are PurohitSetu Acharyas verified?</h3>
            <p className="text-slate-600 leading-relaxed">
              Every Acharya in our network is thoroughly vetted for their Vedic Gurukul lineage, ritual fluency in Sanskrit, and background check. They possess deep experience in North Indian traditions.
            </p>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">Q: Do the Pandits bring all required Hawan and Puja Samagri?</h3>
            <p className="text-slate-600 leading-relaxed">
              Yes. If you choose the &quot;Include Complete Hawan &amp; Samagri Kit&quot; option, our Acharyas will arrive with genuine mango wood, pure cow ghee, Navagraha samidha, Gangajal, and all ritual essentials.
            </p>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">Q: Can I consult regarding the auspicious Muhurat beforehand?</h3>
            <p className="text-slate-600 leading-relaxed">
              Yes, our Acharyas calculate the accurate Shubh Muhurat based on your family&apos;s Janma Nakshatra, Rashi, and regional Panchang at zero additional fee after booking.
            </p>
          </div>
        </div>
      </section>

      {/* 10. CONTACT & SUPPORT SECTION */}
      <section id="contact-section" className="bg-white border-t border-amber-200 py-10 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-black text-slate-900">Need Immediate Vedic Assistance?</h2>
          <p className="text-xs text-slate-600 max-w-xl mx-auto">
            Our Acharyas and dedicated customer support team are available 7 days a week to guide you with Muhurat, ritual requirements, and custom ceremonies.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold pt-2">
            <a
              href={`tel:+91${SUPPORT_PHONE}`}
              className="bg-amber-50 border border-amber-300 text-orange-950 px-4 py-2.5 rounded-xl hover:bg-amber-100 transition flex items-center gap-2"
            >
              <span>📞</span> Call Support: +91 {SUPPORT_PHONE}
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="bg-amber-50 border border-amber-300 text-orange-950 px-4 py-2.5 rounded-xl hover:bg-amber-100 transition flex items-center gap-2"
            >
              <span>✉️</span> Email Us: {SUPPORT_EMAIL}
            </a>
            <a
              href={`https://wa.me/91${SUPPORT_PHONE}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition flex items-center gap-2"
            >
              <span>💬</span> WhatsApp Direct
            </a>
          </div>
        </div>
      </section>

      {/* 11. FOOTER (RICH WITH 40+ SEO KEYWORDS & CORRECT EMAIL) */}
      <footer className="bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white py-10 px-4 border-t-2 border-amber-400">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          
          {/* Main Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-orange-50">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>•</span>
            <a href="#services-section" className="hover:text-white transition">Puja Catalog</a>
            <span>•</span>
            <a href="#localities-section" className="hover:text-white transition">Bangalore Zones</a>
            <span>•</span>
            <a href="#why-choose-us" className="hover:text-white transition">Why Us</a>
            <span>•</span>
            <a href="#faq-section" className="hover:text-white transition">FAQ</a>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-white transition underline underline-offset-4">Privacy Policy</Link>
            <span>•</span>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white transition font-medium underline underline-offset-4">
              {SUPPORT_EMAIL}
            </a>
          </div>

          {/* 40+ Structured Local High-Intent SEO Keywords */}
          <div className="border-t border-orange-700/60 pt-4 text-left">
            <span className="block text-[11px] font-extrabold uppercase tracking-widest text-amber-300 mb-2.5 text-center">
              Popular Vedic Pujas &amp; Pandit Services in Bengaluru:
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {SEO_FOOTER_KEYWORDS.map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] bg-black/25 text-orange-100/90 border border-orange-700/40 px-2 py-0.5 rounded"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Copyright & Helpline */}
          <div className="border-t border-orange-600/70 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-orange-100 gap-2">
            <p>© 2026 PurohitSetu Bengaluru • Authentic North Indian &amp; Vedic Purohit Platform</p>
            <div className="bg-black/40 px-3.5 py-1 rounded-full text-white font-semibold border border-white/20">
              Official Helpline: +91 {SUPPORT_PHONE}
            </div>
          </div>

          {/* Developer Credit */}
          <div className="pt-2 border-t border-orange-700/50 text-[10px] text-orange-200/90 font-medium tracking-wide">
            Created and Designed by <span className="font-bold text-amber-300">Prince Pandey</span> • Mob:{" "}
            <a href="tel:+917667984349" className="hover:text-white underline underline-offset-2 font-bold">
              +91 7667984349
            </a>
          </div>
        </div>
      </footer>

      {/* 12. TOKEN BOOKING MODAL */}
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
                <label htmlFor="token-puja-select" className="block font-bold text-slate-700 mb-0.5">Puja Ritual / Service</label>
                <select
                  id="token-puja-select"
                  value={tokenData.pujaName}
                  onChange={(e) => setTokenData({ ...tokenData, pujaName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  {RAW_PUJA_LIST.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                  <option value="Other Custom Ritual">Other Custom Ritual</option>
                </select>
              </div>

              {tokenData.pujaName === "Other Custom Ritual" && (
                <div>
                  <input
                    type="text"
                    placeholder="Specify custom ritual..."
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

                <input
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}