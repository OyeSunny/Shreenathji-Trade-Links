'use server';

import { requireOwnerPageSession } from '@/features/auth/server/session';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const enquiryStatusChangeSchema = z.object({
  enquiryId: z.string().cuid(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'QUOTED', 'WON', 'LOST', 'SPAM']),
});

export async function changeEnquiryStatus(formData: FormData) {
  await requireOwnerPageSession();

  const result = enquiryStatusChangeSchema.safeParse({
    enquiryId: formData.get('enquiryId'),
    status: formData.get('status'),
  });

  if (!result.success) return;

  await db.enquiry.updateMany({
    where: { id: result.data.enquiryId },
    data: { status: result.data.status },
  });
  revalidatePath('/admin/enquiries');
}
