import { AdminNavigation } from '@/components/admin/admin-navigation';
import { AdminUnsavedChangesGuard } from '@/components/admin/admin-unsaved-changes-guard';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { getOwnerSecurityState } from '@/features/auth/server/owner-security';
import { requireOwnerPageSession } from '@/features/auth/server/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const owner = await requireOwnerPageSession();
  const security = await getOwnerSecurityState(owner.user.id);

  if (security.requiresSetup) {
    redirect('/admin/setup-2fa');
  }

  return (
    <main className="admin-workspace">
      <AdminUnsavedChangesGuard />
      <aside className="admin-rail">
        <Link
          aria-label="Shreenathji Trade Links — admin overview"
          className="admin-brand"
          href="/admin"
        >
          <span className="admin-brand__mark">STL</span>
          <span>
            <strong>Shreenathji</strong>
            <small>Trade Links</small>
          </span>
        </Link>
        <AdminNavigation />
        <p className="admin-rail__footnote">
          Owner workspace
          <br />
          <span>Secure session active</span>
        </p>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__context">
            <span className="admin-topbar__signal" aria-hidden="true" />
            <span>Owner control room</span>
          </div>
          <SignOutButton />
        </header>
        <div className="admin-content">{children}</div>
      </section>
    </main>
  );
}
