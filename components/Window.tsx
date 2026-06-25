'use client';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  motion,
  useMotionValue,
  useAnimationControls,
  animate as fmAnimate,
} from 'framer-motion';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { useWindowStore, type AppId } from '@/store/useWindowStore';
import {
  useScrollytellingStore,
  getClosedStepIndexForApp,
  getStepAppId,
} from '@/store/useScrollytellingStore';

interface WindowProps {
  id: AppId;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  className?: string;
}

const RESIZE_HANDLES = [
  { dir: 'n',  style: { top: 0, left: 6, right: 6, height: 5, cursor: 'ns-resize' } },
  { dir: 's',  style: { bottom: 0, left: 6, right: 6, height: 5, cursor: 'ns-resize' } },
  { dir: 'e',  style: { top: 6, right: 0, bottom: 6, width: 5, cursor: 'ew-resize' } },
  { dir: 'w',  style: { top: 6, left: 0, bottom: 6, width: 5, cursor: 'ew-resize' } },
  { dir: 'ne', style: { top: 0, right: 0, width: 10, height: 10, cursor: 'nesw-resize' } },
  { dir: 'nw', style: { top: 0, left: 0, width: 10, height: 10, cursor: 'nwse-resize' } },
  { dir: 'se', style: { bottom: 0, right: 0, width: 10, height: 10, cursor: 'nwse-resize' } },
  { dir: 'sw', style: { bottom: 0, left: 0, width: 10, height: 10, cursor: 'nesw-resize' } },
] as const;

function centeredPos(w: number, h: number) {
  if (typeof window === 'undefined') return { x: 80, y: 60 };
  return {
    x: Math.max(0, Math.round((window.innerWidth - w) / 2)),
    y: Math.max(28, Math.round((window.innerHeight - h) / 2)),
  };
}

export function Window({
  id,
  title,
  icon,
  children,
  defaultPosition,
  defaultSize = { width: 760, height: 520 },
  className = '',
}: WindowProps) {
  const { closeWindow, focusWindow, activeWindow } = useWindowStore();
  const isActive = activeWindow === id;
  const { step, setStep } = useScrollytellingStore();
  const isScrollytelling = getStepAppId(step) === id;

  const initPos = defaultPosition ?? centeredPos(defaultSize.width, defaultSize.height);
  const x = useMotionValue(initPos.x);
  const y = useMotionValue(initPos.y);
  const [size, setSize] = useState(defaultSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const savedPos = useRef(initPos);
  const savedSize = useRef(defaultSize);
  const controls = useAnimationControls();

  // Centre la fenêtre après montage (window.innerHeight n'existe pas côté serveur)
  useLayoutEffect(() => {
    if (!defaultPosition) {
      const pos = centeredPos(size.width, size.height);
      x.set(pos.x);
      y.set(pos.y);
      savedPos.current = pos;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mount animation
  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
    });
  }, [controls]);

  // ── Drag via title bar ────────────────────────────────────────────────────
  function handleTitleBarPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    focusWindow(id);

    const startX = e.clientX - x.get();
    const startY = e.clientY - y.get();

    const onMove = (me: PointerEvent) => {
      x.set(me.clientX - startX);
      y.set(Math.max(28, me.clientY - startY));
    };
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function startResize(dir: string) {
    return (e: React.PointerEvent) => {
      if (isMaximized) return;
      e.preventDefault();
      e.stopPropagation();

      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const startW = size.width;
      const startH = size.height;
      const startX = x.get();
      const startY = y.get();
      const MIN_W = 320;
      const MIN_H = 200;

      const onMove = (me: PointerEvent) => {
        const dx = me.clientX - startClientX;
        const dy = me.clientY - startClientY;
        let nw = startW, nh = startH, nx = startX, ny = startY;

        if (dir.includes('e')) nw = Math.max(MIN_W, startW + dx);
        if (dir.includes('s')) nh = Math.max(MIN_H, startH + dy);
        if (dir.includes('w')) {
          nw = Math.max(MIN_W, startW - dx);
          nx = startX + (startW - nw);
        }
        if (dir.includes('n')) {
          nh = Math.max(MIN_H, startH - dy);
          ny = startY + (startH - nh);
        }

        x.set(nx);
        y.set(Math.max(28, ny));
        setSize({ width: nw, height: nh });
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    };
  }

  // ── Maximize ─────────────────────────────────────────────────────────────
  function toggleMaximize() {
    if (!isMaximized) {
      savedPos.current = { x: x.get(), y: y.get() };
      savedSize.current = { ...size };
      fmAnimate(x, 0, { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] });
      fmAnimate(y, 28, { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] });
      setSize({
        width: typeof window !== 'undefined' ? window.innerWidth : 1440,
        height: typeof window !== 'undefined' ? window.innerHeight - 28 : 900,
      });
    } else {
      fmAnimate(x, savedPos.current.x, { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] });
      fmAnimate(y, savedPos.current.y, { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] });
      setSize(savedSize.current);
    }
    setIsMaximized((v) => !v);
  }

  function closeFromControls() {
    if (isScrollytelling) {
      setStep(getClosedStepIndexForApp(id));
      return;
    }

    closeWindow(id);
  }

  // ── Minimize to dock ──────────────────────────────────────────────────────
  async function handleMinimize() {
    const currentY = y.get();
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    await controls.start({
      scaleX: 0.6,
      scaleY: 0.05,
      opacity: 0,
      y: vh - currentY + 60,
      transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
    });
    closeFromControls();
  }

  // Keyboard shortcut: Escape closes / advances step
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        closeFromControls();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isActive, closeFromControls]);

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0, scale: 0.94 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      data-window-container
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x,
        y,
        width: size.width,
        height: size.height,
        zIndex: isActive ? 50 : 40,
        borderRadius: isMaximized ? 0 : 12,
        originX: 0.5,
        originY: 0.5,
      }}
      className={`flex flex-col overflow-hidden shadow-2xl ${
        isActive ? 'ring-1 ring-white/10' : ''
      } ${className}`}
      onPointerDown={() => focusWindow(id)}
    >
      {/* Title bar */}
      <div
        onPointerDown={handleTitleBarPointerDown}
        className="flex items-center gap-3 px-4 shrink-0 select-none"
        style={{
          height: 44,
          background: isActive ? 'rgba(42,42,42,0.97)' : 'rgba(30,30,30,0.97)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          cursor: isMaximized ? 'default' : 'grab',
        }}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5" aria-label="Contrôles">
          <button
            onClick={closeFromControls}
            aria-label="Fermer"
            className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] transition-colors flex items-center justify-center group"
          >
            <X size={7} className="opacity-0 group-hover:opacity-100 text-[#6a0000]" />
          </button>
          <button
            onClick={handleMinimize}
            aria-label="Minimiser vers le dock"
            className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FF9F0A] transition-colors flex items-center justify-center group"
          >
            <Minus size={7} className="opacity-0 group-hover:opacity-100 text-[#5a3500]" />
          </button>
          <button
            onClick={toggleMaximize}
            aria-label={isMaximized ? 'Restaurer la fenêtre' : 'Agrandir'}
            className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#34C759] transition-colors flex items-center justify-center group"
          >
            {isMaximized
              ? <Minimize2 size={6} className="opacity-0 group-hover:opacity-100 text-[#004a00]" />
              : <Maximize2 size={6} className="opacity-0 group-hover:opacity-100 text-[#004a00]" />
            }
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 flex-1 justify-center pointer-events-none">
          {icon && <span className="opacity-60 shrink-0">{icon}</span>}
          <span className="text-[13px] font-medium text-white/75 truncate">{title}</span>
        </div>

        <div className="w-14 shrink-0" />
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-hidden"
        style={{ background: 'rgba(22,22,22,0.98)' }}
      >
        {children}
      </div>

      {/* Resize handles — hidden when maximized */}
      {!isMaximized &&
        RESIZE_HANDLES.map(({ dir, style }) => (
          <div
            key={dir}
            onPointerDown={startResize(dir)}
            style={{ position: 'absolute', ...style }}
          />
        ))}
    </motion.div>
  );
}
