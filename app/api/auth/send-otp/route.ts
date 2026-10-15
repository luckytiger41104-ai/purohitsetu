import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { action, email, password, phone, otp, newPassword } = await req.json();

    // 1. Direct Email & Password Login
    if (action === 'login') {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      const { data: admins, error: adminErr } = await supabase
        .from('admins')
        .select('*');

      if (adminErr || !admins) {
        return NextResponse.json(
          { error: 'Failed to access database.' },
          { status: 500 }
        );
      }

      // Case-insensitive email check
      const admin = admins.find(
        (a) => (a.email || '').trim().toLowerCase() === cleanEmail && (a.password || '').trim() === cleanPassword
      );

      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      const cookieStore = await cookies();
      cookieStore.set('admin_session', admin.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({ success: true });
    }

    // 2. Forgot Password via OTP Verification
    if (action === 'reset_password') {
      const cleanPhone = (phone || '').trim();
      const cleanOtp = (otp || '').trim();
      const cleanNewPassword = (newPassword || '').trim();

      const { data: otpRecord } = await supabase
        .from('phone_otps')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('otp_code', cleanOtp)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!otpRecord) {
        return NextResponse.json(
          { error: 'Invalid or expired OTP. Please check again.' },
          { status: 400 }
        );
      }

      // Update password in admins table
      const { error: updateErr } = await supabase
        .from('admins')
        .update({ password: cleanNewPassword })
        .eq('phone', cleanPhone);

      if (updateErr) {
        return NextResponse.json(
          { error: 'Could not update password. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Password successfully updated. Please login with your new password.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}