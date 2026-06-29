export type NoteCategory = 'about' | 'career' | 'education';

export interface NoteDetail {
  label: string;
  value: string;
}

export interface Note {
  id: string;
  title: string;
  listTitle?: string;
  category: NoteCategory;
  date: string;
  details: NoteDetail[];
  content?: string;
  tags?: string[];
}

export const NOTES: Note[] = [
  {
    id: 'qui-je-suis',
    title: 'Qui je suis ?',
    listTitle: 'Creative Producer',
    category: 'about',
    date: 'Heaven Paris',
    details: [
      { label: 'Société', value: 'Heaven' },
      { label: 'Lieu', value: 'Paris' },
      { label: 'Période', value: 'Septembre 2024 - Septembre 2026' },
      { label: "Type d'emploi", value: 'Alternance' },
      { label: 'Description', value: '....' },
    ],
  },
  {
    id: 'creative-producer',
    title: 'Creative Producer',
    category: 'career',
    date: 'Heaven Paris',
    details: [
      { label: 'Société', value: 'Heaven' },
      { label: 'Lieu', value: 'Paris' },
      { label: 'Période', value: 'Septembre 2024 - Septembre 2026' },
      { label: "Type d'emploi", value: 'Alternance' },
      { label: 'Description', value: '....' },
    ],
  },
  {
    id: 'directeur-artistique',
    title: 'Directeur Artistique',
    category: 'career',
    date: 'Iconoclast',
    details: [
      { label: 'Société', value: 'Iconoclast' },
      { label: 'Lieu', value: 'Paris' },
      { label: 'Période', value: 'Septembre 2023 - Septembre 2024' },
      { label: "Type d'emploi", value: 'Alternance' },
      { label: 'Description', value: '....' },
    ],
  },
  {
    id: 'assistant-com',
    title: 'Assistant Com',
    category: 'career',
    date: 'Groupe-B Architectes',
    details: [
      { label: 'Société', value: 'Groupe-B Architectes' },
      { label: 'Lieu', value: 'Paris' },
      { label: 'Période', value: 'Septembre 2022 - Juillet 2023' },
      { label: "Type d'emploi", value: 'Alternance' },
      { label: 'Description', value: 'Communication externe/interne, Événement du groupe' },
    ],
  },
  {
    id: 'assistant-da',
    title: 'Assistant DA',
    category: 'career',
    date: 'Havas Factory',
    details: [
      { label: 'Société', value: 'Havas Factory' },
      { label: 'Lieu', value: 'Paris' },
      { label: 'Période', value: 'Avril 2022 - Juillet 2022' },
      { label: "Type d'emploi", value: 'Stage' },
      { label: 'Description', value: 'UI (Déclinaisons support print & digital)' },
    ],
  },
  {
    id: 'mastere-direction-artistique-digital',
    title: 'Mastère Direction Artistique Digital',
    category: 'education',
    date: 'Digital Campus Paris',
    details: [
      { label: 'École', value: 'Digital Campus Paris' },
      { label: 'Lieu', value: 'Paris' },
      { label: 'Période', value: 'Septembre 2024 - Septembre 2026' },
      { label: 'Description', value: '....' },
    ],
  },
  {
    id: 'chef-de-projet-digital',
    title: 'Chef de projet digital',
    category: 'education',
    date: 'Digital Campus Paris',
    details: [
      { label: 'École', value: 'Digital Campus Paris' },
      { label: 'Lieu', value: 'Paris' },
      { label: 'Période', value: 'Septembre 2022 - Septembre 2024' },
      { label: 'Description', value: '....' },
    ],
  },
];
