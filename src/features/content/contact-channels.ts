const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const makeTelephoneLink = (phone: string) => {
  const normalized = phone.trim().replace(/[\s()-]/g, '');

  return normalized ? `tel:${normalized}` : null;
};

export const makeWhatsAppLink = (phone: string) => {
  const digits = digitsOnly(phone);

  return digits ? `https://wa.me/${digits}` : null;
};
