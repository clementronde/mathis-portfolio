'use client';
import { useEffect, useState } from 'react';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { encodeSrc } from '@/utils/path';

const PREMIERE_BG = '/premiere/Premierebg.png';
const PREMIERE_MOBILE_BG = '/images/premiereprobgmobile.png';
const PREMIERE_VIDEO = '/images/desktop/202606302120 (1).mp4';
const PREMIERE_RATIO = 1512 / 982;
const PREMIERE_MOBILE_RATIO = 604 / 830;

export function PremiereWindow() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <Window
      id="premiere"
      title="Premiere Pro"
      icon={<AppIcon id="premiere" size={16} />}
      chrome="frameless"
      defaultSize={isMobile
        ? { width: 604, height: 830 }
        : { width: 900, height: Math.round(900 / PREMIERE_RATIO) }
      }
      fixedAspectRatio={isMobile ? PREMIERE_MOBILE_RATIO : PREMIERE_RATIO}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          backgroundImage: `url("${encodeSrc(isMobile ? PREMIERE_MOBILE_BG : PREMIERE_BG)}")`,
          backgroundSize: '100% 100%',
          backgroundColor: '#161221',
        }}
      >
        {/* Rectangle du Programme monitor — desktop */}
        {!isMobile && (
          <div
            className="absolute overflow-hidden bg-black"
            style={{ left: '30%', top: '10%', width: '36.9%', height: '30.2%' }}
          >
            <video
              src={encodeSrc(PREMIERE_VIDEO)}
              autoPlay
              loop
              muted
              playsInline
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Rectangle du Programme monitor — mobile */}
        {isMobile && (
          <div
            className="absolute overflow-hidden bg-black"
            style={{ left: '27.8%', top: '9%', width: '70%', height: '45%' }}
          >
            <video
              src={encodeSrc(PREMIERE_VIDEO)}
              autoPlay
              loop
              muted
              playsInline
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
    </Window>
  );
}
