'use client';

import { useEffect, useId, useState } from 'react';

import styles from './contact-capture-popup.module.css';

const storageKey = 'stl-contact-capture-dismissed';

const initialValues = {
  email: '',
  phone: '',
  consent: false,
  website: '',
};

export function ContactCapturePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [state, setState] = useState<
    'idle' | 'sending' | 'success' | 'error' | 'limited'
  >('idle');
  const titleId = useId();

  const close = () => {
    window.sessionStorage.setItem(storageKey, '1');
    setIsOpen(false);
  };

  useEffect(() => {
    if (window.sessionStorage.getItem(storageKey)) return;

    // Give compact-screen buyers time to access the menu and read the page before
    // presenting a full-screen form. The desktop prompt remains intentionally quick.
    const isCompactScreen =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 991.98px)').matches;
    const timeout = window.setTimeout(
      () => setIsOpen(true),
      isCompactScreen ? 9000 : 1800,
    );
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState('sending');

    try {
      const response = await fetch('/api/contact-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.status === 429) {
        setState('limited');
        return;
      }

      if (!response.ok) {
        setState('error');
        return;
      }

      setState('success');
      window.sessionStorage.setItem(storageKey, '1');
    } catch {
      setState('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <section
        aria-describedby={`${titleId}-description`}
        aria-labelledby={titleId}
        className={styles.dialog}
        role="dialog"
      >
        <div aria-hidden="true" className={styles.rail} />
        <button
          aria-label="Close contact form"
          className={styles.close}
          onClick={close}
          type="button"
        >
          ×
        </button>
        {state === 'success' ? (
          <div className={styles.success} role="status">
            <span aria-hidden="true">✓</span>
            <p className={styles.eyebrow}>Contact saved</p>
            <h2 id={titleId}>Thank you.</h2>
            <p>
              We’ll only use these details for relevant material and supply
              updates.
            </p>
            <button
              className={styles.secondaryButton}
              onClick={close}
              type="button"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className={styles.eyebrow}>Buyer supply desk</p>
            <h2 id={titleId}>Keep your supply desk informed.</h2>
            <p className={styles.intro} id={`${titleId}-description`}>
              Share one contact route. We can send relevant material
              availability, offer updates, and a catalogue when it is useful to
              your work.
            </p>
            <form className={styles.form} noValidate onSubmit={submit}>
              <label htmlFor="contact-capture-email">Business email</label>
              <input
                autoComplete="email"
                id="contact-capture-email"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="you@company.com"
                required
                type="email"
                value={values.email}
              />
              <label htmlFor="contact-capture-phone">
                Phone or WhatsApp <span>(optional)</span>
              </label>
              <input
                autoComplete="tel"
                id="contact-capture-phone"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="Country code + number"
                type="tel"
                value={values.phone}
              />
              <input
                aria-hidden="true"
                autoComplete="off"
                className={styles.honeypot}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    website: event.target.value,
                  }))
                }
                tabIndex={-1}
                type="text"
                value={values.website}
              />
              <label
                className={styles.consent}
                htmlFor="contact-capture-consent"
              >
                <input
                  checked={values.consent}
                  id="contact-capture-consent"
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      consent: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span>
                  I agree to be contacted about relevant materials, offers, and
                  supply services. We do not sell contact details.
                </span>
              </label>
              {state === 'error' ? (
                <p className={styles.error} role="alert">
                  Please check the email and consent box, then try again.
                </p>
              ) : null}
              {state === 'limited' ? (
                <p className={styles.error} role="alert">
                  Please wait before trying again.
                </p>
              ) : null}
              <button
                className={styles.primaryButton}
                disabled={!values.consent || state === 'sending'}
                type="submit"
              >
                {state === 'sending' ? 'Saving contact…' : 'Send my contact'}
                <span aria-hidden="true"> ↗</span>
              </button>
            </form>
            <button className={styles.dismiss} onClick={close} type="button">
              Not right now
            </button>
          </>
        )}
      </section>
    </div>
  );
}
