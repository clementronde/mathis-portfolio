'use client';
import { useId } from 'react';

// Dossier rouge façon Finder macOS : fond à onglet plus sombre, face avant plus claire
// avec un liseré lumineux en haut
export function MacFolderIcon({ size = 72 }: { size?: number }) {
  const id = useId();
  const backId = `${id}-back`;
  const frontId = `${id}-front`;

  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 100 80"
      style={{ display: 'block', filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.18))' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={backId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8324E" />
          <stop offset="1" stopColor="#C8223D" />
        </linearGradient>
        <linearGradient id={frontId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF4F68" />
          <stop offset="1" stopColor="#EC3653" />
        </linearGradient>
      </defs>
      <path
        d="M4 9a5 5 0 0 1 5-5h24.5a5 5 0 0 1 3.6 1.5L41 9.5a5 5 0 0 0 3.6 1.5H91a5 5 0 0 1 5 5v55a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"
        fill={`url(#${backId})`}
      />
      <rect x="4" y="18" width="92" height="58" rx="5" fill={`url(#${frontId})`} />
      <path d="M9 18.6h82" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
