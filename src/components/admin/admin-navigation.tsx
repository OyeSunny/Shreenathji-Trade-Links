'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navigation = [
  { href: '/admin', icon: 'bi-grid-1x2', label: 'Overview' },
  { href: '/admin/catalogue', icon: 'bi-box-seam', label: 'Catalogue' },
  { href: '/admin/enquiries', icon: 'bi-inbox', label: 'Enquiries' },
  { href: '/admin/offers', icon: 'bi-tags', label: 'Offers' },
  { href: '/admin/content', icon: 'bi-sliders', label: 'Website content' },
  { href: '/admin/reviews', icon: 'bi-chat-square-quote', label: 'Feedback' },
  {
    href: '/admin/leads',
    icon: 'bi-person-lines-fill',
    label: 'Contact leads',
  },
];

const isCurrentPath = (pathname: string, href: string) =>
  href === '/admin' ? pathname === href : pathname.startsWith(href);

export const AdminNavigation = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.body.classList.add('admin-menu-open');
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.classList.remove('admin-menu-open');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        aria-controls="admin-navigation"
        aria-expanded={isOpen}
        className="admin-menu-toggle"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <i aria-hidden="true" className="bi bi-list" />
        <span>{isOpen ? 'Close' : 'Menu'}</span>
      </button>
      {isOpen ? (
        <button
          aria-label="Close workspace menu"
          className="admin-navigation__backdrop"
          onClick={closeMenu}
          type="button"
        />
      ) : null}
      <nav
        aria-label="Administration"
        className={`admin-navigation${isOpen ? ' admin-navigation--open' : ''}`}
        id="admin-navigation"
      >
        <p className="admin-navigation__eyebrow">Workspace</p>
        <div className="admin-navigation__links">
          {navigation.map((item, index) => {
            const current = isCurrentPath(pathname, item.href);

            return (
              <Link
                aria-current={current ? 'page' : undefined}
                className={
                  current
                    ? 'admin-navigation__link is-active'
                    : 'admin-navigation__link'
                }
                href={item.href}
                key={item.href}
                onClick={closeMenu}
              >
                <span className="admin-navigation__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <i aria-hidden="true" className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
