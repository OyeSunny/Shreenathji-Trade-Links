'use client';

import { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import styles from './admin-unsaved-changes-guard.module.css';

type PendingNavigation =
  { kind: 'history' } | { href: string; kind: 'href' } | null;

function isEditableControl(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;

  return target.matches(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, select',
  );
}

function isInternalNavigation(anchor: HTMLAnchorElement) {
  if (
    anchor.target ||
    anchor.hasAttribute('download') ||
    anchor.getAttribute('href')?.startsWith('#')
  ) {
    return false;
  }

  try {
    return new URL(anchor.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function AdminUnsavedChangesGuard() {
  const dirtyForms = useRef(new Set<HTMLFormElement>());
  const ignoringNextHistoryEvent = useRef(false);
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation>(null);

  useEffect(() => {
    const pruneDisconnectedForms = () => {
      for (const form of dirtyForms.current) {
        if (!form.isConnected) dirtyForms.current.delete(form);
      }
    };

    const hasUnsavedChanges = () => {
      pruneDisconnectedForms();
      return dirtyForms.current.size > 0;
    };

    const markFormDirty = (event: Event) => {
      if (!isEditableControl(event.target)) return;

      const form = event.target.closest('form');
      if (!form || form.dataset.unsavedGuard === 'off') return;

      dirtyForms.current.add(form);
    };

    const clearSubmittedForm = (event: Event) => {
      const form =
        event.target instanceof HTMLFormElement
          ? event.target
          : event.target instanceof HTMLElement
            ? event.target.closest('form')
            : null;

      if (form) dirtyForms.current.delete(form);
    };

    const interceptLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href]')
          : null;
      if (!anchor || !isInternalNavigation(anchor) || !hasUnsavedChanges()) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setPendingNavigation({ href: anchor.href, kind: 'href' });
    };

    const protectBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges()) return;

      event.preventDefault();
      event.returnValue = '';
    };

    const interceptHistory = () => {
      if (ignoringNextHistoryEvent.current) {
        ignoringNextHistoryEvent.current = false;
        return;
      }
      if (!hasUnsavedChanges()) return;

      ignoringNextHistoryEvent.current = true;
      window.history.go(1);
      setPendingNavigation({ kind: 'history' });
    };

    window.history.pushState(
      { ...window.history.state, unsavedChangesGuard: true },
      '',
      window.location.href,
    );
    document.addEventListener('input', markFormDirty, true);
    document.addEventListener('change', markFormDirty, true);
    document.addEventListener('submit', clearSubmittedForm, true);
    document.addEventListener('click', interceptLink, true);
    window.addEventListener('beforeunload', protectBeforeUnload);
    window.addEventListener('popstate', interceptHistory);

    return () => {
      document.removeEventListener('input', markFormDirty, true);
      document.removeEventListener('change', markFormDirty, true);
      document.removeEventListener('submit', clearSubmittedForm, true);
      document.removeEventListener('click', interceptLink, true);
      window.removeEventListener('beforeunload', protectBeforeUnload);
      window.removeEventListener('popstate', interceptHistory);
    };
  }, []);

  const stayAndSave = () => setPendingNavigation(null);

  const leaveWithoutSaving = () => {
    const navigation = pendingNavigation;
    dirtyForms.current.clear();
    setPendingNavigation(null);

    if (!navigation) return;
    if (navigation.kind === 'history') {
      window.history.go(-2);
      return;
    }

    window.location.assign(navigation.href);
  };

  return (
    <Modal
      centered
      contentClassName={styles.panel}
      onHide={stayAndSave}
      show={pendingNavigation !== null}
    >
      <Modal.Header closeButton>
        <Modal.Title>Unsaved changes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className={styles.eyebrow}>Owner workspace</p>
        <p className="mb-0">
          You have edits that have not been saved. Keep editing and save them,
          or leave this page without saving.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={stayAndSave} variant="outline-dark">
          Keep editing
        </Button>
        <Button onClick={leaveWithoutSaving} variant="danger">
          Leave without saving
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
