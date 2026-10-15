import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { name, phone, password } = await req.json();

    const cleanPhone = (phone || '').trim();
    const cleanName = (name || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanPhone || !cleanName || !cleanPassword) {
      return NextResponse.json(
        { error: 'Name, phone number, and password are required.' },
        { status: 400 }
      );
    }

    // Check if phone already registered
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

    // Insert new Pandit (without city column)
    const { data, error } = await supabase
      .from('pandits')
      .insert([
        {
          name: cleanName,
          phone: cleanPhone,
          password: cleanPassword,
          status: 'pending',
          tokens: 50,
        },
      ])
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