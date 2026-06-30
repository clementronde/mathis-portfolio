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
  chrome?: 'default' | 'frameless';
  fixedAspectRatio?: number;
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

const TOPBAR_H = 28;
const DOCK_BOTTOM_H = 80; // dock en bas: bottom-4 + py-2 + icône + marge
// Largeur max des fenêtres sur mobile = largeur du dock (8 icônes × 36px + 7 gaps × 8px + 2 × 12px padding)
const MOBILE_MAX_W = 368;

function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

const VIEWPORT_GAP = 16;

function fitAspectSize(size: { width: number; height: number }, aspectRatio?: number) {
  if (!aspectRatio) return size;

  const byWidth = { width: size.width, height: Math.round(size.width / aspectRatio) };
  if (byWidth.height <= size.height) return byWidth;

  return { width: Math.round(size.height * aspectRatio), height: size.height };
}

function responsiveSize(base: { width: number; height: number }, aspectRatio?: number) {
  if (typeof window === 'undefined') return base;
  const mobile = isMobileViewport();
  const GAP = mobile ? 0 : VIEWPORT_GAP;
  const maxW = mobile ? Math.min(MOBILE_MAX_W, window.innerWidth) : window.innerWidth - GAP * 2;
  const maxHeight = window.innerHeight - TOPBAR_H - DOCK_BOTTOM_H - (mobile ? 0 : GAP);
  return fitAspectSize({
    width: Math.min(base.width, maxW),
    height: Math.min(base.height, maxHeight),
  }, aspectRatio);
}

function centeredPos(w: number, h: number) {
  if (typeof window === 'undefined') return { x: 80, y: 60 };
  const availableHeight = window.innerHeight - TOPBAR_H - DOCK_BOTTOM_H;
  if (isMobileViewport()) {
    return {
      x: Math.round((window.innerWidth - w) / 2),
      y: Math.max(TOPBAR_H, TOPBAR_H + Math.round((availableHeight - h) / 2)),
    };
  }
  return {
    x: Math.max(0, Math.round((window.innerWidth - w) / 2)),
    y: Math.max(TOPBAR_H, Math.round((availableHeight - h) / 2) + TOPBAR_H),
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
  chrome = 'default',
  fixedAspectRatio,
}: WindowProps) {
  const { closeWindow, focusWindow, activeWindow } = useWindowStore();
  const isActive = activeWindow === id;
  const { step, setStep } = useScrollytellingStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const isScrollytelling = getStepAppId(step) === id;

  const initPos = defaultPosition ?? centeredPos(defaultSize.width, defaultSize.height);
  const x = useMotionValue(initPos.x);
  const y = useMotionValue(initPos.y);
  const [size, setSize] = useState(defaultSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const savedPos = useRef(initPos);
  const savedSize = useRef(defaultSize);
  const controls = useAnimationControls();
  const isFrameless = chrome === 'frameless';

  // Applique la taille responsive et centre la fenêtre après montage
  useLayoutEffect(() => {
    const s = responsiveSize(defaultSize, fixedAspectRatio);
    setSize(s);
    savedSize.current = s;
    if (!defaultPosition) {
      const pos = centeredPos(s.width, s.height);
      x.set(pos.x);
      y.set(pos.y);
      savedPos.current = pos;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleResize() {
      if (isMaximized) return;

      const nextSize = responsiveSize(defaultSize, fixedAspectRatio);
      setSize((currentSize) => {
        const width = Math.min(currentSize.width, nextSize.width);
        const height = Math.min(currentSize.height, nextSize.height);
        const next = { width, height };

        if (!defaultPosition) {
          const pos = centeredPos(next.width, next.height);
          x.set(pos.x);
          y.set(pos.y);
          savedPos.current = pos;
        }

        savedSize.current = next;
        return next;
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [defaultPosition, defaultSize, fixedAspectRatio, isMaximized, x, y]);

  // Mount animation
  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
    });
  }, [controls]);

  // ── Drag via top chrome area ─────────────────────────────────────────────
  function startWindowDrag(clientX: number, clientY: number) {
    if (isMaximized) return;

    focusWindow(id);

    const startX = clientX - x.get();
    const startY = clientY - y.get();

    const onMove = (me: PointerEvent) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Keep at least 120px of the window visible on each axis
      const clampedX = Math.max(-(size.width - 120), Math.min(vw - 120, me.clientX - startX));
      const clampedY = Math.max(TOPBAR_H, Math.min(vh - DOCK_BOTTOM_H - 44, me.clientY - startY));
      x.set(clampedX);
      y.set(clampedY);
    };
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  function handleWindowPointerDownCapture(e: React.PointerEvent<HTMLDivElement>) {
    // Bloquer drag touch uniquement sur mobile (pas sur écrans tactiles desktop)
    if (isMaximized || e.button !== 0 || (e.pointerType === 'touch' && isMobileViewport())) return;

    const target = e.target as HTMLElement;
    if (
      target.closest(
        'button, a, input, textarea, select, [role="button"], [data-no-window-drag]'
      )
    ) {
      return;
    }

    const bounds = e.currentTarget.getBoundingClientRect();
    const draggableHeight = isFrameless ? 72 : 44;
    if (e.clientY - bounds.top > draggableHeight) return;

    e.preventDefault();
    startWindowDrag(e.clientX, e.clientY);
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

        if (fixedAspectRatio) {
          const widthDriven =
            dir.includes('e') ||
            dir.includes('w') ||
            Math.abs(dx) >= Math.abs(dy);

          if (widthDriven) {
            nh = Math.max(MIN_H, Math.round(nw / fixedAspectRatio));
            if (dir.includes('n')) ny = startY + (startH - nh);
          } else {
            nw = Math.max(MIN_W, Math.round(nh * fixedAspectRatio));
            if (dir.includes('w')) nx = startX + (startW - nw);
          }
        }

        x.set(nx);
        y.set(ny);
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
      fmAnimate(y, TOPBAR_H, { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] });
      setSize(fitAspectSize({
        width: typeof window !== 'undefined' ? window.innerWidth : 1440,
        height: typeof window !== 'undefined' ? window.innerHeight - TOPBAR_H - DOCK_BOTTOM_H : 900,
      }, fixedAspectRatio));
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
        borderRadius: isMaximized ? 0 : isFrameless ? 28 : 16,
        originX: 0.5,
        originY: 0.5,
      }}
      className={`flex flex-col overflow-hidden shadow-2xl ${
        isActive && !isFrameless ? 'ring-1 ring-white/10' : ''
      } ${className}`}
      onPointerDownCapture={handleWindowPointerDownCapture}
      onPointerDown={() => focusWindow(id)}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 shrink-0 select-none"
        style={{
          height: isFrameless ? 70 : 44,
          position: isFrameless ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          right: isFrameless ? undefined : 0,
          zIndex: 3,
          width: isFrameless ? 150 : undefined,
          alignItems: isFrameless ? 'flex-start' : 'center',
          paddingTop: isFrameless ? 25 : undefined,
          paddingLeft: isFrameless ? 30 : undefined,
          background: isFrameless
            ? 'transparent'
            : isActive ? 'rgba(42,42,42,0.97)' : 'rgba(30,30,30,0.97)',
          borderBottom: isFrameless ? 'none' : '1px solid rgba(255,255,255,0.08)',
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
        {!isFrameless && (
          <>
            <div className="flex items-center gap-2 flex-1 justify-center pointer-events-none">
              {icon && <span className="opacity-60 shrink-0">{icon}</span>}
              <span className="text-[13px] font-medium text-white/75 truncate">{title}</span>
            </div>

            <div className="w-14 shrink-0" />
          </>
        )}
      </div>

      {/* Content — stoppe la propagation touch pour éviter le déclenchement du scrollytelling */}
      <div
        className="flex-1 overflow-hidden"
        data-window-interactive="true"
        style={{ background: 'rgba(22,22,22,0.98)' }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
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
