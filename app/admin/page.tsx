"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Booking {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  puja_name: string;
  language: string;
  area: string;
  pincode: string;
  address: string;
  date: string;
  time_slot: string;
  samagri: boolean;
  status: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              PurohitSetu Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live Pooja Bookings & Leads Management
            </p>
          </div>
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="mt-4 sm:mt-0 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh List"}
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 mb-6 rounded-xl bg-red-100 text-red-900 border border-red-300 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-4 px-4">Booked At (Time)</th>
                  <th className="py-4 px-4">Yajman Name</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-4">Puja Name</th>
                  <th className="py-4 px-4">Ritual Date & Slot</th>
                  <th className="py-4 px-4">Address</th>
                  <th className="py-4 px-4 text-center">Samagri</th>
                  <th className="py-4 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading && bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      Loading bookings...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      No bookings found yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 text-slate-500 text-xs">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {item.name || "-"}
                        </div>
                        <div className="text-[11px] text-amber-700 font-medium">
                          Lang: {item.language || "Hindi"}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {item.phone ? (
                          <a
                            href={`https://wa.me/91${item.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 hover:text-green-700 underline flex items-center gap-1"
                          >
                            <span>💬 {item.phone}</span>
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">
                          {item.puja_name || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-700">
                        <div className="font-bold text-xs">{item.date || "-"}</div>
                        <div className="text-[11px] text-slate-500">{item.time_slot || "-"}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-xs max-w-xs">
                        <div className="font-semibold text-slate-800">
                          {item.area ? `${item.area} (${item.pincode || ""})` : "-"}
                        </div>
                        <div className="truncate text-slate-500">{item.address || ""}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.samagri
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.samagri ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <select
                          value={item.status || "Pending"}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                            item.status === "Confirmed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : item.status === "Completed"
                              ? "bg-blue-50 text-blue-700 border-blue-300"
                              : item.status === "Cancelled"
                              ? "bg-red-50 text-red-700 border-red-300"
                              : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}