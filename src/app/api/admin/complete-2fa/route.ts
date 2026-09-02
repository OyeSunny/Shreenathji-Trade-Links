import { completeOwnerTwoFactorSetup } from '@/features/auth/server/recovery-codes';
import { requireOwnerApiSession } from '@/features/auth/server/session';
import { env } from '@/lib/env';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (request.headers.get('origin') !== env.BETTER_AUTH_URL) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const owner = await requireOwnerApiSession(request.headers);

  if (!owner.ok) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED' },
      { status: owner.status },
    );
  }

  try {
    const recoveryCodes = await completeOwnerTwoFactorSetup(
      owner.session.user.id,
    );

    return NextResponse.json({ recoveryCodes });
  } catch {
    return NextResponse.json(
      { error: 'TWO_FACTOR_SETUP_NOT_READY' },
      { status: 409 },
    );
  }
}
