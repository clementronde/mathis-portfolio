'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PROJECTS } from '@/data/projects';
import { encodeSrc } from '@/utils/path';

// Intro : le texte d'accueil au centre, entouré de photos qui viennent vers nous en 3D,
// puis tout s'efface avant que le fond de verrouillage apparaisse
// Deux lignes de longueurs différentes : un titre court puis une phrase plus longue et plus légère,
// pour éviter l'effet de bloc carré
const INTRO_LINES = ['Bienvenue sur mon portfolio,', 'balade-toi dans mon univers pour découvrir mon travail'];
const INTRO_DURATION_MS = 5300;
const SHOW_INTRO = true;
// Texte tapé lettre par lettre, comme au clavier
const TYPE_START_MS = 500;
const TYPE_TOTAL_MS = 3000;
const INTRO_CHAR_COUNT = INTRO_LINES.join('').length;
const TYPE_CHAR_MS = TYPE_TOTAL_MS / INTRO_CHAR_COUNT;

const CARET_CSS = `
@keyframes intro-caret { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
.intro-caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.12em;
  background: currentColor;
  animation: intro-caret 1s step-end infinite;
}
`;

function TypedIntroText() {
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setTyped((count) => {
          if (count + 1 >= INTRO_CHAR_COUNT) window.clearInterval(interval);
          return Math.min(INTRO_CHAR_COUNT, count + 1);
        });
      }, TYPE_CHAR_MS);
    }, TYPE_START_MS);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [reduceMotion]);

  const shown = reduceMotion ? INTRO_CHAR_COUNT : typed;
  let offset = 0;
  return (
    <>
      <style>{CARET_CSS}</style>
      <span className="sr-only">{INTRO_LINES.join(' ')}</span>
      {INTRO_LINES.map((line, index) => {
        const lineStart = offset;
        offset += line.length;
        const visible = Math.max(0, Math.min(line.length, shown - lineStart));
        // Le curseur reste sur la ligne en cours, puis sur la dernière une fois le texte fini
        const hasCaret =
          (shown >= lineStart && shown < lineStart + line.length) ||
          (index === INTRO_LINES.length - 1 && shown >= INTRO_CHAR_COUNT) ||
          (index === 0 && shown === 0);
        return (
          <span
            key={line}
            className="block"
            style={index === 0 ? undefined : { marginTop: '0.5em', fontSize: '0.5em', fontWeight: 500, color: '#3a3a3c', letterSpacing: '-0.005em' }}
            aria-hidden="true"
          >
            {line.slice(0, visible)}
            {hasCaret && <span className="intro-caret" />}
            {/* Reste invisible : la mise en page centrée ne bouge pas pendant la frappe */}
            <span style={{ visibility: 'hidden' }}>{line.slice(visible)}</span>
          </span>
        );
      })}
    </>
  );
}

// Une photo de couverture par projet. Chaque photo garde une position fixe autour du centre
// (angle d'or pour une répartition régulière sans motif visible) et avance en profondeur
// vers la caméra : la perspective la fait grossir et s'écarter du centre en s'approchant
const INTRO_PHOTO_COUNT = 22;
const INTRO_FLIGHT_S = 7;
const GOLDEN_ANGLE = 137.508;
// Couvertures d'abord, puis d'autres photos des projets pour remplir l'espace
const INTRO_SOURCES = [
  ...PROJECTS.map((project) => project.coverImage),
  ...PROJECTS.flatMap((project) => project.images.filter((src) => src !== project.coverImage).slice(0, 1)),
].slice(0, INTRO_PHOTO_COUNT);
const INTRO_PHOTOS = INTRO_SOURCES.map((src, index) => {
  const angle = ((index * GOLDEN_ANGLE) % 360) * (Math.PI / 180);
  // Jamais pile au centre, pour que les photos proches ne masquent pas le texte
  const radius = 26 + (index % 7) * 5;
  return {
    src,
    x: `${(Math.cos(angle) * radius).toFixed(2)}vw`,
    y: `${(Math.sin(angle) * radius * 0.62).toFixed(2)}vw`,
    width: 80 + (index % 4) * 16,
    // Délais négatifs : au démarrage, les photos sont déjà à toutes les profondeurs
    delay: `-${((index / INTRO_PHOTO_COUNT) * INTRO_FLIGHT_S).toFixed(2)}s`,
  };
});

// Styles de l'intro dans le composant : ils se chargent avec lui, sans dépendre de globals.css
const INTRO_CSS = `
.intro-space {
  position: absolute;
  inset: 0;
  z-index: 0;
  isolation: isolate;
  overflow: hidden;
  perspective: 1000px;
  perspective-origin: 50% 50%;
}
.intro-fly-photo {
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  height: auto;
  opacity: 0;
  will-change: transform, opacity;
  animation: intro-fly ${INTRO_FLIGHT_S}s linear infinite;
}
@keyframes intro-fly {
  0% { opacity: 0; transform: translate(-50%, -50%) translate3d(var(--intro-x), var(--intro-y), -3200px); }
  /* Invisibles tant qu'elles sont minuscules derrière le texte, puis apparaissent franchement */
  38% { opacity: 0; }
  52% { opacity: 1; }
  88% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) translate3d(var(--intro-x), var(--intro-y), 820px); }
}
@media (prefers-reduced-motion: reduce) {
  .intro-fly-photo {
    animation: none;
    opacity: 1;
    transform: translate(-50%, -50%) translate3d(var(--intro-x), var(--intro-y), -900px);
  }
}
`;

function IntroScene() {
  return (
    <motion.div
      key="intro"
      className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
      style={{ background: '#f1efea' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      transition={{ duration: 0.5 }}
    >
      <style>{INTRO_CSS}</style>
      <div className="intro-space" aria-hidden="true">
        {INTRO_PHOTOS.map((photo) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photo.src}
            src={encodeSrc(photo.src)}
            alt=""
            className="intro-fly-photo"
            style={{
              width: photo.width,
              '--intro-x': photo.x,
              '--intro-y': photo.y,
              animationDelay: photo.delay,
            } as React.CSSProperties}
            draggable={false}
          />
        ))}
      </div>

      {/* Zone claire derrière le texte : les photos s'y estompent sans flou */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 34% 24% at 50% 50%, rgba(241,239,234,0.92) 0%, rgba(241,239,234,0.7) 55%, rgba(241,239,234,0) 100%)',
        }}
        aria-hidden="true"
      />

      <h1
        className="relative z-10 mx-4 text-center font-semibold"
        style={{
          // Calque à part pour que le texte reste au-dessus des photos en 3D
          transform: 'translateZ(0)',
          color: '#111111',
          fontSize: 'clamp(26px, 3.8vw, 60px)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          // Halo couleur fond net (pas de flou d'arrière-plan) pour détacher le texte des photos
          textShadow: '0 0 2px #f1efea, 0 0 8px #f1efea, 0 0 18px #f1efea, 0 0 36px #f1efea',
        }}
      >
        <TypedIntroText />
      </h1>
    </motion.div>
  );
}

interface LockScreenProps {
  canUnlock: boolean;
  loadedImages: number;
  onUnlock: () => void;
  totalImages: number;
}

export function LockScreen({ canUnlock, loadedImages, onUnlock, totalImages }: LockScreenProps) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [introDone, setIntroDone] = useState(!SHOW_INTRO);
  // Le fond n'apparaît qu'une fois le texte d'intro complètement effacé
  const [showLock, setShowLock] = useState(!SHOW_INTRO);
  const progress = totalImages > 0 ? Math.round((loadedImages / totalImages) * 100) : 100;

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setDate(
        now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
      );
    }
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!SHOW_INTRO) return;
    const timer = window.setTimeout(() => setIntroDone(true), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.div
      key="lockscreen"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        backgroundColor: '#000000',
        cursor: !showLock ? 'default' : canUnlock ? 'pointer' : 'wait',
      }}
      onClick={() => showLock && onUnlock()}
      exit={{
        opacity: 0,
        scale: 1.06,
        transition: { duration: 0.65, ease: [0.32, 0, 0.67, 0] },
      }}
    >
      <AnimatePresence onExitComplete={() => setShowLock(true)}>
        {!introDone && <IntroScene />}
      </AnimatePresence>

      {showLock && (
        <>
          {/* Wallpaper */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('/images/desktop/wallpaperverouillage.avif')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            // Apparition en fondu une fois l'intro effacée
            initial={SHOW_INTRO ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />

          {/* Date + heure, disposition de l'écran verrouillé de macOS */}
          <div
            className="absolute top-[7vh] z-10 flex flex-col items-center text-white"
            style={{ textShadow: '0 1px 20px rgba(0,0,0,0.18)' }}
          >
            <div
              className="font-semibold"
              style={{ fontSize: 'clamp(15px, 1.4vw, 22px)', opacity: 0.85 }}
            >
              {date}
            </div>
            <div
              className="leading-none"
              style={{
                fontFamily: 'var(--font-apple-rounded)',
                fontSize: 'clamp(64px, 7.5vw, 128px)',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
                opacity: 0.8,
              }}
            >
              {time}
            </div>
          </div>

          {/* Profil */}
          <div
            className="absolute bottom-[5vh] z-10 flex flex-col items-center text-white"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.35)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/desktop/Ellipsemathis.png"
              alt=""
              className="h-[56px] w-[56px] sm:h-[72px] sm:w-[72px] rounded-full"
              style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}
              draggable={false}
            />
            <span className="mt-3 text-[15px] sm:text-[18px] font-semibold">CREATIVE HUMAN</span>
            <span className="mt-1.5 text-[12px] sm:text-[14px] text-white/70">
              {canUnlock ? 'Cliquer pour entrer' : `Chargement ${progress} %`}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}
