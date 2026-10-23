import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, otp, yajmanName, pujaName } = await req.json();

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'FAST2SMS_API_KEY missing in environment variables.' },
        { status: 500 }
      );
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // 1. First Attempt: Using Fast2SMS Quick SMS Route ('q') which bypasses the OTP domain lock
    const quickMessage = `Pranam ${yajmanName || 'Yajman'}, your PurohitSetu verification code for ${pujaName || 'Puja'} is ${otp}. Please share this code with Pandit Ji only after ritual completion.`;

    let response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: quickMessage,
        numbers: cleanPhone,
        flash: 0,
      }),
    });

    let result = await response.json();
    console.log('Fast2SMS Quick Route Response:', result);

    // 2. If 'q' route requires DLT or fails, try the fallback OTP route with variables_values
    if (!result.return && result.status_code !== 200) {
      response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
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
      result = await response.json();
      console.log('Fast2SMS OTP Route Response:', result);
    }

    if (result.return === true || result.status_code === 200) {
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json(
        { success: false, error: result.message || 'SMS delivery failed from provider' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Fast2SMS Dispatch Exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error while dispatching SMS.' },
      { status: 500 }
    );
  }
}