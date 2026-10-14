import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const key_id = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET || '').trim();

    console.log('--- RAZORPAY DEBUG ---');
    console.log('Using Key ID:', key_id);
    console.log('Secret Length:', key_secret.length);
    console.log('Secret First 4:', key_secret.slice(0, 4));
    console.log('Secret Last 4:', key_secret.slice(-4));
    console.log('----------------------');

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: 'Razorpay keys not configured' },
        { status: 500 }
      );
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    const order = await instance.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay Error Details:', error);
    const desc = error?.error?.description || error?.message || 'Authentication failed';
    return NextResponse.json({ error: desc }, { status: 400 });
  }
}