import {
  makeTelephoneLink,
  makeWhatsAppLink,
} from '@/features/content/contact-channels';

describe('buyer contact links', () => {
  it('keeps a configured international call number usable on mobile devices', () => {
    expect(makeTelephoneLink('+91 98765-43210')).toBe('tel:+919876543210');
  });

  it('creates a WhatsApp deep link using digits only', () => {
    expect(makeWhatsAppLink('+91 98765 43210')).toBe(
      'https://wa.me/919876543210',
    );
  });

  it('does not create links from an empty value', () => {
    expect(makeTelephoneLink('')).toBeNull();
    expect(makeWhatsAppLink('')).toBeNull();
  });
});
