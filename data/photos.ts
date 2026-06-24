export interface Photo {
  id: string;
  src: string;
  alt: string;
  category: 'portrait' | 'lifestyle' | 'sport' | 'voyage' | 'event' | 'perso';
  color: string;
}

export const PHOTOS: Photo[] = [
  { id: 'p1', src: '/images/photos/photo-1.jpg', alt: 'Portrait en lumière naturelle', category: 'portrait', color: '#2d1b1b' },
  { id: 'p2', src: '/images/photos/photo-2.jpg', alt: 'Course urbaine', category: 'sport', color: '#1a1a2e' },
  { id: 'p3', src: '/images/photos/photo-3.jpg', alt: 'Lifestyle Paris', category: 'lifestyle', color: '#1e2d1a' },
  { id: 'p4', src: '/images/photos/photo-4.jpg', alt: 'Voyage Maroc', category: 'voyage', color: '#2e1a0a' },
  { id: 'p5', src: '/images/photos/photo-5.jpg', alt: 'Concert Paris', category: 'event', color: '#0a0a2e' },
  { id: 'p6', src: '/images/photos/photo-6.jpg', alt: 'Portrait studio', category: 'portrait', color: '#1a0f1a' },
  { id: 'p7', src: '/images/photos/photo-7.jpg', alt: 'Soirée amis', category: 'perso', color: '#2e1a1a' },
  { id: 'p8', src: '/images/photos/photo-8.jpg', alt: 'Coucher de soleil', category: 'voyage', color: '#2e200a' },
  { id: 'p9', src: '/images/photos/photo-9.jpg', alt: 'Shooting mode', category: 'lifestyle', color: '#1a1a1a' },
  { id: 'p10', src: '/images/photos/photo-10.jpg', alt: 'Running aube', category: 'sport', color: '#0a1a2e' },
  { id: 'p11', src: '/images/photos/photo-11.jpg', alt: 'Portrait rue', category: 'portrait', color: '#1e1a0f' },
  { id: 'p12', src: '/images/photos/photo-12.jpg', alt: 'Festival musique', category: 'event', color: '#1a0a2e' },
  { id: 'p13', src: '/images/photos/photo-13.jpg', alt: 'Famille déjeuner', category: 'perso', color: '#2e1e0a' },
  { id: 'p14', src: '/images/photos/photo-14.jpg', alt: 'Barcelone rue', category: 'voyage', color: '#1a1e2e' },
  { id: 'p15', src: '/images/photos/photo-15.jpg', alt: 'Sport action', category: 'sport', color: '#0a1a0a' },
  { id: 'p16', src: '/images/photos/photo-16.jpg', alt: 'Portrait intime', category: 'portrait', color: '#2e1a2e' },
];

export const PHOTO_CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'portrait', label: 'Portrait' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'sport', label: 'Sport' },
  { id: 'voyage', label: 'Voyage' },
  { id: 'event', label: 'Event' },
  { id: 'perso', label: 'Perso' },
] as const;
