import Link from 'next/link';
import Image from 'next/image';

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#fffaf5] flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-8 md:p-10 rounded-3xl shadow-xl border border-orange-100 text-center relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full shadow-md p-1 bg-white border-2 border-orange-200">
            <Image
              src="/logo.png"
              alt="PurohitSetu"
              width={128}
              height={128}
              priority
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          Booking Confirmed!
        </h1>

        {/* Subtext in English */}
        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
          Thank you for choosing <span className="font-semibold text-orange-600">PurohitSetu</span>. 
          Your Vedic puja request has been received. Our verified Acharya will contact you shortly with all ritual details.
        </p>

        {/* Highlight Card */}
        <div className="bg-orange-50/70 border border-orange-200/60 rounded-2xl p-4 mb-8 text-xs md:text-sm text-gray-700 space-y-1">
          <p className="font-semibold text-orange-950">What happens next?</p>
          <p className="text-gray-600">
            You will receive a call or WhatsApp message for muhurat timing, samagri setup, and puja preparation.
          </p>
        </div>

        {/* Action Button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full py-3.5 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}