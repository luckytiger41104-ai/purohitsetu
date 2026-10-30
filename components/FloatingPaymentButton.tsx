"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { triggerNewBookingNotification } from "@/lib/notifyPandits";


const PRESET_TOKEN_AMOUNTS = [101, 251, 501, 1100, 2100, 5100];

const loadRazorpaySDK = (): Promise<boolean> => {
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

function FloatingPaymentContent() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Form State for Pandit Settlement
  const [panditName, setPanditName] = useState("");
  const [panditPhone, setPanditPhone] = useState("");
  const [pujaName, setPujaName] = useState("Griha Pravesh Puja");
  const [pujaDate, setPujaDate] = useState("");
  const [totalDakshina, setTotalDakshina] = useState("2100");
  const [settlementLoading, setSettlementLoading] = useState(false);

  // Form State for Devotee / User Booking Token
  const [tokenData, setTokenData] = useState({
    yajmanName: "",
    phone: "",
    preferredPandit: "",
    selectedPuja: "General Puja Booking Token",
    customPuja: "",
    amount: "501",
  });
  const [tokenProcessing, setTokenProcessing] = useState(false);
  const [tokenNotice, setTokenNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // SIRF Pandit Dashboard (/pandit/dashboard) ya Admin panel par True hoga
  // Public pages (/pandit/whitefield, etc.) par False rahega
  const isPanditDashboard = pathname === "/pandit/dashboard" || pathname?.startsWith("/admin");

  // Auto-calculated 30% Platform Fee for Pandit settlement
  const calculatedCommission = Math.round((parseFloat(totalDakshina) || 0) * 0.3);

  // Pandit Ji ka 30% commission settlement handler
  const handleCommissionPay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (calculatedCommission < 1) {
      alert("Please enter a valid total dakshina amount to calculate the commission.");
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert("Payment key is currently activating. Please wait a few moments.");
      return;
    }

    setSettlementLoading(true);

    const isLoaded = await loadRazorpaySDK();
    if (!isLoaded) {
      alert("Unable to load payment gateway. Please check your internet connection.");
      setSettlementLoading(false);
      return;
    }

    const options = {
      key: razorpayKey,
      amount: calculatedCommission * 100,
      currency: "INR",
      name: "PurohitSetu Admin Settlement",
      description: `30% Platform Commission: ${pujaName} (${pujaDate || "Recent"})`,
      image: "/pandit-logo.png",
      prefill: {
        name: panditName,
        contact: panditPhone,
      },
      notes: {
        role: "Pandit Commission Settlement",
        puja_name: pujaName,
        puja_date: pujaDate || "N/A",
        total_dakshina_received: totalDakshina,
        commission_paid: calculatedCommission.toString(),
        pandit_phone: panditPhone,
      },
      theme: {
        color: "#ea580c",
      },
      handler: function (response: any) {
        alert(`Settlement Successful!\nPayment ID: ${response.razorpay_payment_id}\nRitual: ${pujaName}\nCommission Paid: ₹${calculatedCommission}`);
        setIsOpen(false);
        setSettlementLoading(false);
      },
      modal: {
        ondismiss: () => setSettlementLoading(false),
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + (response.error?.description || "Transaction cancelled"));
        setSettlementLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      alert("Gateway error: " + err.message);
      setSettlementLoading(false);
    }
  };

  // Devotee / User ka Puja Booking Token handler
  const handleTokenPayment = async (e: React.FormEvent) => {
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
      setTokenNotice({ type: "error", text: "Payment configuration is currently unavailable." });
      return;
    }

    setTokenProcessing(true);

    const sdkLoaded = await loadRazorpaySDK();
    if (!sdkLoaded) {
      setTokenProcessing(false);
      setTokenNotice({ type: "error", text: "Payment gateway failed to initialize. Please check internet connection." });
      return;
    }

    const finalRitualName =
      tokenData.selectedPuja === "Other Custom Ritual"
        ? tokenData.customPuja || "Custom Vedic Ritual"
        : tokenData.selectedPuja;

    const options = {
      key: razorpayKey,
      amount: Math.round(amountNum * 100),
      currency: "INR",
      name: "PurohitSetu Bengaluru",
      description: `Puja Booking Token - ${finalRitualName}`,
      image: "/pandit-logo.png",
      prefill: {
        name: tokenData.yajmanName,
        contact: tokenData.phone,
      },
      notes: {
        pandit_name: tokenData.preferredPandit || "General Acharya",
        puja_name: finalRitualName,
        service_type: "puja_advance_token",
      },
      theme: {
        color: "#ea580c",
      },
      handler: async (response: any) => {
        try {
          const paymentId = response?.razorpay_payment_id || "PAY_CONFIRMED";

          await supabase.from("token_transactions").insert({
            pandit_id: tokenData.preferredPandit || "general_booking",
            pandit_phone: tokenData.phone,
            pandit_name: tokenData.preferredPandit || "General Acharya",
            pack_name: `Booking Token: ${finalRitualName}`,
            amount: amountNum,
            tokens_credited: 0,
            razorpay_payment_id: paymentId,
          });

          triggerNewBookingNotification(finalRitualName, "Bengaluru (Token Booking)");

          setTokenNotice({
            type: "success",
            text: `Booking token of ₹${amountNum} received successfully! Reference ID: ${paymentId}`,
          });

          setTokenData({
            yajmanName: "",
            phone: "",
            preferredPandit: "",
            selectedPuja: "General Puja Booking Token",
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
        ondismiss: () => setTokenProcessing(false),
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
    <>
      {/* 1. SIRF PANDIT DASHBOARD PAR DIKHNE WALA BUTTON AUR MODAL */}
      {isPanditDashboard ? (
        <>
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-red-800 via-orange-600 to-amber-600 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm py-3 px-5 rounded-full shadow-2xl border-2 border-amber-300 flex items-center gap-2 transition active:scale-95"
            >
              <span>🚩</span>
              <span>Settle 30% Platform Fee</span>
            </button>
          </div>

          {isOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
              <div className="bg-slate-950 text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-500/40 max-h-[92vh] overflow-y-auto">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] bg-orange-950 text-orange-400 border border-orange-800/80 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Pandit Settlement Portal
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-amber-400 mt-1.5 tracking-tight">
                      30% Commission Settlement
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Confirm and settle platform commission after ritual completion
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center transition"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCommissionPay} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Pandit Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Acharya Prince Pandey"
                        value={panditName}
                        onChange={(e) => setPanditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Registered Mobile *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit number"
                        value={panditPhone}
                        onChange={(e) => setPanditPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Completed Puja Ritual *</label>
                    <select
                      value={pujaName}
                      onChange={(e) => setPujaName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="Griha Pravesh Puja">Griha Pravesh &amp; Vastu Shanti Puja</option>
                      <option value="Vedic Vivah Sanskar">Vedic Vivah Sanskar (Marriage)</option>
                      <option value="Satyanarayan Bhagwan Katha">Shri Satyanarayan Bhagwan Katha &amp; Puja</option>
                      <option value="Navchandi Mahayagya">Navchandi Mahayagya &amp; Hawan</option>
                      <option value="Rudrabhishek Hawan">Rudrabhishek Puja &amp; Hawan</option>
                      <option value="Mundan Sanskar">Mundan Sanskar (Chudakarana)</option>
                      <option value="Upanayana Janeu Sanskar">Upanayana / Janeu Sanskar</option>
                      <option value="Kaal Sarp Dosh Nivaran">Kaal Sarp Dosh Nivaran Hawan</option>
                      <option value="Mangal Dosh Shanti">Mangal Dosh Shanti &amp; Hawan</option>
                      <option value="Antyesti & Terahvin Shanti">Antyesti / Terahvin Shanti Hawan</option>
                      <option value="General Vedic Puja">General Vedic Puja / Other Ritual</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Completion Date *</label>
                      <input
                        type="date"
                        required
                        value={pujaDate}
                        onChange={(e) => setPujaDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Total Dakshina (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="2100"
                        value={totalDakshina}
                        onChange={(e) => setTotalDakshina(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-extrabold text-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-amber-500/30 p-3.5 rounded-2xl space-y-1.5 shadow-inner">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Total Dakshina Received:</span>
                      <span className="font-bold text-slate-200">₹{totalDakshina || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>PurohitSetu Platform Share:</span>
                      <span className="font-bold text-orange-400">30%</span>
                    </div>
                    <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center text-sm font-black">
                      <span className="text-amber-400">Payable Commission:</span>
                      <span className="text-lg text-emerald-400">₹{calculatedCommission}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={settlementLoading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-700 via-orange-600 to-amber-600 hover:brightness-110 text-white font-black text-sm shadow-xl transition active:scale-[0.99] disabled:opacity-50"
                  >
                    {settlementLoading ? "Opening Payment Gateway..." : `Pay ₹${calculatedCommission} Commission via UPI / Card`}
                  </button>

                  <p className="text-[10px] text-center text-slate-500">
                    🔒 Secured by Razorpay. Official Transaction ID recorded instantly.
                  </p>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        /* 2. PUBLIC WEBSITE (HOMEPAGE AUR SABHI /pandit/ LOCALITY PAGES) PAR PUJA TOKEN (₹) */
        <>
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:scale-105 active:scale-95 text-white font-black text-xs sm:text-sm py-3 px-5 rounded-full shadow-2xl border-2 border-amber-300 flex items-center gap-2 transition"
            >
              <span>🪙</span>
              <span>Puja Token (₹)</span>
            </button>
          </div>

          {isOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
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
                    onClick={() => {
                      setIsOpen(false);
                      setTokenNotice(null);
                    }}
                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center justify-center transition"
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

                <form onSubmit={handleTokenPayment} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Yajman Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={tokenData.yajmanName}
                      onChange={(e) => setTokenData({ ...tokenData, yajmanName: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      value={tokenData.phone}
                      onChange={(e) => setTokenData({ ...tokenData, phone: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-0.5">
                      <label className="font-bold text-slate-700">Preferred Acharya</label>
                      <span className="text-[9px] text-slate-500">Optional</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Acharya Prince Pandey"
                      value={tokenData.preferredPandit}
                      onChange={(e) => setTokenData({ ...tokenData, preferredPandit: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-stone-50 text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Puja Ritual / Service</label>
                    <select
                      value={tokenData.selectedPuja}
                      onChange={(e) => setTokenData({ ...tokenData, selectedPuja: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none"
                    >
                      <option value="General Puja Booking Token">General Puja Booking Token</option>
                      <option value="Griha Pravesh Puja">Griha Pravesh &amp; Vastu Shanti</option>
                      <option value="Satyanarayan Katha">Satyanarayan Katha</option>
                      <option value="Vivah Sanskar (Marriage)">Vivah Sanskar (Marriage)</option>
                      <option value="Navchandi Mahayagya">Navchandi Mahayagya</option>
                      <option value="Rudrabhishek Puja">Rudrabhishek Puja</option>
                      <option value="Mundan Sanskar">Mundan Sanskar</option>
                      <option value="Other Custom Ritual">Other Custom Ritual</option>
                    </select>
                  </div>

                  {tokenData.selectedPuja === "Other Custom Ritual" && (
                    <div>
                      <input
                        type="text"
                        placeholder="Specify custom ritual..."
                        value={tokenData.customPuja}
                        onChange={(e) => setTokenData({ ...tokenData, customPuja: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <span className="block font-bold text-slate-700 mb-1">Select Advance Token Amount (₹)</span>
                    <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                      {PRESET_TOKEN_AMOUNTS.map((amt) => (
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

                  <p className="text-[9px] text-center text-slate-500 font-medium">
                    🔒 Secured by Razorpay. Supports PhonePe, GPay, Paytm, Cards &amp; UPI.
                  </p>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function FloatingPaymentButton() {
  return (
    <Suspense fallback={null}>
      <FloatingPaymentContent />
    </Suspense>
  );
}