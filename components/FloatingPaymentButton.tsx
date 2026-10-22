"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function FloatingPaymentButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [panditName, setPanditName] = useState("");
  const [panditPhone, setPanditPhone] = useState("");
  const [amount, setAmount] = useState("300");
  const [loading, setLoading] = useState(false);

  // Sirf Pandit Dashboard ya Pandit Login pages par dikhega, Public Homepage par bilkul nahi dikhega
  const isPanditRoute = pathname?.startsWith("/pandit") || pathname?.startsWith("/dashboard");

  if (!isPanditRoute) {
    return null;
  }

  const handleCommissionPay = async (e: React.FormEvent) => {
    e.preventDefault();
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert("Payment key abhi live activate ho rahi hai. Kripya thoda intezaar karein.");
      return;
    }

    setLoading(true);

    const options = {
      key: razorpayKey,
      amount: Math.round(parseFloat(amount) * 100),
      currency: "INR",
      name: "PurohitSetu Admin Settlement",
      description: `30% Platform Fee - ${panditName || "Pandit Acharya"}`,
      image: "/pandit-logo.png",
      prefill: {
        name: panditName,
        contact: panditPhone,
      },
      notes: {
        role: "Pandit Commission Settlement",
        phone: panditPhone,
      },
      theme: {
        color: "#c2410c",
      },
      handler: function (response: any) {
        alert("Settlement Successful! Payment ID: " + response.razorpay_payment_id);
        setIsOpen(false);
        setLoading(false);
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert("Payment gateway open karne mein error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button sirf Pandit Routes par bottom-right corner me dikhega */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-red-700 via-orange-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs py-2.5 px-4 rounded-full shadow-2xl border-2 border-amber-300 flex items-center gap-2 transition active:scale-95"
        >
          <span>🚩</span>
          <span>Pay 30% Platform Fee</span>
        </button>
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Pandit Ji Commission Settlement</h3>
                <p className="text-[10px] text-stone-500">30% PurohitSetu Lead Sharing Fee</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCommissionPay} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-0.5">Aapka Naam (Pandit Ji) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acharya Prince Pandey"
                  value={panditName}
                  onChange={(e) => setPanditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-0.5">Registered Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={panditPhone}
                  onChange={(e) => setPanditPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-0.5">Commission Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-red-700 to-orange-600 text-white font-bold rounded-xl shadow transition"
              >
                {loading ? "Processing..." : `Pay ₹${amount} Settlement via UPI/Card`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}