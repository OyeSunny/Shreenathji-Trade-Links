import { ownerPasswordSchema } from '@/features/auth/schemas';
import { completeInitialOwnerSetup } from '@/features/auth/server/initial-owner-setup';
import { env } from '@/lib/env';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const initialSetupSchema = z.object({
  password: ownerPasswordSchema,
  setupToken: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(env.BETTER_AUTH_URL).origin) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  try {
    const input = initialSetupSchema.parse(await request.json());
    const result = await completeInitialOwnerSetup(input);

    if (result !== 'created') {
      return NextResponse.json({ error: 'SETUP_UNAVAILABLE' }, { status: 409 });
    }

    return NextResponse.json({ created: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'SETUP_UNAVAILABLE' }, { status: 409 });
  }
}
