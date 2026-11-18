import React, { useState, useMemo } from 'react';
import { Search, Plus, Heart, Trash2, Edit3, Droplet, Sparkles, Filter } from 'lucide-react';
import { Fragrance } from '../types/fragrance';
import { SoundService } from '../services/sound';

interface ScreenMyShelfProps {
  fragrances: Fragrance[];
  onSelectFragrance: (fragrance: Fragrance) => void;
  onAddNewFragrance: () => void;
  onEditFragrance: (fragrance: Fragrance) => void;
  onDeleteFragrance: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const ScreenMyShelf: React.FC<ScreenMyShelfProps> = ({
  fragrances,
  onSelectFragrance,
  onAddNewFragrance,
  onEditFragrance,
  onDeleteFragrance,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'fallWinter' | 'springSummer'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredFragrances = useMemo(() => {
    return fragrances.filter((f) => {
      // Search
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.notes.top.some((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        f.notes.heart.some((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter
      if (filterMode === 'favorites') return f.isFavorite;
      if (filterMode === 'fallWinter') return f.tags.seasons.includes('Fall / Winter') || f.tags.seasons.includes('All Seasons');
      if (filterMode === 'springSummer') return f.tags.seasons.includes('Spring / Summer') || f.tags.seasons.includes('All Seasons');
      return true;
    });
  }, [fragrances, searchQuery, filterMode]);

  const handleDeleteConfirm = (id: string) => {
    SoundService.playTap();
    onDeleteFragrance(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#10090B] text-[#F4E9E5] pb-32 pt-10 px-4 sm:px-6 select-none overflow-x-hidden">
      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-[#F4E9E5] tracking-tight">
            My Shelf
          </h1>
          <p className="text-xs text-[#C8B7B9] font-sans">
            {fragrances.length} {fragrances.length === 1 ? 'flacon' : 'flacons'} in your personal wardrobe
          </p>
        </div>

        {/* Add Fragrance Button */}
        <button
          onClick={() => {
            SoundService.playTap();
            onAddNewFragrance();
          }}
          className="h-10 px-4 rounded-full bg-[#F4E9E5] text-[#10090B] font-sans font-semibold text-xs flex items-center gap-1.5 hover:bg-white active:scale-95 transition-all shadow-[0_4px_16px_rgba(244,233,229,0.2)] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Flacon</span>
        </button>
      </header>

      {/* Search Input Bar */}
      <div className="relative z-10 mb-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-[#C8B7B9] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by fragrance, note, or brand..."
            className="w-full bg-[#1E0F13] border border-[rgba(244,233,229,0.14)] rounded-full pl-11 pr-4 py-2.5 text-xs text-[#F4E9E5] placeholder-[#C8B7B9]/60 focus:outline-none focus:border-[#D8A6AC] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-[#C8B7B9] hover:text-[#F4E9E5] px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="relative z-10 flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {[
          { id: 'all', label: 'All Fragrances' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'fallWinter', label: 'Fall / Winter' },
          { id: 'springSummer', label: 'Spring / Summer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              SoundService.playTap();
              setFilterMode(tab.id as any);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all cursor-pointer ${
              filterMode === tab.id
                ? 'bg-[#F4E9E5] text-[#10090B] font-semibold shadow-sm'
                : 'glass-control text-[#C8B7B9] hover:text-[#F4E9E5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fragrance Grid */}
      {filteredFragrances.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredFragrances.map((frag) => (
            <div
              key={frag.id}
              className="relative rounded-2xl glass-card overflow-hidden flex flex-col group border border-[rgba(244,233,229,0.12)] hover:border-[#D8A6AC]/50 transition-all shadow-lg"
            >
              {/* Bottle Photo Area */}
              <div
                onClick={() => {
                  SoundService.playTap();
                  onSelectFragrance(frag);
                }}
                className="relative w-full h-44 bg-[#180C0F] cursor-pointer overflow-hidden"
              >
                <img
                  src={frag.imageUrl}
                  alt={frag.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10090B] via-transparent to-transparent opacity-80" />

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    SoundService.playTap();
                    onToggleFavorite(frag.id);
                  }}
                  aria-label="Toggle favorite"
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#10090B]/60 backdrop-blur-md flex items-center justify-center border border-[rgba(244,233,229,0.2)] text-[#F4E9E5] active:scale-90 transition-all cursor-pointer"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      frag.isFavorite ? 'fill-[#A34F56] text-[#A34F56]' : 'text-[#F4E9E5]'
                    }`}
                  />
                </button>

                {/* Concentration Badge */}
                <span className="absolute bottom-2 left-2 text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-[#10090B]/80 text-[#D8A6AC] backdrop-blur-md">
                  {frag.concentration}
                </span>
              </div>

              {/* Information & Action Footer */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div
                  onClick={() => {
                    SoundService.playTap();
                    onSelectFragrance(frag);
                  }}
                  className="cursor-pointer mb-2"
                >
                  <h4 className="font-serif text-base text-[#F4E9E5] font-medium leading-snug line-clamp-1">
                    {frag.name}
                  </h4>
                  <p className="text-[11px] text-[#C8B7B9] font-sans truncate">
                    {frag.brand} · {frag.volumeMilliliters}ml
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[rgba(244,233,229,0.08)]">
                  <span className="text-[10px] font-sans text-[#D8A6AC]">
                    {frag.longevityText}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        SoundService.playTap();
                        onEditFragrance(frag);
                      }}
                      aria-label="Edit fragrance"
                      className="p-1.5 rounded-lg text-[#C8B7B9] hover:text-[#F4E9E5] hover:bg-[rgba(244,233,229,0.08)] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(frag.id)}
                      aria-label="Delete fragrance"
                      className="p-1.5 rounded-lg text-[#C8B7B9] hover:text-red-400 hover:bg-[rgba(244,233,229,0.08)] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card rounded-[28px] p-8 text-center mt-6">
          <Droplet className="w-12 h-12 text-[#D8A6AC] mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-xl text-[#F4E9E5] mb-2">
            {searchQuery ? 'No matching flacons found' : 'Your shelf begins here'}
          </h3>
          <p className="text-xs text-[#C8B7B9] max-w-xs mx-auto mb-6 leading-relaxed">
            {searchQuery
              ? `No fragrances matched "${searchQuery}". Try a different name or note.`
              : 'Add your bottles to unlock bespoke weather and occasion recommendations.'}
          </p>
          <button
            onClick={onAddNewFragrance}
            className="py-3 px-6 rounded-full bg-[#F4E9E5] text-[#10090B] font-sans font-semibold text-xs transition-all hover:bg-white active:scale-95 cursor-pointer shadow-lg"
          >
            Add Your First Fragrance
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card max-w-sm w-full p-6 rounded-3xl border border-red-500/30 text-center animate-in fade-in zoom-in-95">
            <h4 className="font-serif text-xl text-[#F4E9E5] mb-2">Remove from Shelf?</h4>
            <p className="text-xs text-[#C8B7B9] leading-relaxed mb-6">
              This will permanently delete this fragrance and its historical wear records from your local wardrobe.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-full glass-control text-xs font-sans text-[#F4E9E5] hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-full bg-red-600 text-white text-xs font-sans font-semibold hover:bg-red-500 cursor-pointer shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
