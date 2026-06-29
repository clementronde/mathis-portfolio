'use client';
import { useRef, type RefObject } from 'react';
import { motion, useMotionValue, type PanInfo } from 'framer-motion';
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
  dragConstraints?: RefObject<HTMLElement | null>;
  onMove?: (position: { left: number; top: number }) => void;
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
  dragConstraints,
  onMove,
}: DesktopItemProps) {
  const itemRef = useRef<HTMLButtonElement>(null);
  const wasDragged = useRef(false);
  const clickBlockTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (wasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    onClick?.();
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (Math.abs(info.offset.x) > 2 || Math.abs(info.offset.y) > 2) {
      wasDragged.current = true;
    }

    const itemRect = itemRef.current?.getBoundingClientRect();
    const boundsRect = dragConstraints?.current?.getBoundingClientRect();

    if (itemRect && boundsRect) {
      onMove?.({
        left: Math.round(itemRect.left - boundsRect.left),
        top: Math.round(itemRect.top - boundsRect.top),
      });
    }

    x.set(0);
    y.set(0);

    clickBlockTimeout.current = setTimeout(() => {
      wasDragged.current = false;
    }, 0);
  }

  return (
    <motion.button
      ref={itemRef}
      className="absolute flex flex-col items-center gap-1.5 group outline-none cursor-grab active:cursor-grabbing touch-none"
      style={{ rotate, x, y, ...style }}
      drag
      dragConstraints={dragConstraints}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={() => {
        if (clickBlockTimeout.current) clearTimeout(clickBlockTimeout.current);
        wasDragged.current = true;
      }}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={{ y: -4, scale: 1.03 }}
      whileDrag={{ scale: 1.05, zIndex: 30 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      aria-label={`Ouvrir ${label}`}
    >
      {/* Image / folder / map */}
      <div
        style={{
          width,
          aspectRatio,
          background: imageColor,
          backgroundImage: imageSrc && type !== 'map' ? `url("${encodeSrc(imageSrc)}")` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 0,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          position: 'relative',
        }}
        className="transition-shadow group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.7)]"
      >
        {type === 'map' && (
          <div className="absolute inset-0" style={{ background: '#d9f0dc' }}>
            <div
              className="absolute inset-0 opacity-80"
              style={{
                backgroundImage:
                  'linear-gradient(32deg, transparent 0 38%, rgba(90,160,210,0.35) 39% 42%, transparent 43%), linear-gradient(126deg, transparent 0 48%, rgba(90,160,210,0.28) 49% 52%, transparent 53%), linear-gradient(0deg, rgba(255,255,255,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.28) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 100% 100%, 34px 34px, 34px 34px',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                left: '38%',
                top: '46%',
                width: '31%',
                height: '26%',
                background: '#acdceb',
                border: '2px solid rgba(84,153,184,0.38)',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                left: '64%',
                top: '62%',
                width: '22%',
                height: '18%',
                background: '#acdceb',
                border: '2px solid rgba(84,153,184,0.38)',
              }}
            />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 64" preserveAspectRatio="none">
              <path
                d="M20 16 L38 12 L51 19 L59 30 L52 38 L62 48 L55 57 L42 51 L36 39 L25 34 L17 25 Z"
                fill="none"
                stroke="#ff5b14"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="absolute left-4 top-3 rounded-md px-2 py-1 text-[12px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.88)', color: '#5d6570' }}
            >
              Long Run
            </span>
          </div>
        )}

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
