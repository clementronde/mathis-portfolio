'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';
import {
  useScrollytellingStore,
  getStepAppId,
  getStepFinderFolder,
  SCROLL_STEPS,
} from '@/store/useScrollytellingStore';
import { TopBar } from './TopBar';
import { Dock } from './Dock';
import { DesktopItem } from './DesktopItem';
import { FinderWindow } from './FinderWindow';
import { MailWindow } from './MailWindow';
import { NotesWindow } from './NotesWindow';
import { PhotosWindow } from './PhotosWindow';
import { MapsWindow } from './MapsWindow';
import { MusicWindow } from './MusicWindow';
import { LockScreen } from './LockScreen';
import { Lightbox } from './Lightbox';
import type { AppId } from '@/store/useWindowStore';
import { PROJECTS } from '@/data/projects';
import { PHOTOS } from '@/data/photos';
import { encodeSrc } from '@/utils/path';

// Desktop collage — 5 real projects
const DESKTOP_ITEMS = [
  {
    id: 'course-adidas-item',
    label: 'Course Adidas',
    imageSrc: '/images/desktop/my-first-10k-v0-v8kel475syzc1 1.png',
    imageColor: '#d9f0dc',
    rotate: 0,
    style: { left: '8.5%', top: '15%' },
    width: 285,
    aspectRatio: '413/272',
    type: 'photo' as const,
    action: { type: 'lightbox' },
  },
  {
    id: 'rats-item',
    label: 'Les Rats',
    imageSrc: '/images/projects/25-07-25 SHOOT_LES RATS/MSA00289.avif',
    imageColor: '#0a0a0f',
    rotate: 0,
    style: { left: '4%', bottom: '21%' },
    width: 210,
    aspectRatio: '4/5',
    type: 'photo' as const,
    action: { type: 'finder', folder: 'shoot-les-rats' },
  },
  {
    id: 'family-item',
    label: 'Family',
    imageSrc: '/images/projects/25-12-23 NOEL_AYME/MSA00148.avif',
    imageColor: '#2e1208',
    rotate: 0,
    style: { right: '12%', top: '6%' },
    width: 265,
    aspectRatio: '16/10',
    type: 'photo' as const,
    action: { type: 'finder', folder: 'noel-ayme' },
  },
  {
    id: 'couscous-item',
    label: 'Couscous',
    imageSrc: '/images/desktop/ShootpourleBar-RestaurantLeNouveauMagnoliasitueau129RuedesPyrenees75020Pari-ezgif.com-video-to-gif-converter.gif',
    imageColor: '#2e1a00',
    rotate: 0,
    style: { right: '7%', top: '22%' },
    width: 155,
    aspectRatio: '1/2',
    type: 'photo' as const,
    action: { type: 'lightbox' },
  },
  {
    id: 'album-moment-item',
    label: 'Album du moment',
    imageSrc: '/images/desktop/Album du moment.png',
    imageColor: '#1a0a2e',
    rotate: 0,
    style: { right: '12%', bottom: '16%' },
    width: 250,
    aspectRatio: '1/1',
    type: 'photo' as const,
    action: { type: 'lightbox' },
  },
] as const;


const WINDOWS: { id: AppId; element: React.ReactNode }[] = [
  { id: 'finder',    element: <FinderWindow key="finder" /> },
  { id: 'mail',      element: <MailWindow key="mail" /> },
  { id: 'notes',     element: <NotesWindow key="notes" /> },
  { id: 'photos',    element: <PhotosWindow key="photos" /> },
  { id: 'maps',      element: <MapsWindow key="maps" /> },
  { id: 'music',  element: <MusicWindow key="music" /> },
];

const STATIC_PRELOAD_IMAGES = [
  '/images/wallpaper.jpg',
  '/images/wallpaper.avif',
  '/images/MSA.png',
  '/images/desktop/wallpaperverouillage.png',
  '/images/desktop/Ellipsemathis.png',
  '/images/desktop/Couscous.png',
  '/images/MSA.svg',
  '/images/icons/Findericon.png',
  '/images/icons/Mailicon.png',
  '/images/icons/noteicon.png',
  '/images/icons/Photosicon.png',
  '/images/icons/musiqueIcon.png',
  '/images/icons/localistionicon.png',
  '/images/icons/folder-with-paper.svg',
  '/images/icons/dossiericon.png',
  '/images/icons/lightroomicon.png',
  '/images/icons/photoshopicon.png',
  '/images/icons/premiereproicon.png',
] as const;

const SITE_PRELOAD_IMAGES = Array.from(
  new Set([
    ...STATIC_PRELOAD_IMAGES,
    ...DESKTOP_ITEMS.map((item) => item.imageSrc),
    ...PHOTOS.map((photo) => photo.src),
    ...PROJECTS.flatMap((project) => [project.coverImage, ...project.images]),
  ])
);

const PRELOAD_TOTAL = SITE_PRELOAD_IMAGES.length;

const DESKTOP_ITEM_POSITIONS_KEY = 'portfolio-desktop-item-positions-v2';
const DESKTOP_REFERENCE_SIZE = { width: 1440, height: 900 };

function getDefaultItemPositions() {
  return DESKTOP_ITEMS.reduce<Record<string, React.CSSProperties>>((positions, item) => {
    positions[item.id] = item.style;
    return positions;
  }, {});
}

function parsePercent(value: React.CSSProperties[keyof React.CSSProperties]) {
  if (typeof value !== 'string' || !value.endsWith('%')) return null;
  const percent = Number(value.slice(0, -1));
  return Number.isFinite(percent) ? percent / 100 : null;
}

function parseAspectRatio(value: string) {
  const [width, height] = value.split('/').map(Number);
  if (!width || !height) return 1;
  return width / height;
}

function getMobileItemPosition(item: (typeof DESKTOP_ITEMS)[number]): React.CSSProperties {
  const desktopStyle: React.CSSProperties = item.style;
  const leftPercent = parsePercent(desktopStyle.left);
  const rightPercent = parsePercent(desktopStyle.right);
  const topPercent = parsePercent(desktopStyle.top);
  const bottomPercent = parsePercent(desktopStyle.bottom);
  const desktopHeight = item.width / parseAspectRatio(item.aspectRatio);

  const left =
    leftPercent !== null
      ? leftPercent
      : rightPercent !== null
        ? 1 - rightPercent - item.width / DESKTOP_REFERENCE_SIZE.width
        : 0;
  const top =
    topPercent !== null
      ? topPercent
      : bottomPercent !== null
        ? 1 - bottomPercent - desktopHeight / DESKTOP_REFERENCE_SIZE.height
        : 0;

  return {
    left: `${Math.max(0, Math.min(left, 0.9)) * 100}%`,
    top: `${Math.max(0, Math.min(top, 0.9)) * 100}%`,
  };
}

export function Desktop() {
  const { openWindows, openWindow } = useWindowStore();
  const { step, nextStep, prevStep } = useScrollytellingStore();
  const desktopItemsRef = useRef<HTMLDivElement>(null);
  const preloadImagesRef = useRef<HTMLImageElement[]>([]);
  const [itemPositions, setItemPositions] = useState<Record<string, React.CSSProperties>>(getDefaultItemPositions);
  const scrollCooldown = useRef(false);
  const [locked, setLocked] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [desktopLightboxImage, setDesktopLightboxImage] = useState<string | null>(null);
  const [preloadCompleteCount, setPreloadCompleteCount] = useState(0);
  const [preloadReady, setPreloadReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const savedPositions = window.localStorage.getItem(DESKTOP_ITEM_POSITIONS_KEY);
    if (!savedPositions) return;

    try {
      const parsedPositions = JSON.parse(savedPositions) as Record<string, React.CSSProperties>;
      setItemPositions({
        ...getDefaultItemPositions(),
        ...parsedPositions,
      });
    } catch {
      window.localStorage.removeItem(DESKTOP_ITEM_POSITIONS_KEY);
    }
  }, []);

  useEffect(() => {
    if (!locked || preloadImagesRef.current.length > 0) return;

    let completed = 0;
    let disposed = false;
    const markComplete = () => {
      if (disposed) return;

      completed += 1;
      setPreloadCompleteCount(completed);
      if (completed >= PRELOAD_TOTAL) setPreloadReady(true);
    };

    import('leaflet').catch(() => undefined);

    preloadImagesRef.current = SITE_PRELOAD_IMAGES.map((src) => {
      const image = new Image();
      let settled = false;
      const finishImage = () => {
        if (settled) return;
        settled = true;
        markComplete();
      };

      image.decoding = 'async';
      image.onload = finishImage;
      image.onerror = finishImage;
      image.src = encodeSrc(src);

      if (image.complete) {
        queueMicrotask(finishImage);
      }

      return image;
    });

    if (PRELOAD_TOTAL === 0) setPreloadReady(true);

    return () => {
      disposed = true;
    };
  }, [locked]);

  // Sync step → window open/close
  useEffect(() => {
    const appId = getStepAppId(step);
    const finderFolder = getStepFinderFolder(step);
    const { openWindows: current, openWindow: open, closeWindow: close } = useWindowStore.getState();
    current.forEach((id) => { if (id !== appId) close(id); });
    if (appId) open(appId, appId === 'finder' ? finderFolder : undefined);
  }, [step]);

  // Wheel / touch scroll → advance/retreat step
  useEffect(() => {
    const isInsideInteractiveWindow = (target: EventTarget | null) =>
      target instanceof Element && target.closest('[data-window-interactive="true"]') !== null;

    const handleWheel = (e: WheelEvent) => {
      if (locked) return;
      if (isInsideInteractiveWindow(e.target)) return;
      if (scrollCooldown.current) return;
      scrollCooldown.current = true;
      setTimeout(() => { scrollCooldown.current = false; }, 900);
      if (e.deltaY > 0) nextStep();
      else if (e.deltaY < 0) prevStep();
    };

    let touchStartY = 0;
    let touchStartedInsideWindow = false;
    const handleTouchStart = (e: TouchEvent) => {
      if (locked) return;
      touchStartedInsideWindow = isInsideInteractiveWindow(e.target);
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (locked) return;
      if (touchStartedInsideWindow || isInsideInteractiveWindow(e.target)) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 50 || scrollCooldown.current) return;
      scrollCooldown.current = true;
      setTimeout(() => { scrollCooldown.current = false; }, 900);
      if (delta > 0) nextStep();
      else prevStep();
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [locked, nextStep, prevStep]);

  // Keyboard navigation (arrow keys when no window is open)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (locked) return;
      if (getStepAppId(step) !== null) return; // let window handle its own keys
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [locked, step, nextStep, prevStep]);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        backgroundImage: `url('/images/wallpaper.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#6aa3c5',
      }}
    >

      <motion.div
        className="absolute inset-0"
        animate={{ opacity: locked ? 0 : 1 }}
        transition={{ duration: locked ? 0 : 0.32, ease: 'easeOut' }}
        style={{ pointerEvents: locked ? 'none' : 'auto' }}
      >
        <TopBar />

        {/* Logo MSA — desktop grand, mobile petit */}
        <div className="absolute left-1/2 z-[9] -translate-x-1/2 pointer-events-none select-none"
          style={{ top: '72px' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/MSA.svg"
            alt="MSA"
            className="block w-auto hidden md:block"
            style={{ height: 58, filter: 'drop-shadow(0 2px 20px rgba(0,0,0,0.45))' }}
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/MSA.svg"
            alt="MSA"
            className="block w-auto md:hidden"
            style={{ height: 36, filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.5))' }}
            draggable={false}
          />
        </div>

        {/* Desktop collage — toutes tailles, largeurs réduites sur mobile */}
        <div ref={desktopItemsRef} className="absolute inset-0 z-[10]">
          {DESKTOP_ITEMS.map((item) => (
            <DesktopItem
              key={item.id}
              label={item.label}
              imageSrc={item.imageSrc}
              imageColor={item.imageColor}
              rotate={item.rotate}
              style={isMobile ? getMobileItemPosition(item) : itemPositions[item.id]}
              width={isMobile ? Math.round(item.width * 0.38) : item.width}
              aspectRatio={item.aspectRatio}
              type={item.type}
              dragConstraints={desktopItemsRef}
              onMove={(position) => {
                setItemPositions((positions) => {
                  const nextPositions = {
                    ...positions,
                    [item.id]: position,
                  };
                  window.localStorage.setItem(DESKTOP_ITEM_POSITIONS_KEY, JSON.stringify(nextPositions));
                  return nextPositions;
                });
              }}
              onClick={() => {
                if (item.action.type === 'lightbox' && item.imageSrc) {
                  setDesktopLightboxImage(item.imageSrc);
                  return;
                }

                const folder = (item.action as { type: string; folder?: string }).folder;
                openWindow('finder', folder);
              }}
            />
          ))}
        </div>

        {desktopLightboxImage && (
          <Lightbox
            images={[desktopLightboxImage]}
            colors={['#111111']}
            current={0}
            onClose={() => setDesktopLightboxImage(null)}
            onPrev={() => undefined}
            onNext={() => undefined}
          />
        )}

        {/* Windows — desktop + mobile (Window adapte sa taille via responsiveSize) */}
        <div className="absolute inset-0 z-[20] pointer-events-none">
          <div className="pointer-events-auto">
            <AnimatePresence>
              {WINDOWS.filter(({ id }) => openWindows.includes(id)).map(({ element }) => element)}
            </AnimatePresence>
          </div>
        </div>

        <Dock />

        {/* ── Scroll hint (step 0, desktop uniquement) ── */}
        <AnimatePresence>
          {step === 0 && (
            <motion.div
              key="scroll-hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] hidden md:flex flex-col items-center gap-1.5 pointer-events-none select-none"
            >
              <span className="text-white/50 text-[11px] tracking-widest uppercase">Défiler pour explorer</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              >
                <ChevronDown size={18} className="text-white/40" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step progress dots ── */}
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[80] hidden md:flex flex-col gap-2 pointer-events-none select-none">
          {SCROLL_STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 6 : 5,
                height: i === step ? 6 : 5,
                background: i === step ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.22)',
                transform: i === step ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Lock screen overlay ── */}
      <AnimatePresence>
        {locked && (
          <LockScreen
            key="lockscreen"
            canUnlock={preloadReady}
            loadedImages={preloadCompleteCount}
            totalImages={PRELOAD_TOTAL}
            onUnlock={() => {
              if (preloadReady) setLocked(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
