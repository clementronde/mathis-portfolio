'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { PROJECTS } from '@/data/projects';
import { encodeSrc } from '@/utils/path';
import { useWindowStore } from '@/store/useWindowStore';
import { ChevronLeft, ChevronRight, Folder, ImageIcon, Minus, Plus, X } from 'lucide-react';

// Flatten all project images into a single list, tagged by project id
const ALL_PHOTOS = PROJECTS.flatMap((proj) =>
  proj.images
    .filter((img) => /\.(avif|jpg|jpeg|JPG|webp|png)$/i.test(img))
    .map((img, i) => ({
      src: img,
      color: proj.color,
      projectId: proj.id,
      projectTitle: proj.title,
      category: proj.category,
      location: proj.location,
      year: proj.year,
      description: proj.description,
      key: `${proj.id}-${i}`,
    }))
);

const ZOOM_MIN = 0;
const ZOOM_MAX = 5;
const DEFAULT_ZOOM = 3;
const TILE_WIDTH_BY_ZOOM = [70, 82, 96, 116, 142, 176];
const WHEEL_ZOOM_STEP = 420;
const PINCH_ZOOM_IN_SCALE = 1.8;
const PINCH_ZOOM_OUT_SCALE = 0.55;
const ZOOM_COOLDOWN_MS = 260;

export function PhotosWindow() {
  const openWindow = useWindowStore((state) => state.openWindow);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [isMobile, setIsMobile] = useState(false);
  const windowContentRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const wheelZoomDeltaRef = useRef(0);
  const currentZoomRef = useRef(DEFAULT_ZOOM);
  const gestureStartZoomRef = useRef(DEFAULT_ZOOM);
  const lastZoomChangeRef = useRef(0);

  const filtered = selectedProject
    ? ALL_PHOTOS.filter((p) => p.projectId === selectedProject)
    : ALL_PHOTOS;

  const currentProject = PROJECTS.find((p) => p.id === selectedProject);
  const tileWidth = TILE_WIDTH_BY_ZOOM[zoomLevel];
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
          className={`${isMobile ? 'w-[110px]' : 'w-[210px]'} shrink-0 flex flex-col overflow-y-auto`}
          style={{
            paddingTop: isMobile ? 44 : 100,
            paddingBottom: 24,
            overscrollBehavior: 'contain',
            background: '#fbfbfb',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            boxShadow: '22px 0 42px -34px rgba(0,0,0,0.72)',
            zIndex: 2,
          }}
        >
          <button
            onClick={() => setSelectedProject(null)}
            className={`flex items-center ${isMobile ? 'gap-1.5 py-1.5 mx-[6px] text-[10px]' : 'gap-3 py-2 mx-[22px] text-[17px]'} px-0 rounded-lg font-medium transition-colors`}
            style={{
              background: !selectedProject ? 'rgba(0,0,0,0.045)' : 'transparent',
              color: '#1d1d1f',
            }}
          >
            <ImageIcon size={isMobile ? 13 : 22} className="shrink-0" strokeWidth={2} />
            <span className="truncate">Bibliothèque</span>
          </button>
          {!isMobile && (
            <>
              <div className="mx-[22px] mt-1 mb-1 text-[12px]" style={{ color: 'rgba(60,60,67,0.45)' }}>{ALL_PHOTOS.length} photos</div>
              <div className="mt-6 mb-4 px-[28px] text-[13px] font-semibold" style={{ color: 'rgba(60,60,67,0.68)' }}>Albums</div>
            </>
          )}
          {isMobile && <div className="mx-[6px] mt-3 mb-2 text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(60,60,67,0.5)' }}>Albums</div>}
          {PROJECTS.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setSelectedProject(proj.id)}
              className={`flex items-center ${isMobile ? 'gap-1.5 py-1 mx-[6px] text-[10px]' : 'gap-3 py-2 mx-[22px] text-[15px]'} px-0 rounded-lg font-medium transition-colors text-left`}
              style={{
                background: selectedProject === proj.id ? 'rgba(0,0,0,0.045)' : 'transparent',
                color: '#1d1d1f',
              }}
            >
              <Folder size={isMobile ? 13 : 21} className="shrink-0" strokeWidth={2} />
              <span className="truncate">{proj.title}</span>
              {!isMobile && <span className="ml-auto text-[12px] shrink-0" style={{ color: 'rgba(60,60,67,0.42)' }}>{proj.images.length}</span>}
            </button>
          ))}
        </div>

        {/* Main gallery */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div
            className={`${isMobile ? 'flex items-end px-3 pb-2' : 'h-[86px] px-7 flex items-center'} shrink-0 gap-2 min-w-0`}
            style={{ background: '#ffffff', paddingTop: isMobile ? 44 : undefined }}
          >
            <span className={`${isMobile ? 'text-[13px]' : 'text-[23px]'} font-bold truncate min-w-0`} style={{ color: 'rgba(0,0,0,0.7)' }}>
              {currentProject ? currentProject.title : 'Bibliothèque'}
            </span>
            <span className={`${isMobile ? 'text-[11px]' : 'text-[14px]'} ml-1 shrink-0`} style={{ color: 'rgba(0,0,0,0.35)' }}>
              · {filtered.length}
            </span>
            <div className="ml-auto flex shrink-0 items-center gap-1.5" style={{ color: 'rgba(0,0,0,0.52)' }}>
              <button
                type="button"
                onClick={() => setClampedZoom((current) => current - 1)}
                aria-label="Réduire la taille des photos"
                className="grid h-6 w-6 place-items-center rounded-md transition-colors hover:bg-black/5 disabled:opacity-35"
                disabled={zoomLevel === ZOOM_MIN}
              >
                <Minus size={13} strokeWidth={2.2} />
              </button>
              {!isMobile && (
                <input
                  aria-label="Taille des photos"
                  type="range"
                  min={ZOOM_MIN}
                  max={ZOOM_MAX}
                  step={1}
                  value={zoomLevel}
                  onChange={(event) => setClampedZoom(Number(event.target.value))}
                  className="h-1 w-[72px] accent-[#007aff]"
                />
              )}
              <button
                type="button"
                onClick={() => setClampedZoom((current) => current + 1)}
                aria-label="Agrandir les photos"
                className="grid h-6 w-6 place-items-center rounded-md transition-colors hover:bg-black/5 disabled:opacity-35"
                disabled={zoomLevel === ZOOM_MAX}
              >
                <Plus size={13} strokeWidth={2.2} />
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
                className="photos-random-grid"
                style={{
                  '--photo-tile': `${tileWidth}px`,
                  '--photo-row': `${Math.round(tileWidth * 0.76)}px`,
                } as React.CSSProperties}
              >
                {filtered.map((photo, idx) => (
                  <motion.button
                    key={photo.key}
                    onClick={() => setLightboxIndex(idx)}
                    aria-label={`Photo ${idx + 1}`}
                    className={`photos-random-tile photos-random-tile--${idx % 11}`}
                    whileHover={{ scale: 0.985, opacity: 0.9 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: photo.color,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={encodeSrc(photo.src)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <PhotoDetails
          photos={filtered}
          current={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i! - 1 + filtered.length) % filtered.length)}
          onNext={() => setLightboxIndex((i) => (i! + 1) % filtered.length)}
          onOpenAlbum={(projectId) => {
            setLightboxIndex(null);
            openWindow('finder', projectId);
          }}
        />
      )}
    </Window>
  );
}

type GalleryPhoto = (typeof ALL_PHOTOS)[number];

function fileName(src: string) {
  return decodeURIComponent(src.split('/').pop() ?? 'Photo').replace(/\.[^.]+$/, '');
}

function fileFormat(src: string) {
  return (src.split('.').pop() ?? 'image').toUpperCase();
}

function PhotoDetails({
  photos,
  current,
  onClose,
  onPrev,
  onNext,
  onOpenAlbum,
}: {
  photos: GalleryPhoto[];
  current: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenAlbum: (projectId: string) => void;
}) {
  const photo = photos[current];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrev();
      if (event.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  return createPortal(
    <motion.div
      className="photos-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Informations de ${fileName(photo.src)}`}
    >
      <div className="photos-detail-backdrop" aria-hidden="true">
        {photos.slice(0, 24).map((item, index) => (
          <div className={`photos-detail-backdrop-tile photos-detail-backdrop-tile--${index % 7}`} key={item.key}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={encodeSrc(item.src)} alt="" />
          </div>
        ))}
      </div>
      <div className="photos-detail-veil" aria-hidden="true" />

      <motion.article
        className="photos-detail-card"
        initial={{ y: 28, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="photos-detail-lights" aria-hidden="true"><i /><i /><i /></div>
        <button className="photos-detail-close" onClick={onClose} aria-label="Fermer"><X size={16} /></button>

        <motion.div key={photo.key} className="photos-detail-image-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={encodeSrc(photo.src)} alt={`${photo.projectTitle} — ${photo.location}`} />
        </motion.div>

        <div className="photos-detail-copy">
          <p className="photos-detail-kicker">{photo.category} · {current + 1}/{photos.length}</p>
          <h2>{fileName(photo.src)}</h2>
          <p className="photos-detail-description">{photo.description}</p>
          <dl>
            <div><dt>Année</dt><dd>{photo.year}</dd></div>
            <div>
              <dt>Album</dt>
              <dd>
                <button
                  type="button"
                  className="photos-detail-album-link"
                  onClick={() => onOpenAlbum(photo.projectId)}
                  aria-label={`Ouvrir l’album ${photo.projectTitle} dans Finder`}
                >
                  {photo.projectTitle}
                  <ChevronRight size={11} aria-hidden="true" />
                </button>
              </dd>
            </div>
            <div><dt>Lieu</dt><dd>{photo.location}</dd></div>
            <div><dt>Format</dt><dd>Image · {fileFormat(photo.src)}</dd></div>
          </dl>
        </div>

        {photos.length > 1 && (
          <div className="photos-detail-nav">
            <button onClick={onPrev} aria-label="Photo précédente"><ChevronLeft size={18} /></button>
            <button onClick={onNext} aria-label="Photo suivante"><ChevronRight size={18} /></button>
          </div>
        )}
      </motion.article>
    </motion.div>,
    document.body
  );
}
