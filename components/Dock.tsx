'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DOCK_APPS } from '@/data/apps';
import { AppIcon } from '@/components/icons/AppIcons';
import { useWindowStore, type AppId } from '@/store/useWindowStore';

const panelStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.14)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

export function Dock({
  highlightPhotos = false,
  onPhotosClick,
}: {
  highlightPhotos?: boolean;
  onPhotosClick?: () => void;
}) {
  const { openWindow, openWindows } = useWindowStore();
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
      data-tour="dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] px-3 py-2 flex flex-row items-center gap-2 rounded-2xl"
      style={panelStyle}
      role="toolbar"
      aria-label="Dock d'applications"
    >
      {DOCK_APPS.map((app) => {
        const isOpen = openWindows.includes(app.id);
        const highlighted = highlightPhotos && app.id === 'photos';
        return (
          <motion.button
            key={app.id}
            // Le Finder s'ouvre toujours sur Documents depuis le dock
            onClick={() => {
              if (app.id === 'photos') onPhotosClick?.();
              openWindow(app.id, app.id === 'finder' ? 'documents' : undefined);
            }}
            aria-label={`Ouvrir ${app.label}`}
            title={app.label}
            className="relative flex items-center justify-center group outline-none"
            whileHover={{ y: -8, scale: 1.18 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <AppIcon id={app.id as AppId} size={iconSize} />

            {/* Mise en avant après la visite : cadre blanc + notification au-dessus de l'icône */}
            <AnimatePresence>
              {highlighted && (
                <>
                  <motion.span
                    key="photos-frame"
                    className="absolute pointer-events-none"
                    style={{
                      inset: -6,
                      borderRadius: 14,
                      border: '2px solid #ffffff',
                      boxShadow: '0 0 18px rgba(255,255,255,0.45)',
                    }}
                    initial={{ opacity: 0, scale: 1.25 }}
                    animate={{ opacity: [1, 0.55, 1], scale: 1 }}
                    // Transition propre à la sortie : sinon elle hérite de la boucle infinie et ne finit jamais
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{
                      scale: { type: 'spring', stiffness: 320, damping: 22 },
                      opacity: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    aria-hidden="true"
                  />
                  <motion.span
                    key="photos-notification"
                    role="status"
                    className="absolute left-1/2 bottom-full pointer-events-none whitespace-nowrap"
                    style={{
                      marginBottom: 16,
                      x: '-50%',
                      padding: '8px 14px',
                      borderRadius: 12,
                      background: '#ffffff',
                      color: '#1d1d1f',
                      fontSize: 13,
                      fontWeight: 600,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: [0, -4, 0] }}
                    exit={{ opacity: 0, y: 6, transition: { duration: 0.2 } }}
                    transition={{
                      opacity: { duration: 0.3 },
                      y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  >
                    Regarde mon travail
                    {/* Pointe de la bulle vers l'icône */}
                    <span
                      className="absolute left-1/2 top-full"
                      style={{
                        width: 10,
                        height: 10,
                        background: '#ffffff',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                      }}
                      aria-hidden="true"
                    />
                  </motion.span>
                </>
              )}
            </AnimatePresence>

            <span
              className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-1 h-1 rounded-full bg-white/75 transition-opacity"
              style={{ opacity: isOpen ? 1 : 0 }}
              aria-hidden="true"
            />

            <span
              // Masquée pendant la mise en avant pour ne pas recouvrir la notification
              style={{ display: highlighted ? 'none' : undefined }}
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
