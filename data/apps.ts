import type { AppId } from '@/store/useWindowStore';

export interface App {
  id: AppId;
  label: string;
}

export const DOCK_APPS: App[] = [
  { id: 'finder', label: 'Finder' },
  { id: 'mail', label: 'Mail' },
  { id: 'photos', label: 'Photos' },
  { id: 'maps', label: 'Maps' },
];
