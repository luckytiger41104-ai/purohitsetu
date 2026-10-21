import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { phone, otp, fullName, city, experience, bio, password, purpose } = await req.json();

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const cleanOtp = (otp || '').trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Invalid phone number format.' }, { status: 400 });
    }

    if (!cleanOtp || cleanOtp.length !== 4) {
      return NextResponse.json({ success: false, message: 'Verification code must be 4 digits.' }, { status: 400 });
    }

    // Check OTP record
    const { data: record, error: fetchErr } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (fetchErr || !record) {
      return NextResponse.json({ success: false, message: 'Verification code expired or not requested. Please try again.' }, { status: 400 });
    }

    if (new Date(record.expires_at).getTime() < Date.now()) {
      await supabase.from('phone_verifications').delete().eq('phone', cleanPhone);
      return NextResponse.json({ success: false, message: 'Verification code expired. Please request a new one.' }, { status: 400 });
    }

    if (record.otp !== cleanOtp) {
      return NextResponse.json({ success: false, message: 'Incorrect verification code. Please check your SMS.' }, { status: 401 });
    }

    // OTP delete after verification
    await supabase.from('phone_verifications').delete().eq('phone', cleanPhone);

    // Case 1: Forgot Password Reset
    if (purpose === 'reset') {
      const { error: resetErr } = await supabase
        .from('pandits')
        .update({ password: password.trim() })
        .eq('phone', cleanPhone);

      if (resetErr) {
        return NextResponse.json({ success: false, message: 'Failed to update password.' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Password updated successfully.', phone: cleanPhone });
    }

    // Case 2: New Registration (Save profile + password)
    if (fullName) {
      const { error: regErr } = await supabase
        .from('pandits')
        .upsert({
          phone: cleanPhone,
          full_name: fullName.trim(),
          city: city?.trim() || 'Bengaluru, Karnataka',
          experience: experience?.trim() || 'Vedic Scholar',
          bio: bio?.trim() || 'Dedicated Vedic Acharya performing authentic ceremonies with scriptural precision.',
          password: password?.trim() || '123456',
          wallet_balance: 0,
          earnings_balance: 0,
          strike_count: 0,
          is_blocked: false,
        }, { onConflict: 'phone' });

      if (regErr) {
        return NextResponse.json({ success: false, message: 'Failed to register account: ' + regErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account registered and verified successfully.',
      phone: cleanPhone,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Authentication failed.' }, { status: 500 });
  }
}