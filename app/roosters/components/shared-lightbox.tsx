'use client';

import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

const Lightbox = dynamic(() => import('yet-another-react-lightbox'), { ssr: false });

interface SharedLightboxProps {
  open: boolean;
  slides: Array<{ src: string; alt: string }>;
  index: number;
  onClose: () => void;
}

export function SharedLightbox({ open, slides, index, onClose }: SharedLightboxProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <Lightbox
      open={open}
      slides={slides}
      index={index}
      close={onClose}
      plugins={[Zoom]}
      carousel={{ finite: true }}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: false, closeOnPullUp: false }}
      render={{ buttonPrev: () => null, buttonNext: () => null }}
    />,
    document.body
  );
}
