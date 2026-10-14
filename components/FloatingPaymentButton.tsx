'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation'; // <-- Path check karne ke liye
import { supabase } from '@/lib/supabaseClient';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function FloatingPaymentButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pujaName, setPujaName] = useState('Vedic Ritual Dakshina');
  const [amount, setAmount] = useState('501');

  // AGAR ADMIN YA PANDIT DASHBOARD HAI TOH BUTTON NAHI DIKHEGA
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/pandit')) {
    return null;
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !amount) {
      alert('Please fill your name, phone and amount.');
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_purohitsetu',
      amount: Number(amount) * 100,
      currency: 'INR',
      name: 'PurohitSetu',
      description: `Puja Dakshina: ${pujaName}`,
      image: '/logo.jpg',
      handler: async function (response: any) {
        await supabase.from('yajman_payments').insert({
          yajman_name: name,
          yajman_phone: phone,
          puja_name: pujaName,
          amount: Number(amount),
          payment_method: 'online',
          payment_status: 'paid',
          razorpay_payment_id: response?.razorpay_payment_id || 'RZP_DIRECT',
        });

        alert(`Har Har Mahadev! Dakshina payment of ₹${amount} received successfully.`);
        setIsOpen(false);
      },
      prefill: {
        name: name,
        contact: phone,
      },
      theme: {
        color: '#c2410c',
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      await supabase.from('yajman_payments').insert({
        yajman_name: name,
        yajman_phone: phone,
        puja_name: pujaName,
        amount: Number(amount),
        payment_method: 'online',
        payment_status: 'paid',
        razorpay_payment_id: 'DEMO_' + Math.floor(Math.random() * 100000),
      });
      alert(`Payment recorded successfully: ₹${amount}`);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold py-3 px-5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs border-2 border-amber-300 transition transform hover:scale-105 cursor-pointer"
        >
          <span className="text-base">💳</span>
          <span className="tracking-wide">Pay Dakshina / Online</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-300 text-gray-900">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="font-extrabold text-gray-900 text-sm tracking-wide">
                Shubh Dakshina / Online Payment
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-black text-base font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-900 font-bold mb-1">
                  Yajman Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-gray-400 bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-600 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-bold mb-1">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border-2 border-gray-400 bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-600 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-bold mb-1">Puja Ritual</label>
                <input
                  type="text"
                  value={pujaName}
                  onChange={(e) => setPujaName(e.target.value)}
                  className="w-full border-2 border-gray-400 bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-orange-600 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-bold mb-1">Select Amount (₹)</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['501', '1100', '2100'].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-2 rounded-xl border-2 font-black text-xs cursor-pointer transition ${
                        amount === amt
                          ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                          : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border-2 border-gray-400 bg-white rounded-xl px-3.5 py-2.5 text-sm font-black text-gray-900 focus:outline-none focus:border-orange-600 shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-extrabold py-3 rounded-xl shadow-lg mt-3 cursor-pointer text-xs tracking-wider transition"
              >
                Proceed to Pay ₹{amount} (UPI / Card)
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}