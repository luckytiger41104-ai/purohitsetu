import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pujaName, locality } = await req.json();

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: "dcdfe5c2-7b44-42a9-a049-ac65061449be",
        filters: [{ field: "tag", key: "user_role", relation: "=", value: "acharya" }],
        headings: { en: "🚩 Nayi Puja Booking Aayi Hai!" },
        contents: { 
          en: `${pujaName || "Vedic Puja"} booking in ${locality || "Bengaluru"}. Turant dashboard khol kar claim karein!` 
        },
        url: "https://www.purohitsetu.in/pandit/dashboard",
      }),
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}