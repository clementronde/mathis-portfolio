'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { encodeSrc } from '@/utils/path';

const PHOTOSHOP_IMAGE = '/Photoshop/imagephotoshop.png';
const PHOTOSHOP_BG = '/Photoshop/Photoshopbg.png';
const PHOTOSHOP_RATIO = 1512 / 861;

export function PhotoshopWindow() {
  const imageRef = useRef<HTMLDivElement>(null);
  const [reveal, setReveal] = useState(50);

  function updateReveal(clientX: number) {
    const bounds = imageRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const nextReveal = ((clientX - bounds.left) / bounds.width) * 100;
    setReveal(Math.max(0, Math.min(100, nextReveal)));
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateReveal(event.clientX);
  }

  return (
    <Window
      id="photoshop"
      title="Photoshop"
      icon={<AppIcon id="photoshop" size={16} />}
      chrome="frameless"
      defaultSize={{ width: 900, height: Math.round(900 / PHOTOSHOP_RATIO) }}
      fixedAspectRatio={PHOTOSHOP_RATIO}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          backgroundImage: `url("${encodeSrc(PHOTOSHOP_BG)}")`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute"
          style={{
            left: '2.8%',
            top: '10.9%',
            width: '72.5%',
            height: '86.5%',
          }}
        >
          <motion.div
            ref={imageRef}
            className="absolute left-1/2 top-1/2 h-[78%] max-h-[78%] -translate-x-1/2 -translate-y-1/2 overflow-hidden"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              aspectRatio: '433 / 650',
              boxShadow: '0 24px 80px rgba(0,0,0,0.42)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={encodeSrc(PHOTOSHOP_IMAGE)}
              alt="Image retouchée"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />

            <div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - reveal}% 0 0)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encodeSrc(PHOTOSHOP_IMAGE)}
                alt="Image non retouchée"
                className="h-full w-full object-cover"
                style={{
                  filter: 'brightness(0.72) contrast(0.82) saturate(0.78)',
                }}
                draggable={false}
              />
            </div>

            <div
              className="absolute inset-y-0 w-px bg-white/95"
              style={{
                left: `${reveal}%`,
                boxShadow: '0 0 16px rgba(0,0,0,0.55)',
              }}
              aria-hidden="true"
            />

            <button
              type="button"
              aria-label="Déplacer le comparateur avant après"
              data-no-window-drag
              className="absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-black/45 text-white shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-md outline-none transition-transform hover:scale-105 active:scale-95"
              style={{ left: `${reveal}%`, touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={(event) => {
                if (event.buttons !== 1) return;
                event.preventDefault();
                event.stopPropagation();
                updateReveal(event.clientX);
              }}
            >
              <span className="flex items-center gap-0.5 text-[18px] leading-none" aria-hidden="true">
                <span>‹</span>
                <span>›</span>
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    </Window>
  );
}
