import { completeOwnerPasswordReset } from '@/features/auth/server/password-reset';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      password?: unknown;
      token?: unknown;
    };
    const completed = await completeOwnerPasswordReset({
      token: typeof body.token === 'string' ? body.token : '',
      password: typeof body.password === 'string' ? body.password : '',
    });
    return NextResponse.json(
      { ok: completed },
      { status: completed ? 200 : 400 },
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
