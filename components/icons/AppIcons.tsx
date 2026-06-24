'use client';
import {
  Folder,
  Mail,
  StickyNote,
  ImageIcon,
  Music2,
  MapPin,
} from 'lucide-react';
import type { AppId } from '@/store/useWindowStore';

function LightroomIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#001D26" />
      <text x="5" y="20" fontSize="13" fontWeight="700" fill="#31A8FF" fontFamily="sans-serif">Lr</text>
    </svg>
  );
}

function PhotoshopIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#001C26" />
      <text x="4" y="20" fontSize="12" fontWeight="700" fill="#31A8FF" fontFamily="sans-serif">Ps</text>
    </svg>
  );
}

function PremiereIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#0D0D26" />
      <text x="4" y="20" fontSize="12" fontWeight="700" fill="#9999FF" fontFamily="sans-serif">Pr</text>
    </svg>
  );
}

function FinderIcon({ size = 28 }: { size?: number }) {
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

interface AppIconProps {
  id: AppId;
  size?: number;
  className?: string;
}

export function AppIcon({ id, size = 28, className }: AppIconProps) {
  const iconSize = size * 0.6;
  const wrapperStyle = { width: size, height: size };

  const wrappers: Record<string, { bg: string; color: string }> = {
    mail: { bg: '#1B73E8', color: '#fff' },
    notes: { bg: '#FFD60A', color: '#1a1a00' },
    photos: { bg: '#fff', color: '#888' },
    music: { bg: '#FC3C44', color: '#fff' },
    maps: { bg: '#34C759', color: '#fff' },
  };

  if (id === 'finder') return <FinderIcon size={size} />;
  if (id === 'lightroom') return <LightroomIcon size={size} />;
  if (id === 'photoshop') return <PhotoshopIcon size={size} />;
  if (id === 'premiere') return <PremiereIcon size={size} />;

  const w = wrappers[id] ?? { bg: '#444', color: '#fff' };

  const icons: Record<string, React.ReactNode> = {
    mail: <Mail size={iconSize} />,
    notes: <StickyNote size={iconSize} />,
    photos: <ImageIcon size={iconSize} />,
    music: <Music2 size={iconSize} />,
    maps: <MapPin size={iconSize} />,
  };

  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        borderRadius: size * 0.22,
        background: w.bg,
        color: w.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {icons[id] ?? <Folder size={iconSize} />}
    </div>
  );
}
