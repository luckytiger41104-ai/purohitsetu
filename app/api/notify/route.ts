import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { pujaName, locality } = await req.json();

    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;
    const appId = 'dcdfe5c2-7b44-42a9-a049-ac65061449be';

    if (!restApiKey) {
      return NextResponse.json(
        { success: false, error: 'ONESIGNAL_REST_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Basic ${restApiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        filters: [{ field: 'tag', key: 'user_role', relation: '=', value: 'acharya' }],
        headings: { en: '🚩 Nayi Puja Booking Aayi Hai!' },
        contents: {
          en: `${pujaName || 'Vedic Ceremony'} booking in ${locality || 'Bengaluru'}. Abhi dashboard khol kar claim karein!`,
        },
        url: 'https://www.purohitsetu.in/pandit/dashboard',
      }),
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch notification' },
      { status: 500 }
    );
  }
}