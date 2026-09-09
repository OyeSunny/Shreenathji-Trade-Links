'use client';

export type UmamiEventName =
  | 'contact_lead_submitted'
  | 'offer_enquiry_clicked'
  | 'phone_clicked'
  | 'quote_submitted'
  | 'whatsapp_clicked';

type UmamiEventData = Record<string, string>;

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: UmamiEventData) => void;
    };
  }
}

const allowedDataKeys = new Set(['offer', 'placement', 'product']);

export const trackUmamiEvent = (
  eventName: UmamiEventName,
  data: UmamiEventData = {},
) => {
  if (typeof window === 'undefined' || !window.umami) return;

  const safeData = Object.fromEntries(
    Object.entries(data).filter(
      ([key, value]) => allowedDataKeys.has(key) && value.trim().length > 0,
    ),
  );

  window.umami.track(eventName, safeData);
};
