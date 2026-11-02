import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { phone, purpose } = await req.json();

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // --- 1. ADMIN PANEL SECURITY (Max 2 OTPs per 24 Hours) ---
    if (purpose === 'admin_login' || purpose === 'admin_reset') {
      const authorizedAdminPhone = (process.env.ADMIN_AUTHORIZED_PHONE || '').replace(/\D/g, '').slice(-10);

      if (authorizedAdminPhone && cleanPhone !== authorizedAdminPhone) {
        return NextResponse.json(
          { success: false, message: 'Security Alert: This phone number is not authorized as an administrator.' },
          { status: 403 }
        );
      }

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: adminAttempts } = await supabase
        .from('otp_request_logs')
        .select('*', { count: 'exact', head: true })
        .eq('phone', cleanPhone)
        .in('purpose', ['admin_login', 'admin_reset'])
        .gte('created_at', oneDayAgo);

      if ((adminAttempts || 0) >= 2) {
        return NextResponse.json(
          { success: false, message: 'Admin Security Limit: Maximum 2 OTP requests allowed per 24 hours.' },
          { status: 429 }
        );
      }
    }

    // --- 2. PANDIT REGISTRATION (Max 5 OTPs per Hour) ---
    if (purpose === 'register') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: registerAttempts } = await supabase
        .from('otp_request_logs')
        .select('*', { count: 'exact', head: true })
        .eq('phone', cleanPhone)
        .eq('purpose', 'register')
        .gte('created_at', oneHourAgo);

      if ((registerAttempts || 0) >= 5) {
        return NextResponse.json(
          { success: false, message: 'Hourly Limit Exceeded: Maximum 5 OTP requests allowed per hour. Please try again later.' },
          { status: 429 }
        );
      }

      // Check if already registered
      const { data: existingPandit } = await supabase
        .from('pandits')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (existingPandit) {
        return NextResponse.json(
          { success: false, message: 'This mobile number is already registered. Please sign in instead.' },
          { status: 409 }
        );
      }
    }

    // --- 3. POOJA COMPLETION (Max 3 OTPs per 24 Hours for Yajman) ---
    if (purpose === 'pooja_complete') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: poojaAttempts } = await supabase
        .from('otp_request_logs')
        .select('*', { count: 'exact', head: true })
        .eq('phone', cleanPhone)
        .eq('purpose', 'pooja_complete')
        .gte('created_at', oneDayAgo);

      if ((poojaAttempts || 0) >= 3) {
        return NextResponse.json(
          { success: false, message: 'Daily verification code limit (3 attempts) reached for this devotee number.' },
          { status: 429 }
        );
      }
    }

    // --- 4. 60-SECOND COOLDOWN (Anti-Spam Protection) ---
    const { data: recentOtp } = await supabase
      .from('phone_verifications')
      .select('expires_at')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (recentOtp) {
      const expiresAt = new Date(recentOtp.expires_at).getTime();
      const createdAt = expiresAt - 5 * 60 * 1000;
      const elapsedSeconds = (Date.now() - createdAt) / 1000;

      if (elapsedSeconds < 60) {
        const remaining = Math.ceil(60 - elapsedSeconds);
        return NextResponse.json(
          { success: false, message: `Please wait ${remaining} second${remaining > 1 ? 's' : ''} before requesting another OTP.` },
          { status: 429 }
        );
      }
    }

    // Generate 4-digit verification code
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: dbError } = await supabase
      .from('phone_verifications')
      .upsert(
        {
          phone: cleanPhone,
          otp: generatedOtp,
          expires_at: expiresAt,
        },
        { onConflict: 'phone' }
      );

    if (dbError) {
      return NextResponse.json(
        { success: false, message: 'Failed to initialize verification session. Please retry.' },
        { status: 500 }
      );
    }

    // Log attempt for rate-limiting
    await supabase.from('otp_request_logs').insert({
      phone: cleanPhone,
      purpose: purpose || 'general',
    });

    // --- 5. FIREBASE IDENTITY TOOLKIT SMS DISPATCH ---
    const firebaseApiKey =
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      'AIzaSyCb0nldwpe3JhnwWQL_j59bpu_VXE1A15k';
    const fullPhone = `+91${cleanPhone}`;

    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: fullPhone,
        }),
      }
    );

    const firebaseData = await firebaseRes.json();

    if (firebaseData.error) {
      return NextResponse.json(
        {
          success: false,
          message: firebaseData.error.message || 'SMS delivery failed. Please retry later.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code successfully sent via SMS.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}