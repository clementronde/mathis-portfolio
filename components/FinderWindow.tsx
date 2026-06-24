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

/* ─── Mac-style folder icon ─────────────────────────────────────── */
function FolderIcon({
  coverImage,
  color,
  size = 72,
}: {
  coverImage: string;
  color: string;
  size?: number;
}) {
  return (
    <div style={{ width: size, height: size * 0.82, position: 'relative' }}>
      {/* Back of folder */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '38%',
          borderRadius: `${size * 0.07}px ${size * 0.18}px 0 0`,
          background: `hsl(from ${color} h s calc(l + 8%))`,
          backgroundColor: adjustColor(color, 15),
        }}
      />
      {/* Main folder body */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          top: '16%',
          borderRadius: size * 0.1,
          background: adjustColor(color, 8),
          boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Photo thumbnail inside folder */}
        <div
          style={{
            width: '65%',
            height: '65%',
            borderRadius: size * 0.05,
            backgroundImage: `url("${encodeSrc(coverImage)}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            background: color,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            backgroundBlendMode: 'normal',
          }}
        />
      </div>
    </div>
  );
}

// Simple color brightening helper
function adjustColor(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r},${g},${b})`;
  } catch {
    return hex;
  }
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
      <div className="flex h-full text-white" style={{ background: '#1c1c1e' }}>

        {/* ── Sidebar ── */}
        <div
          className="w-44 shrink-0 flex flex-col py-3 overflow-y-auto"
          style={{ background: '#1a1a1c', borderRight: '1px solid rgba(255,255,255,0.07)' }}
        >
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.label} className="mb-3">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-3 mb-1">
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = item.id === null ? !sidebarFilter && !selectedProject : sidebarFilter === item.id;
                return (
                  <button
                    key={item.label}
                    onClick={() => { setSidebarFilter(item.id ?? null); setSelectedProject(null); }}
                    className={`flex items-center gap-2 w-full px-3 py-1.5 text-[13px] rounded-md mx-0 text-left transition-colors ${
                      active ? 'bg-white/15 text-white' : 'text-white/55 hover:bg-white/8 hover:text-white/90'
                    }`}
                    style={{ marginLeft: 4, marginRight: 4, width: 'calc(100% - 8px)' }}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Project list */}
          <div className="mt-1">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-3 mb-1">
              Projets
            </p>
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedProject(p); setSidebarFilter(null); }}
                className={`flex items-center gap-2 w-full px-3 py-1 text-[12px] rounded-md text-left transition-colors truncate ${
                  selectedProject?.id === p.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/45 hover:bg-white/8 hover:text-white/80'
                }`}
                style={{ marginLeft: 4, marginRight: 4, width: 'calc(100% - 8px)' }}
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
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#1c1c1e' }}
          >
            {selectedProject ? (
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Retour"
                className="flex items-center gap-1 text-white/50 hover:text-white/90 transition-colors"
              >
                <ChevronLeft size={14} />
                <span className="text-[12px]">Retour</span>
              </button>
            ) : (
              <span className="text-[13px] font-semibold text-white/80">{title}</span>
            )}

            {selectedProject && (
              <>
                <ChevronRight size={12} className="text-white/25" />
                <span className="text-[13px] font-medium text-white/70 truncate">
                  {selectedProject.title}
                </span>
                <span className="text-[11px] text-white/30 ml-1 hidden sm:inline">
                  · {selectedProject.location} · {selectedProject.year}
                </span>
              </>
            )}

            <div className="ml-auto flex gap-1">
              <button onClick={() => setView('grid')} aria-label="Grille"
                className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'text-white bg-white/10' : 'text-white/35 hover:text-white/70'}`}>
                <Grid2x2 size={13} />
              </button>
              <button onClick={() => setView('list')} aria-label="Liste"
                className={`p-1.5 rounded transition-colors ${view === 'list' ? 'text-white bg-white/10' : 'text-white/35 hover:text-white/70'}`}>
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
                  <p className="text-[12px] text-white/40 mb-4 leading-relaxed">
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
                              boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                            }} />
                        ) : (
                          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="w-10 h-10 rounded-md shrink-0"
                              style={{
                                background: selectedProject.color,
                                backgroundImage: `url("${encodeSrc(img)}")`,
                                backgroundSize: 'cover',
                              }} />
                            <span className="text-[12px] text-white/60">
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
                      /* Mac-style folder icon */
                      <motion.button
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        aria-label={`Ouvrir ${p.title}`}
                        whileHover={{ y: -2 }}
                        className="flex flex-col items-center gap-1.5 group outline-none"
                      >
                        <FolderIcon coverImage={p.coverImage} color={p.color} size={80} />
                        <span className="text-[11px] text-white/65 group-hover:text-white transition-colors text-center leading-tight max-w-[90px] truncate">
                          {p.title}
                        </span>
                        <span className="text-[9px] text-white/25">{p.images.length} photos</span>
                      </motion.button>
                    ) : (
                      /* List row */
                      <motion.button
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        aria-label={`Ouvrir ${p.title}`}
                        className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                          style={{
                            background: p.color,
                            backgroundImage: `url("${encodeSrc(p.coverImage)}")`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                          }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-white/80 group-hover:text-white truncate">{p.title}</p>
                          <p className="text-[11px] text-white/30">{p.category} · {p.year}</p>
                        </div>
                        <span className="text-[11px] text-white/25 shrink-0">{p.images.length} photos</span>
                        <ChevronRight size={13} className="text-white/20 shrink-0" />
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
