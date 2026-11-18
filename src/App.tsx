import React, { useState, useEffect, useMemo } from 'react';
import { Fragrance, Occasion, TimeOfDay, UserPreferences, WearLog, WeatherContext } from './types/fragrance';
import { StorageService } from './services/storage';
import { computeRecommendation, getTimeOfDay } from './services/recommendationEngine';
import { DeviceFrame } from './components/DeviceFrame';
import { NavigationCapsule, NavigationTab } from './components/NavigationCapsule';
import { ScreenWelcome } from './components/ScreenWelcome';
import { ScreenScentFinder } from './components/ScreenScentFinder';
import { ScreenBottleDetail } from './components/ScreenBottleDetail';
import { ScreenMyShelf } from './components/ScreenMyShelf';
import { ModalFragranceEditor } from './components/ModalFragranceEditor';
import { ModalFilters } from './components/ModalFilters';
import { ModalSettings } from './components/ModalSettings';
import { ModalAuth } from './components/ModalAuth';
import { ModalGmail } from './components/ModalGmail';
import { SoundService } from './services/sound';
import { AuthProvider, useAuth } from './services/authContext';

function MainApp() {
  const { currentUser } = useAuth();

  const [fragrances, setFragrances] = useState<Fragrance[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(StorageService.getPreferences());
  const [weather, setWeather] = useState<WeatherContext>(StorageService.getWeather());
  const [wearLogs, setWearLogs] = useState<WearLog[]>([]);

  const [currentTab, setCurrentTab] = useState<NavigationTab>('discover');
  const [currentOccasion, setCurrentOccasion] = useState<Occasion>('Date Night');
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<TimeOfDay>('Evening');

  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance | null>(null);
  const [activeModal, setActiveModal] = useState<
    'none' | 'filters' | 'settings' | 'fragranceEditor' | 'auth' | 'gmail'
  >('none');
  const [editingFragrance, setEditingFragrance] = useState<Partial<Fragrance> | null>(null);
  const [gmailComposeFragrance, setGmailComposeFragrance] = useState<Fragrance | null>(null);

  const [isWelcomeActive, setIsWelcomeActive] = useState<boolean>(true);

  // Initialize local data on mount
  useEffect(() => {
    const loadedFragrances = StorageService.getFragrances();
    setFragrances(loadedFragrances);

    const loadedLogs = StorageService.getWearLogs();
    setWearLogs(loadedLogs);

    const loadedPrefs = StorageService.getPreferences();
    setPreferences(loadedPrefs);

    const loadedWeather = StorageService.getWeather();
    setWeather(loadedWeather);

    // Initial time of day from clock
    setCurrentTimeOfDay(getTimeOfDay());

    if (loadedPrefs.hasCompletedWelcome) {
      setIsWelcomeActive(false);
    }
  }, []);

  // When user signs in, sync cloud wardrobe
  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous) {
      StorageService.syncUserFragrances(currentUser.uid).then((cloudList) => {
        if (cloudList && cloudList.length > 0) {
          setFragrances(cloudList);
        }
      });
    }
  }, [currentUser]);

  // Compute recommendation deterministically
  const recommendation = useMemo(() => {
    return computeRecommendation({
      fragrances,
      occasion: currentOccasion,
      weather,
      timeOfDay: currentTimeOfDay,
      wearLogs,
    });
  }, [fragrances, currentOccasion, weather, currentTimeOfDay, wearLogs]);

  // Welcome flow completion
  const handleGetStarted = () => {
    const updated = StorageService.savePreferences({ hasCompletedWelcome: true });
    setPreferences(updated);
    setIsWelcomeActive(false);
    setCurrentTab('discover');
  };

  const handleExploreDirectly = () => {
    setIsWelcomeActive(false);
    setCurrentTab('discover');
  };

  // Fragrance Selection
  const handleSelectFragrance = (fragrance: Fragrance) => {
    setSelectedFragrance(fragrance);
  };

  const handleBackFromDetail = () => {
    setSelectedFragrance(null);
  };

  // Wear Today
  const handleWearToday = (fragrance: Fragrance) => {
    const result = StorageService.recordWear(fragrance.id, currentOccasion, weather);
    if (result.success && result.log) {
      setWearLogs([result.log, ...wearLogs]);
      setFragrances((prev) =>
        prev.map((f) => (f.id === fragrance.id ? { ...f, lastWornAt: result.log!.wornAt } : f))
      );
      if (selectedFragrance?.id === fragrance.id) {
        setSelectedFragrance((prev) => (prev ? { ...prev, lastWornAt: result.log!.wornAt } : null));
      }

      // Sync wear log to cloud if logged in
      if (currentUser && !currentUser.isAnonymous) {
        StorageService.syncCloudWearLog(currentUser.uid, result.log);
      }
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    const updated = StorageService.toggleFavorite(id);
    setFragrances(updated);
    if (selectedFragrance?.id === id) {
      setSelectedFragrance((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
    const target = updated.find((f) => f.id === id);
    if (target && currentUser && !currentUser.isAnonymous) {
      StorageService.syncCloudFragranceSave(currentUser.uid, target);
    }
  };

  // Delete Fragrance
  const handleDeleteFragrance = (id: string) => {
    const updated = StorageService.deleteFragrance(id);
    setFragrances(updated);
    if (selectedFragrance?.id === id) {
      setSelectedFragrance(null);
    }
    if (currentUser && !currentUser.isAnonymous) {
      StorageService.syncCloudFragranceDelete(currentUser.uid, id);
    }
  };

  // Save Fragrance (Create or Edit)
  const handleSaveFragrance = (saved: Fragrance) => {
    let updated: Fragrance[];
    if (fragrances.some((f) => f.id === saved.id)) {
      updated = StorageService.updateFragrance(saved.id, saved);
    } else {
      updated = StorageService.addFragrance(saved);
    }
    setFragrances(updated);
    if (selectedFragrance?.id === saved.id) {
      setSelectedFragrance(saved);
    }
    setActiveModal('none');
    setEditingFragrance(null);

    // Sync to cloud if user is authenticated
    if (currentUser && !currentUser.isAnonymous) {
      StorageService.syncCloudFragranceSave(currentUser.uid, saved);
    }
  };

  // Cycle Contexts Quickly on click
  const handleToggleOccasion = () => {
    SoundService.playTap();
    const cycle: Occasion[] = ['Date Night', 'Evening', 'Work', 'Casual', 'Formal Event', 'Relaxation'];
    const idx = cycle.indexOf(currentOccasion);
    const next = cycle[(idx + 1) % cycle.length];
    setCurrentOccasion(next);
  };

  const handleToggleTime = () => {
    SoundService.playTap();
    const cycle: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening', 'Late Night'];
    const idx = cycle.indexOf(currentTimeOfDay);
    const next = cycle[(idx + 1) % cycle.length];
    setCurrentTimeOfDay(next);
  };

  const handleToggleWeather = () => {
    SoundService.playTap();
    setActiveModal('settings');
  };

  // Reset to original wardrobe
  const handleResetAllData = () => {
    StorageService.resetAllData();
    const reloaded = StorageService.getFragrances();
    setFragrances(reloaded);
    setWearLogs([]);
    setSelectedFragrance(null);
  };

  return (
    <DeviceFrame>
      <div className="relative min-h-screen w-full bg-[#10090B] text-[#F4E9E5]">
        {/* Screen 1: Welcome (First-run entry) */}
        {isWelcomeActive ? (
          <ScreenWelcome
            onGetStarted={handleGetStarted}
            onExploreDirectly={handleExploreDirectly}
            onSignIn={() => setActiveModal('auth')}
          />
        ) : selectedFragrance ? (
          /* Screen 3: Bottle Detail (Pushed view with working back and share) */
          <ScreenBottleDetail
            fragrance={selectedFragrance}
            onBack={handleBackFromDetail}
            onWearToday={handleWearToday}
            onToggleFavorite={handleToggleFavorite}
            onEditFragrance={(f) => {
              setEditingFragrance(f);
              setActiveModal('fragranceEditor');
            }}
            onEmailFragrance={(f) => {
              setGmailComposeFragrance(f);
              setActiveModal('gmail');
            }}
          />
        ) : (
          /* Main Tab Destinations */
          <>
            {currentTab === 'today' || currentTab === 'discover' ? (
              /* Screen 2: Scent Finder / Today Recommendation */
              <ScreenScentFinder
                fragrances={fragrances}
                recommendation={recommendation}
                currentOccasion={currentOccasion}
                currentTimeOfDay={currentTimeOfDay}
                currentWeather={weather}
                onSelectFragrance={handleSelectFragrance}
                onOpenFilters={() => setActiveModal('filters')}
                onOpenSettings={() => setActiveModal('settings')}
                onOpenAuth={() => setActiveModal('auth')}
                onOpenGmail={() => {
                  setGmailComposeFragrance(null);
                  setActiveModal('gmail');
                }}
                onToggleOccasion={handleToggleOccasion}
                onToggleTime={handleToggleTime}
                onToggleWeather={handleToggleWeather}
                onNavigateToShelf={() => setCurrentTab('shelf')}
              />
            ) : (
              /* Screen 4: My Shelf (Collection Management) */
              <ScreenMyShelf
                fragrances={fragrances}
                onSelectFragrance={handleSelectFragrance}
                onAddNewFragrance={() => {
                  setEditingFragrance(null);
                  setActiveModal('fragranceEditor');
                }}
                onEditFragrance={(f) => {
                  setEditingFragrance(f);
                  setActiveModal('fragranceEditor');
                }}
                onDeleteFragrance={handleDeleteFragrance}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {/* Compact Floating 3-Icon Navigation Capsule */}
            <NavigationCapsule
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setSelectedFragrance(null);
              }}
            />
          </>
        )}

        {/* Modal: Authentication & Account Profile */}
        {activeModal === 'auth' && (
          <ModalAuth
            onClose={() => setActiveModal('none')}
            onSuccess={() => setActiveModal('none')}
          />
        )}

        {/* Modal: Fragrance Editor (Add or Edit) */}
        {activeModal === 'fragranceEditor' && (
          <ModalFragranceEditor
            initialFragrance={editingFragrance}
            onSave={handleSaveFragrance}
            onClose={() => {
              setActiveModal('none');
              setEditingFragrance(null);
            }}
          />
        )}

        {/* Modal: Recommendation Filters */}
        {activeModal === 'filters' && (
          <ModalFilters
            currentOccasion={currentOccasion}
            currentTimeOfDay={currentTimeOfDay}
            onApply={(occ, time) => {
              setCurrentOccasion(occ);
              setCurrentTimeOfDay(time);
              setActiveModal('none');
            }}
            onClose={() => setActiveModal('none')}
          />
        )}

        {/* Modal: Gmail Atelier Mail */}
        {activeModal === 'gmail' && (
          <ModalGmail
            fragrances={fragrances}
            initialComposeFragrance={gmailComposeFragrance}
            onImportFragrance={(draft) => {
              setEditingFragrance(draft);
              setActiveModal('fragranceEditor');
            }}
            onClose={() => {
              setActiveModal('none');
              setGmailComposeFragrance(null);
            }}
          />
        )}

        {/* Modal: Settings, Weather Simulation & Wear Log */}
        {activeModal === 'settings' && (
          <ModalSettings
            preferences={preferences}
            weather={weather}
            wearLogs={wearLogs}
            onSavePreferences={(prefs) => {
              const updated = StorageService.savePreferences(prefs);
              setPreferences(updated);
            }}
            onSaveWeather={(w) => {
              StorageService.saveWeather(w);
              setWeather(w);
            }}
            onResetAllData={handleResetAllData}
            onOpenAuth={() => setActiveModal('auth')}
            onOpenGmail={() => {
              setGmailComposeFragrance(null);
              setActiveModal('gmail');
            }}
            onClose={() => setActiveModal('none')}
          />
        )}
      </div>
    </DeviceFrame>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
