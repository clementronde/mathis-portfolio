'use client';
import { useState, useEffect } from 'react';
import { AppWindow, ChevronLeft, ChevronRight, Clock, Download, FileText, Monitor } from 'lucide-react';
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

const FINDER_PROJECT_IDS = ['otacos-lolla', 'tbs-sete'];
const FINDER_PROJECTS = PROJECTS.filter((project) => FINDER_PROJECT_IDS.includes(project.id));
const DESKTOP_PROJECT_IDS = ['noclout', 'shoot-les-rats', 'mariage-he', 'lisboa', 'berlin'];
const DESKTOP_PROJECTS = PROJECTS.filter((project) => DESKTOP_PROJECT_IDS.includes(project.id));

type FinderSection = 'recents' | 'desktop' | 'documents' | 'downloads' | 'applications';

const SIDEBAR_ITEMS = [
  { id: 'desktop', label: 'Bureau', icon: Monitor },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'downloads', label: 'Téléchargement', icon: Download },
  { id: 'applications', label: 'Applications', icon: AppWindow },
] satisfies { id: FinderSection; label: string; icon: typeof Monitor }[];

const SECTION_PROJECTS: Record<FinderSection, Project[]> = {
  recents: FINDER_PROJECTS,
  desktop: DESKTOP_PROJECTS,
  documents: FINDER_PROJECTS,
  downloads: FINDER_PROJECTS,
  applications: FINDER_PROJECTS,
};

const SECTION_TITLES: Record<FinderSection, string> = {
  recents: 'Récents',
  desktop: 'Bureau',
  documents: 'Documents',
  downloads: 'Téléchargement',
  applications: 'Applications',
};

const PROJECT_SECTION_BY_ID = new Map<string, FinderSection>([
  ...FINDER_PROJECTS.map((project) => [project.id, 'documents'] as const),
  ...DESKTOP_PROJECTS.map((project) => [project.id, 'desktop'] as const),
]);

const ALL_FINDER_PROJECTS = [...FINDER_PROJECTS, ...DESKTOP_PROJECTS].filter(
  (project, index, projects) => projects.findIndex((p) => p.id === project.id) === index
);

function findFinderProject(id: string | null) {
  if (!id) return null;
  return ALL_FINDER_PROJECTS.find((project) => project.id === id) ?? null;
}

function getProjectSection(project: Project | null): FinderSection | null {
  return project ? PROJECT_SECTION_BY_ID.get(project.id) ?? null : null;
}

function getSectionProjects(section: FinderSection) {
  return SECTION_PROJECTS[section];
}

function getSidebarButtonStyle(active: boolean): React.CSSProperties {
  return {
    marginLeft: 4,
    marginRight: 4,
    width: 'calc(100% - 8px)',
    background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
    color: '#1d1d1f',
  };
}

function ProjectFolderGrid({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (project: Project) => void;
}) {
  return (
    <>
      {projects.map((p) => (
        <motion.button
          key={p.id}
          onClick={() => onOpen(p)}
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
      ))}
    </>
  );
}

function SidebarProjectList({
  projects,
  selectedProject,
  onOpen,
}: {
  projects: Project[];
  selectedProject: Project | null;
  onOpen: (project: Project) => void;
}) {
  return (
    <div className="mt-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-1" style={{ color: 'rgba(60,60,67,0.4)' }}>
        Projets
      </p>
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => onOpen(p)}
          className="flex items-center gap-2 w-full px-3 py-1 text-[12px] rounded-md text-left transition-colors truncate"
          style={getSidebarButtonStyle(selectedProject?.id === p.id)}
        >
          <div
            className="w-3.5 h-3.5 rounded-sm shrink-0"
            style={{
              background: p.color,
              backgroundImage: `url("${encodeSrc(p.coverImage)}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <span className="truncate">{p.title}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export function FinderWindow() {
  const { finderFolder } = useWindowStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    () => findFinderProject(finderFolder)
  );
  const [activeSection, setActiveSection] = useState<FinderSection>(
    () => getProjectSection(findFinderProject(finderFolder)) ?? 'documents'
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const proj = findFinderProject(finderFolder);
    if (proj) {
      setSelectedProject(proj);
      setActiveSection(getProjectSection(proj) ?? 'documents');
      setActiveImageIndex(0);
    }
  }, [finderFolder]);

  function openProject(project: Project) {
    setSelectedProject(project);
    setActiveSection(getProjectSection(project) ?? activeSection);
    setActiveImageIndex(0);
  }

  function openSection(section: FinderSection) {
    setActiveSection(section);
    setSelectedProject(null);
    setActiveImageIndex(0);
  }

  const title = selectedProject
    ? selectedProject.title
    : SECTION_TITLES[activeSection];

  const activeImage = selectedProject?.images[activeImageIndex] ?? selectedProject?.coverImage;
  const visibleProjects = getSectionProjects(activeSection);

  return (
    <Window
      id="finder"
      title={title}
      icon={<AppIcon id="finder" size={16} />}
      
      defaultSize={{ width: 860, height: 580 }}
    >
      <div className="flex h-full" style={{ background: '#ffffff', color: '#1d1d1f' }}>

        {/* ── Sidebar ── */}
        <div
          className="w-44 shrink-0 flex flex-col py-3 overflow-y-auto"
          style={{ background: '#f2f2f7', borderRight: '1px solid rgba(0,0,0,0.1)' }}
        >
          <button
            onClick={() => openSection('recents')}
            className="flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-md text-left transition-colors"
            style={getSidebarButtonStyle(activeSection === 'recents' && !selectedProject)}
          >
            <Clock size={15} />
            <span>Récents</span>
          </button>

          <div className="mt-4">
            <p className="text-[10px] font-semibold px-3 mb-1" style={{ color: 'rgba(60,60,67,0.5)' }}>
              Favoris
            </p>
            {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id && !selectedProject;
              return (
                <button
                  key={label}
                  onClick={() => openSection(id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-md text-left transition-colors"
                  style={getSidebarButtonStyle(active)}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <SidebarProjectList
            projects={visibleProjects}
            selectedProject={selectedProject}
            onOpen={openProject}
          />
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
                className="h-8 w-10 flex items-center justify-center rounded-l-full transition-colors"
                style={{
                  color: 'rgba(0,0,0,0.65)',
                  background: 'rgba(255,255,255,0.82)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }}
              >
                <ChevronLeft size={20} />
              </button>
            ) : (
              <span className="text-[13px] font-semibold" style={{ color: '#1d1d1f' }}>{title}</span>
            )}

            {selectedProject && (
              <>
                <button
                  aria-label="Suivant"
                  className="h-8 w-10 -ml-2 flex items-center justify-center rounded-r-full transition-colors"
                  style={{
                    color: 'rgba(0,0,0,0.65)',
                    background: 'rgba(255,255,255,0.82)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    borderLeft: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <ChevronRight size={20} />
                </button>
                <span className="text-[15px] font-semibold truncate ml-4" style={{ color: 'rgba(0,0,0,0.72)' }}>
                  {selectedProject.title}
                </span>
              </>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">

              {/* Project images view */}
              {selectedProject ? (
                <motion.div
                  key={selectedProject.id}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full flex flex-col items-center justify-center px-8 py-5"
                >
                  <motion.button
                    key={activeImage}
                    onClick={() => setLightboxIndex(activeImageIndex)}
                    aria-label={`Agrandir la photo ${activeImageIndex + 1}`}
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.18 }}
                    className="outline-none shrink min-h-0"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div
                      className="flex items-center justify-center overflow-hidden max-w-full max-h-full"
                      style={{
                        width: 'min(620px, 100%)',
                        height: 'min(410px, 62vh)',
                      }}
                    >
                      {activeImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={encodeSrc(activeImage)}
                          alt=""
                          className="block max-w-full max-h-full object-contain"
                          draggable={false}
                        />
                      )}
                    </div>
                  </motion.button>

                  <div className="mt-4 w-full max-w-[640px] flex justify-center gap-3 overflow-x-auto px-2 py-1">
                    {selectedProject.images.map((img, i) => (
                      <button
                        key={img}
                        onClick={() => setActiveImageIndex(i)}
                        onDoubleClick={() => setLightboxIndex(i)}
                        aria-label={`Afficher la photo ${i + 1}`}
                        className="shrink-0 outline-none transition-opacity"
                        style={{ opacity: activeImageIndex === i ? 1 : 0.28 }}
                      >
                        <div
                          className="overflow-hidden"
                          style={{
                            width: i === 3 ? 135 : 88,
                            height: 72,
                            background: selectedProject.color,
                            boxShadow: activeImageIndex === i ? '0 0 0 2px rgba(0,0,0,0.18)' : 'none',
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={encodeSrc(img)}
                            alt=""
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>

              ) : (
                /* Folder grid view */
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full grid content-start gap-x-8 gap-y-6 p-8"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(116px, 1fr))' }}
                >
                  <ProjectFolderGrid projects={visibleProjects} onOpen={openProject} />
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
