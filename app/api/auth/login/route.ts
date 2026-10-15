import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    const cleanPhone = (phone || '').toString().trim();
    const cleanPassword = (password || '').toString().trim();

    if (!cleanPhone || !cleanPassword) {
      return NextResponse.json(
        { error: 'Mobile number aur password zaroori hain.' },
        { status: 400 }
      );
    }

    const { data: pandit, error } = await supabase
      .from('pandits')
      .select('*')
      .eq('phone', cleanPhone)
      .single();

    if (error || !pandit) {
      return NextResponse.json(
        { error: 'Account not found. Please register first.' },
        { status: 404 }
      );
    }

    const storedPassword = (pandit.password_hash || pandit.password || '').toString().trim();

    if (storedPassword !== cleanPassword) {
      return NextResponse.json(
        { error: 'Incorrect password. Click "Forgot Password" to reset.' },
        { status: 401 }
      );
    }

    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await supabase
      .from('pandits')
      .update({ active_session_token: sessionToken })
      .eq('phone', cleanPhone);

    return NextResponse.json({
      success: true,
      session_token: sessionToken,
      pandit: { ...pandit, active_session_token: sessionToken },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}