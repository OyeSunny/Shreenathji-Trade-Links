'use client';

import Link from 'next/link';
import { useState } from 'react';

const links = [
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'Company' },
  { href: '/contact', label: 'Contact' },
] as const;

export function PublicNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="public-navigation">
      <nav aria-label="Main navigation" className="public-navigation__desktop">
        {links.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <Link
        className="btn btn-sm btn-outline-light public-navigation__quote"
        href="/request-a-quote"
      >
        Request a quote
      </Link>

      <button
        aria-controls="mobile-site-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className="public-navigation__toggle"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span />
        <span />
      </button>

      <div
        className="public-navigation__mobile"
        id="mobile-site-navigation"
        hidden={!isOpen}
      >
        <nav aria-label="Mobile navigation">
          {links.map((link, index) => (
            <Link href={link.href} key={link.href} onClick={closeMenu}>
              <span>0{index + 1}</span>
              {link.label}
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
          <Link
            className="btn btn-primary w-100"
            href="/request-a-quote"
            onClick={closeMenu}
          >
            Request a quote <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
