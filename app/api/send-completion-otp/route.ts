import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, otp, yajmanName, pujaName } = await req.json();

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'FAST2SMS_API_KEY missing in environment variables' },
        { status: 500 }
      );
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid 10-digit phone number' },
        { status: 400 }
      );
    }

    // Fast2SMS Dedicated OTP Route (~₹0.20 per SMS)
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: String(otp),
        numbers: cleanPhone,
      }),
    });

    const result = await response.json();
    console.log('Fast2SMS Dedicated OTP Route Response:', result);

    if (result.return === true || result.status_code === 200) {
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json(
        { success: false, error: result.message || 'OTP dispatch failed via Fast2SMS' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Fast2SMS Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}