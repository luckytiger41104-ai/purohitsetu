import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { phone, otp, fullName, city, experience, bio } = await req.json();

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const cleanOtp = (otp || '').trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Invalid phone number format.' }, { status: 400 });
    }

    if (!cleanOtp || cleanOtp.length !== 4) {
      return NextResponse.json({ success: false, message: 'Verification code must be 4 digits.' }, { status: 400 });
    }

    // Supabase se OTP match check
    const { data: record, error: fetchErr } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (fetchErr || !record) {
      return NextResponse.json({ success: false, message: 'Verification code expired or not requested. Please request a new code.' }, { status: 400 });
    }

    // Expiry check
    if (new Date(record.expires_at).getTime() < Date.now()) {
      await supabase.from('phone_verifications').delete().eq('phone', cleanPhone);
      return NextResponse.json({ success: false, message: 'Verification code expired. Please request a new one.' }, { status: 400 });
    }

    // Strict OTP compare (No bypass)
    if (record.otp !== cleanOtp) {
      return NextResponse.json({ success: false, message: 'Incorrect verification code. Please check your SMS and try again.' }, { status: 401 });
    }

    // OTP delete after success
    await supabase.from('phone_verifications').delete().eq('phone', cleanPhone);

    // Naya registration data save
    if (fullName) {
      await supabase
        .from('pandits')
        .upsert({
          phone: cleanPhone,
          full_name: fullName.trim(),
          city: city?.trim() || 'Bengaluru, Karnataka',
          experience: experience?.trim() || 'Vedic Scholar',
          bio: bio?.trim() || 'Dedicated Vedic Acharya performing authentic ceremonies with scriptural precision.',
          wallet_balance: 0,
          earnings_balance: 0,
          strike_count: 0,
          is_blocked: false,
        }, { onConflict: 'phone' });
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      phone: cleanPhone,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Authentication failed.' }, { status: 500 });
  }
}