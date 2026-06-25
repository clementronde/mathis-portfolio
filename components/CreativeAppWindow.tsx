'use client';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import type { AppId } from '@/store/useWindowStore';

const APP_DATA: Record<string, {
  title: string;
  description: string;
  skills: { label: string; level: number }[];
  color: string;
  accentColor: string;
}> = {
  lightroom: {
    title: 'Adobe Lightroom',
    description: 'Étalonnage colorimétrique, développement RAW, gestion des archives photo et création de presets personnalisés.',
    skills: [
      { label: 'Étalonnage colorimétrique', level: 95 },
      { label: 'Développement RAW', level: 90 },
      { label: 'Presets personnalisés', level: 85 },
      { label: 'Gestion de catalogue', level: 88 },
      { label: 'Export multi-formats', level: 92 },
    ],
    color: '#001D26',
    accentColor: '#31A8FF',
  },
  photoshop: {
    title: 'Adobe Photoshop',
    description: 'Retouche avancée, compositing créatif, nettoyage d\'image et habillage print.',
    skills: [
      { label: 'Retouche portrait', level: 88 },
      { label: 'Compositing', level: 78 },
      { label: 'Nettoyage & recadrage', level: 92 },
      { label: 'Masques & sélections', level: 85 },
      { label: 'Print & mise en page', level: 75 },
    ],
    color: '#001C26',
    accentColor: '#31A8FF',
  },
  premiere: {
    title: 'Adobe Premiere Pro',
    description: 'Montage vidéo, création de reels et clips courts, habillage sonore et exportation.',
    skills: [
      { label: 'Montage vidéo', level: 82 },
      { label: 'Reels & clips courts', level: 88 },
      { label: 'Motion graphics basique', level: 70 },
      { label: 'Sound design', level: 72 },
      { label: 'Export & formats', level: 90 },
    ],
    color: '#0D0D26',
    accentColor: '#9999FF',
  },
};

const POSITIONS: Record<string, { x: number; y: number }> = {
  lightroom: { x: 400, y: 60 },
  photoshop: { x: 440, y: 90 },
  premiere: { x: 480, y: 110 },
};

interface Props {
  id: 'lightroom' | 'photoshop' | 'premiere';
}

export function CreativeAppWindow({ id }: Props) {
  const data = APP_DATA[id];

  return (
    <Window
      id={id as AppId}
      title={data.title}
      icon={<AppIcon id={id as AppId} size={16} />}
      chrome="frameless"
      defaultSize={{ width: 500, height: 420 }}
    >
      <div
        className="flex flex-col h-full px-6 pb-6 pt-[86px] overflow-y-auto"
        style={{ background: '#ffffff', color: '#1d1d1f' }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <AppIcon id={id as AppId} size={52} />
          <div>
            <h2 className="text-[18px] font-semibold" style={{ color: '#1d1d1f' }}>{data.title}</h2>
            <p className="text-[13px] mt-1 leading-relaxed max-w-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>{data.description}</p>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(0,0,0,0.35)' }}>Compétences</p>
          {data.skills.map((skill) => (
            <div key={skill.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[13px]" style={{ color: 'rgba(0,0,0,0.75)' }}>{skill.label}</span>
                <span className="text-[12px]" style={{ color: 'rgba(0,0,0,0.4)' }}>{skill.level}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${skill.level}%`,
                    background: data.accentColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}
