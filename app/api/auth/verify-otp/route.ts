import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { phone, otp, password, purpose } = await req.json();

    const { data: otpRecord } = await supabase
      .from('phone_otps')
      .select('*')
      .eq('phone', phone)
      .single();

    if (!otpRecord || otpRecord.otp_code !== otp) {
      return NextResponse.json({ error: 'Incorrect OTP entered.' }, { status: 400 });
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP expired. Please request a new OTP.' }, { status: 400 });
    }

    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (purpose === 'register') {
      const { data: updatedPandit, error } = await supabase
        .from('pandits')
        .upsert(
          {
            phone: phone,
            password_hash: password,
            active_session_token: sessionToken,
            full_name: 'Acharya Prince Pandey',
            wallet_balance: 0,
          },
          { onConflict: 'phone' }
        )
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await supabase.from('phone_otps').delete().eq('phone', phone);
      return NextResponse.json({ success: true, session_token: sessionToken, pandit: updatedPandit });
    }

    if (purpose === 'forgot') {
      const { data: updatedPandit, error } = await supabase
        .from('pandits')
        .update({
          password_hash: password,
          active_session_token: sessionToken,
        })
        .eq('phone', phone)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await supabase.from('phone_otps').delete().eq('phone', phone);
      return NextResponse.json({ success: true, session_token: sessionToken, pandit: updatedPandit });
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}