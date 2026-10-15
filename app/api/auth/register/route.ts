import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { name, phone, password } = await req.json();

    const cleanPhone = (phone || '').trim();
    const cleanName = (name || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanPhone || !cleanPassword) {
      return NextResponse.json(
        { error: 'Phone number and password are required.' },
        { status: 400 }
      );
    }

    // Check existing pandit by phone
    const { data: existingPandit } = await supabase
      .from('pandits')
      .select('phone')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingPandit) {
      return NextResponse.json(
        { error: 'An account with this mobile number already exists. Please login.' },
        { status: 409 }
      );
    }

    // Both full_name and name provided to satisfy any schema constraint
    const insertPayload: Record<string, any> = {
      phone: cleanPhone,
      password: cleanPassword,
      name: cleanName,
      full_name: cleanName,
      status: 'pending',
      tokens: 50,
    };

    const { data, error } = await supabase
      .from('pandits')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Registration failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful.',
      pandit: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}