import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { action, email, password, phone, newPassword } = await req.json();

    // --- 1. PRE-LOGIN: Credential Check & Daily 2 OTP Quota Check ---
    if (action === 'pre_login') {
      const cleanEmail = (email || '').trim().toLowerCase();
      const inputPassword = (password || '').trim();

      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', inputPassword)
        .maybeSingle();

      if (!admin) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      const rawPhone = admin.phone || process.env.ADMIN_AUTHORIZED_PHONE || '';
      const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

      if (!cleanPhone || cleanPhone.length !== 10) {
        return NextResponse.json(
          { success: false, error: 'Admin phone number is not configured.' },
          { status: 500 }
        );
      }

      // Check daily 2 OTP security limit
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: adminAttempts } = await supabase
        .from('otp_request_logs')
        .select('*', { count: 'exact', head: true })
        .eq('phone', cleanPhone)
        .eq('purpose', 'admin_login')
        .gte('created_at', oneDayAgo);

      if ((adminAttempts || 0) >= 2) {
        return NextResponse.json(
          { success: false, error: 'Admin Security Limit: Maximum 2 OTP requests allowed per 24 hours.' },
          { status: 429 }
        );
      }

      // Log attempt
      await supabase.from('otp_request_logs').insert({
        phone: cleanPhone,
        purpose: 'admin_login',
      });

      return NextResponse.json({
        success: true,
        phone: cleanPhone,
        maskedPhone: `+91 ******${cleanPhone.slice(-4)}`,
      });
    }

    // --- 2. VERIFY 2FA: Create Admin Session Cookie ---
    if (action === 'verify_2fa') {
      const cleanEmail = (email || '').trim().toLowerCase();

      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!admin) {
        return NextResponse.json(
          { success: false, error: 'Admin account not found.' },
          { status: 404 }
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

    // --- 3. FORGOT PASSWORD: Update Password in Database ---
    if (action === 'reset_password') {
      const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

      const { error } = await supabase
        .from('admins')
        .update({ password: newPassword })
        .eq('phone', cleanPhone);

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to update password. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Password successfully updated!',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}