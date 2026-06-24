'use client';
import { useState } from 'react';
import { Folder, Mail, StickyNote, ImageIcon, Music2, MapPin } from 'lucide-react';
import type { AppId } from '@/store/useWindowStore';

const ICON_FILES: Partial<Record<AppId, string>> = {
  finder:    '/images/icons/Findericon.png',
  mail:      '/images/icons/Mailicon.png',
  notes:     '/images/icons/noteicon.png',
  photos:    '/images/icons/Photosicon.png',
  music:     '/images/icons/musiqueIcon.png',
  maps:      '/images/icons/localistionicon.png',
  lightroom: '/images/icons/lightroom.webp',
  photoshop: '/images/icons/photoshopicon.webp',
  premiere:  '/images/icons/premiereproicon.png',
};

function IconWithFallback({
  id,
  size,
  fallback,
}: {
  id: AppId;
  size: number;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const src = ICON_FILES[id];

  if (failed || !src) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={id}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, borderRadius: size * 0.22, objectFit: 'cover', display: 'block' }}
      draggable={false}
    />
  );
}

/* ── Fallback built-in icons ─────────────────────────────────── */

function FinderFallback({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#1B5EBF" />
      <rect x="4" y="8" width="20" height="14" rx="2" fill="#2E8EFF" />
      <rect x="4" y="8" width="20" height="5" rx="2" fill="#4BA3FF" />
      <circle cx="9" cy="10.5" r="1.5" fill="#FF5F57" />
      <circle cx="14" cy="10.5" r="1.5" fill="#FFBD2E" />
      <circle cx="19" cy="10.5" r="1.5" fill="#28C840" />
    </svg>
  );
}

function LightroomFallback({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#001D26" />
      <text x="5" y="20" fontSize="13" fontWeight="700" fill="#31A8FF" fontFamily="sans-serif">Lr</text>
    </svg>
  );
}

function PhotoshopFallback({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#001C26" />
      <text x="4" y="20" fontSize="12" fontWeight="700" fill="#31A8FF" fontFamily="sans-serif">Ps</text>
    </svg>
  );
}

function PremiereFallback({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#0D0D26" />
      <text x="4" y="20" fontSize="12" fontWeight="700" fill="#9999FF" fontFamily="sans-serif">Pr</text>
    </svg>
  );
}

const ICON_STYLES: Record<string, { bg: string; color: string }> = {
  mail:  { bg: '#1B73E8', color: '#fff' },
  notes: { bg: '#FFD60A', color: '#1a1a00' },
  photos:{ bg: '#fff',    color: '#888' },
  music: { bg: '#FC3C44', color: '#fff' },
  maps:  { bg: '#34C759', color: '#fff' },
};

const LUCIDE_ICONS: Record<string, React.ComponentType<{ size: number }>> = {
  mail:   Mail,
  notes:  StickyNote,
  photos: ImageIcon,
  music:  Music2,
  maps:   MapPin,
};

function BuiltinFallback({ id, size }: { id: AppId; size: number }) {
  if (id === 'finder')    return <FinderFallback size={size} />;
  if (id === 'lightroom') return <LightroomFallback size={size} />;
  if (id === 'photoshop') return <PhotoshopFallback size={size} />;
  if (id === 'premiere')  return <PremiereFallback size={size} />;

  const style = ICON_STYLES[id] ?? { bg: '#444', color: '#fff' };
  const Icon  = LUCIDE_ICONS[id] ?? Folder;
  const iconSize = Math.round(size * 0.52);

  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: size * 0.22,
        background: style.bg,
        color: style.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <Icon size={iconSize} />
    </div>
  );
}

/* ── Public API ───────────────────────────────────────────────── */

export function AppIcon({ id, size = 28, className }: {
  id: AppId;
  size?: number;
  className?: string;
}) {
  return (
    <div className={className} style={{ width: size, height: size, flexShrink: 0 }}>
      <IconWithFallback
        id={id}
        size={size}
        fallback={<BuiltinFallback id={id} size={size} />}
      />
    </div>
  );
}
