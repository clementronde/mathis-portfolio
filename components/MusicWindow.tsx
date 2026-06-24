'use client';
import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2 } from 'lucide-react';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';

const PLAYLIST = [
  { id: 1, title: 'Golden Hour', artist: 'JVKE', duration: '3:24', color: '#2d1a0a' },
  { id: 2, title: 'Still D.R.E.', artist: 'Dr. Dre', duration: '4:01', color: '#0a1a2e' },
  { id: 3, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:22', color: '#2e0a1a' },
  { id: 4, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', color: '#1a2e0a' },
  { id: 5, title: 'As It Was', artist: 'Harry Styles', duration: '2:37', color: '#2e1a2e' },
  { id: 6, title: 'Flowers', artist: 'Miley Cyrus', duration: '3:20', color: '#0a2e1a' },
  { id: 7, title: 'Anti-Hero', artist: 'Taylor Swift', duration: '3:21', color: '#2e2a0a' },
];

export function MusicWindow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  const current = PLAYLIST[currentIndex];

  function prev() {
    setCurrentIndex((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
    setProgress(0);
  }
  function next() {
    setCurrentIndex((i) => (i + 1) % PLAYLIST.length);
    setProgress(0);
  }

  return (
    <Window
      id="music"
      title="Musique"
      icon={<AppIcon id="music" size={16} />}
      defaultPosition={{ x: 320, y: 80 }}
      defaultSize={{ width: 580, height: 480 }}
    >
      <div className="flex h-full text-white" style={{ background: 'rgba(18,10,10,0.98)' }}>
        {/* Left — now playing */}
        <div
          className="w-52 shrink-0 flex flex-col items-center justify-center p-6 gap-4"
          style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Album art */}
          <div
            className="w-36 h-36 rounded-2xl shadow-2xl"
            style={{
              background: current.color,
              backgroundImage: `linear-gradient(135deg, ${current.color}, #0a0a0a)`,
              boxShadow: `0 16px 48px ${current.color}80`,
            }}
          />

          <div className="text-center">
            <p className="text-[14px] font-semibold text-white leading-tight">{current.title}</p>
            <p className="text-[12px] text-white/50 mt-1">{current.artist}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-1">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/30">
              <span>1:{String(Math.floor(progress * 0.6)).padStart(2, '0')}</span>
              <span>{current.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button onClick={prev} aria-label="Précédent" className="text-white/50 hover:text-white transition-colors">
              <SkipBack size={18} />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause' : 'Lecture'}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform"
            >
              {playing ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
            </button>
            <button onClick={next} aria-label="Suivant" className="text-white/50 hover:text-white transition-colors">
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-white/30">
            <Shuffle size={13} />
            <div className="flex items-center gap-1">
              <Volume2 size={13} />
              <div className="w-16 h-0.5 bg-white/20 rounded-full">
                <div className="w-3/4 h-full bg-white/50 rounded-full" />
              </div>
            </div>
            <Repeat size={13} />
          </div>
        </div>

        {/* Right — playlist */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[11px] text-white/40 uppercase tracking-wider">Ma playlist</p>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {PLAYLIST.map((track, idx) => (
              <button
                key={track.id}
                onClick={() => { setCurrentIndex(idx); setProgress(0); setPlaying(true); }}
                aria-label={`Jouer ${track.title}`}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  idx === currentIndex ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-lg shrink-0"
                  style={{ background: `linear-gradient(135deg, ${track.color}, #0a0a0a)` }}
                />
                <div className="flex-1 text-left">
                  <p className={`text-[13px] font-medium leading-tight ${idx === currentIndex ? 'text-white' : 'text-white/70'}`}>
                    {track.title}
                  </p>
                  <p className="text-[11px] text-white/35 mt-0.5">{track.artist}</p>
                </div>
                <span className="text-[11px] text-white/30">{track.duration}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}
