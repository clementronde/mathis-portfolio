'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWindowStore } from '@/store/useWindowStore';
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
    id: 'noclout-item',
    label: 'NOCLOUT',
    imageSrc: '/images/projects/24-11-02 NOCLOUT/MSA00088.avif',
    imageColor: '#0a0a0a',
    rotate: -3,
    style: { left: '5%', top: '13%' },
    width: 160,
    aspectRatio: '2/3',
    type: 'photo' as const,
    action: { type: 'finder', folder: 'noclout' },
  },
  {
    id: 'rats-item',
    label: 'Les Rats',
    imageSrc: '/images/projects/25-07-25 SHOOT_LES RATS/MSA00016.avif',
    imageColor: '#0a0a0f',
    rotate: 1.5,
    style: { left: '21%', top: '17%' },
    width: 150,
    aspectRatio: '3/4',
    type: 'photo' as const,
    action: { type: 'finder', folder: 'shoot-les-rats' },
  },
  {
    id: 'mariage-item',
    label: 'Mariage H&E',
    imageSrc: '/images/projects/25-08-22 MARIAGE H&E/MSA00038_1.avif',
    imageColor: '#1a1208',
    rotate: 0.5,
    style: { left: '40%', top: '12%' },
    width: 170,
    aspectRatio: '4/5',
    type: 'photo' as const,
    action: { type: 'finder', folder: 'mariage-he' },
  },
  {
    id: 'lisboa-item',
    label: 'Lisboa',
    imageSrc: '/images/projects/26-04-03 LISBOA/MSA00125.avif',
    imageColor: '#1a1e0a',
    rotate: 2,
    style: { right: '17%', top: '10%' },
    width: 175,
    aspectRatio: '4/3',
    type: 'photo' as const,
    action: { type: 'finder', folder: 'lisboa' },
  },
  {
    id: 'berlin-item',
    label: 'Berlin',
    imageSrc: '/images/projects/25-02-20 BERLIN/MSA00807.avif',
    imageColor: '#0f0f0f',
    rotate: -1.5,
    style: { right: '4%', top: '7%' },
    width: 140,
    aspectRatio: '3/4',
    type: 'photo' as const,
    action: { type: 'finder', folder: 'berlin' },
  },
] as const;

function MobileGrid() {
  const { openWindow } = useWindowStore();
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
            onClick={() => openWindow(id)}
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

const DESKTOP_ITEM_POSITIONS_KEY = 'portfolio-desktop-item-positions';

function getDefaultItemPositions() {
  return DESKTOP_ITEMS.reduce<Record<string, React.CSSProperties>>((positions, item) => {
    positions[item.id] = item.style;
    return positions;
  }, {});
}

export function Desktop() {
  const { openWindows, openWindow } = useWindowStore();
  const desktopItemsRef = useRef<HTMLDivElement>(null);
  const [itemPositions, setItemPositions] = useState<Record<string, React.CSSProperties>>(getDefaultItemPositions);

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

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        backgroundImage: `url('/images/wallpaper.avif')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#6aa3c5',
      }}
    >

      <TopBar />

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
    </div>
  );
}
