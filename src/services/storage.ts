import { INITIAL_WARDROBE } from '../data/mockFragrances';
import { Fragrance, UserPreferences, WearLog, WeatherContext } from '../types/fragrance';

const STORAGE_KEYS = {
  FRAGRANCES: 'noire_fragrances_v1',
  WEAR_LOGS: 'noire_wear_logs_v1',
  PREFERENCES: 'noire_preferences_v1',
  WEATHER: 'noire_weather_v1',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  temperatureUnit: 'C',
  defaultOccasion: 'Evening',
  hasCompletedWelcome: false,
  manualWeatherOnly: false,
  hapticsEnabled: true,
  soundEnabled: true,
};

const DEFAULT_WEATHER: WeatherContext = {
  temperatureC: 12,
  condition: 'Cloudy',
  icon: 'cloud',
  isManual: true,
  source: 'manual',
  fetchedAt: new Date().toISOString(),
  locationName: 'Paris',
};

export const StorageService = {
  getFragrances(): Fragrance[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FRAGRANCES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to read fragrances from storage', e);
    }
    // Seed initial wardrobe
    this.saveFragrances(INITIAL_WARDROBE);
    return INITIAL_WARDROBE;
  },

  saveFragrances(fragrances: Fragrance[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FRAGRANCES, JSON.stringify(fragrances));
    } catch (e) {
      console.error('Failed to save fragrances', e);
    }
  },

  addFragrance(fragrance: Fragrance): Fragrance[] {
    const list = this.getFragrances();
    const updated = [fragrance, ...list];
    this.saveFragrances(updated);
    return updated;
  },

  updateFragrance(id: string, draft: Partial<Fragrance>): Fragrance[] {
    const list = this.getFragrances();
    const updated = list.map((f) => (f.id === id ? { ...f, ...draft, updatedAt: new Date().toISOString() } : f));
    this.saveFragrances(updated);
    return updated;
  },

  deleteFragrance(id: string): Fragrance[] {
    const list = this.getFragrances();
    const updated = list.filter((f) => f.id !== id);
    this.saveFragrances(updated);

    // Clean up related wear logs
    const logs = this.getWearLogs().filter((l) => l.fragranceId !== id);
    this.saveWearLogs(logs);

    return updated;
  },

  toggleFavorite(id: string): Fragrance[] {
    const list = this.getFragrances();
    const updated = list.map((f) => (f.id === id ? { ...f, isFavorite: !f.isFavorite } : f));
    this.saveFragrances(updated);
    return updated;
  },

  getWearLogs(): WearLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEAR_LOGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to read wear logs', e);
    }
    return [];
  },

  saveWearLogs(logs: WearLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WEAR_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save wear logs', e);
    }
  },

  recordWear(fragranceId: string, occasion: any, weather?: any): { success: boolean; isDuplicate: boolean; log?: WearLog } {
    const logs = this.getWearLogs();
    const now = new Date();

    // Protection against rapid duplicate taps (within 15 seconds)
    const recent = logs[0];
    if (recent && recent.fragranceId === fragranceId) {
      const diffMs = now.getTime() - new Date(recent.wornAt).getTime();
      if (diffMs < 15000) {
        return { success: false, isDuplicate: true, log: recent };
      }
    }

    const fragrances = this.getFragrances();
    const fragrance = fragrances.find((f) => f.id === fragranceId);
    if (!fragrance) return { success: false, isDuplicate: false };

    const newLog: WearLog = {
      id: `wear-${Date.now()}`,
      fragranceId,
      fragranceName: fragrance.name,
      wornAt: now.toISOString(),
      occasion: occasion || 'Evening',
      weatherSnapshot: weather
        ? {
            temperature: weather.temperatureC,
            condition: weather.condition,
            unit: 'C',
            source: weather.source,
          }
        : undefined,
    };

    const updatedLogs = [newLog, ...logs];
    this.saveWearLogs(updatedLogs);

    // Update lastWornAt on the fragrance
    this.updateFragrance(fragranceId, { lastWornAt: now.toISOString() });

    return { success: true, isDuplicate: false, log: newLog };
  },

  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to read preferences', e);
    }
    return DEFAULT_PREFERENCES;
  },

  savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save preferences', e);
    }
    return updated;
  },

  getWeather(): WeatherContext {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEATHER);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to read weather', e);
    }
    return DEFAULT_WEATHER;
  },

  saveWeather(weather: WeatherContext): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(weather));
    } catch (e) {
      console.error('Failed to save weather', e);
    }
  },

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.FRAGRANCES);
    localStorage.removeItem(STORAGE_KEYS.WEAR_LOGS);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.WEATHER);
  },

  // Cloud Sync Helpers with Firestore
  async syncUserFragrances(userId: string): Promise<Fragrance[]> {
    try {
      const { db, collection, getDocs, setDoc, doc } = await import('./firebase');
      const colRef = collection(db, 'users', userId, 'fragrances');
      const snap = await getDocs(colRef);

      if (!snap.empty) {
        const cloudFragrances: Fragrance[] = [];
        snap.forEach((d) => {
          cloudFragrances.push(d.data() as Fragrance);
        });
        this.saveFragrances(cloudFragrances);
        return cloudFragrances;
      } else {
        // First cloud sync: push current local fragrances to cloud
        const local = this.getFragrances();
        for (const f of local) {
          await setDoc(doc(db, 'users', userId, 'fragrances', f.id), {
            ...f,
            userId,
          });
        }
        return local;
      }
    } catch (err) {
      console.warn('Could not complete cloud fragrance sync:', err);
      return this.getFragrances();
    }
  },

  async syncCloudFragranceSave(userId: string, fragrance: Fragrance): Promise<void> {
    try {
      const { db, setDoc, doc } = await import('./firebase');
      await setDoc(doc(db, 'users', userId, 'fragrances', fragrance.id), {
        ...fragrance,
        userId,
      });
    } catch (err) {
      console.warn('Cloud save failed, local copy preserved:', err);
    }
  },

  async syncCloudFragranceDelete(userId: string, fragranceId: string): Promise<void> {
    try {
      const { db, deleteDoc, doc } = await import('./firebase');
      await deleteDoc(doc(db, 'users', userId, 'fragrances', fragranceId));
    } catch (err) {
      console.warn('Cloud delete failed:', err);
    }
  },

  async syncCloudWearLog(userId: string, log: WearLog): Promise<void> {
    try {
      const { db, setDoc, doc } = await import('./firebase');
      await setDoc(doc(db, 'users', userId, 'wearLogs', log.id), {
        ...log,
        userId,
      });
    } catch (err) {
      console.warn('Cloud wear log save failed:', err);
    }
  },
};
