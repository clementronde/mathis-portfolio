'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  artwork: string;
  audioSrc: string;
}

const TRACKS: Track[] = [
  {
    id: 'clint-eastwood',
    title: 'Clint Eastwood',
    artist: 'Gorillaz',
    duration: '3:02',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5b/8d/47/5b8d47da-71ea-93ab-dffc-733f11332659/825646290703.jpg/600x600bb.jpg',
    audioSrc: '/audio/%5BHD%5D%20Gorillaz%20-%20Clint%20Eastwood.mp3',
  },
  {
    id: 'come-on-eileen',
    title: 'Come on Eileen',
    artist: 'Dexys Midnight Runners',
    duration: '3:02',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/98/a5/7c/98a57c6d-c857-90bb-5835-fdd60699bf05/06UMGIM09147.rgb.jpg/600x600bb.jpg',
    audioSrc: '/audio/Dexys%20Midnight%20Runners%2C%20Kevin%20Rowland%20-%20Come%20On%20Eileen%20%281982%20Version%29.mp3',
  },
  {
    id: 'human-nature',
    title: 'Human Nature',
    artist: 'Michael Jackson',
    duration: '3:02',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg',
    audioSrc: '/audio/Michael%20Jackson%20-%20Human%20Nature%20%28Audio%29.mp3',
  },
  {
    id: 'losing-my-religion',
    title: 'Losing My Religion',
    artist: 'Oscar and the Wolf',
    duration: '3:02',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/5c/fd/46/5cfd46a5-ecbd-6f16-25f5-ab14ad098c00/820200597700.jpg/600x600bb.jpg',
    audioSrc: '/audio/R.E.M.%20-%20Losing%20My%20Religion%20Lyrics.mp3',
  },
];

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function Cover({ track, className }: { track: Track; className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={track.artwork}
      alt=""
      className={`${className} object-cover bg-neutral-100`}
      draggable={false}
    />
  );
}

export function MusicWindow() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const shouldContinueRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMobile, setIsMobile] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);

  const current = TRACKS[currentIndex];
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(0);
    setDuration(0);
    setPlayError(null);
  }, [current.audioSrc]);

  function playElement(audio: HTMLAudioElement) {
    if (!audio.getAttribute('src')) {
      audio.src = current.audioSrc;
      audio.load();
    }

    setPlayError(null);
    return audio.play()
      .then(() => setPlaying(true))
      .catch((error) => {
        setPlaying(false);
        setPlayError(error instanceof Error ? error.message : 'Lecture impossible');
      });
  }

  function playAudio(index: number, mode: 'play' | 'preserve' = 'play') {
    const audio = audioRef.current;
    if (!audio) return;

    shouldContinueRef.current = mode === 'play' || playing;

    if (index !== currentIndex) {
      pendingPlayRef.current = shouldContinueRef.current;
      setCurrentIndex(index);
      setCurrentTime(0);
      setDuration(0);
      setPlayError(null);
      if (!shouldContinueRef.current) setPlaying(false);
      return;
    }

    setPlayError(null);
    if (shouldContinueRef.current) {
      void playElement(audio);
    }
  }

  function playTrack(index: number) {
    playAudio(index);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      shouldContinueRef.current = false;
      setPlaying(false);
      return;
    }

    shouldContinueRef.current = true;
    void playElement(audio);
  }

  function prev() {
    playAudio((currentIndex - 1 + TRACKS.length) % TRACKS.length);
  }

  function next() {
    playAudio((currentIndex + 1) % TRACKS.length, 'preserve');
  }

  function handleCanPlay() {
    const audio = audioRef.current;
    if (!audio || !pendingPlayRef.current) return;

    pendingPlayRef.current = false;
    void playElement(audio);
  }

  return (
    <Window
      id="music"
      title="Musique"
      icon={<AppIcon id="music" size={16} />}
      chrome="frameless"
      defaultSize={{ width: 900, height: 600 }}
    >
      <div
        className="flex h-full flex-col overflow-hidden"
        data-window-interactive="true"
        style={{ background: '#ffffff', color: '#111111' }}
      >
        <audio
          ref={audioRef}
          src={current.audioSrc}
          preload="auto"
          onCanPlay={handleCanPlay}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onPlay={() => {
            setPlaying(true);
            setPlayError(null);
          }}
          onPause={() => setPlaying(false)}
          onError={() => {
            setPlaying(false);
            setPlayError('Le fichier audio ne peut pas être lu par le navigateur.');
          }}
          onEnded={next}
        />

        <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 pb-5 pt-12' : 'px-8 pb-6 pt-10'}`}>
          <section>
            <h2 className={`${isMobile ? 'text-[16px]' : 'text-[20px]'} font-semibold`} style={{ color: 'rgba(0,0,0,0.68)' }}>
              Mes favoris du moment
            </h2>
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-x-4 gap-y-5 pt-4' : 'grid-cols-4 gap-6 pt-6'}`}>
              {TRACKS.map((track, index) => {
                const active = index === currentIndex;
                return (
                  <button
                    key={track.id}
                    onClick={() => playTrack(index)}
                    className="group text-left outline-none"
                    aria-label={`Jouer ${track.title}`}
                  >
                    <div className="relative">
                      <Cover
                        track={track}
                        className={`aspect-square w-full border transition-transform ${active ? 'scale-[0.98]' : 'group-hover:scale-[0.985]'}`}
                      />
                      {active && playing && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/18">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-black">
                            <Pause size={18} fill="black" />
                          </span>
                        </span>
                      )}
                    </div>
                    <p className={`${isMobile ? 'text-[12px]' : 'text-[16px]'} mt-3 font-medium leading-tight truncate`}>
                      {track.title}
                    </p>
                    <p className={`${isMobile ? 'text-[11px]' : 'text-[14px]'} mt-1 truncate`} style={{ color: 'rgba(0,0,0,0.72)' }}>
                      {track.artist}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={isMobile ? 'mt-9' : 'mt-14'}>
            <h2 className={`${isMobile ? 'text-[16px]' : 'text-[20px]'} font-semibold`} style={{ color: 'rgba(0,0,0,0.68)' }}>
              Bibliothèque
            </h2>
            <div className={isMobile ? 'mt-4 -mx-4' : 'mt-6 -mx-8'}>
              {TRACKS.map((track, index) => {
                const active = index === currentIndex;
                return (
                  <button
                    key={track.id}
                    onClick={() => playTrack(index)}
                    className={`w-full grid items-center transition-colors ${isMobile ? 'grid-cols-[44px_1fr_auto] gap-3 px-4 py-3' : 'grid-cols-[56px_minmax(0,1fr)_minmax(160px,0.8fr)_52px] gap-5 px-8 py-4'}`}
                    style={{ background: active ? '#f2f2f2' : '#ffffff', borderTop: '1px solid rgba(0,0,0,0.05)' }}
                    aria-label={`Jouer ${track.title}`}
                  >
                    <Cover track={track} className={isMobile ? 'h-[40px] w-[40px]' : 'h-[44px] w-[44px]'} />
                    <span className="min-w-0 text-left">
                      <span className={`${isMobile ? 'text-[12px]' : 'text-[15px]'} block font-medium truncate`}>{track.title}</span>
                      {isMobile && (
                        <span className="block text-[11px] truncate" style={{ color: 'rgba(0,0,0,0.58)' }}>{track.artist}</span>
                      )}
                    </span>
                    {!isMobile && <span className="text-left text-[15px] truncate" style={{ color: 'rgba(0,0,0,0.82)' }}>{track.artist}</span>}
                    <span className={`${isMobile ? 'text-[11px]' : 'text-[15px]'} justify-self-end`} style={{ color: 'rgba(0,0,0,0.82)' }}>
                      {track.duration}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div
          className={`${isMobile ? 'px-4 py-3' : 'px-6 py-3'} shrink-0`}
          style={{ background: 'rgba(255,255,255,0.92)', borderTop: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(18px)' }}
        >
          <div className="flex items-center gap-4">
            <Cover track={current} className="h-10 w-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">{current.title}</p>
                  <p className="truncate text-[11px]" style={{ color: playError ? '#c0392b' : 'rgba(0,0,0,0.48)' }}>
                    {playError ?? (playing ? 'Lecture en cours' : current.artist)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {!isMobile && <Shuffle size={15} style={{ color: 'rgba(0,0,0,0.35)' }} />}
                  <button onClick={prev} aria-label="Précédent" style={{ color: 'rgba(0,0,0,0.5)' }}>
                    <SkipBack size={18} />
                  </button>
                  <button
                    onClick={togglePlay}
                    aria-label={playing ? 'Pause' : 'Lecture'}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
                    style={{ background: '#FC3C44', color: '#fff' }}
                  >
                    {playing ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                  </button>
                  <button onClick={next} aria-label="Suivant" style={{ color: 'rgba(0,0,0,0.5)' }}>
                    <SkipForward size={18} />
                  </button>
                  {!isMobile && <Repeat size={15} style={{ color: 'rgba(0,0,0,0.35)' }} />}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="w-8 text-[10px]" style={{ color: 'rgba(0,0,0,0.42)' }}>{formatTime(currentTime)}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(0,0,0,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: '#FC3C44' }} />
                </div>
                <span className="w-8 text-right text-[10px]" style={{ color: 'rgba(0,0,0,0.42)' }}>{formatTime(duration)}</span>
                {!isMobile && (
                  <label className="ml-4 flex items-center gap-2" aria-label="Volume">
                    <Volume2 size={15} style={{ color: 'rgba(0,0,0,0.42)' }} />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(event) => setVolume(Number(event.target.value))}
                      className="w-20 accent-[#FC3C44]"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}
