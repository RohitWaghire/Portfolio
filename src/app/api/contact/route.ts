import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Contact + brief submissions are delivered to a Discord channel through a
 * webhook. Set DISCORD_WEBHOOK_URL in .env.local (never commit it).
 */
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const MAX_ATTACHMENT_BYTES = 7 * 1024 * 1024; // Discord allows 8 MB per request

type Submission = {
  services?: string[] | null;
  budget?: string | null;
  name?: string;
  email?: string;
  handle?: string;
  contact?: string;
  other?: string;
  details?: string;
  shots?: string[];
  website?: string;
  elapsed?: number;
};

const clip = (value: unknown, max = 1024) =>
  String(value ?? '').trim().slice(0, max);

function mimeFromBase64(base64: string): string | null {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  if (base64.startsWith('UklGR')) return 'image/webp';
  return null;
}

function extensionFor(mime: string) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/gif') return 'gif';
  return 'webp';
}

// Small in-memory limiter. Serverless instances are isolated, so this is a
// best-effort guard rather than a hard guarantee.
const attempts = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function rateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.reset < now) {
    attempts.set(key, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  try {
    if (!WEBHOOK_URL) {
      console.error('[contact] DISCORD_WEBHOOK_URL is not set');
      return NextResponse.json(
        { ok: false, error: 'Contact form is not configured' },
        { status: 500 }
      );
    }

    const body = (await req.json()) as Submission;

    // Honeypot
    if (body.website) {
      return NextResponse.json({ ok: false, error: 'Spam detected' }, { status: 400 });
    }

    // Too-fast submissions are almost always bots.
    if (typeof body.elapsed === 'number' && body.elapsed < 800) {
      return NextResponse.json(
        { ok: false, error: 'Submitted too quickly' },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const isBrief = Boolean(body.shots?.length || body.contact);
    const name = clip(body.name, 80);
    const email = clip(body.email, 160);
    const contact = clip(body.contact, 200);
    const services = (body.services ?? []).map((s) => clip(s, 60)).filter(Boolean);

    if (isBrief ? !contact : !name || !email) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const fields: { name: string; value: string; inline?: boolean }[] = [];

    if (isBrief) {
      fields.push({ name: 'Contact', value: contact || '—', inline: true });
      if (body.details) {
        fields.push({ name: 'Project link', value: clip(body.details, 1000) });
      }
      if (services.length) {
        fields.push({ name: 'Request', value: services.join(', '), inline: true });
      }
    } else {
      fields.push({ name: 'Name', value: name || '—', inline: true });
      fields.push({ name: 'Email', value: email || '—', inline: true });
      if (body.handle) {
        fields.push({ name: 'X handle', value: clip(body.handle, 80), inline: true });
      }
      if (body.other) {
        fields.push({ name: 'Other', value: clip(body.other, 200), inline: true });
      }
      fields.push({ name: 'Services', value: services.length ? services.join(', ') : '—' });
      fields.push({ name: 'Budget', value: clip(body.budget, 40) || '—', inline: true });
      if (body.details) {
        fields.push({ name: 'Details', value: clip(body.details, 1024) });
      }
    }

    // Decode screenshot attachments; skip anything oversized so the webhook
    // request stays under Discord's limit.
    const files: { name: string; blob: Blob }[] = [];
    let skipped = 0;
    let totalBytes = 0;

    for (const [index, data] of (body.shots ?? []).entries()) {
      const mime = mimeFromBase64(data);
      if (!mime) {
        skipped += 1;
        continue;
      }
      const buffer = Buffer.from(data, 'base64');
      if (totalBytes + buffer.byteLength > MAX_ATTACHMENT_BYTES) {
        skipped += 1;
        continue;
      }
      totalBytes += buffer.byteLength;
      files.push({
        name: `screenshot-${index + 1}.${extensionFor(mime)}`,
        blob: new Blob([buffer], { type: mime })
      });
    }

    if (isBrief) {
      const shotNote =
        files.length > 0
          ? `${files.length} attached${skipped ? ` (${skipped} skipped, too large)` : ''}`
          : skipped
            ? `${skipped} skipped, too large`
            : 'None';
      fields.push({ name: 'Screenshots', value: shotNote, inline: true });
    }

    const payload = {
      username: 'Portfolio',
      allowed_mentions: { parse: [] as string[] },
      embeds: [
        {
          title: isBrief ? 'New project brief' : 'New project request',
          color: 0x0084ff,
          fields,
          timestamp: new Date().toISOString()
        }
      ],
      attachments: files.map((file, index) => ({
        id: index,
        filename: file.name
      }))
    };

    // With attachments Discord requires multipart form data.
    let response: Response;
    if (files.length > 0) {
      const form = new FormData();
      form.append('payload_json', JSON.stringify(payload));
      files.forEach((file, index) => {
        form.append(`files[${index}]`, file.blob, file.name);
      });
      response = await fetch(`${WEBHOOK_URL}?wait=true`, {
        method: 'POST',
        body: form
      });
    } else {
      response = await fetch(`${WEBHOOK_URL}?wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[contact] Discord webhook failed', response.status, detail);
      return NextResponse.json(
        { ok: false, error: 'Could not deliver the request' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error handling contact request:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
