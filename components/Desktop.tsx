'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWindowStore } from '@/store/useWindowStore';
import { HomeNotifications } from './HomeNotifications';
import { Dock } from './Dock';
import { DesktopItem } from './DesktopItem';
import { DESKTOP_FOLDER_PREFIX, FinderWindow, RECENT_DOCUMENT_PROJECT_COUNT } from './FinderWindow';
import { MailWindow } from './MailWindow';
import { NotesWindow } from './NotesWindow';
import { PhotosWindow } from './PhotosWindow';
import { MapsWindow } from './MapsWindow';
import { MusicWindow } from './MusicWindow';
import { PhotoshopWindow } from './PhotoshopWindow';
import { PremiereWindow } from './PremiereWindow';
import { LockScreen } from './LockScreen';
import { Lightbox } from './Lightbox';
import type { AppId } from '@/store/useWindowStore';
import { PROJECTS } from '@/data/projects';
import { PHOTOS } from '@/data/photos';
import { DESKTOP_ITEMS } from '@/data/desktopItems';
import { encodeSrc } from '@/utils/path';
import { DesktopTour } from './DesktopTour';


const WINDOWS: { id: AppId; element: React.ReactNode }[] = [
  { id: 'finder',    element: <FinderWindow key="finder" /> },
  { id: 'mail',      element: <MailWindow key="mail" /> },
  { id: 'notes',     element: <NotesWindow key="notes" /> },
  { id: 'photos',    element: <PhotosWindow key="photos" /> },
  { id: 'maps',      element: <MapsWindow key="maps" /> },
  { id: 'music',  element: <MusicWindow key="music" /> },
  { id: 'photoshop', element: <PhotoshopWindow key="photoshop" /> },
  { id: 'premiere',  element: <PremiereWindow key="premiere" /> },
];

const STATIC_PRELOAD_IMAGES = [
  '/images/wallpaper.jpg',
  '/images/wallpaper.avif',
  '/images/desktop/wallpaperverouillage.avif',
  '/images/desktop/Ellipsemathis.png',
  '/images/desktop/Couscous.png',
  '/images/desktop/FilesRedDerniersProjets.png',
  '/images/icons/Findericon.png',
  '/images/icons/Mailicon.png',
  '/images/icons/noteicon.png',
  '/images/icons/Photosicon.png',
  '/images/icons/musiqueIcon.png',
  '/images/icons/plansicon.png',
  '/images/icons/folder-with-paper.svg',
  '/images/icons/dossiericon.png',
  '/images/icons/lightroomicon.png',
  '/images/icons/photoshopicon.png',
  '/images/icons/premiereproicon.png',
  '/Photoshop/Photoshopbg.png',
  '/Photoshop/imagephotoshop.png',
  '/premiere/Premierebg.png',
  '/images/premiereprobgmobile.png',
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

const DESKTOP_ITEM_POSITIONS_KEY = 'portfolio-desktop-item-positions-v4';
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
  const { openWindows, openWindow, openPhotosAlbum } = useWindowStore();
  const desktopItemsRef = useRef<HTMLDivElement>(null);
  const preloadImagesRef = useRef<HTMLImageElement[]>([]);
  const [itemPositions, setItemPositions] = useState<Record<string, React.CSSProperties>>(getDefaultItemPositions);
  const [locked, setLocked] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [desktopLightboxImage, setDesktopLightboxImage] = useState<string | null>(null);
  const [preloadCompleteCount, setPreloadCompleteCount] = useState(0);
  const [preloadReady, setPreloadReady] = useState(false);
  const [showTour, setShowTour] = useState(false);
  // À la fin de la visite, l'icône Photos du dock est mise en avant jusqu'à son ouverture
  const [photosHint, setPhotosHint] = useState(false);
  const finishTour = useCallback(() => {
    setShowTour(false);
    setPhotosHint(true);
  }, []);
  const photosOpen = openWindows.includes('photos');
  useEffect(() => {
    if (photosOpen) setPhotosHint(false);
  }, [photosOpen]);

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
      // Permet de relancer le préchargement si l'effet est rejoué (StrictMode en dev)
      preloadImagesRef.current = [];
    };
  }, [locked]);

  useEffect(() => {
    if (locked) return;

    const tourTimer = window.setTimeout(() => setShowTour(true), 780);
    return () => window.clearTimeout(tourTimer);
  }, [locked]);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        // Le fond du wallpaper est noir : on le réduit sans couture visible
        backgroundImage: `url('/images/wallpaper.jpg')`,
        backgroundSize: 'auto 78%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000000',
      }}
    >

      <motion.div
        className="absolute inset-0"
        animate={{ opacity: locked ? 0 : 1 }}
        transition={{ duration: locked ? 0 : 0.32, ease: 'easeOut' }}
        style={{ pointerEvents: locked ? 'none' : 'auto' }}
      >
        <HomeNotifications />

        {/* Desktop collage — toutes tailles, largeurs réduites sur mobile */}
        <div ref={desktopItemsRef} data-tour="desktop-items" className="pointer-events-none absolute inset-0 z-[10]">
          {DESKTOP_ITEMS.map((item) => (
            <DesktopItem
              key={item.id}
              label={item.label}
              subtitle={
                item.action.type === 'finder' && item.action.folder === 'projets-recents'
                  ? `${RECENT_DOCUMENT_PROJECT_COUNT} éléments`
                  : undefined
              }
              imageSrc={item.imageSrc}
              imageColor={item.imageColor}
              rotate={item.rotate}
              style={isMobile ? getMobileItemPosition(item) : itemPositions[item.id]}
              width={isMobile ? Math.round(item.width * 0.5) : item.width}
              aspectRatio={item.aspectRatio}
              type={item.type}
              finderSelectHover={item.finderSelectHover ?? false}
              blink={item.blink ?? false}
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
                if (item.action.type === 'lightbox') {
                  setDesktopLightboxImage(item.imageSrc);
                  return;
                }

                if (item.action.type === 'photos') {
                  // Sur ordinateur, la photo ouvre le dossier Bureau du Finder ; sur mobile, l'album Photos
                  if (isMobile) openPhotosAlbum(item.action.album ?? null);
                  else openWindow('finder', `${DESKTOP_FOLDER_PREFIX}${item.id}`);
                  return;
                }

                openWindow('finder', item.action.folder);
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

        <Dock highlightPhotos={photosHint && !showTour} onPhotosClick={() => setPhotosHint(false)} />

        {showTour && <DesktopTour onFinish={finishTour} />}
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
              if (preloadReady) {
                setLocked(false);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
