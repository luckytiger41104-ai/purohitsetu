import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    const cleanPassword = (password || '').trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    if (!cleanPassword) {
      return NextResponse.json({ success: false, message: 'Please enter your password.' }, { status: 400 });
    }

    // Pandit record find karein
    const { data: pandit, error } = await supabase
      .from('pandits')
      .select('id, phone, full_name, password')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (error || !pandit) {
      return NextResponse.json({ success: false, message: 'Account not found. Please register first.' }, { status: 404 });
    }

    // Password verify
    if (pandit.password !== cleanPassword) {
      return NextResponse.json({ success: false, message: 'Incorrect password. Please try again or reset password.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      phone: cleanPhone,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal server error.' }, { status: 500 });
  }
}