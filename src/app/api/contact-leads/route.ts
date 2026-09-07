import { contactCaptureSchema } from '@/features/leads/contact-capture-input';
import {
  ContactLeadRateLimitError,
  submitContactLead,
} from '@/features/leads/server/submit-contact-lead';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const input = contactCaptureSchema.parse(await request.json());
    await submitContactLead({ input, headers: request.headers });

    return NextResponse.json(
      { accepted: true },
      { headers: { 'Cache-Control': 'no-store' }, status: 201 },
    );
  } catch (error) {
    if (error instanceof ContactLeadRateLimitError) {
      return NextResponse.json(
        { accepted: false, error: 'TOO_MANY_REQUESTS' },
        {
          headers: { 'Cache-Control': 'no-store', 'Retry-After': '900' },
          status: 429,
        },
      );
    }

    return NextResponse.json(
      { accepted: false, error: 'INVALID_CONTACT' },
      { headers: { 'Cache-Control': 'no-store' }, status: 400 },
    );
  }
}
