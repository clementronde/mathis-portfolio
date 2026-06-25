'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { Lightbox } from './Lightbox';
import { PROJECTS } from '@/data/projects';
import { encodeSrc } from '@/utils/path';
import { ImageIcon } from 'lucide-react';
import { useScrollytellingStore, getStepPhotoScrollProgress } from '@/store/useScrollytellingStore';

// Flatten all project images into a single list, tagged by project id
const ALL_PHOTOS = PROJECTS.flatMap((proj) =>
  proj.images
    .filter((img) => /\.(avif|jpg|jpeg|JPG|webp|png)$/i.test(img))
    .map((img, i) => ({ src: img, color: proj.color, projectId: proj.id, key: `${proj.id}-${i}` }))
);

export function PhotosWindow() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const step = useScrollytellingStore((state) => state.step);
  const galleryRef = useRef<HTMLDivElement>(null);

  const filtered = selectedProject
    ? ALL_PHOTOS.filter((p) => p.projectId === selectedProject)
    : ALL_PHOTOS;

  const currentProject = PROJECTS.find((p) => p.id === selectedProject);

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

  return (
    <Window
      id="photos"
      title="Photos"
      icon={<AppIcon id="photos" size={16} />}
      
      defaultSize={{ width: 860, height: 580 }}
    >
      <div className="flex h-full" style={{ background: '#ffffff', color: '#1d1d1f' }}>
        {/* Sidebar */}
        <div
          className="w-48 shrink-0 flex flex-col overflow-y-auto py-3"
          style={{ borderRight: '1px solid rgba(0,0,0,0.1)', background: '#f2f2f7' }}
        >
          {/* Library */}
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md text-[13px] transition-colors"
            style={{
              background: !selectedProject ? 'rgba(0,122,255,0.15)' : 'transparent',
              color: !selectedProject ? '#007AFF' : 'rgba(60,60,67,0.7)',
            }}
          >
            <ImageIcon size={14} className="shrink-0" />
            <span className="font-medium">Bibliothèque</span>
          </button>
          <div className="mx-3 mt-1 mb-1 text-[10px]" style={{ color: 'rgba(60,60,67,0.4)' }}>{ALL_PHOTOS.length} photos</div>

          {/* Albums */}
          <div className="mt-3 mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(60,60,67,0.4)' }}>
            Albums
          </div>
          {PROJECTS.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setSelectedProject(proj.id)}
              className="flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md text-[13px] transition-colors text-left"
              style={{
                background: selectedProject === proj.id ? 'rgba(0,122,255,0.15)' : 'transparent',
                color: selectedProject === proj.id ? '#007AFF' : 'rgba(60,60,67,0.7)',
              }}
            >
              <div
                className="w-4 h-4 rounded-sm shrink-0"
                style={{
                  backgroundImage: `url("${encodeSrc(proj.coverImage)}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  background: proj.color,
                }}
              />
              <span className="truncate">{proj.title}</span>
              <span className="ml-auto text-[10px] shrink-0" style={{ color: 'rgba(60,60,67,0.35)' }}>{proj.images.length}</span>
            </button>
          ))}
        </div>

        {/* Main gallery */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div
            className="px-4 py-2.5 shrink-0 flex items-center gap-2"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', background: '#f9f9f9' }}
          >
            <span className="text-[15px] font-semibold" style={{ color: '#1d1d1f' }}>
              {currentProject ? currentProject.title : 'Bibliothèque'}
            </span>
            <span className="text-[12px] ml-1" style={{ color: 'rgba(0,0,0,0.35)' }}>
              · {filtered.length} photo{filtered.length > 1 ? 's' : ''}
            </span>
            {currentProject && (
              <span className="text-[11px] ml-auto" style={{ color: 'rgba(0,0,0,0.3)' }}>
                {currentProject.location} · {currentProject.year}
              </span>
            )}
          </div>

          {/* Grid */}
          <div ref={galleryRef} className="flex-1 overflow-y-auto p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProject ?? 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="columns-4 gap-2"
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
