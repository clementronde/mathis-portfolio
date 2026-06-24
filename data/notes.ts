export interface Note {
  id: string;
  title: string;
  category: 'pro' | 'perso';
  date: string;
  content: string;
  tags?: string[];
}

export const NOTES: Note[] = [
  {
    id: 'freelance',
    title: 'Photographe Freelance',
    category: 'pro',
    date: '2022 → Présent',
    content: `Activité principale en tant que photographe indépendant.

Spécialisé dans :
— Portrait & mode
— Reportage événementiel
— Shooting de marque
— Contenu social media

Clients : marques mode, agences comm, particuliers, artistes.

Disponible pour missions ponctuelles ou collaborations longues durées.`,
    tags: ['Freelance', 'Portrait', 'Mode'],
  },
  {
    id: 'shooting-marque',
    title: 'Shooting Marque & Mode',
    category: 'pro',
    date: '2023 → 2024',
    content: `Collaborations avec plusieurs marques sur des campagnes visuelles.

Missions réalisées :
— Direction artistique des shootings
— Sélection et préparation des lieux
— Supervision modèles et stylisme
— Post-production complète (Lightroom + Photoshop)
— Livraison formats web & print

Marques : Adidas, projets mode indépendants, e-commerce.`,
    tags: ['Marque', 'Mode', 'DA'],
  },
  {
    id: 'reportage',
    title: 'Reportage Événementiel',
    category: 'pro',
    date: '2022 → Présent',
    content: `Couverture d'événements en tout genre.

Types d'événements couverts :
— Concerts & festivals
— Soirées privées & anniversaires
— Événements corporate
— Mariages & cérémonies

Approche discrète et documentaire.
Livraison sous 48h.`,
    tags: ['Reportage', 'Event'],
  },
  {
    id: 'retouche',
    title: 'Retouche Lightroom / Photoshop',
    category: 'pro',
    date: 'Continu',
    content: `Post-production et retouche image.

Lightroom :
— Développement RAW
— Étalonnage colorimétrique
— Presets personnalisés
— Export multi-formats

Photoshop :
— Retouche avancée
— Compositing
— Nettoyage image
— Habillage print

Délai moyen : 24-48h pour un lot standard.`,
    tags: ['Lightroom', 'Photoshop', 'Post-prod'],
  },
  {
    id: 'da',
    title: 'Direction Artistique',
    category: 'pro',
    date: '2023 → Présent',
    content: `Direction artistique pour shootings et productions visuelles.

Compétences :
— Moodboard & brief visuel
— Casting & sélection équipe
— Coordination sur le terrain
— Cohérence visuelle globale
— Adaptation aux contraintes client`,
    tags: ['DA', 'Créatif'],
  },
  {
    id: 'contenu',
    title: 'Production Contenu Social Media',
    category: 'pro',
    date: '2023 → Présent',
    content: `Création de contenu optimisé pour les réseaux sociaux.

Formats maîtrisés :
— Instagram (feed, stories, reels)
— TikTok (vidéo courte, montage)
— LinkedIn (corporate, personal branding)

Services :
— Stratégie visuelle
— Shooting dédié réseaux
— Montage vidéo (Premiere Pro)
— Livraison formats adaptés`,
    tags: ['Social Media', 'Contenu', 'Vidéo'],
  },
  {
    id: 'voyages',
    title: 'Voyages',
    category: 'perso',
    date: '2020 → Présent',
    content: `Destinations qui ont marqué :

🇲🇦 Maroc — Marrakech, désert, Atlas
🇪🇸 Espagne — Barcelone, Madrid
🇮🇹 Italie — Rome, Naples, Sicile
🇵🇹 Portugal — Lisbonne, Porto
🇸🇳 Sénégal — Dakar, Saint-Louis
🇬🇷 Grèce — Santorin, Athènes

La photo de voyage : capturer l'instant avant qu'il disparaisse.`,
    tags: ['Voyage', 'Monde'],
  },
  {
    id: 'courses',
    title: 'Courses & Sport',
    category: 'perso',
    date: 'Régulier',
    content: `La course à pied comme méditation en mouvement.

Programmes :
— Course urbaine Paris
— Semi-marathon (1h42)
— Trail en forêt

L'intersection entre le sport et la photo :
capturer le mouvement, l'effort, la beauté du corps en action.

Projet en cours : série photo sur la course de nuit en ville.`,
    tags: ['Sport', 'Running'],
  },
  {
    id: 'argentique',
    title: 'Inspiration Argentique',
    category: 'perso',
    date: 'Continu',
    content: `L'argentique comme retour à l'essentiel.

Appareils :
— Canon AE-1
— Contax T2
— Olympus MJU II

Films préférés :
— Kodak Portra 400
— Kodak Gold 200
— Ilford HP5

L'argentique apprend la patience. Chaque déclencheur compte.
Le grain, les couleurs chaudes, l'imperfection — c'est ça la vie.`,
    tags: ['Argentique', 'Film'],
  },
  {
    id: 'portraits-perso',
    title: 'Portraits de Proches',
    category: 'perso',
    date: 'Toujours',
    content: `Les meilleurs sujets sont souvent les plus proches.

Série en cours : portraits de famille dans la lumière du matin.

Il y a quelque chose de particulier à photographier
ceux qu'on aime — une confiance que les inconnus ne donnent pas,
une profondeur qui s'acquiert avec le temps.`,
    tags: ['Portrait', 'Famille', 'Intime'],
  },
  {
    id: 'carnets',
    title: 'Carnets de Lieux',
    category: 'perso',
    date: 'Continu',
    content: `Cataloguer les endroits qui méritent d'être revus.

Paris :
— Belleville à l'heure dorée
— Les quais en hiver
— Montmartre sans touristes (6h du matin)
— La Goutte-d'Or, rue des Poissonniers

Hors Paris :
— La côte basque en octobre
— Les Alpes, premier matin de neige
— Marseille, lumière crue de midi`,
    tags: ['Lieux', 'Paris', 'Carnet'],
  },
];
