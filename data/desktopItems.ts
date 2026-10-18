// Single source of truth for what's actually sitting on the desktop.
// Both the Desktop collage and the Finder "Bureau" section read from this list,
// so they can never drift out of sync.
export interface DesktopItemConfig {
  id: string;
  label: string;
  imageSrc: string;
  imageColor: string;
  rotate: number;
  style: React.CSSProperties;
  width: number;
  aspectRatio: string;
  type: 'photo' | 'folder' | 'map';
  // 'photos' ouvre l'app Photos sur l'album, 'finder' ouvre un dossier du Finder
  action:
    | { type: 'photos'; album?: string }
    | { type: 'finder'; folder?: string }
    | { type: 'lightbox' };
  finderSelectHover?: boolean;
  blink?: boolean;
}

export const DESKTOP_ITEMS: DesktopItemConfig[] = [
  {
    id: 'derniers-projets-item',
    label: 'DERNIERS PROJETS',
    imageSrc: '/images/desktop/FilesRedDerniersProjets.png',
    imageColor: 'transparent',
    rotate: 0,
    style: { left: '24%', top: '12%' },
    width: 72,
    aspectRatio: '68/54',
    type: 'folder',
    action: { type: 'finder', folder: 'projets-recents' },
  },
  {
    id: 'costa-rica-item',
    label: 'COSTA RICA',
    imageSrc: '/images/projects/18-08 COSTA RICA/DSC_0787_1.avif',
    imageColor: '#0a2e1a',
    rotate: 0,
    style: { right: '6%', top: '10%' },
    width: 110,
    aspectRatio: '4/3',
    type: 'photo',
    action: { type: 'photos', album: 'costa-rica' },
  },
  {
    id: 'papic-item',
    label: 'PAPIC',
    imageSrc: '/images/projects/25-07-25 SHOOT_LES RATS/MSA00016.avif',
    imageColor: '#1a0a0a',
    rotate: 0,
    style: { right: '20%', top: '32%' },
    width: 84,
    aspectRatio: '1/1',
    type: 'photo',
    action: { type: 'photos', album: 'shoot-les-rats' },
  },
  {
    id: 'ile-de-re-item',
    label: 'ÎLE DE RÉ',
    imageSrc: '/images/projects/24-08 ILE DE RE/MSA00126.avif',
    imageColor: '#0a1e2e',
    rotate: 0,
    style: { right: '1%', bottom: '19%' },
    width: 136,
    aspectRatio: '3/2',
    type: 'photo',
    action: { type: 'photos', album: 'ile-de-re-2024' },
  },
  {
    id: 'maroc-item',
    label: 'MAROC',
    imageSrc: '/images/projects/23-01 Maroc/DSC_0153.avif',
    imageColor: '#2e1a00',
    rotate: 0,
    style: { left: '8%', bottom: '11%' },
    width: 112,
    aspectRatio: '2/3',
    type: 'photo',
    action: { type: 'photos', album: 'maroc-2023' },
  },
];
