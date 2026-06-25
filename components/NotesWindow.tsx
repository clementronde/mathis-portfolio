'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { NOTES, type Note } from '@/data/notes';
import { useScrollytellingStore, getStepNoteIndex } from '@/store/useScrollytellingStore';

export function NotesWindow() {
  const [selected, setSelected] = useState<Note>(NOTES[0]);
  const [filter, setFilter] = useState<'all' | 'pro' | 'perso'>('all');
  const step = useScrollytellingStore((state) => state.step);

  const filtered = NOTES.filter((n) => filter === 'all' || n.category === filter);

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
      
      defaultSize={{ width: 700, height: 520 }}
    >
      <div className="flex h-full" style={{ background: '#ffffff' }}>
        {/* Sidebar */}
        <div
          className="w-52 shrink-0 flex flex-col overflow-hidden"
          style={{
            background: '#f2f2f7',
            borderRight: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          {/* Filter tabs */}
          <div className="flex gap-0 p-2 shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            {(['all', 'pro', 'perso'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex-1 py-1 text-[11px] rounded-md transition-colors"
                style={{
                  background: filter === f ? 'rgba(255,204,0,0.25)' : 'transparent',
                  color: filter === f ? '#b8860b' : 'rgba(60,60,67,0.55)',
                }}
              >
                {f === 'all' ? 'Toutes' : f === 'pro' ? 'Pro' : 'Perso'}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-1">
            {filtered.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelected(note)}
                aria-label={`Ouvrir la note ${note.title}`}
                className="w-full text-left px-3 py-2.5 transition-colors border-l-2"
                style={{
                  background: selected.id === note.id ? 'rgba(255,204,0,0.15)' : 'transparent',
                  borderLeftColor: selected.id === note.id ? '#FFCC00' : 'transparent',
                }}
              >
                <p className="text-[13px] font-medium truncate" style={{ color: 'rgba(0,0,0,0.8)' }}>{note.title}</p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(0,0,0,0.4)' }}>{note.date}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Note content */}
        <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#fffef5' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex-1 overflow-y-auto p-6"
            >
              {/* Header */}
              <div className="mb-5">
                <h2 className="text-[20px] font-semibold leading-tight" style={{ color: '#1d1d1f' }}>{selected.title}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px]" style={{ color: 'rgba(0,0,0,0.4)' }}>{selected.date}</span>
                  {selected.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,204,0,0.2)', color: '#8a6d00' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="text-[13.5px] leading-7 whitespace-pre-line" style={{ color: 'rgba(0,0,0,0.65)' }}>
                {selected.content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Window>
  );
}
