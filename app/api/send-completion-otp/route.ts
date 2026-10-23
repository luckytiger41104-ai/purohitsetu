import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, otp, yajmanName, pujaName } = await req.json();

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'FAST2SMS_API_KEY is not defined in environment.' },
        { status: 500 }
      );
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // Fast2SMS Quick OTP Route via process.env
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: String(otp),
        numbers: cleanPhone,
      }),
    });

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dispatch SMS.' },
      { status: 500 }
    );
  }
}