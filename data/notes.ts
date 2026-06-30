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
    category: 'about',
    date: 'Mathis Straebler',
    details: [],
    content: `Mon plus grand bonheur ? Figer l'éphémère pour le transformer en souvenirs pour la vie."

Je m'appelle Mathis. Pour moi, la photographie est bien plus qu'un métier : c'est le prolongement de mon regard.
J'adore par-dessus tout capturer des instants de vie authentiques et spontanés. Ce qui m'anime au quotidien, c'est cette magie de pouvoir arrêter le temps pour offrir des moments précieux, gravés pour toute la vie.

Je conçois également l'image comme un puissant moyen de communication. C'est pourquoi j'aime mettre mon œil au service des marques, en créant des photographies publicitaires qui font passer un message fort.

Mais au-delà de la communication, la photographie reste mon mode d'expression privilégié. C'est un art avec lequel j'adore jouer, expérimenter et composer pour traduire ma vision du monde.

Bienvenue dans mon univers !`,
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
