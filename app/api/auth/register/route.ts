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

    // 1. Check existing pandit by phone
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

    // 2. Safe Insert Object (supports schema with or without name)
    const insertPayload: Record<string, any> = {
      phone: cleanPhone,
      password: cleanPassword,
      status: 'pending',
      tokens: 50,
    };

    if (cleanName) {
      insertPayload.name = cleanName;
    }

    let { data, error } = await supabase
      .from('pandits')
      .insert([insertPayload])
      .select()
      .single();

    // Fallback: If 'name' column is missing in schema, insert without it
    if (error && error.message?.includes("'name' column")) {
      delete insertPayload.name;
      const retry = await supabase
        .from('pandits')
        .insert([insertPayload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

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