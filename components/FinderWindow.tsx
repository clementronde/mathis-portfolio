'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, Grid2x2, List, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Window } from './Window';
import { Lightbox } from './Lightbox';
import { PROJECTS, type Project } from '@/data/projects';
import { useWindowStore } from '@/store/useWindowStore';
import { AppIcon } from './icons/AppIcons';
import { encodeSrc } from '@/utils/path';

/* ─── Mac-style folder icon using dossiericon.png ───────────────── */
function FolderIcon({ size = 72 }: { coverImage?: string; color?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/icons/dossiericon.png"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      draggable={false}
    />
  );
}

/* ─── Sidebar items ──────────────────────────────────────────────── */
const SIDEBAR_SECTIONS = [
  {
    label: 'Favoris',
    items: [
      { label: 'Tous les projets', id: null },
      { label: 'Pro', id: '__pro__' },
      { label: 'Voyages', id: '__voyages__' },
      { label: 'Perso', id: '__perso__' },
    ],
  },
];

const CATEGORY_FILTERS: Record<string, string[]> = {
  __pro__: ['Portrait', 'Événement', 'Marque', 'Mariage', 'Sport'],
  __voyages__: ['Voyage'],
  __perso__: ['Perso', 'Famille'],
};

/* ─── Main component ─────────────────────────────────────────────── */
export function FinderWindow() {
  const { finderFolder } = useWindowStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    () => PROJECTS.find((p) => p.id === finderFolder) ?? null
  );
  const [sidebarFilter, setSidebarFilter] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (finderFolder) {
      const proj = PROJECTS.find((p) => p.id === finderFolder);
      if (proj) setSelectedProject(proj);
    }
  }, [finderFolder]);

  // Which projects to show in the main area
  const visibleProjects =
    sidebarFilter && CATEGORY_FILTERS[sidebarFilter]
      ? PROJECTS.filter((p) => CATEGORY_FILTERS[sidebarFilter].includes(p.category))
      : PROJECTS;

  const title = selectedProject
    ? selectedProject.title
    : sidebarFilter === '__pro__'
    ? 'Pro'
    : sidebarFilter === '__voyages__'
    ? 'Voyages'
    : sidebarFilter === '__perso__'
    ? 'Perso'
    : 'Tous les projets';

  return (
    <Window
      id="finder"
      title={title}
      icon={<AppIcon id="finder" size={16} />}
      defaultPosition={{ x: 60, y: 40 }}
      defaultSize={{ width: 860, height: 580 }}
    >
      <div className="flex h-full" style={{ background: '#ffffff', color: '#1d1d1f' }}>

        {/* ── Sidebar ── */}
        <div
          className="w-44 shrink-0 flex flex-col py-3 overflow-y-auto"
          style={{ background: '#f2f2f7', borderRight: '1px solid rgba(0,0,0,0.1)' }}
        >
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.label} className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-1" style={{ color: 'rgba(60,60,67,0.4)' }}>
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = item.id === null ? !sidebarFilter && !selectedProject : sidebarFilter === item.id;
                return (
                  <button
                    key={item.label}
                    onClick={() => { setSidebarFilter(item.id ?? null); setSelectedProject(null); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] rounded-md text-left transition-colors"
                    style={{
                      marginLeft: 4, marginRight: 4, width: 'calc(100% - 8px)',
                      background: active ? 'rgba(0,122,255,0.15)' : 'transparent',
                      color: active ? '#007AFF' : 'rgba(60,60,67,0.7)',
                    }}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Project list */}
          <div className="mt-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-1" style={{ color: 'rgba(60,60,67,0.4)' }}>
              Projets
            </p>
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedProject(p); setSidebarFilter(null); }}
                className="flex items-center gap-2 w-full px-3 py-1 text-[12px] rounded-md text-left transition-colors truncate"
                style={{
                  marginLeft: 4, marginRight: 4, width: 'calc(100% - 8px)',
                  background: selectedProject?.id === p.id ? 'rgba(0,122,255,0.15)' : 'transparent',
                  color: selectedProject?.id === p.id ? '#007AFF' : 'rgba(60,60,67,0.65)',
                }}
              >
                <div
                  className="w-3.5 h-3.5 rounded-sm shrink-0"
                  style={{
                    backgroundImage: `url("${encodeSrc(p.coverImage)}")`,
                    backgroundSize: 'cover',
                    background: p.color,
                  }}
                />
                <span className="truncate">{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Toolbar */}
          <div
            className="flex items-center gap-2 px-4 h-10 shrink-0"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', background: '#f9f9f9' }}
          >
            {selectedProject ? (
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Retour"
                className="flex items-center gap-1 transition-colors"
                style={{ color: '#007AFF' }}
              >
                <ChevronLeft size={14} />
                <span className="text-[12px]">Retour</span>
              </button>
            ) : (
              <span className="text-[13px] font-semibold" style={{ color: '#1d1d1f' }}>{title}</span>
            )}

            {selectedProject && (
              <>
                <ChevronRight size={12} style={{ color: 'rgba(0,0,0,0.25)' }} />
                <span className="text-[13px] font-medium truncate" style={{ color: 'rgba(0,0,0,0.65)' }}>
                  {selectedProject.title}
                </span>
                <span className="text-[11px] ml-1 hidden sm:inline" style={{ color: 'rgba(0,0,0,0.35)' }}>
                  · {selectedProject.location} · {selectedProject.year}
                </span>
              </>
            )}

            <div className="ml-auto flex gap-1">
              <button onClick={() => setView('grid')} aria-label="Grille"
                className="p-1.5 rounded transition-colors"
                style={{ color: view === 'grid' ? '#007AFF' : 'rgba(0,0,0,0.35)', background: view === 'grid' ? 'rgba(0,122,255,0.12)' : 'transparent' }}>
                <Grid2x2 size={13} />
              </button>
              <button onClick={() => setView('list')} aria-label="Liste"
                className="p-1.5 rounded transition-colors"
                style={{ color: view === 'list' ? '#007AFF' : 'rgba(0,0,0,0.35)', background: view === 'list' ? 'rgba(0,122,255,0.12)' : 'transparent' }}>
                <List size={13} />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">

              {/* Project images view */}
              {selectedProject ? (
                <motion.div
                  key={selectedProject.id}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="text-[12px] mb-4 leading-relaxed" style={{ color: 'rgba(0,0,0,0.45)' }}>
                    {selectedProject.description}
                  </p>
                  <div className={view === 'grid' ? 'grid grid-cols-3 gap-3' : 'flex flex-col gap-1.5'}>
                    {selectedProject.images.map((img, i) => (
                      <motion.button
                        key={img} onClick={() => setLightboxIndex(i)}
                        aria-label={`Photo ${i + 1}`}
                        whileHover={{ scale: 1.02 }} className="outline-none"
                      >
                        {view === 'grid' ? (
                          <div className="w-full aspect-[4/5] rounded-lg overflow-hidden"
                            style={{
                              background: selectedProject.color,
                              backgroundImage: `url("${encodeSrc(img)}")`,
                              backgroundSize: 'cover', backgroundPosition: 'center',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }} />
                        ) : (
                          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors"
                            style={{ background: 'transparent' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <div className="w-10 h-10 rounded-md shrink-0"
                              style={{
                                background: selectedProject.color,
                                backgroundImage: `url("${encodeSrc(img)}")`,
                                backgroundSize: 'cover',
                              }} />
                            <span className="text-[12px]" style={{ color: 'rgba(0,0,0,0.55)' }}>
                              {selectedProject.id}_{String(i + 1).padStart(2, '0')}.jpg
                            </span>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

              ) : (
                /* Folder grid view */
                <motion.div
                  key={sidebarFilter ?? 'all'}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={view === 'grid'
                    ? 'grid gap-x-4 gap-y-6'
                    : 'flex flex-col gap-1'}
                  style={view === 'grid' ? { gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' } : {}}
                >
                  {visibleProjects.map((p) =>
                    view === 'grid' ? (
                      <motion.button
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        aria-label={`Ouvrir ${p.title}`}
                        whileHover={{ y: -2 }}
                        className="flex flex-col items-center gap-1.5 group outline-none"
                      >
                        <FolderIcon coverImage={p.coverImage} color={p.color} size={80} />
                        <span className="text-[11px] text-center leading-tight max-w-[90px] truncate transition-colors"
                          style={{ color: 'rgba(0,0,0,0.6)' }}>
                          {p.title}
                        </span>
                        <span className="text-[9px]" style={{ color: 'rgba(0,0,0,0.3)' }}>{p.images.length} photos</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        aria-label={`Ouvrir ${p.title}`}
                        className="flex items-center gap-3 w-full px-2 py-2 rounded-lg transition-colors text-left group"
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                          style={{
                            background: p.color,
                            backgroundImage: `url("${encodeSrc(p.coverImage)}")`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                          }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] truncate" style={{ color: 'rgba(0,0,0,0.8)' }}>{p.title}</p>
                          <p className="text-[11px]" style={{ color: 'rgba(0,0,0,0.4)' }}>{p.category} · {p.year}</p>
                        </div>
                        <span className="text-[11px] shrink-0" style={{ color: 'rgba(0,0,0,0.3)' }}>{p.images.length} photos</span>
                        <ChevronRight size={13} style={{ color: 'rgba(0,0,0,0.2)' }} className="shrink-0" />
                      </motion.button>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && selectedProject && (
        <Lightbox
          images={selectedProject.images}
          colors={selectedProject.images.map(() => selectedProject.color)}
          current={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i! - 1 + selectedProject.images.length) % selectedProject.images.length)}
          onNext={() => setLightboxIndex((i) => (i! + 1) % selectedProject.images.length)}
        />
      )}
    </Window>
  );
}
