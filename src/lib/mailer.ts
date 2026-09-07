import nodemailer from 'nodemailer';
import 'server-only';

import { env } from './env';

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

export const mailer: Mailer = {
  async send(message) {
    if (
      !env.SMTP_HOST ||
      !env.SMTP_PORT ||
      !env.SMTP_USER ||
      !env.SMTP_PASSWORD
    ) {
      throw new Error('Transactional mail delivery has not been configured');
    }

    const transport = nodemailer.createTransport({
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
    });

    await transport.sendMail({
      from: env.MAIL_FROM,
      subject: message.subject,
      text: message.text,
      to: message.to,
    });
  },
};
