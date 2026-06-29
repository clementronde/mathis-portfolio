'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { NOTES, type Note, type NoteCategory } from '@/data/notes';
import { useScrollytellingStore, getStepNoteIndex } from '@/store/useScrollytellingStore';
import { useWindowStore } from '@/store/useWindowStore';

const NOTE_FOLDERS = [
  { id: 'about', label: 'Qui je suis ?' },
  { id: 'career', label: 'Carrière' },
  { id: 'education', label: 'Education' },
] satisfies { id: NoteCategory; label: string }[];

function getNoteCount(category: NoteCategory) {
  return NOTES.filter((note) => note.category === category).length;
}

export function NotesWindow() {
  const selectedNoteId = useWindowStore((state) => state.selectedNoteId);
  const setSelectedNote = useWindowStore((state) => state.setSelectedNote);
  const [selected, setSelected] = useState<Note>(
    () => NOTES.find((note) => note.id === useWindowStore.getState().selectedNoteId) ?? NOTES[0]
  );
  const [activeFolder, setActiveFolder] = useState<NoteCategory>(
    () => (NOTES.find((note) => note.id === useWindowStore.getState().selectedNoteId) ?? NOTES[0]).category
  );
  const step = useScrollytellingStore((state) => state.step);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const filtered = NOTES.filter((note) => note.category === activeFolder);

  function selectNote(note: Note) {
    setSelected(note);
    setActiveFolder(note.category);
    setSelectedNote(note.id);
  }

  function selectFolder(nextFolder: NoteCategory) {
    setActiveFolder(nextFolder);
    const nextNote = NOTES.find((note) => note.category === nextFolder);
    if (nextNote) selectNote(nextNote);
  }

  useEffect(() => {
    const noteIndex = getStepNoteIndex(step);
    const nextNote = noteIndex !== undefined ? NOTES[noteIndex] : undefined;
    if (!nextNote) return;

    selectNote(nextNote);
  }, [step]);

  useEffect(() => {
    const nextNote = NOTES.find((note) => note.id === selectedNoteId);
    if (!nextNote || nextNote.id === selected.id) return;

    selectNote(nextNote);
  }, [selected.id, selectedNoteId]);

  return (
    <Window
      id="notes"
      title="Notes"
      icon={<AppIcon id="notes" size={16} />}
      chrome="frameless"
      defaultSize={{ width: 920, height: 520 }}
    >
      <div className="flex h-full" style={{ background: '#ffffff', color: '#000000' }}>
        {/* Sidebar */}
        <div
          className={`${isMobile ? 'w-[110px]' : 'w-[210px]'} shrink-0 flex flex-col overflow-hidden`}
          style={{
            paddingTop: isMobile ? 44 : 102,
            background: '#fbfbfb',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            boxShadow: '22px 0 42px -34px rgba(0,0,0,0.72)',
            zIndex: 2,
          }}
        >
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-2' : 'px-5'}`}>
            {NOTE_FOLDERS.map((folder) => {
              const active = activeFolder === folder.id;
              return (
              <button
                key={folder.label}
                onClick={() => selectFolder(folder.id)}
                className={`w-full ${isMobile ? 'h-8 gap-1.5 px-1' : 'h-10 gap-3 px-2'} flex items-center rounded-md text-left font-medium transition-colors`}
                style={{ background: active ? 'rgba(0,0,0,0.045)' : 'transparent' }}
              >
                <FileText size={isMobile ? 13 : 21} strokeWidth={1.6} className="shrink-0" />
                <span className={`min-w-0 flex-1 truncate ${isMobile ? 'text-[10px]' : 'text-[14px]'}`}>{folder.label}</span>
                {!isMobile && <span style={{ color: 'rgba(0,0,0,0.45)' }}>{getNoteCount(folder.id)}</span>}
              </button>
              );
            })}
          </div>
        </div>

        {/* Note list — masquée sur mobile */}
        {!isMobile && <div className="w-[230px] shrink-0 flex flex-col overflow-hidden" style={{ background: '#ffffff' }}>
          <div
            className="h-[72px] shrink-0 flex items-center px-7 text-[18px] font-bold"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.7)' }}
          >
            Notes
          </div>
          <div className="flex-1 overflow-y-auto px-3 pt-5">
            {filtered.map((note) => (
              <button
                key={note.id}
                onClick={() => selectNote(note)}
                aria-label={`Ouvrir la note ${note.title}`}
                className="w-full text-left px-4 py-3 transition-colors rounded"
                style={{
                  background: selected.id === note.id ? '#FFC400' : 'transparent',
                }}
              >
                <p className="text-[13px] font-medium truncate" style={{ color: '#000000' }}>{note.listTitle ?? note.title}</p>
                <p className="text-[12px] mt-1 truncate" style={{ color: selected.id === note.id ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.42)' }}>{note.date}</p>
              </button>
            ))}
          </div>
        </div>}

        {/* Note content */}
        <div
          className="flex-1 overflow-hidden flex flex-col"
          style={{ background: '#ffffff', borderLeft: '1px solid rgba(0,0,0,0.08)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className={`flex-1 overflow-y-auto ${isMobile ? 'px-3 py-4' : 'px-8 py-8'}`}
            >
              {/* Header */}
              <div className="mb-4">
                <h2 className={`${isMobile ? 'text-[13px]' : 'text-[19px]'} font-semibold leading-tight`} style={{ color: '#000000' }}>{selected.title}</h2>
              </div>

              {/* Body */}
              <div className={`${isMobile ? 'text-[11px] leading-5' : 'text-[14px] leading-7'}`} style={{ color: 'rgba(0,0,0,0.62)' }}>
                <dl className="space-y-1.5">
                  {selected.details.map((detail) => (
                    <div key={detail.label} className="flex gap-1.5">
                      <dt className="font-semibold shrink-0" style={{ color: 'rgba(0,0,0,0.74)' }}>{detail.label} :</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
                {selected.content && (
                  <p className="mt-5 whitespace-pre-line">{selected.content}</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Window>
  );
}
