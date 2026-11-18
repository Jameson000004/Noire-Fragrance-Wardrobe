export interface IngredientItem {
  id: string;
  name: string;
  layer: 'top' | 'heart' | 'base';
  family: string;
  description: string;
  imageUrl: string;
}

export const INGREDIENTS_CATALOG: IngredientItem[] = [
  // Top Notes
  {
    id: 'ing-bergamot',
    name: 'Calabrian Bergamot',
    layer: 'top',
    family: 'Citrus',
    description: 'Crisp, sparkling citrus with aromatic tea undertones and bright luminosity.',
    imageUrl: 'https://images.unsplash.com/photo-1587496679742-bad502958fbf?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ing-pink-pepper',
    name: 'Pink Pepper',
    layer: 'top',
    family: 'Spicy',
    description: 'Vibrant, rosy piquant spice that adds electric radiance to the opening.',
    imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ing-mandarin',
    name: 'Blood Mandarin',
    layer: 'top',
    family: 'Citrus',
    description: 'Juicy, sun-drenched sweet citrus with bittersweet peel nuances.',
    imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ing-cardamom',
    name: 'Green Cardamom',
    layer: 'top',
    family: 'Spicy',
    description: 'Cool eucalyptus and resinous warmth, evoking ancient spice caravans.',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=85',
  },

  // Heart Notes
  {
    id: 'ing-rose',
    name: 'Velvet Rose',
    layer: 'heart',
    family: 'Floral',
    description: 'Deep crimson petals, honeyed sweetness, and aristocratic thorniness.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ing-iris',
    name: 'Iris Florentina',
    layer: 'heart',
    family: 'Floral',
    description: 'Noble orris root delivering a silky, aristocratic powder and suede texture.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ing-neroli',
    name: 'Orange Blossom',
    layer: 'heart',
    family: 'Floral',
    description: 'Intoxicating white floral with fresh honey and sunlit Mediterranean breeze.',
    imageUrl: 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ing-jasmine',
    name: 'Night Jasmine',
    layer: 'heart',
    family: 'Floral',
    description: 'Indolic, hypnotic night-blooming blossom with warm narcotic depth.',
    imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=85',
  },

  // Base Notes
  {
    id: 'ing-amber',
    name: 'Warm Amber Resin',
    layer: 'base',
    family: 'Amber',
    description: 'Rich fossilized resin, labdanum warmth, and radiant golden caress on skin.',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ing-sandalwood',
    name: 'Australian Sandalwood',
    layer: 'base',
    family: 'Woody',
    description: 'Creamy, lactonic polished woods with a serene, meditative temple aura.',
    imageUrl: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ing-ebony',
    name: 'Dark Ebony Wood',
    layer: 'base',
    family: 'Woody',
    description: 'Smoky, charred architectural black wood with dense velvet shadow.',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ing-vanilla',
    name: 'Bourbon Vanilla',
    layer: 'base',
    family: 'Gourmand',
    description: 'Dark, leathery Madagascar bean infused with smoky wood casks.',
    imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=85',
  },
  {
    id: 'ing-oud',
    name: 'Aged Agarwood (Oud)',
    layer: 'base',
    family: 'Woody',
    description: 'Mystical, animalic smoked woods revered for centuries in royal courts.',
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=85',
  },
];
