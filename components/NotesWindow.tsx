'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { NOTES, type Note } from '@/data/notes';
import { useScrollytellingStore, getStepNoteIndex } from '@/store/useScrollytellingStore';

const NOTE_FOLDERS = [
  { label: 'Qui je suis ?', count: 3 },
  { label: 'Carrière', count: 3 },
  { label: 'Education', count: 2 },
  { label: 'Scénarios', count: 8 },
  { label: 'Objectifs', count: 2 },
  { label: 'Citations', count: 5 },
];

export function NotesWindow() {
  const [selected, setSelected] = useState<Note>(NOTES[0]);
  const [filter, setFilter] = useState<'all' | 'pro' | 'perso'>('all');
  const step = useScrollytellingStore((state) => state.step);

  const filtered = NOTES.filter((n) => filter === 'all' || n.category === filter);

  function selectFilter(nextFilter: 'all' | 'pro' | 'perso') {
    setFilter(nextFilter);
    const nextNote = NOTES.find((note) => nextFilter === 'all' || note.category === nextFilter);
    if (nextNote) setSelected(nextNote);
  }

  useEffect(() => {
    const noteIndex = getStepNoteIndex(step);
    const nextNote = noteIndex !== undefined ? NOTES[noteIndex] : undefined;
    if (!nextNote) return;

    setFilter('all');
    setSelected(nextNote);
  }, [step]);

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
          className="w-[210px] shrink-0 flex flex-col overflow-hidden"
          style={{
            paddingTop: 102,
            background: '#fbfbfb',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            boxShadow: '22px 0 42px -34px rgba(0,0,0,0.72)',
            zIndex: 2,
          }}
        >
          <div className="hidden">
            {(['all', 'pro', 'perso'] as const).map((f) => (
              <button
                key={f}
                onClick={() => selectFilter(f)}
                className="flex-1 py-1 text-[10px] rounded-md transition-colors"
                style={{
                  background: filter === f ? 'rgba(255,204,0,0.25)' : 'transparent',
                  color: filter === f ? '#b8860b' : 'rgba(60,60,67,0.55)',
                }}
              >
                {f === 'all' ? 'Toutes' : f === 'pro' ? 'Pro' : 'Perso'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5">
            {NOTE_FOLDERS.map((folder, index) => (
              <button
                key={folder.label}
                onClick={() => selectFilter(index < 3 ? 'pro' : 'perso')}
                className="w-full h-10 flex items-center gap-3 text-left text-[14px] font-medium"
              >
                <FileText size={21} strokeWidth={1.6} />
                <span className="min-w-0 flex-1 truncate">{folder.label}</span>
                <span style={{ color: 'rgba(0,0,0,0.45)' }}>{folder.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note list */}
        <div className="w-[230px] shrink-0 flex flex-col overflow-hidden" style={{ background: '#ffffff' }}>
          <div
            className="h-[72px] shrink-0 flex items-center px-7 text-[18px] font-bold"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.7)' }}
          >
            Notes
          </div>
          <div className="flex-1 overflow-y-auto px-3 pt-5">
            {filtered.slice(0, 3).map((note) => (
              <button
                key={note.id}
                onClick={() => setSelected(note)}
                aria-label={`Ouvrir la note ${note.title}`}
                className="w-full text-left px-4 py-3 transition-colors rounded"
                style={{
                  background: selected.id === note.id ? '#FFC400' : 'transparent',
                }}
              >
                <p className="text-[13px] font-medium truncate" style={{ color: '#000000' }}>{note.title}</p>
                <p className="text-[12px] mt-1 truncate" style={{ color: selected.id === note.id ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.42)' }}>{note.date}</p>
              </button>
            ))}
          </div>
        </div>

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
              className="flex-1 overflow-y-auto px-8 py-8"
            >
              {/* Header */}
              <div className="mb-5">
                <h2 className="text-[19px] font-semibold leading-tight" style={{ color: '#000000' }}>{selected.title}</h2>
              </div>

              {/* Body */}
              <div className="text-[14px] leading-8 whitespace-pre-line" style={{ color: 'rgba(0,0,0,0.62)' }}>
                {selected.content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Window>
  );
}
