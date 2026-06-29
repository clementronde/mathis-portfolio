'use client';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { encodeSrc } from '@/utils/path';

const PREMIERE_BG = '/premiere/Premierebg.png';

export function PremiereWindow() {
  return (
    <Window
      id="premiere"
      title="Premiere Pro"
      icon={<AppIcon id="premiere" size={16} />}
      chrome="frameless"
      defaultSize={{ width: 900, height: 585 }}
    >
      <div
        className="h-full w-full"
        style={{
          backgroundImage: `url("${encodeSrc(PREMIERE_BG)}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#161221',
        }}
      />
    </Window>
  );
}
