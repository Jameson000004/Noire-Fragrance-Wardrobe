import React, { useState } from 'react';
import { Cloud, Clock, Calendar, SlidersHorizontal, ArrowRight, User, Check, Plus, Sparkles, Droplets, Mail } from 'lucide-react';
import { Fragrance, Occasion, RecommendationResult, TimeOfDay, WeatherContext } from '../types/fragrance';
import { INGREDIENTS_CATALOG } from '../data/mockIngredients';
import { SoundService } from '../services/sound';
import { useAuth } from '../services/authContext';

interface ScreenScentFinderProps {
  fragrances: Fragrance[];
  recommendation: RecommendationResult | null;
  currentOccasion: Occasion;
  currentTimeOfDay: TimeOfDay;
  currentWeather: WeatherContext;
  onSelectFragrance: (fragrance: Fragrance) => void;
  onOpenFilters: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenGmail: () => void;
  onToggleOccasion: () => void;
  onToggleTime: () => void;
  onToggleWeather: () => void;
  onNavigateToShelf: () => void;
}

export const ScreenScentFinder: React.FC<ScreenScentFinderProps> = ({
  fragrances,
  recommendation,
  currentOccasion,
  currentTimeOfDay,
  currentWeather,
  onSelectFragrance,
  onOpenFilters,
  onOpenSettings,
  onOpenAuth,
  onOpenGmail,
  onToggleOccasion,
  onToggleTime,
  onToggleWeather,
  onNavigateToShelf,
}) => {
  const { currentUser, userProfile, hasGmailAccess } = useAuth();
  const [activeSegment, setActiveSegment] = useState<'today' | 'shelf'>('today');
  const [selectedNoteLayer, setSelectedNoteLayer] = useState<'top' | 'heart' | 'base'>('heart');
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(['ing-rose', 'ing-amber']);
  const [activeIngredientDetail, setActiveIngredientDetail] = useState<string | null>(null);

  const toggleIngredient = (id: string) => {
    SoundService.playTap();
    setSelectedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const currentIngredients = INGREDIENTS_CATALOG.filter((i) => i.layer === selectedNoteLayer);

  const handleCardClick = (fragrance: Fragrance) => {
    SoundService.playTap();
    onSelectFragrance(fragrance);
  };

  const heroFragrance = recommendation?.fragrance || fragrances[0];

  return (
    <div className="relative min-h-screen w-full bg-[#10090B] text-[#F4E9E5] pb-28 pt-10 px-4 sm:px-6 select-none overflow-x-hidden">
      {/* Dynamic blurred ambient background glow derived from the recommended fragrance */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25 blur-[90px] transition-all duration-1000 z-0"
        style={{
          background: 'radial-gradient(circle at 50% 30%, #55282F 0%, #28171B 50%, #10090B 80%)',
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between mb-5">
        <h1 className="font-serif text-2xl text-[#F4E9E5] tracking-tight">Noiré</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              SoundService.playTap();
              onOpenGmail();
            }}
            aria-label="Open Atelier Mail (Gmail)"
            className="relative w-10 h-10 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC]/60 transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 text-[#F4E9E5]" strokeWidth={1.75} />
            {hasGmailAccess && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D8A6AC] ring-1 ring-[#10090B]" />
            )}
          </button>

          <button
            onClick={onOpenFilters}
            aria-label="Filter recommendations"
            className="w-10 h-10 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC]/60 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#F4E9E5]" strokeWidth={1.75} />
          </button>
          
          {/* User Profile / Auth Button (Matches Mockup Screen 2 Top-Right Circle!) */}
          <button
            onClick={onOpenAuth}
            aria-label="Account and cloud sync"
            className="w-10 h-10 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC]/60 transition-all cursor-pointer overflow-hidden p-0.5"
          >
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : currentUser && !currentUser.isAnonymous ? (
              <span className="text-xs font-serif font-bold text-[#D8A6AC]">
                {(userProfile?.displayName || userProfile?.email || 'N').charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="w-4 h-4 text-[#F4E9E5]" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </header>

      {/* Title & Introduction */}
      <div className="relative z-10 mb-5">
        <h2 className="font-serif text-3xl font-normal text-[#F4E9E5] tracking-tight mb-1">
          Scent Finder
        </h2>
        <p className="text-xs sm:text-sm text-[#C8B7B9] font-sans">
          Find your perfect fragrance based on weather, time, and occasion.
        </p>
      </div>

      {/* Interactive Context Cards Row (Weather, Time, Occasion) */}
      <div className="relative z-10 grid grid-cols-3 gap-2.5 mb-6">
        {/* Weather Card */}
        <button
          onClick={onToggleWeather}
          className="glass-card p-3 rounded-2xl flex flex-col items-start text-left hover:border-[#D8A6AC]/40 transition-all active:scale-[0.98] cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-[rgba(244,233,229,0.08)] flex items-center justify-center mb-2 text-[#D8A6AC] group-hover:text-white transition-colors">
            <Cloud className="w-3.5 h-3.5" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-[#C8B7B9] uppercase font-sans font-medium tracking-wider mb-0.5">
            Weather
          </span>
          <span className="text-xs font-sans font-semibold text-[#F4E9E5] truncate w-full">
            {Math.round(currentWeather.temperatureC)}°C · {currentWeather.condition}
          </span>
        </button>

        {/* Time Card */}
        <button
          onClick={onToggleTime}
          className="glass-card p-3 rounded-2xl flex flex-col items-start text-left hover:border-[#D8A6AC]/40 transition-all active:scale-[0.98] cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-[rgba(244,233,229,0.08)] flex items-center justify-center mb-2 text-[#D8A6AC] group-hover:text-white transition-colors">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-[#C8B7B9] uppercase font-sans font-medium tracking-wider mb-0.5">
            Time
          </span>
          <span className="text-xs font-sans font-semibold text-[#F4E9E5] truncate w-full">
            {currentTimeOfDay}
          </span>
        </button>

        {/* Occasion Card */}
        <button
          onClick={onToggleOccasion}
          className="glass-card p-3 rounded-2xl flex flex-col items-start text-left hover:border-[#D8A6AC]/40 transition-all active:scale-[0.98] cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-[rgba(244,233,229,0.08)] flex items-center justify-center mb-2 text-[#D8A6AC] group-hover:text-white transition-colors">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-[#C8B7B9] uppercase font-sans font-medium tracking-wider mb-0.5">
            Occasion
          </span>
          <span className="text-xs font-sans font-semibold text-[#F4E9E5] truncate w-full">
            {currentOccasion}
          </span>
        </button>
      </div>

      {/* Segmented Switch: For today / My shelf */}
      <div className="relative z-10 flex justify-center mb-6">
        <div className="glass-control p-1 rounded-full flex items-center gap-1">
          <button
            onClick={() => setActiveSegment('today')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
              activeSegment === 'today'
                ? 'bg-[#F4E9E5] text-[#10090B] shadow-sm font-semibold'
                : 'text-[#C8B7B9] hover:text-[#F4E9E5]'
            }`}
          >
            For today
          </button>
          <button
            onClick={() => {
              setActiveSegment('shelf');
              onNavigateToShelf();
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
              activeSegment === 'shelf'
                ? 'bg-[#F4E9E5] text-[#10090B] shadow-sm font-semibold'
                : 'text-[#C8B7B9] hover:text-[#F4E9E5]'
            }`}
          >
            My shelf
          </button>
        </div>
      </div>

      {/* Section: Recommended For You */}
      <div className="relative z-10 mb-7">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-normal text-[#F4E9E5]">
              Recommended For You
            </h3>
            {recommendation?.isBestMatch && (
              <span className="bg-[#F4E9E5] text-[#10090B] text-[10px] font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Best match
              </span>
            )}
          </div>
          <button
            onClick={onNavigateToShelf}
            className="text-xs font-sans text-[#C8B7B9] hover:text-[#F4E9E5] transition-colors cursor-pointer"
          >
            See all
          </button>
        </div>

        {/* Featured Recommendation Card (Matches Screen 2 Mockup!) */}
        {heroFragrance ? (
          <div
            onClick={() => handleCardClick(heroFragrance)}
            className="relative w-full rounded-[28px] overflow-hidden bg-gradient-to-b from-[#28171B] to-[#10090B] border border-[rgba(244,233,229,0.18)] shadow-[0_16px_40px_rgba(0,0,0,0.6)] cursor-pointer group active:scale-[0.99] transition-all"
          >
            {/* Background bottle photo */}
            <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-[#180C0F]">
              <img
                src={heroFragrance.imageUrl}
                alt={heroFragrance.name}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10090B] via-[#10090B]/40 to-transparent" />

              {/* Tags overlay on upper left */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5">
                <span className="glass-control px-2.5 py-1 rounded-full text-[11px] font-sans font-medium text-[#F4E9E5] backdrop-blur-md">
                  {heroFragrance.tags.timeOfDay[0] || 'Evening'} · {currentOccasion}
                </span>
                <span className="glass-control px-2.5 py-1 rounded-full text-[11px] font-sans font-medium text-[#D8A6AC] backdrop-blur-md">
                  {heroFragrance.longevityText}
                </span>
              </div>
            </div>

            {/* Bottom info section */}
            <div className="p-5 pt-2 flex items-end justify-between">
              <div>
                <h4 className="font-serif text-2xl text-[#F4E9E5] mb-1">
                  {heroFragrance.name}
                </h4>
                <p className="text-xs text-[#C8B7B9] font-sans tracking-wide">
                  {heroFragrance.notes.top.map((n) => n.family || n.name).slice(0, 3).join(' · ') ||
                    'Floral · Woody · Amber'}
                </p>

                {/* Explainable recommendation reason */}
                {recommendation && recommendation.reasons.length > 0 && (
                  <p className="text-[11px] text-[#D8A6AC] mt-2 font-sans italic opacity-90 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 flex-shrink-0" />
                    <span>{recommendation.reasons[0]}</span>
                  </p>
                )}
              </div>

              {/* Circular Action Button */}
              <button
                aria-label={`View details for ${heroFragrance.name}`}
                className="w-11 h-11 rounded-full bg-[rgba(244,233,229,0.14)] border border-[rgba(244,233,229,0.25)] flex items-center justify-center text-[#F4E9E5] group-hover:bg-[#F4E9E5] group-hover:text-[#10090B] transition-all flex-shrink-0 shadow-lg"
              >
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl text-center">
            <Droplets className="w-10 h-10 text-[#D8A6AC] mx-auto mb-3 opacity-60" />
            <h4 className="font-serif text-xl text-[#F4E9E5] mb-1">Your shelf begins here</h4>
            <p className="text-xs text-[#C8B7B9] mb-4">
              Add a fragrance to start discovering your personal matches.
            </p>
            <button
              onClick={onNavigateToShelf}
              className="py-2.5 px-6 rounded-full bg-[#F4E9E5] text-[#10090B] text-xs font-semibold cursor-pointer"
            >
              Add First Fragrance
            </button>
          </div>
        )}
      </div>

      {/* Section: Popular Selections / Wardrobe Carousel */}
      <div className="relative z-10 mb-8">
        <h3 className="font-serif text-lg font-normal text-[#F4E9E5] mb-3 px-1">
          Popular Selections
        </h3>

        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none snap-x">
          {fragrances.map((frag, idx) => (
            <div
              key={frag.id}
              onClick={() => handleCardClick(frag)}
              className="flex-shrink-0 w-36 sm:w-40 snap-start rounded-2xl overflow-hidden glass-card p-2 cursor-pointer group active:scale-[0.97] transition-all hover:border-[#D8A6AC]/50"
            >
              <div className="w-full h-36 rounded-xl overflow-hidden bg-[#160B0E] mb-2 relative">
                <img
                  src={frag.imageUrl}
                  alt={frag.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-1.5 right-1.5 bg-[#10090B]/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-[#C8B7B9] font-sans">
                  {frag.concentration === 'Eau de Parfum' ? 'EdP' : frag.concentration === 'Eau de Toilette' ? 'EdT' : 'Extrait'}
                </span>
              </div>
              <h5 className="font-serif text-sm text-[#F4E9E5] truncate mb-0.5">
                {frag.name}
              </h5>
              <p className="text-[11px] text-[#C8B7B9] truncate font-sans">
                {frag.brand}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Note Explorer Sheet (Bottom photographic tiles with Top/Heart/Base tabs) */}
      <div className="relative z-10 rounded-[28px] glass-panel p-5 border border-[rgba(244,233,229,0.18)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-serif text-lg text-[#F4E9E5]">Olfactory Notes</h4>
            <p className="text-[11px] text-[#C8B7B9]">Explore the architecture of your wardrobe</p>
          </div>
          {/* Note Layer Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#1A0D10] p-1 rounded-full border border-[rgba(244,233,229,0.12)]">
            {(['top', 'heart', 'base'] as const).map((layer) => {
              const count = INGREDIENTS_CATALOG.filter((i) => i.layer === layer).length;
              return (
                <button
                  key={layer}
                  onClick={() => {
                    SoundService.playTap();
                    setSelectedNoteLayer(layer);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-sans transition-all capitalize cursor-pointer ${
                    selectedNoteLayer === layer
                      ? 'bg-[#F4E9E5] text-[#10090B] font-semibold'
                      : 'text-[#C8B7B9] hover:text-[#F4E9E5]'
                  }`}
                >
                  {layer} <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Ingredient Photo Tiles Grid */}
        <div className="grid grid-cols-2 gap-3">
          {currentIngredients.map((ingredient) => {
            const isSelected = selectedIngredientIds.includes(ingredient.id);
            return (
              <div
                key={ingredient.id}
                onClick={() => toggleIngredient(ingredient.id)}
                className={`relative rounded-2xl overflow-hidden glass-card p-2.5 transition-all cursor-pointer group ${
                  isSelected ? 'border-[#F4E9E5] ring-1 ring-[#F4E9E5]/60' : 'hover:border-[#D8A6AC]/40'
                }`}
              >
                <div className="w-full h-24 rounded-xl overflow-hidden bg-[#180C0F] mb-2 relative">
                  <img
                    src={ingredient.imageUrl}
                    alt={ingredient.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Selected ivory ring / checkmark button */}
                  <div
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#F4E9E5] text-[#10090B] shadow-md'
                        : 'bg-[#10090B]/60 backdrop-blur-md text-[#F4E9E5] border border-[rgba(244,233,229,0.3)]'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-serif text-sm text-[#F4E9E5] font-medium leading-tight">
                      {ingredient.name}
                    </h5>
                    <span className="text-[10px] text-[#D8A6AC] uppercase tracking-wider font-sans">
                      {ingredient.family}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#C8B7B9] mt-1.5 line-clamp-2 leading-relaxed opacity-85">
                  {ingredient.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
