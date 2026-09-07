import { LoginForm } from '@/components/auth/login-form';
import { OwnerAccessShell } from '@/components/auth/owner-access-shell';

export default function AdminLoginPage() {
  return (
    <OwnerAccessShell
      description="Use your owner email and password. Your authenticator check keeps this workspace private."
      eyebrow="Owner sign in"
      title="Take control of the supply desk."
    >
      <LoginForm />
    </OwnerAccessShell>
  );
}
