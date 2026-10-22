"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

export default function FloatingPaymentButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State in English
  const [panditName, setPanditName] = useState("");
  const [panditPhone, setPanditPhone] = useState("");
  const [pujaName, setPujaName] = useState("Griha Pravesh Puja");
  const [pujaDate, setPujaDate] = useState("");
  const [totalDakshina, setTotalDakshina] = useState("2100");
  const [loading, setLoading] = useState(false);

  // Auto-calculated 30% Platform Fee
  const calculatedCommission = Math.round((parseFloat(totalDakshina) || 0) * 0.3);

  // Only visible on Pandit dashboard or pandit routes
  const isPanditRoute = pathname?.startsWith("/pandit") || pathname?.startsWith("/dashboard");

  if (!isPanditRoute) {
    return null;
  }

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

    setLoading(true);

    const isLoaded = await loadRazorpaySDK();
    if (!isLoaded) {
      alert("Unable to load payment gateway. Please check your internet connection.");
      setLoading(false);
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
        setLoading(false);
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + (response.error?.description || "Transaction cancelled"));
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      alert("Gateway error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-red-800 via-orange-600 to-amber-600 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm py-3 px-5 rounded-full shadow-2xl border-2 border-amber-300 flex items-center gap-2 transition active:scale-95"
        >
          <span>🚩</span>
          <span>Settle 30% Platform Fee</span>
        </button>
      </div>

      {/* Dark Luxury Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-slate-950 text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-500/40 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
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
              
              {/* Pandit Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Pandit Name *
                  </label>
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
                  <label className="block text-slate-300 font-bold mb-1">
                    Registered Mobile Number *
                  </label>
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

              {/* Single Ritual Field (No Duplicate Boxes) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Completed Puja Ritual *
                </label>
                <select
                  value={pujaName}
                  onChange={(e) => setPujaName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="Griha Pravesh Puja">Griha Pravesh & Vastu Shanti Puja</option>
                  <option value="Vedic Vivah Sanskar">Vedic Vivah Sanskar (Marriage)</option>
                  <option value="Satyanarayan Bhagwan Katha">Shri Satyanarayan Bhagwan Katha & Puja</option>
                  <option value="Navchandi Mahayagya">Navchandi Mahayagya & Hawan</option>
                  <option value="Rudrabhishek Hawan">Rudrabhishek Puja & Hawan</option>
                  <option value="Mundan Sanskar">Mundan Sanskar (Chudakarana)</option>
                  <option value="Upanayana Janeu Sanskar">Upanayana / Janeu Sanskar</option>
                  <option value="Kaal Sarp Dosh Nivaran">Kaal Sarp Dosh Nivaran Hawan</option>
                  <option value="Mangal Dosh Shanti">Mangal Dosh Shanti & Hawan</option>
                  <option value="Antyesti & Terahvin Shanti">Antyesti / Terahvin Shanti Hawan</option>
                  <option value="General Vedic Puja">General Vedic Puja / Other Ritual</option>
                </select>
              </div>

              {/* Date & Dakshina Received */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Puja Completion Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={pujaDate}
                    onChange={(e) => setPujaDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Total Dakshina Received (₹) *
                  </label>
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

              {/* Commission Breakdown Card */}
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
                  <span className="text-amber-400">Payable Commission Amount:</span>
                  <span className="text-lg text-emerald-400">₹{calculatedCommission}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-700 via-orange-600 to-amber-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-orange-950/40 transition active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? "Opening Payment Gateway..." : `Pay ₹${calculatedCommission} Commission via UPI / Card`}
              </button>

              <p className="text-[10px] text-center text-slate-500">
                🔒 Secured by Razorpay. Official Transaction ID will be recorded instantly.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}