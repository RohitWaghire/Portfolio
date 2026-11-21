import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot check
    if (body.website) {
      return NextResponse.json({ ok: false, error: 'Spam detected' }, { status: 400 });
    }

    // Rate limit / elapsed time check (too fast = bot)
    if (body.elapsed && body.elapsed < 800) {
      return NextResponse.json({ ok: false, error: 'Submitted too quickly' }, { status: 400 });
    }

    // In a real backend, you'd send an email/webhook via Telegram, Resend, or Discord
    console.log('[Contact Submission Received]:', {
      timestamp: new Date().toISOString(),
      services: body.services,
      budget: body.budget,
      name: body.name,
      email: body.email,
      contact: body.contact,
      handle: body.handle,
      details: body.details,
      shotsCount: body.shots?.length || 0
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error handling contact request:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
