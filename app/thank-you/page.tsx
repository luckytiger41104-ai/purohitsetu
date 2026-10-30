import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg border-t-4 border-orange-600 text-center">
        <div className="text-5xl mb-3">🕉️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Booking Request Received!
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Aapki pooja ki booking prapt ho gayi hai. Hamare verified Acharya jald hi aapse sampark karenge.
        </p>
        <Link
          href="/"
          className="inline-block w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}