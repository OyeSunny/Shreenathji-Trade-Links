import 'server-only';

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

export const mailer: Mailer = {
  async send() {
    throw new Error('Transactional mail delivery has not been configured');
  },
};
