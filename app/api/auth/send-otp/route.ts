import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { phone, purpose } = await req.json();

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    // Check existing registration
    const { data: existingPandit } = await supabase
      .from('pandits')
      .select('id, full_name')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (purpose === 'register' && existingPandit) {
      return NextResponse.json({
        success: false,
        message: 'This mobile number is already registered. Please sign in instead.'
      }, { status: 409 });
    }

    if (purpose === 'login' && !existingPandit) {
      return NextResponse.json({
        success: false,
        message: 'Mobile number not found. Please register your Acharya account first.'
      }, { status: 404 });
    }

    // 4-digit numeric OTP generate
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes validity

    // Supabase phone_verifications table me store
    const { error: dbError } = await supabase
      .from('phone_verifications')
      .upsert({
        phone: cleanPhone,
        otp: generatedOtp,
        expires_at: expiresAt,
      }, { onConflict: 'phone' });

    if (dbError) {
      return NextResponse.json({ success: false, message: 'Failed to initiate OTP verification.' }, { status: 500 });
    }

    // Fast2SMS API Call via Quick Route (Does not require website approval)
    const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
    if (!fast2smsApiKey) {
      return NextResponse.json({ success: false, message: 'SMS Gateway service key not configured.' }, { status: 500 });
    }

    const fast2smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': fast2smsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: `Your PurohitSetu verification code is ${generatedOtp}. Valid for 5 minutes.`,
        language: 'english',
        flash: 0,
        numbers: cleanPhone,
      }),
    });

    const smsResult = await fast2smsRes.json();

    if (!smsResult.return) {
      return NextResponse.json({
        success: false,
        message: smsResult.message || 'Unable to send SMS code right now.'
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully via SMS.'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal server error.' }, { status: 500 });
  }
}