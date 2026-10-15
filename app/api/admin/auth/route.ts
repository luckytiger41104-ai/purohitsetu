import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { action, email, password, phone, otp, newPassword } = await req.json();

    // 1. Direct Email & Password Login
    if (action === 'login') {
      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (!admin) {
        return NextResponse.json(
          { error: 'Email ya Password galat hai.' },
          { status: 401 }
        );
      }

      const cookieStore = await cookies();
      cookieStore.set('admin_session', admin.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 din tak active session
      });

      return NextResponse.json({ success: true });
    }

    // 2. Forgot Password via OTP Verification
    if (action === 'reset_password') {
      const { data: otpRecord } = await supabase
        .from('phone_otps')
        .select('*')
        .eq('phone', phone)
        .eq('otp_code', otp)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (!otpRecord) {
        return NextResponse.json(
          { error: 'OTP galat hai ya expire ho chuka hai.' },
          { status: 400 }
        );
      }

      // Update password in admins table
      const { error } = await supabase
        .from('admins')
        .update({ password: newPassword })
        .eq('phone', phone);

      if (error) {
        return NextResponse.json(
          { error: 'Password update nahi ho paya.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Password successfully change ho gaya!',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}