import { createOwnerPasswordReset } from '@/features/auth/server/password-reset';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const result = await createOwnerPasswordReset(
      typeof body.email === 'string' ? body.email : '',
    );
    return NextResponse.json({ ok: true, ...result });
  } catch {
    // Keep the response neutral: this endpoint must not disclose owner state.
    return NextResponse.json({ ok: true });
  }
}
