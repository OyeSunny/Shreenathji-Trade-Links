import { enquirySchema } from '@/features/enquiries/schemas';
import {
  EnquiryRateLimitError,
  submitEnquiry,
} from '@/features/enquiries/server/submit-enquiry';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const input = enquirySchema.parse(await request.json());
    await submitEnquiry({ input, headers: request.headers });

    return NextResponse.json(
      { accepted: true },
      { headers: { 'Cache-Control': 'no-store' }, status: 201 },
    );
  } catch (error) {
    if (error instanceof EnquiryRateLimitError) {
      return NextResponse.json(
        { accepted: false, error: 'TOO_MANY_REQUESTS' },
        {
          headers: { 'Cache-Control': 'no-store', 'Retry-After': '900' },
          status: 429,
        },
      );
    }

    return NextResponse.json(
      { accepted: false, error: 'INVALID_ENQUIRY' },
      { headers: { 'Cache-Control': 'no-store' }, status: 400 },
    );
  }
}
