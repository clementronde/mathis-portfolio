'use client';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';

export function HomeNotifications() {
  const openWindow = useWindowStore((state) => state.openWindow);

  return (
    <motion.div
      data-tour="widgets"
      className="absolute left-3 sm:left-5 top-11 sm:top-14 z-0 flex w-[210px] sm:w-[260px] flex-col gap-2.5 select-none"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Photos widget */}
      <button
        type="button"
        onClick={() => openWindow('photos')}
        className="overflow-hidden rounded-2xl bg-white/95 text-left shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-transform hover:scale-[1.02] active:scale-[0.99]"
      >
        <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/icons/Photosicon.png"
            alt=""
            className="h-5 w-5 rounded-[6px]"
            draggable={false}
          />
          <span className="text-[13px] font-medium text-black/90">Photos</span>
        </div>
        <div className="aspect-[16/10] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/desktop/Couscous.png"
            alt="Aperçu Photos"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      </button>

      {/* Mail widget */}
      <button
        type="button"
        onClick={() => openWindow('mail')}
        className="flex items-center gap-3 rounded-2xl bg-white/95 px-3 py-2.5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-transform hover:scale-[1.02] active:scale-[0.99]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/icons/Mailicon.png"
          alt=""
          className="h-8 w-8 flex-shrink-0 rounded-[8px]"
          draggable={false}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-black/90">Mail</div>
          <div className="truncate text-[12px] text-black/60">
            Envie de me contacter pour un projet ?
          </div>
        </div>
        <ChevronRight size={16} className="flex-shrink-0 text-black/30" />
      </button>
    </motion.div>
  );
}
