import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { phone, purpose } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { error: 'Valid 10-digit mobile number required' },
        { status: 400 }
      );
    }

    // Pandit checks
    if (purpose === 'register' || purpose === 'forgot') {
      const { data: existingPandit } = await supabase
        .from('pandits')
        .select('id, password_hash')
        .eq('phone', phone)
        .single();

      if (purpose === 'register' && existingPandit?.password_hash) {
        return NextResponse.json(
          { error: 'This number is already registered. Please login using your password.' },
          { status: 400 }
        );
      }

      if (purpose === 'forgot' && (!existingPandit || !existingPandit.password_hash)) {
        return NextResponse.json(
          { error: 'This number is not registered yet. Please register first.' },
          { status: 400 }
        );
      }
    }

    // Admin check
    if (purpose === 'admin_forgot') {
      const { data: adminUser } = await supabase
        .from('admins')
        .select('id')
        .eq('phone', phone)
        .single();

      if (!adminUser) {
        return NextResponse.json(
          { error: 'Yeh number kisi admin account se link nahi hai.' },
          { status: 404 }
        );
      }
    }

    // Generate 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await supabase.from('phone_otps').upsert({
      phone: phone,
      otp_code: generatedOtp,
      expires_at: expiresAt,
    });

    console.log(`\n================================`);
    console.log(`>>> OTP FOR ${phone}: [ ${generatedOtp} ] <<<`);
    console.log(`================================\n`);

    const apiKey = (process.env.FAST2SMS_API_KEY || '').trim();

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: `Your PurohitSetu OTP is ${generatedOtp}. Valid for 5 minutes.`,
        language: 'english',
        numbers: phone,
      }),
    });

    const smsData = await response.json();
    console.log('Fast2SMS response:', smsData);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully!',
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error while sending OTP' },
      { status: 500 }
    );
  }
}