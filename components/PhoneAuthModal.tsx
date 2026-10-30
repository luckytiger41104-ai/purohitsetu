"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: ConfirmationResult;
  }
}

export default function PhoneAuthModal({ onVerified }: { onVerified?: (phoneNumber: string) => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.recaptchaVerifier && typeof window !== "undefined") {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  // 1. Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      if (cleanPhone.length !== 10) {
        throw new Error("Kripya 10 digit ka valid mobile number dalein");
      }

      const formattedNumber = `+91${cleanPhone}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      
      window.confirmationResult = confirmation;
      setStep("otp");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "OTP bhejne me dikkat aayi. Kripya punah prayas karein.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).grecaptcha?.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      
      if (onVerified && user.phoneNumber) {
        onVerified(user.phoneNumber);
      } else {
        alert("Verification successful!");
      }
    } catch (err: any) {
      console.error(err);
      setError("Galat OTP ya code expire ho chuka hai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-sm mx-auto text-gray-800">
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      <h2 className="text-xl font-bold mb-4 text-center">
        {step === "phone" ? "Mobile Verification" : "Enter OTP"}
      </h2>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md text-sm">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-r-md focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phone.replace(/\D/g, "").length < 10}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 transition"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Enter 6-digit OTP</label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md tracking-widest text-center text-lg font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-sm text-gray-500 hover:underline text-center block"
          >
            Change Number
          </button>
        </form>
      )}

      {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
    </div>
  );
}