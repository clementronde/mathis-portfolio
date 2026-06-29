'use client';
import { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

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
      chrome="frameless"
      defaultSize={{ width: 580, height: 480 }}
    >
      <div className={`${isMobile ? 'flex-col' : ''} flex h-full`} style={{ background: '#ffffff', color: '#1d1d1f' }}>
        {/* Player panel — compact horizontal strip on mobile, full panel on desktop */}
        {isMobile ? (
          <div
            className="w-full shrink-0 flex items-center gap-3 px-4 py-3"
            style={{
              background: '#fbfbfb',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              zIndex: 2,
              paddingTop: 44,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl shrink-0"
              style={{ background: current.color, backgroundImage: `linear-gradient(135deg, ${current.color}, #333)` }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate" style={{ color: '#1d1d1f' }}>{current.title}</p>
              <p className="text-[11px]" style={{ color: 'rgba(0,0,0,0.45)' }}>{current.artist}</p>
              <div className="w-full h-0.5 rounded-full mt-1.5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: '#FC3C44' }} />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={prev} aria-label="Précédent" style={{ color: 'rgba(0,0,0,0.45)' }}>
                <SkipBack size={16} />
              </button>
              <button
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pause' : 'Lecture'}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#FC3C44', color: '#fff' }}
              >
                {playing ? <Pause size={13} fill="white" /> : <Play size={13} fill="white" className="ml-0.5" />}
              </button>
              <button onClick={next} aria-label="Suivant" style={{ color: 'rgba(0,0,0,0.45)' }}>
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div
            className="w-52 shrink-0 flex flex-col items-center justify-center p-6 gap-4"
            style={{
              background: '#fbfbfb',
              borderTopLeftRadius: 24,
              borderBottomLeftRadius: 24,
              boxShadow: '22px 0 42px -34px rgba(0,0,0,0.72)',
              zIndex: 2,
            }}
          >
            <div
              className="w-36 h-36 rounded-2xl shadow-lg"
              style={{ background: current.color, backgroundImage: `linear-gradient(135deg, ${current.color}, #333)`, boxShadow: `0 12px 32px rgba(0,0,0,0.18)` }}
            />
            <div className="text-center">
              <p className="text-[14px] font-semibold leading-tight" style={{ color: '#1d1d1f' }}>{current.title}</p>
              <p className="text-[12px] mt-1" style={{ color: 'rgba(0,0,0,0.45)' }}>{current.artist}</p>
            </div>
            <div className="w-full space-y-1">
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: '#FC3C44' }} />
              </div>
              <div className="flex justify-between text-[10px]" style={{ color: 'rgba(0,0,0,0.35)' }}>
                <span>1:{String(Math.floor(progress * 0.6)).padStart(2, '0')}</span>
                <span>{current.duration}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={prev} aria-label="Précédent" className="transition-colors" style={{ color: 'rgba(0,0,0,0.45)' }}>
                <SkipBack size={18} />
              </button>
              <button
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pause' : 'Lecture'}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                style={{ background: '#FC3C44', color: '#fff' }}
              >
                {playing ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
              </button>
              <button onClick={next} aria-label="Suivant" className="transition-colors" style={{ color: 'rgba(0,0,0,0.45)' }}>
                <SkipForward size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3" style={{ color: 'rgba(0,0,0,0.3)' }}>
              <Shuffle size={13} />
              <div className="flex items-center gap-1">
                <Volume2 size={13} />
                <div className="w-16 h-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.15)' }}>
                  <div className="w-3/4 h-full rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }} />
                </div>
              </div>
              <Repeat size={13} />
            </div>
          </div>
        )}

        {/* Right — playlist */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-[72px] px-5 shrink-0 flex items-center" style={{ background: '#ffffff' }}>
            <p className="text-[18px] font-semibold" style={{ color: 'rgba(0,0,0,0.7)' }}>Ma playlist</p>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {PLAYLIST.map((track, idx) => (
              <button
                key={track.id}
                onClick={() => { setCurrentIndex(idx); setProgress(0); setPlaying(true); }}
                aria-label={`Jouer ${track.title}`}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{ background: idx === currentIndex ? 'rgba(252,60,68,0.08)' : 'transparent' }}
                onMouseEnter={(e) => { if (idx !== currentIndex) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = idx === currentIndex ? 'rgba(252,60,68,0.08)' : 'transparent'; }}
              >
                <div
                  className="w-9 h-9 rounded-lg shrink-0"
                  style={{ background: `linear-gradient(135deg, ${track.color}, #555)` }}
                />
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-medium leading-tight" style={{ color: idx === currentIndex ? '#FC3C44' : '#1d1d1f' }}>
                    {track.title}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(0,0,0,0.4)' }}>{track.artist}</p>
                </div>
                <span className="text-[11px]" style={{ color: 'rgba(0,0,0,0.3)' }}>{track.duration}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}
