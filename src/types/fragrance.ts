export type FragranceConcentration = 'Parfum' | 'Eau de Parfum' | 'Eau de Toilette' | 'Extrait de Parfum' | 'Eau de Cologne';

export type NoteLayer = 'top' | 'heart' | 'base';

export type NoteFamily = 'Floral' | 'Woody' | 'Amber' | 'Citrus' | 'Spicy' | 'Aromatic' | 'Gourmand' | 'Aquatic';

export type Occasion = 'Date Night' | 'Evening' | 'Work' | 'Casual' | 'Formal Event' | 'Relaxation';

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Late Night';

export type Season = 'Fall / Winter' | 'Spring / Summer' | 'All Seasons';

export type TemperatureSuitability = 'Below 15°C' | '15°C - 24°C' | 'Above 24°C' | 'All Temps';

export type Sillage = 'Intimate' | "Arm's length" | 'Strong' | 'Enormous';

export interface FragranceNote {
  id: string;
  name: string;
  layer: NoteLayer;
  family?: NoteFamily;
  displayOrder: number;
  timingMinutes?: number;
  description?: string;
  imageUrl?: string;
}

export interface HowItWearsStage {
  note: string;
  time: string;
  desc: string;
}

export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  concentration: FragranceConcentration;
  volumeMilliliters: number;
  imageUrl: string;
  notes: {
    top: FragranceNote[];
    heart: FragranceNote[];
    base: FragranceNote[];
  };
  tags: {
    occasions: Occasion[];
    timeOfDay: TimeOfDay[];
    seasons: Season[];
    temperatureSuitability: TemperatureSuitability;
    sillage: Sillage;
  };
  longevityHours: number;
  longevityText: string;
  description: string;
  howItWears?: {
    opening: HowItWearsStage;
    heart: HowItWearsStage;
    base: HowItWearsStage;
  };
  isFavorite: boolean;
  isArchived: boolean;
  lastWornAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WearLog {
  id: string;
  fragranceId: string;
  fragranceName: string;
  wornAt: string;
  occasion: Occasion;
  weatherSnapshot?: {
    temperature: number;
    condition: string;
    unit: 'C' | 'F';
    source: 'live' | 'manual';
  };
  feedback?: 'loved' | 'subtle' | 'intense';
  personalNote?: string;
}

export interface WeatherContext {
  temperatureC: number;
  condition: string;
  icon: 'sun' | 'cloud' | 'rain' | 'cloud-rain' | 'cloud-sun' | 'moon' | 'snowflake';
  isManual: boolean;
  source: 'live' | 'manual';
  fetchedAt: string;
  locationName: string;
}

export interface UserPreferences {
  temperatureUnit: 'C' | 'F';
  defaultOccasion: Occasion;
  hasCompletedWelcome: boolean;
  manualWeatherOnly: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
}

export type RecommendationReasonCode =
  | 'occasionMatch'
  | 'timeOfDayMatch'
  | 'temperatureMatch'
  | 'weatherSuitabilityMatch'
  | 'rotationPreference'
  | 'signatureScent'
  | 'insufficientData';

export interface RecommendationFactor {
  factor: 'occasion' | 'weather' | 'time' | 'diversity';
  weight: number;
  score: number; // 0 to 1
  label: string;
}

export interface RecommendationResult {
  fragrance: Fragrance;
  normalizedScore: number; // 0 to 100
  isBestMatch: boolean;
  reasons: string[];
  reasonCodes: RecommendationReasonCode[];
  factors: RecommendationFactor[];
  coverage: number; // 0 to 1 percentage of available data
  timestamp: string;
  alternatives: Fragrance[];
}
