import React, { useState } from 'react';
import { X, Check, Camera, Plus, Trash2 } from 'lucide-react';
import { Fragrance, FragranceConcentration, Occasion, Season, Sillage, TemperatureSuitability, TimeOfDay } from '../types/fragrance';
import { SoundService } from '../services/sound';

interface ModalFragranceEditorProps {
  initialFragrance?: Partial<Fragrance> | null;
  onSave: (fragrance: Fragrance) => void;
  onClose: () => void;
}

const CURATED_BOTTLE_PHOTOS = [
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1000&q=85',
];

export const ModalFragranceEditor: React.FC<ModalFragranceEditorProps> = ({
  initialFragrance,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialFragrance?.id);

  const [name, setName] = useState(initialFragrance?.name || '');
  const [brand, setBrand] = useState(initialFragrance?.brand || 'Noiré Parfums');
  const [concentration, setConcentration] = useState<FragranceConcentration>(
    initialFragrance?.concentration || 'Eau de Parfum'
  );
  const [volumeMl, setVolumeMl] = useState<number>(initialFragrance?.volumeMilliliters || 50);
  const [imageUrl, setImageUrl] = useState<string>(
    initialFragrance?.imageUrl || CURATED_BOTTLE_PHOTOS[0]
  );
  const [longevityHours, setLongevityHours] = useState<number>(initialFragrance?.longevityHours || 8);
  const [description, setDescription] = useState(
    initialFragrance?.description ||
      'An alluring, bespoke olfactory portrait formulated with rare natural essences.'
  );

  // Selected tags
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>(
    initialFragrance?.tags?.occasions || ['Evening', 'Date Night']
  );
  const [selectedTimes, setSelectedTimes] = useState<TimeOfDay[]>(
    initialFragrance?.tags?.timeOfDay || ['Evening']
  );
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>(
    initialFragrance?.tags?.seasons || ['Fall / Winter']
  );
  const [tempSuitability, setTempSuitability] = useState<TemperatureSuitability>(
    initialFragrance?.tags?.temperatureSuitability || 'Below 15°C'
  );
  const [sillage, setSillage] = useState<Sillage>(initialFragrance?.tags?.sillage || "Arm's length");

  // Notes state
  const [topNotes, setTopNotes] = useState<string[]>(
    initialFragrance?.notes?.top?.map((n) => n.name) || ['Calabrian Bergamot', 'Pink Pepper']
  );
  const [heartNotes, setHeartNotes] = useState<string[]>(
    initialFragrance?.notes?.heart?.map((n) => n.name) || ['Velvet Rose', 'Iris Florentina']
  );
  const [baseNotes, setBaseNotes] = useState<string[]>(
    initialFragrance?.notes?.base?.map((n) => n.name) || ['Dark Ebony Wood', 'Warm Amber Resin']
  );

  const [newTopNote, setNewTopNote] = useState('');
  const [newHeartNote, setNewHeartNote] = useState('');
  const [newBaseNote, setNewBaseNote] = useState('');

  const [error, setError] = useState<string | null>(null);

  const toggleOccasion = (occ: Occasion) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const toggleTime = (time: TimeOfDay) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a fragrance name.');
      return;
    }

    const saved: Fragrance = {
      id: initialFragrance?.id || `frag-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || 'Noiré Parfums',
      concentration,
      volumeMilliliters: Number(volumeMl) || 50,
      imageUrl,
      notes: {
        top: topNotes.map((n, i) => ({
          id: `top-${i}-${Date.now()}`,
          name: n,
          layer: 'top',
          displayOrder: i + 1,
        })),
        heart: heartNotes.map((n, i) => ({
          id: `heart-${i}-${Date.now()}`,
          name: n,
          layer: 'heart',
          displayOrder: i + 1,
        })),
        base: baseNotes.map((n, i) => ({
          id: `base-${i}-${Date.now()}`,
          name: n,
          layer: 'base',
          displayOrder: i + 1,
        })),
      },
      tags: {
        occasions: selectedOccasions.length > 0 ? selectedOccasions : ['Evening'],
        timeOfDay: selectedTimes.length > 0 ? selectedTimes : ['Evening'],
        seasons: selectedSeasons.length > 0 ? selectedSeasons : ['Fall / Winter'],
        temperatureSuitability: tempSuitability,
        sillage,
      },
      longevityHours: Number(longevityHours) || 8,
      longevityText: `${longevityHours} h on skin`,
      description: description.trim(),
      howItWears: initialFragrance?.howItWears || {
        opening: {
          note: topNotes.slice(0, 2).join(' · ') || 'Sparkling Citrus',
          time: '0 h',
          desc: 'Bright and luminous opening accord',
        },
        heart: {
          note: heartNotes.slice(0, 2).join(' · ') || 'Opulent Florals',
          time: '1 h',
          desc: 'Warm and velvety heart unveiling',
        },
        base: {
          note: baseNotes.slice(0, 2).join(' · ') || 'Precious Woods & Amber',
          time: `${longevityHours} h`,
          desc: 'Sensual, intimate sillage clinging to skin',
        },
      },
      isFavorite: initialFragrance?.isFavorite || false,
      isArchived: false,
      createdAt: initialFragrance?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    SoundService.playTap();
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-[32px] glass-panel border border-[rgba(244,233,229,0.2)] p-6 sm:p-7 max-h-[92vh] overflow-y-auto shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(244,233,229,0.1)] mb-5">
          <div>
            <h3 className="font-serif text-2xl text-[#F4E9E5]">
              {isEditing ? 'Edit Flacon' : 'Add New Fragrance'}
            </h3>
            <p className="text-xs text-[#C8B7B9] font-sans">
              Record olfactory details and wearing conditions
            </p>
          </div>
          <button
            onClick={() => {
              SoundService.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
          {/* Identity Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1">
                Fragrance Name <span className="text-[#D8A6AC]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Rose Ébène"
                className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3.5 py-2.5 text-sm text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1">
                  Brand / Maker
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Noiré Parfums"
                  className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1">
                  Concentration
                </label>
                <select
                  value={concentration}
                  onChange={(e) => setConcentration(e.target.value as any)}
                  className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
                >
                  <option value="Eau de Parfum">Eau de Parfum</option>
                  <option value="Parfum">Parfum</option>
                  <option value="Extrait de Parfum">Extrait de Parfum</option>
                  <option value="Eau de Toilette">Eau de Toilette</option>
                  <option value="Eau de Cologne">Eau de Cologne</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1">
                  Volume (ml)
                </label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={volumeMl}
                  onChange={(e) => setVolumeMl(Number(e.target.value))}
                  className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1">
                  Longevity (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={longevityHours}
                  onChange={(e) => setLongevityHours(Number(e.target.value))}
                  className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
                />
              </div>
            </div>
          </div>

          {/* Bottle Photography Selection */}
          <div>
            <label className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1.5">
              Bottle Photography
            </label>
            <div className="grid grid-cols-6 gap-2 mb-2">
              {CURATED_BOTTLE_PHOTOS.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImageUrl(url)}
                  className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    imageUrl === url ? 'border-[#F4E9E5] ring-2 ring-[#D8A6AC]' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="Option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="url"
              placeholder="Or paste custom image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.14)] rounded-xl px-3 py-2 text-[11px] text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1">
              Editorial Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC] resize-none"
            />
          </div>

          {/* Suitability Preferences */}
          <div className="space-y-3 pt-2 border-t border-[rgba(244,233,229,0.1)]">
            <div>
              <span className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1.5">
                Suitable Occasions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['Date Night', 'Evening', 'Work', 'Casual', 'Formal Event', 'Relaxation'] as Occasion[]).map(
                  (occ) => {
                    const active = selectedOccasions.includes(occ);
                    return (
                      <button
                        type="button"
                        key={occ}
                        onClick={() => toggleOccasion(occ)}
                        className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                          active
                            ? 'bg-[#F4E9E5] text-[#10090B] font-semibold'
                            : 'glass-control text-[#C8B7B9] hover:text-[#F4E9E5]'
                        }`}
                      >
                        {occ}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1.5">
                Time of Day
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['Morning', 'Afternoon', 'Evening', 'Late Night'] as TimeOfDay[]).map((t) => {
                  const active = selectedTimes.includes(t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => toggleTime(t)}
                      className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                        active
                          ? 'bg-[#F4E9E5] text-[#10090B] font-semibold'
                          : 'glass-control text-[#C8B7B9] hover:text-[#F4E9E5]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1">
                  Temperature
                </label>
                <select
                  value={tempSuitability}
                  onChange={(e) => setTempSuitability(e.target.value as any)}
                  className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3 py-2 text-xs text-[#F4E9E5]"
                >
                  <option value="Below 15°C">Below 15°C (Cool/Cold)</option>
                  <option value="15°C - 24°C">15°C - 24°C (Mild)</option>
                  <option value="Above 24°C">Above 24°C (Warm/Hot)</option>
                  <option value="All Temps">All Temperatures</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#C8B7B9] uppercase tracking-wider mb-1">
                  Sillage
                </label>
                <select
                  value={sillage}
                  onChange={(e) => setSillage(e.target.value as any)}
                  className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl px-3 py-2 text-xs text-[#F4E9E5]"
                >
                  <option value="Intimate">Intimate</option>
                  <option value="Arm's length">Arm's length</option>
                  <option value="Strong">Strong</option>
                  <option value="Enormous">Enormous</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[rgba(244,233,229,0.1)] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-full glass-control text-xs font-semibold text-[#F4E9E5] hover:bg-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-full bg-[#F4E9E5] text-[#10090B] text-xs font-semibold hover:bg-white active:scale-98 transition-all cursor-pointer shadow-lg"
            >
              {isEditing ? 'Save Changes' : 'Add to Shelf'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
