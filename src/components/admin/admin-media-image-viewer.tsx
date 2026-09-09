'use client';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import styles from './admin-media-image-viewer.module.css';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

type AdminMediaImageViewerProps = {
  alt: string;
  src: string;
};

const clampZoom = (zoom: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

export function AdminMediaImageViewer({
  alt,
  src,
}: AdminMediaImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);

  const close = () => {
    setIsOpen(false);
    setZoom(MIN_ZOOM);
  };

  const updateZoom = (amount: number) =>
    setZoom((currentZoom) => clampZoom(currentZoom + amount));

  return (
    <>
      <div className={styles.preview}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={alt} className={styles.thumbnail} src={src} />
        <Button
          aria-label="View full image"
          className={styles.viewButton}
          onClick={() => setIsOpen(true)}
          size="sm"
          type="button"
          variant="dark"
        >
          View full image ↗
        </Button>
      </div>

      <Modal
        centered
        contentClassName={styles.panel}
        onHide={close}
        show={isOpen}
        size="xl"
      >
        <Modal.Header closeButton>
          <div>
            <p className={styles.eyebrow}>Product image</p>
            <Modal.Title>Image inspection</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className={styles.body}>
          <div
            aria-label="Zoomable image area"
            className={styles.canvas}
            onWheel={(event) => {
              event.preventDefault();
              updateZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={alt}
              className={styles.fullImage}
              src={src}
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <span className={styles.zoomReadout}>{Math.round(zoom * 100)}%</span>
          <Button
            aria-label="Zoom out"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => updateZoom(-ZOOM_STEP)}
            type="button"
            variant="outline-dark"
          >
            −
          </Button>
          <Button
            aria-label="Zoom in"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => updateZoom(ZOOM_STEP)}
            type="button"
            variant="dark"
          >
            +
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
