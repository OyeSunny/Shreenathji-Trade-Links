'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Button from 'react-bootstrap/Button';

export const SignOutButton = () => {
  const router = useRouter();

  return (
    <Button
      onClick={async () => {
        await authClient.signOut();
        router.replace('/admin/login');
      }}
      size="sm"
      variant="outline-secondary"
    >
      Sign out
    </Button>
  );
};
