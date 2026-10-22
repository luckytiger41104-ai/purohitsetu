import React from "react";
import Link from "next/link";

export default function PanditPartnerTerms() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-5 mb-6">
          <span className="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider">
            PurohitSetu Acharya Onboarding & Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            Acharya Partner Terms & Privacy Disclosure
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Partner verification rules, direct bank payout guarantee, and operational terms for Purohits in Bengaluru
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300">
          
          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              1. Information Collected from Acharya Partners
            </h2>
            <p className="mb-2">
              PurohitSetu verified aur authentic Vedic services pradan karne ke liye onboarding ke dauran Acharya partners se nimnlikhit zaroori details collect karta hai:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Contact & Authentication:</strong> Full Legal Name, Primary Mobile Number, aur Secure OTP Authentication taaki account access surakshit rahe.</li>
              <li><strong>Vedic Education & Lineage:</strong> Gurukul education details, Vedic Pathshala certifications, ya Acharya/Shastri credentials.</li>
              <li><strong>Years of Ritual Experience:</strong> Sanatan sanskaro aur shastric karmkand conduct karne ka kul anubhav (years of practical experience).</li>
              <li><strong>Ritual Specializations:</strong> Vishesh yagya evam anushthan jaise Griha Pravesh, Vedic Vivah, Navchandi Mahayagya, Rudrabhishek, Dosh Shanti, evam Antyesti/Garuda Purana vidhi.</li>
              <li><strong>Linguistic Competence:</strong> Yajman communication hetu bhashayi kshamta (Hindi, Maithili, Bhojpuri, Sanskrit, Kannada, Telugu).</li>
              <li><strong>Service Coverage Zones:</strong> Bengaluru ke operational areas aur travel convenience (e.g., Whitefield, HSR Layout, Koramangala, etc.).</li>
            </ul>
          </section>

          {/* Naya Direct Payment & Payout Guarantee Section */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-amber-400/30">
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              2. 100% Secure Payment & 24 Hours Payout Guarantee
            </h2>
            <p className="mb-2">
              Agar koi Yajman platform ke madhyam se direct online puja booking advance ya service amount PurohitSetu ko pay karta hai:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-200">
              <li><strong>24-Hour Settlement:</strong> Puja anushthan safalta-poorvak sampann hone ke baad Pandit Ji ka nirdharit shulk (fees) <strong>24 ghante ke andar</strong> unke registered bank khate ya UPI ID me credit kar diya jayega.</li>
              <li><strong>100% Payment Security:</strong> Saari digital transactions RBI-approved secure payment gateway dwara process hoti hain. Acharya ki mehnat ka paisa poori tarah surakshit (100% secure) rehta hai aur payment delay nahi hota.</li>
              <li><strong>Transparent Deductions:</strong> Platform sirf apni pre-agreed facilitation fee retain karta hai, baaki poora hisaab bina kisi chhupe hue charge ke Pandit Ji ko transfer hota hai.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              3. Data Protection & Partner Privacy
            </h2>
            <p>
              Pandit Ji ka mobile number, qualification, aur experience data sirf booking confirmation aur Yajman coordination ke liye use hota hai. PurohitSetu kisi bhi teesre party marketing network ya unauthorized ad companies ke saath Pandit Ji ki private details share ya sell nahi karta hai.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              4. Offline Cash Collection & Platform Facilitation Fee (30% Settlement)
            </h2>
            <p>
              Yadi Yajman puja sthal par seedhe Pandit Ji ko cash/offline dakshina deta hai, toh Acharya platform ki technical coordination seva ke roop me nirdharit 30% facilitation fee dashboard ke "Settle Platform Fee" option se 24 ghante ke bheetar remit karne hetu sehmat hain.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              5. Code of Conduct & Ritual Sanctity
            </h2>
            <p>
              Acharya nirdharit shubh muhurat par swachh Vedic vastra dharan karke evam shuddh shastric samagri ke sath sthal par pahuchein. Bina poorv soochana ke booking cancel karna ya anuchit atirikt shulk maangna account suspension ka kaaran ban sakta hai.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-amber-400 mb-1.5">
              6. Account Closure & Data Deletion
            </h2>
            <p>
              Pandit Ji kisi bhi samay apna partner profile deactivate ya remove karwa sakte hain. Request bhejne ke liye hamare Acharya support desk par email karein: <strong className="text-amber-300">support.purohitsetu@gmail.com</strong>.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <Link href="/pandit/dashboard" className="text-amber-400 font-bold hover:underline">
            ← Back to Acharya Dashboard
          </Link>
          <p>© 2026 PurohitSetu Acharya Network</p>
        </div>

      </div>
    </div>
  );
}