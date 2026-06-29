'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LockScreenProps {
  canUnlock: boolean;
  loadedImages: number;
  onUnlock: () => void;
  totalImages: number;
}

export function LockScreen({ canUnlock, loadedImages, onUnlock, totalImages }: LockScreenProps) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const progress = totalImages > 0 ? Math.round((loadedImages / totalImages) * 100) : 100;

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setDate(
        now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      );
    }
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      key="lockscreen"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        backgroundImage: `url('/images/desktop/wallpaperverouillage.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#141414',
        cursor: canUnlock ? 'pointer' : 'wait',
      }}
      onClick={onUnlock}
      exit={{
        opacity: 0,
        scale: 1.06,
        transition: { duration: 0.65, ease: [0.32, 0, 0.67, 0] },
      }}
    >
      {/* Legibility overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.02) 46%, rgba(0,0,0,0.36) 100%)',
        }}
      />

      {/* Clock + date */}
      <motion.div
        className="absolute top-16 sm:top-20 z-10 flex flex-col items-center text-white"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="font-thin leading-none tracking-tight"
          style={{
            fontSize: 'clamp(72px, 20vw, 160px)',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 2px 60px rgba(0,0,0,0.25)',
          }}
        >
          {time}
        </div>
        <div
          className="mt-3 font-light capitalize tracking-wide opacity-85"
          style={{
            fontSize: 'clamp(15px, 3vw, 24px)',
            textShadow: '0 1px 16px rgba(0,0,0,0.3)',
          }}
        >
          {date}
        </div>
      </motion.div>

      {/* Profile */}
      <motion.div
        className="absolute bottom-14 sm:bottom-20 z-10 flex flex-col items-center text-white"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/desktop/Ellipsemathis.png"
          alt=""
          className="h-[86px] w-[86px] sm:h-[112px] sm:w-[112px] rounded-full"
          style={{
            boxShadow: '0 18px 48px rgba(0,0,0,0.36)',
          }}
          draggable={false}
        />
        <span
          className="mt-5 text-[19px] sm:text-[24px] font-semibold"
          style={{ textShadow: '0 2px 18px rgba(0,0,0,0.45)' }}
        >
          mathis straebler
        </span>
        <span className="mt-2 text-[12px] sm:text-[13px] tracking-[0.16em] font-medium text-white/70">
          {canUnlock ? 'Cliquer pour entrer' : `Chargement ${progress}%`}
        </span>
        <div
          className="mt-4 h-[3px] w-[132px] overflow-hidden rounded-full"
          style={{ background: 'rgba(255,255,255,0.22)' }}
          aria-hidden="true"
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'rgba(255,255,255,0.82)' }}
            initial={{ width: 0 }}
            animate={{ width: `${canUnlock ? 100 : progress}%` }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
