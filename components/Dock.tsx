'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DOCK_APPS } from '@/data/apps';
import { AppIcon } from '@/components/icons/AppIcons';
import { useWindowStore, type AppId } from '@/store/useWindowStore';
import { getOpenStepIndexForApp, useScrollytellingStore } from '@/store/useScrollytellingStore';

const panelStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.14)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

export function Dock() {
  const { openWindow, openWindows } = useWindowStore();
  const setStep = useScrollytellingStore((state) => state.setStep);
  // Petit = phone + tablette (< 1024px) → icônes plus petites
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsSmall(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const iconSize = isSmall ? 36 : 44;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] px-3 py-2 flex flex-row items-center gap-2 rounded-2xl"
      style={panelStyle}
      role="toolbar"
      aria-label="Dock d'applications"
    >
      {DOCK_APPS.map((app) => {
        const isOpen = openWindows.includes(app.id);
        return (
          <motion.button
            key={app.id}
            onClick={() => { openWindow(app.id); setStep(getOpenStepIndexForApp(app.id)); }}
            aria-label={`Ouvrir ${app.label}`}
            title={app.label}
            className="relative flex items-center justify-center group outline-none"
            whileHover={{ y: -8, scale: 1.18 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <AppIcon id={app.id as AppId} size={iconSize} />

            <span
              className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-1 h-1 rounded-full bg-white/75 transition-opacity"
              style={{ opacity: isOpen ? 1 : 0 }}
              aria-hidden="true"
            />

            <span
              className="absolute bottom-full mb-3 bg-black/80 text-white text-[11px] px-2 py-1 rounded-md
                         whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
            >
              {app.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
