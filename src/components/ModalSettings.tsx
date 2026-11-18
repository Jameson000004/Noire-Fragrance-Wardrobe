import React, { useState } from 'react';
import { X, Cloud, Volume2, VolumeX, RotateCcw, Clock, ShieldCheck, Sun, Droplets } from 'lucide-react';
import { UserPreferences, WearLog, WeatherContext } from '../types/fragrance';
import { SoundService } from '../services/sound';

import { useAuth } from '../services/authContext';

interface ModalSettingsProps {
  preferences: UserPreferences;
  weather: WeatherContext;
  wearLogs: WearLog[];
  onSavePreferences: (prefs: Partial<UserPreferences>) => void;
  onSaveWeather: (weather: WeatherContext) => void;
  onResetAllData: () => void;
  onOpenAuth: () => void;
  onClose: () => void;
}

export const ModalSettings: React.FC<ModalSettingsProps> = ({
  preferences,
  weather,
  wearLogs,
  onSavePreferences,
  onSaveWeather,
  onResetAllData,
  onOpenAuth,
  onClose,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [tempC, setTempC] = useState(weather.temperatureC);
  const [condition, setCondition] = useState(weather.condition);
  const [unit, setUnit] = useState<'C' | 'F'>(preferences.temperatureUnit);
  const [soundEnabled, setSoundEnabled] = useState(preferences.soundEnabled);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSaveWeather = () => {
    SoundService.playTap();
    onSaveWeather({
      ...weather,
      temperatureC: tempC,
      condition,
      isManual: true,
      source: 'manual',
      fetchedAt: new Date().toISOString(),
    });
    onSavePreferences({ temperatureUnit: unit, soundEnabled });
    onClose();
  };

  const weatherPresets = [
    { label: 'Cool Evening (12°C)', temp: 12, cond: 'Cloudy' },
    { label: 'Crisp Autumn (8°C)', temp: 8, cond: 'Crisp / Overcast' },
    { label: 'Warm Sun (26°C)', temp: 26, cond: 'Sunny' },
    { label: 'Spring Breeze (19°C)', temp: 19, cond: 'Partly Cloudy' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md rounded-[32px] glass-panel border border-[rgba(244,233,229,0.2)] p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(244,233,229,0.1)] mb-5">
          <div>
            <h3 className="font-serif text-2xl text-[#F4E9E5]">Preferences</h3>
            <p className="text-xs text-[#C8B7B9] font-sans">
              Local-first wardrobe & weather parameters
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6 text-xs font-sans">
          {/* Account & Cloud Sync Card */}
          <div className="p-4 rounded-2xl glass-card border border-[rgba(244,233,229,0.14)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#D8A6AC] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Account & Cloud Sync</span>
              </div>
              <p className="text-xs text-[#F4E9E5] font-medium">
                {currentUser && !currentUser.isAnonymous
                  ? (userProfile?.displayName || userProfile?.email)
                  : currentUser?.isAnonymous
                  ? 'Guest Explorer (Unsaved)'
                  : 'Not Signed In'}
              </p>
              <p className="text-[10px] text-[#C8B7B9]">
                {currentUser && !currentUser.isAnonymous
                  ? 'Cloud wardrobe sync active'
                  : 'Sign in to back up your personal flacons'}
              </p>
            </div>
            <button
              onClick={() => {
                SoundService.playTap();
                onOpenAuth();
              }}
              className="py-1.5 px-3 rounded-full bg-[#F4E9E5] text-[#10090B] font-semibold text-xs hover:bg-white transition-all cursor-pointer shadow-sm"
            >
              {currentUser && !currentUser.isAnonymous ? 'Manage' : 'Sign In'}
            </button>
          </div>

          {/* Temperature Unit */}
          <div>
            <label className="block text-[11px] font-semibold text-[#D8A6AC] uppercase tracking-wider mb-2">
              Temperature Unit
            </label>
            <div className="flex gap-2">
              {(['C', 'F'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => {
                    SoundService.playTap();
                    setUnit(u);
                  }}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-sans font-medium transition-all cursor-pointer ${
                    unit === u
                      ? 'bg-[#F4E9E5] text-[#10090B] font-semibold border-[#F4E9E5]'
                      : 'glass-control text-[#C8B7B9]'
                  }`}
                >
                  °{u} ({u === 'C' ? 'Celsius' : 'Fahrenheit'})
                </button>
              ))}
            </div>
          </div>

          {/* Weather Simulation / Override */}
          <div className="p-4 rounded-2xl glass-card border border-[rgba(244,233,229,0.12)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#D8A6AC] uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5" />
                Weather Simulator
              </span>
              <span className="text-[10px] text-[#C8B7B9]">
                Manual Context
              </span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#C8B7B9]">Temperature:</span>
                <span className="font-semibold text-[#F4E9E5]">
                  {unit === 'C' ? `${tempC}°C` : `${Math.round((tempC * 9) / 5 + 32)}°F`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                value={tempC}
                onChange={(e) => setTempC(Number(e.target.value))}
                className="w-full accent-[#D8A6AC] cursor-pointer"
              />
            </div>

            <div className="mb-3">
              <label className="block text-[10px] text-[#C8B7B9] uppercase mb-1">
                Atmospheric Condition
              </label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g. Cloudy, Rainy, Crisp, Sunny"
                className="w-full bg-[#160B0E] border border-[rgba(244,233,229,0.15)] rounded-xl px-3 py-2 text-xs text-[#F4E9E5]"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {weatherPresets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => {
                    SoundService.playTap();
                    setTempC(preset.temp);
                    setCondition(preset.cond);
                  }}
                  className="p-2 rounded-xl text-left text-[10px] text-[#C8B7B9] hover:text-[#F4E9E5] bg-[rgba(244,233,229,0.05)] hover:bg-[rgba(244,233,229,0.1)] transition-colors truncate cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Sensory */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-[rgba(244,233,229,0.1)]">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#D8A6AC]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#C8B7B9]" />
              )}
              <div>
                <div className="text-xs font-medium text-[#F4E9E5]">Tactile Audio Spritz</div>
                <div className="text-[10px] text-[#C8B7B9]">Sensory atomiser mist on Wear Today</div>
              </div>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) SoundService.playSpritz();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-[#A34F56]' : 'bg-[#2E181D]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#F4E9E5] absolute top-0.5 transition-transform ${
                  soundEnabled ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Wear History Log Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#D8A6AC] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Recent Wear Logs ({wearLogs.length})
              </span>
            </div>
            {wearLogs.length > 0 ? (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {wearLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-[#180C0F] border border-[rgba(244,233,229,0.08)] flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <div className="font-serif text-[#F4E9E5] text-xs font-medium">
                        {log.fragranceName}
                      </div>
                      <div className="text-[10px] text-[#C8B7B9]">
                        {log.occasion} · {new Date(log.wornAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {log.weatherSnapshot && (
                      <span className="text-[10px] text-[#D8A6AC]">
                        {Math.round(log.weatherSnapshot.temperature)}°{log.weatherSnapshot.unit}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#C8B7B9] italic">
                No fragrances logged yet. Tap "Wear Today" on any bottle to start your wearing history.
              </p>
            )}
          </div>

          {/* Reset All Data / Restore Default Wardrobe */}
          <div className="pt-2 border-t border-[rgba(244,233,229,0.1)]">
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 rounded-xl text-xs text-[#C8B7B9] hover:text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Curated Signature Wardrobe</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[rgba(244,233,229,0.1)] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full glass-control text-xs font-medium text-[#F4E9E5] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveWeather}
            className="flex-1 py-3 rounded-full bg-[#F4E9E5] text-[#10090B] text-xs font-semibold hover:bg-white cursor-pointer shadow-lg"
          >
            Save Preferences
          </button>
        </div>

        {/* Confirm Reset Dialog */}
        {showConfirmReset && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="glass-card max-w-xs w-full p-5 rounded-2xl border border-red-500/40 text-center">
              <h4 className="font-serif text-lg text-[#F4E9E5] mb-2">Reset Wardrobe?</h4>
              <p className="text-xs text-[#C8B7B9] mb-5 leading-relaxed">
                This will reset your shelf back to the curated Noiré signature bottles and clear your wearing logs.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-2 rounded-full glass-control text-xs text-[#F4E9E5]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onResetAllData();
                    setShowConfirmReset(false);
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-full bg-red-600 text-white text-xs font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
