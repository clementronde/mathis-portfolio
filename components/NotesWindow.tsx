'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { NOTES, type Note } from '@/data/notes';

export function NotesWindow() {
  const [selected, setSelected] = useState<Note>(NOTES[0]);
  const [filter, setFilter] = useState<'all' | 'pro' | 'perso'>('all');

  const filtered = NOTES.filter((n) => filter === 'all' || n.category === filter);

  return (
    <Window
      id="notes"
      title="Notes"
      icon={<AppIcon id="notes" size={16} />}
      defaultPosition={{ x: 200, y: 60 }}
      defaultSize={{ width: 700, height: 520 }}
    >
      <div className="flex h-full text-white">
        {/* Sidebar */}
        <div
          className="w-52 shrink-0 flex flex-col overflow-hidden"
          style={{
            background: 'rgba(35,30,20,0.95)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Filter tabs */}
          <div className="flex gap-0 p-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {(['all', 'pro', 'perso'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1 text-[11px] rounded-md transition-colors ${
                  filter === f ? 'bg-yellow-400/20 text-yellow-300' : 'text-white/40 hover:text-white/70'
                }`}
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
                className={`w-full text-left px-3 py-2.5 transition-colors ${
                  selected.id === note.id
                    ? 'bg-yellow-400/15 border-l-2 border-yellow-400'
                    : 'hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <p className="text-[13px] font-medium text-white/85 truncate">{note.title}</p>
                <p className="text-[11px] text-white/35 mt-0.5 truncate">{note.date}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Note content */}
        <div className="flex-1 overflow-hidden flex flex-col" style={{ background: 'rgba(42,36,22,0.97)' }}>
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
                <h2 className="text-[20px] font-semibold text-white leading-tight">{selected.title}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-white/40">{selected.date}</span>
                  {selected.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="text-[13.5px] text-white/70 leading-7 whitespace-pre-line">
                {selected.content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Window>
  );
}
