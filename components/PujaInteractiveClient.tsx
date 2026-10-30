"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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

const CLICKABLE_SEO_KEYWORDS = [
  { title: "North Indian Pandit in Whitefield", url: "/pandit/whitefield" },
  { title: "Hindi Pandit in HSR Layout", url: "/pandit/hsr-layout" },
  { title: "Bihari Pandit in Koramangala", url: "/pandit/koramangala" },
  { title: "Maithili Pandit in Marathahalli", url: "/pandit/marathahalli" },
  { title: "Griha Pravesh Puja in Whitefield", url: "/pandit/whitefield/griha-pravesh-puja" },
  { title: "Satyanarayan Puja in HSR Layout", url: "/pandit/hsr-layout/satyanarayan-pooja" },
  { title: "Vedic Vivah Pandit in Koramangala", url: "/pandit/koramangala/marriage-pooja" },
  { title: "Vastu Shanti Puja in Indiranagar", url: "/pandit/indiranagar/vastu-shanti-pooja" },
  { title: "Rudrabhishek Puja in Electronic City", url: "/pandit/electronic-city/rudrabhishek-pooja" },
  { title: "Bhoomi Puja Pandit in Sarjapur Road", url: "/pandit/sarjapur-road/bhoomi-pooja" },
  { title: "Mundan Sanskar in Marathahalli", url: "/pandit/marathahalli/mundan-sanskar" },
  { title: "Janeu Sanskar in Bellandur", url: "/pandit/bellandur/upnayan-sanskar" },
  { title: "Kaal Sarp Dosh Hawan in JP Nagar", url: "/pandit/jp-nagar/kaal-sarp-dosh-pooja" },
  { title: "Manglik Dosh Shanti in Jayanagar", url: "/pandit/jayanagar/manglik-dosh-shanti-pooja" },
  { title: "Santan Gopal Hawan in Hebbal", url: "/pandit/hebbal/santan-gopal-jap-and-pooja" },
  { title: "Navchandi Mahayagya in Yelahanka", url: "/pandit/yelahanka/navchandi-hawan" },
  { title: "Sundarkand Path in BTM Layout", url: "/pandit/btm-layout/sundarkand-path" },
  { title: "Ramayana Akhand Path in Bannerghatta Road", url: "/pandit/bannerghatta-road/ramayana-path" },
  { title: "Ekadashi Udyapan in Malleshwaram", url: "/pandit/malleshwaram/ekadashi-udyapan" },
  { title: "Brihaspati Vrat Udyapan in Rajajinagar", url: "/pandit/rajajinagar/vrihaspati-udyapan" },
  { title: "Pitra Dosh Shanti Tarpan in KR Puram", url: "/pandit/kr-puram/pitra-dosh-shanti" },
  { title: "Antim Sanskar Last Rites in Whitefield", url: "/pandit/whitefield/antim-sanskar" },
  { title: "Terahvin Shanti Hawan in HSR Layout", url: "/pandit/hsr-layout/terahvin-shanti-shradh" },
  { title: "Namkaran Sanskar in Whitefield", url: "/pandit/whitefield/namkaran-sanskar" },
  { title: "Annaprashan Ceremony in Bellandur", url: "/pandit/bellandur/annaprasan-sanskar-pooja" },
  { title: "Godh Bharai Baby Shower in Sarjapur Road", url: "/pandit/sarjapur-road/godh-bharai-pooja" },
  { title: "Vahan Puja in Electronic City", url: "/pandit/electronic-city/vahan-pooja" },
  { title: "Murti Pranapratishtha in Indiranagar", url: "/pandit/indiranagar/murti-pranpratistha" },
  { title: "Maa Bagalamukhi Hawan in Hebbal", url: "/pandit/hebbal/bagulamukhi-anushthan" },
  { title: "Maha Sudarshan Homa in Koramangala", url: "/pandit/koramangala/sudarshan-anushthan" },
  { title: "Vishnu Sahasranama Hawan in JP Nagar", url: "/pandit/jp-nagar/vishnu-sahasranam-path" },
  { title: "Dhanteras Kuber Puja in Jayanagar", url: "/pandit/jayanagar/dhanteras-pooja" },
  { title: "Diwali Lakshmi Ganesh Pujan in Whitefield", url: "/pandit/whitefield/diwali-pooja" },
  { title: "Durga Saptashati Path in Marathahalli", url: "/pandit/marathahalli/durgasaptsati-path" },
  { title: "Pradosh Vrat Udyapan in Malleshwaram", url: "/pandit/malleshwaram/pradosh-varat-udyapan" },
  { title: "Mangalwar Vrat Udyapan in KR Puram", url: "/pandit/kr-puram/mangalvari-udyapan" },
  { title: "Karnavedha Ear Piercing in Yelahanka", url: "/pandit/yelahanka/karnabhed-sanskar" },
  { title: "Gandmool Nakshatra Shanti in Sarjapur Road", url: "/pandit/sarjapur-road/gandmool-nakshatra-shanti-pooja" },
  { title: "Vedic Pandit in Kanakapura Road", url: "/pandit/kanakapura-road" },
  { title: "Authentic Hawan Samagri Kit in Bengaluru", url: "/#booking-section" },
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

export default function PujaInteractiveClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // TOGGLE TO SHOW 1 PUJA INITIALLY OR EXPAND TO ALL
  const [showAllPujas, setShowAllPujas] = useState(false);

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

  // MODAL STATE & TABS
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"advance" | "completion">("advance");

  // Tab 1: Advance Token State
  const [advanceData, setAdvanceData] = useState({
    yajmanName: "",
    phone: "",
    pujaDate: "",
    pujaName: "Griha Pravesh & Vastu Shanti Puja",
    customPuja: "",
    amount: "501",
  });

  // Tab 2: After Puja Completion Settlement State
  const [completionData, setCompletionData] = useState({
    yajmanName: "",
    phone: "",
    pujaName: "Griha Pravesh & Vastu Shanti Puja",
    customPuja: "",
    pujaDate: "",
    panditName: "",
    totalAmount: "2100",
  });

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const pujaParam = searchParams.get("puja");
    const areaParam = searchParams.get("area");

    if (pujaParam || areaParam) {
      setFormData((prev) => ({
        ...prev,
        ...(pujaParam ? { pujaName: pujaParam } : {}),
        ...(areaParam ? { area: areaParam } : {}),
      }));

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

  // If user searched or selected a category, show all matching results; otherwise respect the showAllPujas toggle
  const visiblePujas = useMemo(() => {
    if (searchQuery.trim() || selectedCategory !== "All") {
      return filteredPujas;
    }
    return showAllPujas ? filteredPujas : filteredPujas.slice(0, 1);
  }, [filteredPujas, showAllPujas, searchQuery, selectedCategory]);

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

      router.push("/thank-you");
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: "Error submitting booking: " + (err.message || "Please check your network connection."),
      });
    } finally {
      setLoading(false);
    }
  };

  // COMMON RAZORPAY HANDLER FOR BOTH TABS
  const executeRazorpayPayment = async (payload: {
    yajmanName: string;
    phone: string;
    pujaName: string;
    pujaDate: string;
    panditName?: string;
    amount: string;
    type: "Advance Booking Token" | "Post Puja Total Settlement";
  }) => {
    setPaymentNotice(null);

    const amountNum = parseFloat(payload.amount);
    if (!amountNum || amountNum < 1) {
      setPaymentNotice({ type: "error", text: "Please enter a valid amount (Minimum ₹1)." });
      return;
    }

    if (!payload.yajmanName.trim() || !payload.phone.trim()) {
      setPaymentNotice({ type: "error", text: "Yajman Name and Phone Number are required." });
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setPaymentNotice({
        type: "error",
        text: "Payment configuration is currently unavailable. Please contact support.",
      });
      return;
    }

    setPaymentProcessing(true);

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      setPaymentProcessing(false);
      setPaymentNotice({
        type: "error",
        text: "Payment gateway failed to initialize. Please check your internet connection.",
      });
      return;
    }

    const options = {
      key: razorpayKey,
      amount: Math.round(amountNum * 100),
      currency: "INR",
      name: "PurohitSetu Bengaluru",
      description: `${payload.type} - ${payload.pujaName}`,
      image: "/pandit-logo.png",
      prefill: {
        name: payload.yajmanName,
        contact: payload.phone,
      },
      notes: {
        payment_type: payload.type,
        yajman_name: payload.yajmanName,
        yajman_phone: payload.phone,
        puja_name: payload.pujaName,
        puja_date: payload.pujaDate || "Not Specified",
        pandit_name: payload.panditName || "Assigned Vedic Acharya",
      },
      theme: {
        color: "#ea580c",
      },
      handler: async (response: any) => {
        try {
          const paymentId = response?.razorpay_payment_id || "PAY_CONFIRMED";

          await supabase.from("token_transactions").insert({
            pandit_id: payload.panditName || "general_booking",
            pandit_phone: payload.phone,
            pandit_name: payload.panditName || "Assigned Acharya",
            pack_name: `${payload.type}: ${payload.pujaName} (${payload.pujaDate})`,
            amount: amountNum,
            tokens_credited: 0,
            razorpay_payment_id: paymentId,
          });

          triggerNewBookingNotification(
            `${payload.type}: ${payload.pujaName}`,
            `Bengaluru (₹${amountNum})`
          );

          setPaymentNotice({
            type: "success",
            text: `Payment of ₹${amountNum} completed successfully! Transaction ID: ${paymentId}.`,
          });
        } catch (dbErr: any) {
          console.error(dbErr);
          setPaymentNotice({
            type: "success",
            text: `Payment confirmed (Ref ID: ${response?.razorpay_payment_id}). Thank you!`,
          });
        } finally {
          setPaymentProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setPaymentProcessing(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setPaymentProcessing(false);
        setPaymentNotice({
          type: "error",
          text: `Payment failed: ${response?.error?.description || "Transaction cancelled."}`,
        });
      });
      rzp.open();
    } catch (err: any) {
      setPaymentProcessing(false);
      setPaymentNotice({
        type: "error",
        text: "Could not open payment gateway: " + err.message,
      });
    }
  };

  // Submit Handler Tab 1: Advance Token
  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPuja =
      advanceData.pujaName === "Other Custom Ritual"
        ? advanceData.customPuja || "Custom Ritual"
        : advanceData.pujaName;

    executeRazorpayPayment({
      yajmanName: advanceData.yajmanName,
      phone: advanceData.phone,
      pujaDate: advanceData.pujaDate,
      pujaName: finalPuja,
      amount: advanceData.amount,
      type: "Advance Booking Token",
    });
  };

  // Submit Handler Tab 2: After Puja Completion Settlement
  const handleCompletionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPuja =
      completionData.pujaName === "Other Custom Ritual"
        ? completionData.customPuja || "Custom Ritual"
        : completionData.pujaName;

    executeRazorpayPayment({
      yajmanName: completionData.yajmanName,
      phone: completionData.phone,
      pujaDate: completionData.pujaDate,
      pujaName: finalPuja,
      panditName: completionData.panditName,
      amount: completionData.totalAmount,
      type: "Post Puja Total Settlement",
    });
  };

  return (
    <>
      {/* ACTION BAR UNDER HERO WITH PUJA TOKEN BUTTON */}
      <section className="max-w-4xl mx-auto px-4 pt-3 pb-6 text-center">
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
            <span>🪙</span> Puja Token &amp; Payment
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

        {/* SEARCH AND CATEGORIES */}
        <div className="relative max-w-2xl mx-auto mb-4 shadow-xs">
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
      </section>

      {/* LOCALITIES BAR */}
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

      {/* PUJA SERVICES DIRECTORY (SHOWS 1 INITIALLY, EXPANDS ON TOGGLE) */}
      <section id="services-section" className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6 border-b border-amber-200 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <span className="text-orange-700 font-extrabold uppercase tracking-widest text-[10px]">Sanatan Sanskar Directory</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Vedic Pujas, Sanskars &amp; Hawan Ceremonies
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAllPujas((prev) => !prev)}
            className="text-xs font-bold text-orange-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5"
          >
            <span>{showAllPujas ? "▲ Show Less" : "▼ See All Puja Services (39)"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {visiblePujas.map((puja, index) => (
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
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
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

        {/* BOTTOM DROPDOWN / TOGGLE BUTTON */}
        {!searchQuery && selectedCategory === "All" && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setShowAllPujas((prev) => !prev)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition"
            >
              <span>{showAllPujas ? "▲ Show Less Services" : "▼ See All Puja Services (39)"}</span>
            </button>
          </div>
        )}
      </section>

      {/* WHY DEVOTEES CHOOSE PUROHITSETU */}
      <section id="why-choose-us" className="bg-gradient-to-br from-amber-50 to-orange-50 border-y border-amber-200 py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-orange-700 font-extrabold uppercase tracking-widest text-[10px]">
              Sanatan Heritage &amp; Trust
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Why Devotees Choose PurohitSetu in Bangalore
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Authentic Gurukul-ordained North Indian and South Indian Vedic Pandits across Bengaluru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs">
              <span className="text-2xl block mb-2">🌿</span>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Authentic Sanskrit Chanting &amp; Shastric Vidhi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated strictly to genuine Vedic rituals and Hawans. Zero speculative astrology or commercial horoscope gimmicks.
              </p>
            </div>
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs">
              <span className="text-2xl block mb-2">ॐ</span>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">North Indian, Hindi, Bihari &amp; Maithili Pandits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verified Acharyas from Varanasi, Mithila, Haridwar, and Prayagraj proficient in your family&apos;s authentic customs.
              </p>
            </div>
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs">
              <span className="text-2xl block mb-2">🗣️</span>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Multilingual Ceremony Conduct</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rituals conducted with clear explanation in Hindi, English, Kannada, Telugu, Bhojpuri, or Maithili.
              </p>
            </div>
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs">
              <span className="text-2xl block mb-2">🔥</span>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">Complete Hawan &amp; Samagri Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our Pandits arrive equipped with authenticated Mango wood, Navagraha herbs, pure cow ghee, and Gangajal, etc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAST BOOKING FORM CONTAINER WITH 4-PILL TRUST BAR */}
      <section id="booking-section" className="py-12 px-4 scroll-mt-24">
        <div className="max-w-3xl mx-auto space-y-4">
          
          <div className="bg-white border border-amber-200 rounded-2xl p-3 sm:p-4 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <div>
                <strong className="block text-[11px] font-extrabold text-slate-900">100% Secure Booking</strong>
                <span className="text-[10px] text-slate-500">Your data is safe with us</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl text-orange-600 font-bold">₹</span>
              <div>
                <strong className="block text-[11px] font-extrabold text-slate-900">Zero Upfront Cost</strong>
                <span className="text-[10px] text-slate-500">Pay after puja completion</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎖️</span>
              <div>
                <strong className="block text-[11px] font-extrabold text-slate-900">Verified Pandits</strong>
                <span className="text-[10px] text-slate-500">Experienced &amp; vetted</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎧</span>
              <div>
                <strong className="block text-[11px] font-extrabold text-slate-900">24/7 Support</strong>
                <span className="text-[10px] text-slate-500">We are here to help you</span>
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

      {/* 24/7 SUPPORT DESK */}
      <section className="py-6 px-4 bg-orange-50/50 text-center">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-800 block mb-1">
          24/7 Support Desk
        </span>
        <h3 className="text-base font-black text-slate-900 mb-3">
          Contact Official Platform Support
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
          <a
            href={`tel:+91${SUPPORT_PHONE}`}
            className="bg-white border border-amber-300 px-4 py-2 rounded-xl shadow-xs text-slate-800 hover:bg-orange-50 transition"
          >
            Call / WhatsApp: +91 {SUPPORT_PHONE}
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="bg-white border border-amber-300 px-4 py-2 rounded-xl shadow-xs text-slate-800 hover:bg-orange-50 transition"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white py-10 px-4 border-t-2 border-amber-400">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-orange-50">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-white transition underline underline-offset-4">Privacy Policy</Link>
            <span>•</span>
            <a href="#booking-section" className="hover:text-white transition">Terms &amp; Conditions</a>
            <span>•</span>
            <a href="#why-choose-us" className="hover:text-white transition">About Us</a>
            <span>•</span>
            <a href={`https://wa.me/91${SUPPORT_PHONE}`} target="_blank" rel="noreferrer" className="hover:text-white transition">
              WhatsApp Support ({SUPPORT_PHONE})
            </a>
          </div>

          <div className="border-t border-orange-700/60 pt-4 text-left">
            <span className="block text-[11px] font-extrabold uppercase tracking-widest text-amber-300 mb-2.5 text-center">
              Popular Vedic Searches in Bangalore:
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {CLICKABLE_SEO_KEYWORDS.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="text-[10px] bg-black/25 hover:bg-orange-700 hover:text-white text-orange-100/90 border border-orange-700/40 px-2 py-0.5 rounded transition cursor-pointer"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-orange-600/70 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-orange-100 gap-2">
            <p>© 2026 PurohitSetu Bengaluru • Dedicated Vedic Puja Services • Bengaluru</p>
            <div className="bg-black/40 px-3.5 py-1 rounded-full text-white font-semibold border border-white/20">
              Helpline: +91 {SUPPORT_PHONE}
            </div>
          </div>

          <div className="pt-2 border-t border-orange-700/50 text-[10px] text-orange-200/90 font-medium tracking-wide">
            Created and Designed by <span className="font-bold text-amber-300">Prince Pandey</span> • Mob:{" "}
            <a href="tel:+917667984349" className="hover:text-white underline underline-offset-2 font-bold">
              +91 7667984349
            </a>
          </div>
        </div>
      </footer>

      {/* COMPREHENSIVE PUJA TOKEN & SETTLEMENT PAYMENT MODAL */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-orange-200 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">🪙</span>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Puja Payment &amp; Token</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Verified Payment via Razorpay</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTokenModalOpen(false);
                  setPaymentNotice(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center justify-center"
                aria-label="Close Modal"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-amber-50 rounded-xl mb-4 border border-amber-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setModalTab("advance");
                  setPaymentNotice(null);
                }}
                className={`py-2 rounded-lg transition ${
                  modalTab === "advance"
                    ? "bg-orange-700 text-white shadow-xs"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                1. Advance Token
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalTab("completion");
                  setPaymentNotice(null);
                }}
                className={`py-2 rounded-lg transition ${
                  modalTab === "completion"
                    ? "bg-orange-700 text-white shadow-xs"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                2. After Puja Payment
              </button>
            </div>

            {paymentNotice && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold mb-3 ${
                  paymentNotice.type === "success"
                    ? "bg-green-50 text-green-900 border border-green-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {paymentNotice.text}
              </div>
            )}

            {/* TAB 1: ADVANCE TOKEN FORM */}
            {modalTab === "advance" ? (
              <form onSubmit={handleAdvanceSubmit} className="space-y-3 text-xs">
                <div>
                  <label htmlFor="adv-yajman" className="block font-bold text-slate-700 mb-0.5">Yajman Name *</label>
                  <input
                    id="adv-yajman"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={advanceData.yajmanName}
                    onChange={(e) => setAdvanceData({ ...advanceData, yajmanName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="adv-phone" className="block font-bold text-slate-700 mb-0.5">Phone Number *</label>
                    <input
                      id="adv-phone"
                      type="tel"
                      required
                      placeholder="10-digit number"
                      value={advanceData.phone}
                      onChange={(e) => setAdvanceData({ ...advanceData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="adv-date" className="block font-bold text-slate-700 mb-0.5">Puja Date *</label>
                    <input
                      id="adv-date"
                      type="date"
                      required
                      value={advanceData.pujaDate}
                      onChange={(e) => setAdvanceData({ ...advanceData, pujaDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="adv-puja" className="block font-bold text-slate-700 mb-0.5">Select Sacred Puja *</label>
                  <select
                    id="adv-puja"
                    value={advanceData.pujaName}
                    onChange={(e) => setAdvanceData({ ...advanceData, pujaName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    {RAW_PUJA_LIST.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                    <option value="Other Custom Ritual">Other / Custom Ritual</option>
                  </select>
                </div>

                {advanceData.pujaName === "Other Custom Ritual" && (
                  <div>
                    <input
                      type="text"
                      placeholder="Specify ritual name..."
                      value={advanceData.customPuja}
                      onChange={(e) => setAdvanceData({ ...advanceData, customPuja: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-orange-300 text-slate-900"
                    />
                  </div>
                )}

                <div>
                  <span className="block font-bold text-slate-700 mb-1">Select Advance Token Amount (₹)</span>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {BOOKING_TOKEN_PRESETS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAdvanceData({ ...advanceData, amount: amt.toString() })}
                        className={`py-1.5 rounded-lg font-bold border transition ${
                          advanceData.amount === amt.toString()
                            ? "bg-orange-700 text-white border-orange-700"
                            : "bg-orange-50 text-slate-800 border-orange-200 hover:bg-orange-100"
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  <label htmlFor="adv-custom-amt" className="block text-[10px] font-semibold text-slate-500 mb-0.5">Or Enter Custom Amount (₹)</label>
                  <input
                    id="adv-custom-amt"
                    type="number"
                    min="1"
                    required
                    placeholder="Enter custom amount..."
                    value={advanceData.amount}
                    onChange={(e) => setAdvanceData({ ...advanceData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-orange-700 via-amber-700 to-red-700 text-white font-extrabold shadow hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
                >
                  {paymentProcessing ? "Opening Gateway..." : `Pay Advance Token ₹${advanceData.amount || 0}`}
                </button>
              </form>
            ) : (
              /* TAB 2: POST PUJA FINAL SETTLEMENT FORM */
              <form onSubmit={handleCompletionSubmit} className="space-y-3 text-xs">
                <div>
                  <label htmlFor="comp-yajman" className="block font-bold text-slate-700 mb-0.5">Yajman Name *</label>
                  <input
                    id="comp-yajman"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={completionData.yajmanName}
                    onChange={(e) => setCompletionData({ ...completionData, yajmanName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="comp-phone" className="block font-bold text-slate-700 mb-0.5">Phone Number *</label>
                    <input
                      id="comp-phone"
                      type="tel"
                      required
                      placeholder="10-digit number"
                      value={completionData.phone}
                      onChange={(e) => setCompletionData({ ...completionData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="comp-date" className="block font-bold text-slate-700 mb-0.5">Puja Date *</label>
                    <input
                      id="comp-date"
                      type="date"
                      required
                      value={completionData.pujaDate}
                      onChange={(e) => setCompletionData({ ...completionData, pujaDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="comp-puja" className="block font-bold text-slate-700 mb-0.5">Conducted Puja Ritual *</label>
                  <select
                    id="comp-puja"
                    value={completionData.pujaName}
                    onChange={(e) => setCompletionData({ ...completionData, pujaName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    {RAW_PUJA_LIST.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                    <option value="Other Custom Ritual">Other / Custom Ritual</option>
                  </select>
                </div>

                {completionData.pujaName === "Other Custom Ritual" && (
                  <div>
                    <input
                      type="text"
                      placeholder="Specify ritual name..."
                      value={completionData.customPuja}
                      onChange={(e) => setCompletionData({ ...completionData, customPuja: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-orange-300 text-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="comp-pandit" className="block font-bold text-slate-700 mb-0.5">
                    Conducted By Pandit Name (Acharya) *
                  </label>
                  <input
                    id="comp-pandit"
                    type="text"
                    required
                    placeholder="e.g. Acharya Shrikant Shastri Ji"
                    value={completionData.panditName}
                    onChange={(e) => setCompletionData({ ...completionData, panditName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="comp-total-amt" className="block font-bold text-slate-700 mb-0.5">
                    Total Final Settlement Amount (₹) *
                  </label>
                  <input
                    id="comp-total-amt"
                    type="number"
                    min="1"
                    required
                    placeholder="Enter total amount (e.g. 2100, 5100)..."
                    value={completionData.totalAmount}
                    onChange={(e) => setCompletionData({ ...completionData, totalAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-orange-300 font-black text-slate-900 bg-orange-50/20 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-700 text-white font-extrabold shadow hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
                >
                  {paymentProcessing ? "Opening Gateway..." : `Pay Total Amount ₹${completionData.totalAmount || 0}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}