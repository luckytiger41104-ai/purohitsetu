import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    const { data: pandit, error } = await supabase
      .from('pandits')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !pandit) {
      return NextResponse.json({ error: 'Account not found. Please register first.' }, { status: 404 });
    }

    if (pandit.password_hash !== password) {
      return NextResponse.json({ error: 'Incorrect password. Click "Forgot Password" to reset.' }, { status: 401 });
    }

    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await supabase
      .from('pandits')
      .update({ active_session_token: sessionToken })
      .eq('phone', phone);

    return NextResponse.json({
      success: true,
      session_token: sessionToken,
      pandit: { ...pandit, active_session_token: sessionToken },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}