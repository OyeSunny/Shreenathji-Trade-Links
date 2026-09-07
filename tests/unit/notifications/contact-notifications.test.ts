import { vi } from 'vitest';

const send = vi.hoisted(() => vi.fn());

vi.mock('@/lib/env', () => ({
  env: {
    CONTACT_NOTIFICATION_TO: 'owner@example.com',
    MAIL_FROM: 'website@example.com',
  },
}));
vi.mock('@/lib/mailer', () => ({ mailer: { send } }));

import {
  notifyNewContactLead,
  notifyNewEnquiry,
} from '@/features/notifications/contact-notifications';

describe('buyer contact notifications', () => {
  beforeEach(() => send.mockReset());

  it('sends the owner a usable new-enquiry email', async () => {
    await notifyNewEnquiry({
      companyName: 'Northwind Metals',
      contactName: 'Aisha Khan',
      email: 'aisha@northwind.example',
      materialRequest: 'Iron ore fines, 500 MT, delivered Mundra.',
      phone: '+91 98765 43210',
      type: 'EXPORT',
    });

    expect(send).toHaveBeenCalledWith({
      to: 'owner@example.com',
      subject: 'New export quote request — Northwind Metals',
      text: expect.stringContaining('Iron ore fines, 500 MT'),
    });
  });

  it('sends the owner a notification when a buyer opts in for updates', async () => {
    await notifyNewContactLead({
      email: 'buyer@example.com',
      phone: '+91 98765 43210',
    });

    expect(send).toHaveBeenCalledWith({
      to: 'owner@example.com',
      subject: 'New buyer contact permission',
      text: expect.stringContaining('buyer@example.com'),
    });
  });
});
