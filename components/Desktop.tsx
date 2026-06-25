'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';
import {
  useScrollytellingStore,
  getOpenStepIndexForApp,
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
import { CreativeAppWindow } from './CreativeAppWindow';
import { AppIcon } from './icons/AppIcons';
import type { AppId } from '@/store/useWindowStore';

// Desktop collage — 5 real projects
const DESKTOP_ITEMS = [
  {
    id: 'course-adidas-item',
    label: 'Course Adidas',
    imageSrc: undefined,
    imageColor: '#d9f0dc',
    rotate: 0,
    style: { left: '8.5%', top: '15%' },
    width: 285,
    aspectRatio: '16/10',
    type: 'map' as const,
    action: { type: 'finder', folder: 'hrc-berck' },
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
    imageSrc: '/images/projects/23-01 Maroc/DSC_0153.avif',
    imageColor: '#2e1a00',
    rotate: 0,
    style: { right: '3.5%', top: '22%' },
    width: 155,
    aspectRatio: '3/4',
    type: 'photo' as const,
    action: { type: 'finder', folder: 'maroc-2023' },
  },
  {
    id: 'album-moment-item',
    label: 'Album du moment',
    imageSrc: '/images/projects/25-10-17 HEAVEN_ALTERANTS/V3 (1).avif',
    imageColor: '#1a0a2e',
    rotate: 0,
    style: { right: '12%', bottom: '16%' },
    width: 250,
    aspectRatio: '4/3',
    type: 'photo' as const,
    action: { type: 'finder', folder: 'heaven-alterants' },
  },
] as const;

function MobileGrid() {
  const { openWindow } = useWindowStore();
  const setStep = useScrollytellingStore((state) => state.setStep);
  const apps: { id: AppId; label: string }[] = [
    { id: 'finder', label: 'Finder' },
    { id: 'mail', label: 'Mail' },
    { id: 'notes', label: 'Notes' },
    { id: 'photos', label: 'Photos' },
    { id: 'music', label: 'Music' },
    { id: 'maps', label: 'Maps' },
    { id: 'lightroom', label: 'Lightroom' },
    { id: 'photoshop', label: 'Photoshop' },
    { id: 'premiere', label: 'Premiere' },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 pt-10">
      <div className="grid grid-cols-4 gap-5">
        {apps.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => {
              openWindow(id);
              setStep(getOpenStepIndexForApp(id));
            }}
            aria-label={`Ouvrir ${label}`}
            className="flex flex-col items-center gap-1.5 group"
          >
            <AppIcon id={id} size={60} />
            <span className="text-white text-[11px] opacity-70 group-hover:opacity-100 transition-opacity">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const WINDOWS: { id: AppId; element: React.ReactNode }[] = [
  { id: 'finder',    element: <FinderWindow key="finder" /> },
  { id: 'mail',      element: <MailWindow key="mail" /> },
  { id: 'notes',     element: <NotesWindow key="notes" /> },
  { id: 'photos',    element: <PhotosWindow key="photos" /> },
  { id: 'maps',      element: <MapsWindow key="maps" /> },
  { id: 'music',     element: <MusicWindow key="music" /> },
  { id: 'lightroom', element: <CreativeAppWindow key="lightroom" id="lightroom" /> },
  { id: 'photoshop', element: <CreativeAppWindow key="photoshop" id="photoshop" /> },
  { id: 'premiere',  element: <CreativeAppWindow key="premiere" id="premiere" /> },
];

const DESKTOP_ITEM_POSITIONS_KEY = 'portfolio-desktop-item-positions-v2';

function getDefaultItemPositions() {
  return DESKTOP_ITEMS.reduce<Record<string, React.CSSProperties>>((positions, item) => {
    positions[item.id] = item.style;
    return positions;
  }, {});
}

export function Desktop() {
  const { openWindows, openWindow } = useWindowStore();
  const { step, nextStep, prevStep } = useScrollytellingStore();
  const desktopItemsRef = useRef<HTMLDivElement>(null);
  const [itemPositions, setItemPositions] = useState<Record<string, React.CSSProperties>>(getDefaultItemPositions);
  const scrollCooldown = useRef(false);

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
    const handleWheel = (e: WheelEvent) => {
      if (scrollCooldown.current) return;
      scrollCooldown.current = true;
      setTimeout(() => { scrollCooldown.current = false; }, 900);
      if (e.deltaY > 0) nextStep();
      else if (e.deltaY < 0) prevStep();
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
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
  }, [nextStep, prevStep]);

  // Keyboard navigation (arrow keys when no window is open)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
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
  }, [step, nextStep, prevStep]);

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

      <TopBar />

      <div
        className="absolute left-1/2 top-[72px] z-[9] -translate-x-1/2 hidden md:block pointer-events-none select-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/MSA.svg"
          alt="MSA"
          className="block h-[58px] w-auto"
          draggable={false}
          style={{ filter: 'drop-shadow(0 2px 20px rgba(0,0,0,0.45))' }}
        />
      </div>

      {/* Desktop collage — desktop only */}
      <div ref={desktopItemsRef} className="absolute inset-0 z-[10] hidden md:block">
        {DESKTOP_ITEMS.map((item) => (
          <DesktopItem
            key={item.id}
            label={item.label}
            imageSrc={item.imageSrc}
            imageColor={item.imageColor}
            rotate={item.rotate}
            style={itemPositions[item.id]}
            width={item.width}
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
              const folder = (item.action as { type: string; folder?: string }).folder;
              openWindow('finder', folder);
            }}
          />
        ))}
      </div>

      {/* Mobile grid */}
      <div className="absolute inset-0 z-[10] md:hidden">
        <MobileGrid />
      </div>

      {/* Windows — desktop */}
      <div className="absolute inset-0 z-[20] pointer-events-none hidden md:block">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {WINDOWS.filter(({ id }) => openWindows.includes(id)).map(({ element }) => element)}
          </AnimatePresence>
        </div>
      </div>

      {/* Windows — mobile fullscreen */}
      <div className="absolute inset-0 z-[20] pointer-events-none md:hidden">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {openWindows.includes('finder')    && <div key="finder-m"    className="absolute inset-0 pt-7"><FinderWindow /></div>}
            {openWindows.includes('mail')      && <div key="mail-m"      className="absolute inset-0 pt-7"><MailWindow /></div>}
            {openWindows.includes('notes')     && <div key="notes-m"     className="absolute inset-0 pt-7"><NotesWindow /></div>}
            {openWindows.includes('photos')    && <div key="photos-m"    className="absolute inset-0 pt-7"><PhotosWindow /></div>}
            {openWindows.includes('maps')      && <div key="maps-m"      className="absolute inset-0 pt-7"><MapsWindow /></div>}
            {openWindows.includes('music')     && <div key="music-m"     className="absolute inset-0 pt-7"><MusicWindow /></div>}
            {openWindows.includes('lightroom') && <div key="lr-m"        className="absolute inset-0 pt-7"><CreativeAppWindow id="lightroom" /></div>}
            {openWindows.includes('photoshop') && <div key="ps-m"        className="absolute inset-0 pt-7"><CreativeAppWindow id="photoshop" /></div>}
            {openWindows.includes('premiere')  && <div key="pr-m"        className="absolute inset-0 pt-7"><CreativeAppWindow id="premiere" /></div>}
          </AnimatePresence>
        </div>
      </div>

      <Dock />

      {/* ── Scroll hint (step 0 only) ── */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div
            key="scroll-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[80] flex flex-col items-center gap-1.5 pointer-events-none select-none"
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
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[80] flex flex-col gap-2 pointer-events-none select-none">
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
    </div>
  );
}
