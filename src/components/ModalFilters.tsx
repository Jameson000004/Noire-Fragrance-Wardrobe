import React, { useState } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { Occasion, Season, TimeOfDay } from '../types/fragrance';
import { SoundService } from '../services/sound';

interface ModalFiltersProps {
  currentOccasion: Occasion;
  currentTimeOfDay: TimeOfDay;
  onApply: (occasion: Occasion, timeOfDay: TimeOfDay) => void;
  onClose: () => void;
}

export const ModalFilters: React.FC<ModalFiltersProps> = ({
  currentOccasion,
  currentTimeOfDay,
  onApply,
  onClose,
}) => {
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>(currentOccasion);
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>(currentTimeOfDay);

  const occasions: Occasion[] = ['Date Night', 'Evening', 'Work', 'Casual', 'Formal Event', 'Relaxation'];
  const times: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening', 'Late Night'];

  const handleApply = () => {
    SoundService.playTap();
    onApply(selectedOccasion, selectedTime);
  };

  const handleReset = () => {
    SoundService.playTap();
    setSelectedOccasion('Evening');
    setSelectedTime('Evening');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[32px] glass-panel border border-[rgba(244,233,229,0.2)] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(244,233,229,0.1)] mb-5">
          <div>
            <h3 className="font-serif text-2xl text-[#F4E9E5]">Scent Filters</h3>
            <p className="text-xs text-[#C8B7B9] font-sans">
              Refine your recommendation parameters
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
          {/* Occasion Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-[#D8A6AC] uppercase tracking-wider mb-2.5">
              Occasion
            </label>
            <div className="grid grid-cols-2 gap-2">
              {occasions.map((occ) => (
                <button
                  key={occ}
                  onClick={() => {
                    SoundService.playTap();
                    setSelectedOccasion(occ);
                  }}
                  className={`p-3 rounded-2xl text-left flex items-center justify-between border transition-all cursor-pointer ${
                    selectedOccasion === occ
                      ? 'bg-[#F4E9E5] text-[#10090B] font-semibold border-[#F4E9E5] shadow-sm'
                      : 'glass-card text-[#C8B7B9] border-[rgba(244,233,229,0.1)] hover:border-[#D8A6AC]/40'
                  }`}
                >
                  <span>{occ}</span>
                  {selectedOccasion === occ && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-[#D8A6AC] uppercase tracking-wider mb-2.5">
              Time of Day
            </label>
            <div className="grid grid-cols-2 gap-2">
              {times.map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    SoundService.playTap();
                    setSelectedTime(time);
                  }}
                  className={`p-3 rounded-2xl text-left flex items-center justify-between border transition-all cursor-pointer ${
                    selectedTime === time
                      ? 'bg-[#F4E9E5] text-[#10090B] font-semibold border-[#F4E9E5] shadow-sm'
                      : 'glass-card text-[#C8B7B9] border-[rgba(244,233,229,0.1)] hover:border-[#D8A6AC]/40'
                  }`}
                >
                  <span>{time}</span>
                  {selectedTime === time && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-[rgba(244,233,229,0.1)] flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-3 rounded-full glass-control text-xs font-medium text-[#C8B7B9] hover:text-[#F4E9E5] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-full bg-[#F4E9E5] text-[#10090B] text-xs font-semibold hover:bg-white active:scale-98 transition-all cursor-pointer shadow-lg"
          >
            Apply Parameters
          </button>
        </div>
      </div>
    </div>
  );
};
