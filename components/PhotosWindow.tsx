'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { Lightbox } from './Lightbox';
import { PROJECTS } from '@/data/projects';
import { encodeSrc } from '@/utils/path';
import { Folder, ImageIcon, Minus, Plus } from 'lucide-react';
import { useScrollytellingStore, getStepPhotoScrollProgress } from '@/store/useScrollytellingStore';

// Flatten all project images into a single list, tagged by project id
const ALL_PHOTOS = PROJECTS.flatMap((proj) =>
  proj.images
    .filter((img) => /\.(avif|jpg|jpeg|JPG|webp|png)$/i.test(img))
    .map((img, i) => ({ src: img, color: proj.color, projectId: proj.id, key: `${proj.id}-${i}` }))
);

const ZOOM_MIN = 0;
const ZOOM_MAX = 5;
const DEFAULT_ZOOM = 3;
const COLUMNS_BY_ZOOM = [8, 7, 6, 4, 3, 2];
const WHEEL_ZOOM_STEP = 420;
const PINCH_ZOOM_IN_SCALE = 1.8;
const PINCH_ZOOM_OUT_SCALE = 0.55;
const ZOOM_COOLDOWN_MS = 260;

export function PhotosWindow() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const step = useScrollytellingStore((state) => state.step);
  const windowContentRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const wheelZoomDeltaRef = useRef(0);
  const currentZoomRef = useRef(DEFAULT_ZOOM);
  const gestureStartZoomRef = useRef(DEFAULT_ZOOM);
  const lastZoomChangeRef = useRef(0);

  const filtered = selectedProject
    ? ALL_PHOTOS.filter((p) => p.projectId === selectedProject)
    : ALL_PHOTOS;

  const currentProject = PROJECTS.find((p) => p.id === selectedProject);
  const columnCount = COLUMNS_BY_ZOOM[zoomLevel];
  currentZoomRef.current = zoomLevel;
  const setClampedZoom = (nextZoom: number | ((current: number) => number)) => {
    setZoomLevel((current) => {
      const value = typeof nextZoom === 'function' ? nextZoom(current) : nextZoom;
      return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
    });
  };
  const nudgeZoom = (direction: -1 | 1) => {
    const now = Date.now();
    if (now - lastZoomChangeRef.current < ZOOM_COOLDOWN_MS) return;

    lastZoomChangeRef.current = now;
    setClampedZoom((current) => current + direction);
  };

  useEffect(() => {
    const progress = getStepPhotoScrollProgress(step);
    if (progress === undefined) return;

    setSelectedProject(null);
    setLightboxIndex(null);

    requestAnimationFrame(() => {
      const gallery = galleryRef.current;
      if (!gallery) return;

      const maxScroll = gallery.scrollHeight - gallery.clientHeight;
      gallery.scrollTo({
        top: Math.max(0, maxScroll * progress),
        behavior: 'smooth',
      });
    });
  }, [step]);

  useEffect(() => {
    const windowContent = windowContentRef.current;
    if (!windowContent) return;

    const stopPropagation = (event: Event) => {
      event.stopPropagation();
    };

    windowContent.addEventListener('wheel', stopPropagation);
    windowContent.addEventListener('touchstart', stopPropagation);
    windowContent.addEventListener('touchmove', stopPropagation);
    windowContent.addEventListener('touchend', stopPropagation);

    return () => {
      windowContent.removeEventListener('wheel', stopPropagation);
      windowContent.removeEventListener('touchstart', stopPropagation);
      windowContent.removeEventListener('touchmove', stopPropagation);
      windowContent.removeEventListener('touchend', stopPropagation);
    };
  }, []);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const handleWheelZoom = (event: WheelEvent) => {
      if (!event.ctrlKey) return;

      event.preventDefault();
      wheelZoomDeltaRef.current -= event.deltaY;

      if (Math.abs(wheelZoomDeltaRef.current) < WHEEL_ZOOM_STEP) return;

      nudgeZoom(wheelZoomDeltaRef.current > 0 ? 1 : -1);
      wheelZoomDeltaRef.current = 0;
    };

    const handleGestureStart = (event: Event) => {
      event.preventDefault();
      gestureStartZoomRef.current = currentZoomRef.current;
    };

    const handleGestureChange = (event: Event) => {
      const gestureEvent = event as Event & { scale?: number };
      const scale = gestureEvent.scale ?? 1;

      event.preventDefault();

      if (scale >= PINCH_ZOOM_IN_SCALE && currentZoomRef.current === gestureStartZoomRef.current) {
        nudgeZoom(1);
      }

      if (scale <= PINCH_ZOOM_OUT_SCALE && currentZoomRef.current === gestureStartZoomRef.current) {
        nudgeZoom(-1);
      }
    };

    gallery.addEventListener('wheel', handleWheelZoom, { passive: false });
    gallery.addEventListener('gesturestart', handleGestureStart, { passive: false });
    gallery.addEventListener('gesturechange', handleGestureChange, { passive: false });

    return () => {
      gallery.removeEventListener('wheel', handleWheelZoom);
      gallery.removeEventListener('gesturestart', handleGestureStart);
      gallery.removeEventListener('gesturechange', handleGestureChange);
    };
  }, []);

  return (
    <Window
      id="photos"
      title="Photos"
      icon={<AppIcon id="photos" size={16} />}
      chrome="frameless"
      defaultSize={{ width: 860, height: 580 }}
    >
      <div ref={windowContentRef} className="flex h-full" style={{ background: '#ffffff', color: '#1d1d1f' }}>
        {/* Sidebar */}
        <div
          className="w-[210px] shrink-0 flex flex-col overflow-y-auto"
          style={{
            paddingTop: 100,
            paddingBottom: 24,
            overscrollBehavior: 'contain',
            background: '#fbfbfb',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            boxShadow: '22px 0 42px -34px rgba(0,0,0,0.72)',
            zIndex: 2,
          }}
        >
          {/* Library */}
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-3 px-0 py-2 mx-[22px] rounded-lg text-[17px] font-medium transition-colors"
            style={{
              background: !selectedProject ? 'rgba(0,0,0,0.045)' : 'transparent',
              color: '#1d1d1f',
            }}
          >
            <ImageIcon size={22} className="shrink-0" strokeWidth={2} />
            <span>Bibliothèque</span>
          </button>
          <div className="mx-[22px] mt-1 mb-1 text-[12px]" style={{ color: 'rgba(60,60,67,0.45)' }}>{ALL_PHOTOS.length} photos</div>

          {/* Albums */}
          <div className="mt-6 mb-4 px-[28px] text-[13px] font-semibold" style={{ color: 'rgba(60,60,67,0.68)' }}>
            Albums
          </div>
          {PROJECTS.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setSelectedProject(proj.id)}
              className="flex items-center gap-3 px-0 py-2 mx-[22px] rounded-lg text-[15px] font-medium transition-colors text-left"
              style={{
                background: selectedProject === proj.id ? 'rgba(0,0,0,0.045)' : 'transparent',
                color: '#1d1d1f',
              }}
            >
              <Folder size={21} className="shrink-0" strokeWidth={2} />
              <span className="truncate">{proj.title}</span>
              <span className="ml-auto text-[12px] shrink-0" style={{ color: 'rgba(60,60,67,0.42)' }}>{proj.images.length}</span>
            </button>
          ))}
        </div>

        {/* Main gallery */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div
            className="h-[86px] px-7 shrink-0 flex items-center gap-2 min-w-0"
            style={{ background: '#ffffff' }}
          >
            <span className="text-[23px] font-bold truncate min-w-0" style={{ color: 'rgba(0,0,0,0.7)' }}>
              {currentProject ? currentProject.title : 'Bibliothèque'}
            </span>
            <span className="text-[14px] ml-1 shrink-0" style={{ color: 'rgba(0,0,0,0.35)' }}>
              · {filtered.length} photo{filtered.length > 1 ? 's' : ''}
            </span>
            {currentProject && (
              <span className="text-[11px] ml-auto shrink-0" style={{ color: 'rgba(0,0,0,0.3)' }}>
                {currentProject.location} · {currentProject.year}
              </span>
            )}
            <div className="ml-auto flex shrink-0 items-center gap-2" style={{ color: 'rgba(0,0,0,0.52)' }}>
              <button
                type="button"
                onClick={() => setClampedZoom((current) => current - 1)}
                aria-label="Réduire la taille des photos"
                className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-black/5 disabled:opacity-35"
                disabled={zoomLevel === ZOOM_MIN}
              >
                <Minus size={16} strokeWidth={2.2} />
              </button>
              <input
                aria-label="Taille des photos"
                type="range"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={1}
                value={zoomLevel}
                onChange={(event) => setClampedZoom(Number(event.target.value))}
                className="h-1 w-[92px] accent-[#007aff]"
              />
              <button
                type="button"
                onClick={() => setClampedZoom((current) => current + 1)}
                aria-label="Agrandir les photos"
                className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-black/5 disabled:opacity-35"
                disabled={zoomLevel === ZOOM_MAX}
              >
                <Plus size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div ref={galleryRef} className="flex-1 overflow-y-auto px-5 pb-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProject ?? 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="gap-2"
                style={{ columnCount, columnGap: 8 }}
              >
                {filtered.map((photo, idx) => (
                  <motion.button
                    key={photo.key}
                    onClick={() => setLightboxIndex(idx)}
                    aria-label={`Photo ${idx + 1}`}
                    className="block w-full mb-2 rounded-md overflow-hidden outline-none"
                    whileHover={{ opacity: 0.88 }}
                    transition={{ duration: 0.1 }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: idx % 5 === 0 ? '1/1' : idx % 5 === 1 ? '3/4' : idx % 5 === 2 ? '4/3' : idx % 5 === 3 ? '2/3' : '4/5',
                        background: photo.color,
                        backgroundImage: `url("${encodeSrc(photo.src)}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={filtered.map((p) => p.src)}
          colors={filtered.map((p) => p.color)}
          current={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i! - 1 + filtered.length) % filtered.length)}
          onNext={() => setLightboxIndex((i) => (i! + 1) % filtered.length)}
        />
      )}
    </Window>
  );
}
