'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

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
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
      style={{
        backgroundImage: `url('/images/wallpaper.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={onUnlock}
      exit={{
        opacity: 0,
        scale: 1.06,
        transition: { duration: 0.65, ease: [0.32, 0, 0.67, 0] },
      }}
    >
      {/* Frosted overlay */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(28px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
          background: 'rgba(0,0,0,0.18)',
        }}
      />

      {/* Clock + date */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-white"
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

      {/* Unlock hint */}
      <motion.div
        className="absolute bottom-10 sm:bottom-14 flex flex-col items-center gap-1.5 text-white/50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        >
          <ChevronUp size={20} />
        </motion.div>
        <span className="text-[11px] sm:text-[12px] tracking-[0.18em] uppercase font-medium">
          Cliquer pour entrer
        </span>
      </motion.div>
    </motion.div>
  );
}
