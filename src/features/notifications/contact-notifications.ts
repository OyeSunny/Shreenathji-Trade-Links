import { env } from '@/lib/env';
import { mailer } from '@/lib/mailer';
import 'server-only';

const notificationRecipient = () =>
  env.CONTACT_NOTIFICATION_TO ?? env.MAIL_FROM;

export const notifyNewEnquiry = async ({
  companyName,
  contactName,
  email,
  materialRequest,
  phone,
  type,
}: {
  companyName?: string;
  contactName: string;
  email: string;
  materialRequest: string;
  phone?: string;
  type: 'DOMESTIC' | 'EXPORT';
}) => {
  const buyer = companyName || contactName;
  const market = type === 'EXPORT' ? 'export' : 'domestic';

  await mailer.send({
    to: notificationRecipient(),
    subject: `New ${market} quote request — ${buyer}`,
    text: [
      'A buyer has sent a new quote request through the website.',
      '',
      `Name: ${contactName}`,
      `Company: ${companyName || 'Not provided'}`,
      `Email: ${email}`,
      `Phone / WhatsApp: ${phone || 'Not provided'}`,
      `Market: ${market}`,
      '',
      'Requirement:',
      materialRequest,
      '',
      'Open Admin → Enquiries to review and manage this request.',
    ].join('\n'),
  });
};

export const notifyNewContactLead = async ({
  email,
  phone,
}: {
  email: string;
  phone?: string;
}) => {
  await mailer.send({
    to: notificationRecipient(),
    subject: 'New buyer contact permission',
    text: [
      'A buyer has opted in to receive relevant materials, offers, and supply updates.',
      '',
      `Email: ${email}`,
      `Phone / WhatsApp: ${phone || 'Not provided'}`,
      '',
      'Open Admin → Contact leads to review this permission.',
    ].join('\n'),
  });
};
