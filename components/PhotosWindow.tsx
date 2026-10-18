'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { PROJECTS, PHOTO_COLLECTIONS, getProjectCollection, type PhotoCollection } from '@/data/projects';
import { encodeSrc } from '@/utils/path';
import { useWindowStore } from '@/store/useWindowStore';
import { Aperture, BookOpen, ChevronLeft, ChevronRight, ImageIcon, Minus, Plus, X } from 'lucide-react';

// Le dossier de chaque projet commence par sa date (AA-MM…) : on trie du plus récent au plus ancien
const projectFolder = (src: string) => src.split('/')[3] ?? '';
const PROJECTS_NEWEST_FIRST = [...PROJECTS].sort((a, b) =>
  projectFolder(b.coverImage).localeCompare(projectFolder(a.coverImage))
);

// Flatten all project images into a single list, tagged by project id
const ALL_PHOTOS = PROJECTS_NEWEST_FIRST.flatMap((proj) =>
  proj.images
    .filter((img) => /\.(avif|jpg|jpeg|JPG|webp|png)$/i.test(img))
    .map((img, i) => ({
      src: img,
      color: proj.color,
      projectId: proj.id,
      projectTitle: proj.title,
      category: proj.category,
      collection: getProjectCollection(proj),
      location: proj.location,
      year: proj.year,
      description: proj.description,
      camera: proj.camera,
      instagram: proj.instagram ?? [],
      key: `${proj.id}-${i}`,
    }))
);

// Bibliothèque et collections : une seule photo (la couverture) par projet
const PROJECT_COVERS = PROJECTS_NEWEST_FIRST.flatMap((proj) => {
  const photos = ALL_PHOTOS.filter((photo) => photo.projectId === proj.id);
  const cover = photos.find((photo) => photo.src === proj.coverImage) ?? photos[0];
  return cover ? [cover] : [];
});

const ZOOM_MIN = 0;
const ZOOM_MAX = 5;
const DEFAULT_ZOOM = 2;
const TILE_WIDTH_BY_ZOOM = [110, 140, 175, 215, 265, 330];
const WHEEL_ZOOM_STEP = 420;
const PINCH_ZOOM_IN_SCALE = 1.8;
const PINCH_ZOOM_OUT_SCALE = 0.55;
const ZOOM_COOLDOWN_MS = 260;

export function PhotosWindow() {
  const photosAlbum = useWindowStore((state) => state.photosAlbum);
  const photosNavigationVersion = useWindowStore((state) => state.photosNavigationVersion);
  const [selectedProject, setSelectedProject] = useState<string | null>(photosAlbum);
  const [selectedCollection, setSelectedCollection] = useState<PhotoCollection | null>(null);
  const [viewer, setViewer] = useState<{ projectId: string; index: number } | null>(null);
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
  // Ouverture depuis une image du bureau : on arrive directement sur l'album
  useEffect(() => {
    setSelectedProject(photosAlbum);
    setSelectedCollection(null);
    setViewer(null);
  }, [photosAlbum, photosNavigationVersion]);

  const wheelZoomDeltaRef = useRef(0);
  const currentZoomRef = useRef(DEFAULT_ZOOM);
  const gestureStartZoomRef = useRef(DEFAULT_ZOOM);
  const lastZoomChangeRef = useRef(0);

  const filtered = selectedProject
    ? ALL_PHOTOS.filter((p) => p.projectId === selectedProject)
    : selectedCollection
      ? PROJECT_COVERS.filter((p) => p.collection === selectedCollection)
      : PROJECT_COVERS;
  // La visionneuse fait défiler toutes les photos du projet de la photo ouverte
  const viewerPhotos = viewer ? ALL_PHOTOS.filter((p) => p.projectId === viewer.projectId) : [];
  const openViewer = (photo: GalleryPhoto) => {
    const photos = ALL_PHOTOS.filter((p) => p.projectId === photo.projectId);
    setViewer({ projectId: photo.projectId, index: Math.max(0, photos.findIndex((p) => p.key === photo.key)) });
  };
  const stepViewer = (direction: -1 | 1) =>
    setViewer((current) => current && {
      ...current,
      index: (current.index + direction + viewerPhotos.length) % viewerPhotos.length,
    });

  const currentProject = PROJECTS.find((p) => p.id === selectedProject);
  const currentCollection = PHOTO_COLLECTIONS.find((c) => c.id === selectedCollection);
  const showLibrary = (collection: PhotoCollection | null) => {
    setSelectedProject(null);
    setSelectedCollection(collection);
  };
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
            onClick={() => showLibrary(null)}
            className={`flex items-center ${isMobile ? 'gap-1.5 py-1.5 mx-[6px] text-[10px]' : 'gap-3 py-2 mx-[22px] text-[17px]'} px-0 rounded-lg font-medium transition-colors`}
            style={{
              background: !selectedProject && !selectedCollection ? 'rgba(0,0,0,0.045)' : 'transparent',
              color: '#1d1d1f',
            }}
          >
            <ImageIcon size={isMobile ? 13 : 22} className="shrink-0" strokeWidth={2} />
            <span className="truncate">Bibliothèque</span>
          </button>
          {!isMobile && (
            <>
              <div className="mx-[22px] mt-1 mb-1 text-[12px]" style={{ color: 'rgba(60,60,67,0.45)' }}>{ALL_PHOTOS.length} photos</div>
              <div className="mt-6 mb-4 px-[28px] text-[13px] font-semibold" style={{ color: 'rgba(60,60,67,0.68)' }}>Collections</div>
            </>
          )}
          {isMobile && <div className="mx-[6px] mt-3 mb-2 text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(60,60,67,0.5)' }}>Collections</div>}
          {PHOTO_COLLECTIONS.map((collection) => {
            const Icon = collection.id === 'chroniques' ? BookOpen : Aperture;
            const count = ALL_PHOTOS.filter((p) => p.collection === collection.id).length;
            return (
              <button
                key={collection.id}
                onClick={() => showLibrary(collection.id)}
                className={`flex items-center ${isMobile ? 'gap-1.5 py-1 mx-[6px] text-[10px]' : 'gap-3 py-2 mx-[22px] text-[15px]'} px-0 rounded-lg font-semibold uppercase tracking-wide transition-colors text-left`}
                style={{
                  background: !selectedProject && selectedCollection === collection.id ? 'rgba(0,0,0,0.045)' : 'transparent',
                  color: '#1d1d1f',
                }}
              >
                <Icon size={isMobile ? 13 : 21} className="shrink-0" strokeWidth={2} />
                <span className="truncate">{collection.label}</span>
                {!isMobile && <span className="ml-auto text-[12px] font-normal shrink-0" style={{ color: 'rgba(60,60,67,0.42)' }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Main gallery */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div
            className={`${isMobile ? 'flex items-end px-3 pb-2' : 'h-[86px] px-7 flex items-center'} shrink-0 gap-2 min-w-0`}
            style={{ background: '#ffffff', paddingTop: isMobile ? 44 : undefined }}
          >
            {currentProject && (
              <button
                type="button"
                onClick={() => showLibrary(selectedCollection)}
                aria-label="Retour à la bibliothèque"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors hover:bg-black/5"
                style={{ color: 'rgba(0,0,0,0.55)' }}
              >
                <ChevronLeft size={isMobile ? 16 : 20} strokeWidth={2.4} />
              </button>
            )}
            <span className={`${isMobile ? 'text-[13px]' : 'text-[23px]'} font-bold truncate min-w-0`} style={{ color: 'rgba(0,0,0,0.7)' }}>
              {currentProject ? currentProject.title : currentCollection ? currentCollection.label : 'Bibliothèque'}
            </span>
            <span className={`${isMobile ? 'text-[11px]' : 'text-[14px]'} ml-1 shrink-0`} style={{ color: 'rgba(0,0,0,0.35)' }}>
              · {filtered.length} {selectedProject ? 'photos' : 'projets'}
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
                key={selectedProject ?? selectedCollection ?? 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="photos-masonry"
                style={{ '--photo-tile': `${isMobile ? Math.round(tileWidth * 0.6) : tileWidth}px` } as React.CSSProperties}
              >
                {filtered.map((photo, idx) => (
                  <button
                    key={photo.key}
                    onClick={() => openViewer(photo)}
                    aria-label={`${photo.projectTitle}, photo ${idx + 1}`}
                    className="photos-masonry-tile"
                    style={{ background: photo.color }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={encodeSrc(photo.src)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="photos-masonry-info" aria-hidden="true">
                      <strong>{photo.projectTitle}</strong>
                      <span>{photo.location} · {photo.year}</span>
                    </span>
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {viewer && viewerPhotos[viewer.index] && (
          <PhotoViewer
            photo={viewerPhotos[viewer.index]}
            hasSiblings={viewerPhotos.length > 1}
            onClose={() => setViewer(null)}
            onPrev={() => stepViewer(-1)}
            onNext={() => stepViewer(1)}
          />
        )}
      </AnimatePresence>
    </Window>
  );
}

type GalleryPhoto = (typeof ALL_PHOTOS)[number];

function fileName(src: string) {
  return decodeURIComponent(src.split('/').pop() ?? 'Photo');
}

function fileFormat(src: string) {
  return (src.split('.').pop() ?? 'image').toLowerCase();
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`;
}

// Le lieu affiché est la ville seule ("Paris, France" → "Paris")
function city(location: string) {
  return location.split(',')[0].trim();
}

function PhotoViewer({
  photo,
  hasSiblings,
  onClose,
  onPrev,
  onNext,
}: {
  photo: GalleryPhoto;
  hasSiblings: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [fileSize, setFileSize] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrev();
      if (event.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev]);

  // Poids du fichier lu dans l'en-tête HTTP, sans retélécharger l'image
  useEffect(() => {
    let cancelled = false;
    setFileSize(null);
    fetch(encodeSrc(photo.src), { method: 'HEAD' })
      .then((response) => {
        const length = Number(response.headers.get('content-length'));
        if (!cancelled && length > 0) setFileSize(length);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [photo.src]);

  return createPortal(
    <motion.div
      className="photo-viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={fileName(photo.src)}
    >
      <motion.div
        className="photo-viewer-frame"
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="photo-viewer-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={photo.key} src={encodeSrc(photo.src)} alt={`${photo.projectTitle} — ${photo.location}`} />
        </div>

        <div className="photo-viewer-details">
          <h2>{fileName(photo.src)}</h2>
          <p>Image {fileFormat(photo.src)}{fileSize ? ` · ${formatFileSize(fileSize)}` : ''}</p>
          <dl>
            <div><dt>Année</dt><dd>{photo.year}</dd></div>
            <div><dt>{photo.collection === 'focus' ? 'Marque' : 'Projet'}</dt><dd>{photo.projectTitle}</dd></div>
            <div><dt>Lieu</dt><dd>{city(photo.location)}</dd></div>
            {photo.camera && <div><dt>Appareil</dt><dd>{photo.camera}</dd></div>}
            {photo.instagram.length > 0 && (
              <div>
                <dt>Instagram</dt>
                <dd>
                  {photo.instagram.map((url, index) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                      {photo.instagram.length > 1 ? `Voir ici ${index + 1}` : 'Voir ici'}
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <button type="button" className="photo-viewer-control photo-viewer-close" onClick={onClose} aria-label="Fermer">
          <X size={16} />
        </button>
        {hasSiblings && (
          <>
            <button type="button" className="photo-viewer-control photo-viewer-prev" onClick={onPrev} aria-label="Photo précédente">
              <ChevronLeft size={18} />
            </button>
            <button type="button" className="photo-viewer-control photo-viewer-next" onClick={onNext} aria-label="Photo suivante">
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}
