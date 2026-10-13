'use client';

import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';

const ALL_PUJAS = [
  'Navratri Puja',
  'Durga Puja',
  'Das Mahavidya Puja',
  'Pitrupaksha Shradh Puja',
  'Asthi Visarjan Puja',
  'Varshik Shradh Puja',
  'Tripindi Shradh Puja',
  'Pind Daan Puja',
  'Brahmin Bhojan',
  'Griha Pravesh Puja',
  'Mahamrityunjaya Jaap Puja',
  'Namkaran Sanskar Puja',
  'Satyanarayan Katha Puja',
  'Akshaya Tritiya Puja',
  'Annaprashan Sanskar Puja',
  'Ganesh Chaturthi Puja',
  'Ganesh Visarjan Puja',
  'Kaal Sarp Dosh Nivaran Puja',
  'Marriage (Vivah) Puja',
  'Marriage Anniversary Puja',
  'Navagraha Shanti Puja',
  'Office / Shop Opening Puja',
  'Godh Bharai (Simantonnayana) Puja',
  'Mangal Dosh Nivaran Puja',
  'Rahu Ketu Shanti Puja',
  'Rin Mukti Puja',
  'Rudra Abhishek Puja',
  'Vastu Shanti Puja',
  'Dhanteras Puja',
  'Diwali Lakshmi Puja',
  'Pitru Dosh Nivaran Puja',
  'Shani Shanti Puja',
  'Shuddhikaran Puja',
  'Vishwakarma Puja',
  'Karnavedha Sanskar',
  'Yajnopavita (Janeu) Sanskar',
  'Mundan Sanskar Puja',
  'Ekadashi Udyapan Puja',
  'Gauri Ganesh Hawan',
  'Narayan Bali Puja',
  'Terahvi / Shradh Sanskar Puja',
  'Vehicle (Vahan) Puja',
  'Vyapar Vriddhi Puja',
  'Other Puja',
];

const ALL_LANGUAGES = [
  { code: 'hi', label: 'Hindi (हिंदी)', isAvailable: true },
  { code: 'mai', label: 'Maithili (मैथिली)', isAvailable: true },
  { code: 'mr', label: 'Marathi (मराठी)', isAvailable: true },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)', isAvailable: true },
  { code: 'ta', label: 'Tamil (தமிழ்)', isAvailable: true },
  { code: 'te', label: 'Telugu (తెలుగు)', isAvailable: true },
  { code: 'en', label: 'English', isAvailable: true },
  { code: 'bho', label: 'Bhojpuri (भोजपुरी)', isAvailable: true },
  { code: 'mag', label: 'Magahi (मगही)', isAvailable: false },
  { code: 'bn', label: 'Bengali (বাংলা)', isAvailable: true },
];

export default function BookingPage() {
  const [formData, setFormData] = useState({
    yajmanName: '',
    phone: '',
    pujaName: 'Griha Pravesh Puja',
    customPujaName: '',
    languageCode: 'hi',
    area: '',
    pincode: '',
    houseAddress: '',
    pujaDate: '',
    timeSlot: 'Morning (08:00 AM - 11:00 AM)',
    needSamagriArrangement: true,
  });

  const [pujaSearch, setPujaSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredPujas = useMemo(() => {
    return ALL_PUJAS.filter((name) =>
      name.toLowerCase().includes(pujaSearch.toLowerCase())
    );
  }, [pujaSearch]);

  const selectedLanguage =
    ALL_LANGUAGES.find((l) => l.code === formData.languageCode) || ALL_LANGUAGES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Bengaluru Pincode Strict Validation (560xxx)
    if (!formData.pincode.startsWith('560') || formData.pincode.length !== 6) {
      setMessage({
        type: 'error',
        text: 'Services are currently limited to Bengaluru region (Pincode must start with 560xxx).',
      });
      setLoading(false);
      return;
    }

    const finalPujaName =
      formData.pujaName === 'Other Puja'
        ? formData.customPujaName.trim() || 'Custom Puja'
        : formData.pujaName;

    try {
      const { error } = await supabase.from('bookings').insert([
        {
          puja_id: finalPujaName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          puja_name: finalPujaName,
          yajman_name: formData.yajmanName,
          yajman_phone: formData.phone,
          language_code: formData.languageCode,
          city: 'Bengaluru',
          pincode: formData.pincode,
          area: formData.area,
          house_address: formData.houseAddress,
          puja_date: formData.pujaDate,
          time_slot: formData.timeSlot,
          with_samagri: formData.needSamagriArrangement,
          total_price: null, // Finalized directly on discussion with Pandit ji
          token_charge: 0,
          status: 'OPEN',
        },
      ]);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Booking request placed successfully! Verified Purohits are reviewing your request and will contact you shortly.',
      });

      setFormData({
        yajmanName: '',
        phone: '',
        pujaName: 'Griha Pravesh Puja',
        customPujaName: '',
        languageCode: 'hi',
        area: '',
        pincode: '',
        houseAddress: '',
        pujaDate: '',
        timeSlot: 'Morning (08:00 AM - 11:00 AM)',
        needSamagriArrangement: true,
      });
      setPujaSearch('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Unable to place booking request at this moment.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-700">PurohitSetu</h1>
          <p className="text-slate-600 mt-1">Book Verified Priests in Bengaluru</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Yajman Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.yajmanName}
              onChange={(e) => setFormData({ ...formData, yajmanName: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
            />
          </div>

          {/* Searchable Puja Dropdown */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Select Puja (Searchable)
            </label>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2 border rounded-lg bg-white cursor-pointer flex justify-between items-center text-slate-800"
            >
              <span>{formData.pujaName}</span>
              <span className="text-xs text-slate-400">▼</span>
            </div>

            {isDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto p-2">
                <input
                  type="text"
                  placeholder="Type to search puja..."
                  value={pujaSearch}
                  onChange={(e) => setPujaSearch(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded mb-2 text-sm outline-none focus:border-amber-500"
                  autoFocus
                />
                <div className="space-y-1">
                  {filteredPujas.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, pujaName: name });
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-amber-50 text-slate-700 transition"
                    >
                      {name}
                    </button>
                  ))}
                  {filteredPujas.length === 0 && (
                    <p className="text-xs text-slate-400 px-3 py-2">No matching puja found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Manual input for 'Other Puja' */}
          {formData.pujaName === 'Other Puja' && (
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Enter Puja Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Satyanarayan Puja, Special Hawan"
                value={formData.customPujaName}
                onChange={(e) => setFormData({ ...formData, customPujaName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 bg-white"
              />
            </div>
          )}

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Preferred Language for Ritual
            </label>
            <select
              value={formData.languageCode}
              onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
            >
              {ALL_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label} {lang.isAvailable ? '' : '— [Currently unavailable: On request]'}
                </option>
              ))}
            </select>
            {!selectedLanguage.isAvailable && (
              <p className="text-xs text-amber-700 mt-1 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                Notice: Dedicated verified Pandits for {selectedLanguage.label} are currently being onboarded in your area. We will assign a senior bilingual Purohit on priority.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Bengaluru Area</label>
              <input
                type="text"
                required
                placeholder="e.g. HSR Layout, Whitefield"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode (560xxx)</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="560102"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Complete Address</label>
            <textarea
              required
              rows={2}
              placeholder="Flat no, apartment name, street & landmark"
              value={formData.houseAddress}
              onChange={(e) => setFormData({ ...formData, houseAddress: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Puja Date</label>
              <input
                type="date"
                required
                value={formData.pujaDate}
                onChange={(e) => setFormData({ ...formData, pujaDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Time Slot</label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
              >
                <option value="Early Morning (06:00 AM - 08:00 AM)">Early Morning (06:00 AM - 08:00 AM)</option>
                <option value="Morning (08:00 AM - 11:00 AM)">Morning (08:00 AM - 11:00 AM)</option>
                <option value="Afternoon (11:30 AM - 02:30 PM)">Afternoon (11:30 AM - 02:30 PM)</option>
                <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Samagri Arrangement Notice */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="samagri"
                checked={formData.needSamagriArrangement}
                onChange={(e) =>
                  setFormData({ ...formData, needSamagriArrangement: e.target.checked })
                }
                className="h-4 w-4 text-amber-600 rounded cursor-pointer"
              />
              <label htmlFor="samagri" className="text-sm font-medium text-slate-800 cursor-pointer">
                Arrange complete Puja Samagri kit through Purohit
              </label>
            </div>
            <p className="text-xs text-amber-800 mt-2 font-normal">
              💡 <strong>Note:</strong> Samagri checklist and requirements will be discussed and finalized directly over phone with the Pandit ji based on ritual traditions.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition disabled:opacity-50"
          >
            {loading ? 'Submitting Request...' : 'Confirm & Request Pandit Callback'}
          </button>
        </form>
      </div>
    </main>
  );
}