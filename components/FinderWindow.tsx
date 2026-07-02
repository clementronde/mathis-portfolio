'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, FileText, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Window } from './Window';
import { Lightbox } from './Lightbox';
import { PROJECTS, type Project } from '@/data/projects';
import { NOTES, type Note } from '@/data/notes';
import { DESKTOP_ITEMS, type DesktopItemConfig } from '@/data/desktopItems';
import { useWindowStore, FINDER_SECTION_IDS, type RecentItem, type FinderSectionId } from '@/store/useWindowStore';
import { AppIcon } from './icons/AppIcons';
import { encodeSrc } from '@/utils/path';

/* ─── Mac-style folder icon ───────────────── */
function FolderIcon({ size = 72 }: { coverImage?: string; color?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/icons/folder-with-paper.svg"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      draggable={false}
    />
  );
}

/* Thumbnail for an item actually sitting on the desktop (photo/video/folder icon) */
function DesktopItemThumb({ item, size = 72 }: { item: DesktopItemConfig; size?: number }) {
  const isVideo = /\.(mp4|webm)$/i.test(item.imageSrc);
  const isFolderPng = item.type === 'folder' && item.imageColor === 'transparent';

  return (
    <div
      className="overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        background: isFolderPng ? 'transparent' : item.imageColor,
        borderRadius: 6,
        position: 'relative',
      }}
    >
      {isVideo ? (
        <video
          src={encodeSrc(item.imageSrc)}
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={encodeSrc(item.imageSrc)}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: isFolderPng ? 'contain' : 'cover' }}
          draggable={false}
        />
      )}
    </div>
  );
}

function getDesktopItemFolder(item: DesktopItemConfig): string | undefined {
  return item.action.type === 'finder' ? (item.action as { folder?: string }).folder : undefined;
}

const FINDER_PROJECT_IDS = ['otacos-lolla', 'tbs-sete'];
const FINDER_PROJECTS = PROJECTS.filter((project) => FINDER_PROJECT_IDS.includes(project.id));
// Any desktop icon whose click action points at a real project (not a Finder section) lives "on the Desktop".
const DESKTOP_ITEM_PROJECT_IDS = DESKTOP_ITEMS
  .map(getDesktopItemFolder)
  .filter((folder): folder is string => !!folder && !FINDER_SECTION_IDS.includes(folder as FinderSectionId));
const DESKTOP_PROJECTS = PROJECTS.filter((project) => DESKTOP_ITEM_PROJECT_IDS.includes(project.id));

type FinderSection = FinderSectionId;

const SIDEBAR_ITEMS = [
  { id: 'desktop', label: 'Bureau', icon: Monitor },
  { id: 'documents', label: 'Derniers Projets', icon: FileText },
] satisfies { id: FinderSection; label: string; icon: typeof Monitor }[];

const SECTION_PROJECTS: Record<FinderSection, Project[]> = {
  recents: FINDER_PROJECTS,
  desktop: DESKTOP_PROJECTS,
  documents: FINDER_PROJECTS,
  'social-media': [],
  photos: [],
  videos: [],
};

const SECTION_TITLES: Record<FinderSection, string> = {
  recents: 'Récents',
  desktop: 'Bureau',
  documents: 'Derniers Projets',
  'social-media': 'Social Média',
  photos: 'Photos',
  videos: 'Videos',
};

function isFinderSection(id: string): id is FinderSection {
  return (FINDER_SECTION_IDS as readonly string[]).includes(id);
}

const PROJECT_SECTION_BY_ID = new Map<string, FinderSection>([
  ...FINDER_PROJECTS.map((project) => [project.id, 'documents'] as const),
  ...DESKTOP_PROJECTS.map((project) => [project.id, 'desktop'] as const),
]);

function findFinderProject(id: string | null) {
  if (!id) return null;
  return PROJECTS.find((project) => project.id === id) ?? null;
}

function findNote(id: string | null) {
  if (!id) return null;
  return NOTES.find((note) => note.id === id) ?? null;
}

function getProjectSection(project: Project | null): FinderSection | null {
  return project ? PROJECT_SECTION_BY_ID.get(project.id) ?? null : null;
}

function getSectionProjects(section: FinderSection) {
  return SECTION_PROJECTS[section];
}

type ResolvedRecentItem =
  | { id: string; type: 'project'; project: Project }
  | { id: string; type: 'note'; note: Note };

function resolveRecentItem(item: RecentItem): ResolvedRecentItem | null {
  if (item.type === 'project') {
    const project = findFinderProject(item.itemId);
    return project ? { id: item.id, type: 'project', project } : null;
  }

  const note = findNote(item.itemId);
  return note ? { id: item.id, type: 'note', note } : null;
}

function getSidebarButtonStyle(active: boolean): React.CSSProperties {
  return {
    marginLeft: 22,
    marginRight: 22,
    width: 'calc(100% - 44px)',
    background: active ? 'rgba(0,0,0,0.045)' : 'transparent',
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
          <span className="text-[10px] text-center leading-tight max-w-[90px] truncate transition-colors"
            style={{ color: 'rgba(0,0,0,0.6)' }}>
            {p.title}
          </span>
          <span className="text-[8px]" style={{ color: 'rgba(0,0,0,0.3)' }}>{p.images.length} photos</span>
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
      <p className="text-[9px] font-semibold uppercase tracking-wider px-3 mb-1" style={{ color: 'rgba(60,60,67,0.4)' }}>
        Projets
      </p>
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => onOpen(p)}
          className="flex items-center gap-2 w-full px-3 py-1 text-[11px] rounded-md text-left transition-colors truncate"
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

function RecentItemIcon({
  item,
  size,
}: {
  item: ResolvedRecentItem;
  size: number;
}) {
  if (item.type === 'project') {
    return <FolderIcon coverImage={item.project.coverImage} color={item.project.color} size={size} />;
  }

  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        color: '#c29300',
      }}
    >
      <FileText size={Math.round(size * 0.72)} strokeWidth={1.7} />
    </div>
  );
}

function RecentItemsList({
  items,
  isMobile,
  onOpen,
}: {
  items: ResolvedRecentItem[];
  isMobile: boolean;
  onOpen: (item: ResolvedRecentItem) => void;
}) {
  if (items.length === 0) {
    return (
      <div className={`${isMobile ? 'px-2 pt-4 text-[11px]' : 'px-2 pt-6 text-[14px]'}`} style={{ color: 'rgba(0,0,0,0.42)' }}>
        Les dossiers et notes ouverts apparaîtront ici.
      </div>
    );
  }

  return (
    <>
      {items.map((item, index) => {
        const title = item.type === 'project' ? item.project.title : item.note.title;
        const meta = item.type === 'project' ? `${item.project.images.length} photos` : 'Note';

        return (
          <button
            key={item.id}
            onClick={() => onOpen(item)}
            className={`w-full ${isMobile ? 'h-[42px] gap-2' : 'h-[58px] gap-3'} px-2 flex items-center rounded-md text-left transition-colors`}
            style={{ background: index === 0 ? 'rgba(0,0,0,0.06)' : 'transparent' }}
          >
            <RecentItemIcon item={item} size={isMobile ? 24 : 36} />
            <span className="min-w-0 flex-1">
              <span className={`${isMobile ? 'text-[11px]' : 'text-[15px]'} block font-semibold truncate`}>{title}</span>
              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} block truncate`} style={{ color: 'rgba(0,0,0,0.42)' }}>{meta}</span>
            </span>
            <ChevronRight size={isMobile ? 13 : 22} className="shrink-0" style={{ color: 'rgba(0,0,0,0.55)' }} />
          </button>
        );
      })}
    </>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export function FinderWindow() {
  const { finderFolder, recentItems, openNote, recordRecentProject } = useWindowStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    () => findFinderProject(finderFolder)
  );
  const [activeSection, setActiveSection] = useState<FinderSection>(() => {
    const proj = findFinderProject(finderFolder);
    if (proj) return getProjectSection(proj) ?? 'documents';
    if (finderFolder && isFinderSection(finderFolder)) return finderFolder;
    return 'documents';
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [desktopItemLightboxSrc, setDesktopItemLightboxSrc] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const proj = findFinderProject(finderFolder);
    if (proj) {
      setSelectedProject(proj);
      setActiveSection(getProjectSection(proj) ?? 'documents');
      setActiveImageIndex(0);
    } else if (finderFolder === null) {
      setSelectedProject(null);
      setActiveSection('documents');
      setActiveImageIndex(0);
    } else if (isFinderSection(finderFolder)) {
      setSelectedProject(null);
      setActiveSection(finderFolder);
      setActiveImageIndex(0);
    }
  }, [finderFolder]);

  function openProject(project: Project) {
    setSelectedProject(project);
    setActiveSection(getProjectSection(project) ?? activeSection);
    setActiveImageIndex(0);
    recordRecentProject(project.id);
  }

  function openSection(section: FinderSection) {
    setActiveSection(section);
    setSelectedProject(null);
    setActiveImageIndex(0);
  }

  function openDesktopItem(item: DesktopItemConfig) {
    if (item.action.type === 'lightbox') {
      setDesktopItemLightboxSrc(item.imageSrc);
      return;
    }

    const folder = getDesktopItemFolder(item);
    if (!folder) return;

    const proj = findFinderProject(folder);
    if (proj) {
      openProject(proj);
      return;
    }

    if (isFinderSection(folder)) {
      openSection(folder);
    }
  }

  function openRecentItem(item: ResolvedRecentItem) {
    if (item.type === 'project') {
      openProject(item.project);
      return;
    }

    openNote(item.note.id);
  }

  const title = selectedProject
    ? selectedProject.title
    : SECTION_TITLES[activeSection];

  const activeImage = selectedProject?.images[activeImageIndex] ?? selectedProject?.coverImage;
  const visibleProjects = getSectionProjects(activeSection);
  const visibleRecentItems = recentItems
    .map(resolveRecentItem)
    .filter((item): item is ResolvedRecentItem => item !== null);

  return (
    <Window
      id="finder"
      title={title}
      icon={<AppIcon id="finder" size={16} />}
      chrome="frameless"
      defaultSize={{ width: 860, height: 580 }}
    >
      <div className="flex h-full" style={{ background: '#ffffff', color: '#1d1d1f' }}>

        {/* ── Sidebar ── */}
        <div
          className={`${isMobile ? 'w-[110px]' : 'w-[210px]'} shrink-0 flex flex-col overflow-y-auto`}
          style={{
            paddingTop: isMobile ? 44 : 100,
            paddingBottom: 24,
            background: '#fafafa',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            boxShadow: '22px 0 42px -34px rgba(0,0,0,0.72)',
            zIndex: 2,
          }}
        >
          <button
            onClick={() => openSection('recents')}
            className={`flex items-center ${isMobile ? 'gap-1.5 py-1 text-[10px]' : 'gap-3 py-2 text-[15px]'} px-0 font-medium rounded-lg text-left transition-colors`}
            style={isMobile
              ? { marginLeft: 6, marginRight: 6, width: 'calc(100% - 12px)', background: activeSection === 'recents' && !selectedProject ? 'rgba(0,0,0,0.045)' : 'transparent', color: '#1d1d1f' }
              : getSidebarButtonStyle(activeSection === 'recents' && !selectedProject)
            }
          >
            <Clock size={isMobile ? 13 : 22} strokeWidth={2} className="shrink-0" />
            <span className="truncate">Récents</span>
          </button>

          <div className={isMobile ? 'mt-3' : 'mt-7'}>
            <p
              className={`${isMobile ? 'text-[9px] px-[8px] mb-2' : 'text-[12px] px-[28px] mb-4'} font-semibold uppercase tracking-wide`}
              style={{ color: 'rgba(60,60,67,0.68)' }}
            >
              Favoris
            </p>
            {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id && !selectedProject;
              return (
                <button
                  key={label}
                  onClick={() => openSection(id)}
                  className={`flex items-center ${isMobile ? 'gap-1.5 py-1 text-[10px]' : 'gap-3 py-2 text-[15px]'} px-0 font-medium rounded-lg text-left transition-colors`}
                  style={isMobile
                    ? { marginLeft: 6, marginRight: 6, width: 'calc(100% - 12px)', background: active ? 'rgba(0,0,0,0.045)' : 'transparent', color: '#1d1d1f' }
                    : getSidebarButtonStyle(active)
                  }
                >
                  <Icon size={isMobile ? 13 : 22} strokeWidth={2} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden">
            <SidebarProjectList
              projects={visibleProjects}
              selectedProject={selectedProject}
              onOpen={openProject}
            />
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Toolbar */}
          <div
            className={`flex ${isMobile ? 'items-end gap-2 px-3 pb-3' : 'items-center gap-5 px-7 h-[86px]'} shrink-0`}
            style={{ background: '#ffffff', paddingTop: isMobile ? 44 : undefined }}
          >
            {selectedProject ? (
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Retour"
                className={`${isMobile ? 'h-[30px] w-[26px]' : 'h-[50px] w-[42px]'} flex items-center justify-center rounded-l-full transition-colors`}
                style={{
                  color: 'rgba(0,0,0,0.65)',
                  background: 'rgba(255,255,255,0.82)',
                  boxShadow: '0 10px 26px rgba(0,0,0,0.08)',
                }}
              >
                <ChevronLeft size={isMobile ? 16 : 30} strokeWidth={2.6} />
              </button>
            ) : (
              <span className={`${isMobile ? 'text-[13px]' : 'text-[20px]'} font-bold`} style={{ color: 'rgba(0,0,0,0.7)' }}>{title}</span>
            )}

            {selectedProject && (
              <>
                <button
                  aria-label="Suivant"
                  className={`${isMobile ? 'h-[30px] w-[26px] -ml-2' : 'h-[50px] w-[42px] -ml-5'} flex items-center justify-center rounded-r-full transition-colors`}
                  style={{
                    color: 'rgba(0,0,0,0.65)',
                    background: 'rgba(255,255,255,0.82)',
                    boxShadow: '0 10px 26px rgba(0,0,0,0.08)',
                    borderLeft: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <ChevronRight size={isMobile ? 16 : 30} strokeWidth={2.6} />
                </button>
                <span className={`${isMobile ? 'text-[13px]' : 'text-[20px]'} font-bold truncate ml-1`} style={{ color: 'rgba(0,0,0,0.7)' }}>
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

                  <div className={`${isMobile ? 'mt-2 gap-1.5' : 'mt-4 gap-3'} w-full max-w-[640px] flex justify-center overflow-x-auto px-2 py-1`}>
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
                            width: isMobile ? (i === 3 ? 72 : 48) : (i === 3 ? 135 : 88),
                            height: isMobile ? 40 : 72,
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
                /* Folder list view */
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full flex"
                >
                  <div className={`${isMobile ? 'w-full px-3 pt-2' : 'w-[285px] px-7 pt-6'} shrink-0`}>
                    {activeSection === 'recents' ? (
                      <RecentItemsList
                        items={visibleRecentItems}
                        isMobile={isMobile}
                        onOpen={openRecentItem}
                      />
                    ) : activeSection === 'desktop' ? (
                      DESKTOP_ITEMS.map((item, index) => (
                        <button
                          key={item.id}
                          onClick={() => openDesktopItem(item)}
                          className={`w-full ${isMobile ? 'h-[38px] gap-2' : 'h-[54px] gap-3'} px-2 flex items-center rounded-md text-left transition-colors`}
                          style={{ background: index === 0 ? 'rgba(0,0,0,0.06)' : 'transparent' }}
                        >
                          <DesktopItemThumb item={item} size={isMobile ? 22 : 34} />
                          <span className={`${isMobile ? 'text-[11px]' : 'text-[15px]'} font-semibold truncate`}>{item.label}</span>
                          <ChevronRight size={isMobile ? 13 : 22} className="ml-auto" style={{ color: 'rgba(0,0,0,0.55)' }} />
                        </button>
                      ))
                    ) : visibleProjects.length === 0 ? (
                      <div className={`${isMobile ? 'px-2 pt-4 text-[11px]' : 'px-2 pt-6 text-[14px]'}`} style={{ color: 'rgba(0,0,0,0.42)' }}>
                        Ce dossier est vide.
                      </div>
                    ) : (
                      visibleProjects.map((project, index) => (
                        <button
                          key={project.id}
                          onClick={() => openProject(project)}
                          className={`w-full ${isMobile ? 'h-[38px] gap-2' : 'h-[54px] gap-3'} px-2 flex items-center rounded-md text-left transition-colors`}
                          style={{ background: index === 0 ? 'rgba(0,0,0,0.06)' : 'transparent' }}
                        >
                          <FolderIcon coverImage={project.coverImage} color={project.color} size={isMobile ? 22 : 34} />
                          <span className={`${isMobile ? 'text-[11px]' : 'text-[15px]'} font-semibold truncate`}>{project.title}</span>
                          <ChevronRight size={isMobile ? 13 : 22} className="ml-auto" style={{ color: 'rgba(0,0,0,0.55)' }} />
                        </button>
                      ))
                    )}
                  </div>
                  {!isMobile && (
                    <>
                      <div className="w-px h-full" style={{ background: 'rgba(0,0,0,0.08)' }} />
                      <div className="flex-1 flex items-center justify-center px-10 pb-12">
                        {activeSection === 'recents' && visibleRecentItems[0]?.type === 'note' ? (
                          <div className="flex flex-col items-center gap-3" style={{ color: 'rgba(0,0,0,0.46)' }}>
                            <RecentItemIcon item={visibleRecentItems[0]} size={96} />
                            <span className="text-[15px] font-semibold">{visibleRecentItems[0].note.title}</span>
                          </div>
                        ) : activeSection === 'recents' && visibleRecentItems[0]?.type === 'project' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={encodeSrc(visibleRecentItems[0].project.coverImage)}
                            alt=""
                            className="max-w-[58%] max-h-[62%] object-contain"
                            draggable={false}
                          />
                        ) : activeSection === 'recents' ? (
                          <div className="text-[14px]" style={{ color: 'rgba(0,0,0,0.38)' }}>
                            Aucun élément récent
                          </div>
                        ) : activeSection === 'desktop' ? (
                          <div className="flex flex-wrap gap-6 justify-center">
                            {DESKTOP_ITEMS.map((item) => (
                              <motion.button
                                key={item.id}
                                onClick={() => openDesktopItem(item)}
                                aria-label={`Ouvrir ${item.label}`}
                                whileHover={{ y: -2 }}
                                className="flex flex-col items-center gap-1.5 group outline-none"
                              >
                                <DesktopItemThumb item={item} size={80} />
                                <span className="text-[10px] text-center leading-tight max-w-[90px] truncate transition-colors"
                                  style={{ color: 'rgba(0,0,0,0.6)' }}>
                                  {item.label}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        ) : visibleProjects[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={encodeSrc(visibleProjects[0].coverImage)}
                            alt=""
                            className="max-w-[58%] max-h-[62%] object-contain"
                            draggable={false}
                          />
                        ) : visibleProjects.length === 0 ? (
                          <div className="text-[14px]" style={{ color: 'rgba(0,0,0,0.38)' }}>
                            Ce dossier est vide
                          </div>
                        ) : (
                          <ProjectFolderGrid projects={visibleProjects} onOpen={openProject} />
                        )}
                      </div>
                    </>
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

      {desktopItemLightboxSrc && (
        <Lightbox
          images={[desktopItemLightboxSrc]}
          colors={['#111111']}
          current={0}
          onClose={() => setDesktopItemLightboxSrc(null)}
          onPrev={() => undefined}
          onNext={() => undefined}
        />
      )}
    </Window>
  );
}
