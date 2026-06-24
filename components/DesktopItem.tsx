'use client';
import { motion } from 'framer-motion';
import { Folder } from 'lucide-react';
import { encodeSrc } from '@/utils/path';

interface DesktopItemProps {
  label: string;
  imageSrc?: string;
  imageColor?: string;
  rotate?: number;
  style?: React.CSSProperties;
  onClick?: () => void;
  aspectRatio?: string;
  width?: number;
  type?: 'photo' | 'folder' | 'map';
}

export function DesktopItem({
  label,
  imageSrc,
  imageColor = '#2a2a2a',
  rotate = 0,
  style,
  onClick,
  aspectRatio = '3/4',
  width = 160,
  type = 'photo',
}: DesktopItemProps) {
  return (
    <motion.button
      className="absolute flex flex-col items-center gap-1.5 group outline-none"
      style={{ rotate, ...style }}
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      aria-label={`Ouvrir ${label}`}
    >
      {/* Image / folder */}
      <div
        style={{
          width,
          aspectRatio,
          background: imageColor,
          backgroundImage: imageSrc ? `url("${encodeSrc(imageSrc)}")` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: type === 'folder' ? 12 : 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
        className="transition-shadow group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.7)]"
      >
        {type === 'folder' && !imageSrc && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-60">
            <Folder size={40} className="text-white" />
          </div>
        )}

        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
            opacity: 0.6,
          }}
        />
      </div>

      {/* Label */}
      <span
        className="text-white text-[12px] font-medium px-2 py-0.5 rounded-md"
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          maxWidth: width + 20,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}
