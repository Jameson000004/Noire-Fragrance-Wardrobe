import React, { useState } from 'react';
import {
  ChevronLeft,
  Heart,
  Share2,
  Calendar,
  Sparkles,
  Droplet,
  Clock,
  Sun,
  Flame,
  Check,
} from 'lucide-react';
import { Fragrance } from '../types/fragrance';
import { SoundService } from '../services/sound';

interface ScreenBottleDetailProps {
  fragrance: Fragrance;
  onBack: () => void;
  onWearToday: (fragrance: Fragrance) => void;
  onToggleFavorite: (id: string) => void;
  onEditFragrance?: (fragrance: Fragrance) => void;
}

export const ScreenBottleDetail: React.FC<ScreenBottleDetailProps> = ({
  fragrance,
  onBack,
  onWearToday,
  onToggleFavorite,
  onEditFragrance,
}) => {
  const [justWorn, setJustWorn] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [spritzActive, setSpritzActive] = useState(false);

  const handleWear = () => {
    SoundService.playSpritz();
    setSpritzActive(true);
    setJustWorn(true);
    onWearToday(fragrance);

    setTimeout(() => {
      setSpritzActive(false);
    }, 900);

    setTimeout(() => {
      setJustWorn(false);
    }, 3500);
  };

  const handleShare = async () => {
    SoundService.playTap();
    const shareText = `Discover ${fragrance.name} by ${fragrance.brand} — ${fragrance.concentration}, ${fragrance.longevityText}. Notes: ${fragrance.notes.top.map((n) => n.name).join(', ')} / ${fragrance.notes.heart.map((n) => n.name).join(', ')} / ${fragrance.notes.base.map((n) => n.name).join(', ')}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Noiré — ${fragrance.name}`,
          text: shareText,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2400);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#10090B] text-[#F4E9E5] pb-32 select-none overflow-x-hidden">
      {/* Top Floating Glass Controls */}
      <header className="fixed top-6 inset-x-0 z-30 px-6 flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={() => {
            SoundService.playTap();
            onBack();
          }}
          aria-label="Back"
          className="w-11 h-11 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC] transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            aria-label="Share fragrance summary"
            className="w-11 h-11 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC] transition-all cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => {
              SoundService.playTap();
              onToggleFavorite(fragrance.id);
            }}
            aria-label={fragrance.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="w-11 h-11 rounded-full glass-control flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                fragrance.isFavorite ? 'fill-[#A34F56] text-[#A34F56]' : 'text-[#F4E9E5]'
              }`}
              strokeWidth={1.75}
            />
          </button>
        </div>
      </header>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-card px-4 py-2 rounded-full text-xs font-sans text-[#F4E9E5] shadow-xl border border-[#D8A6AC]/40">
          Fragrance summary copied to clipboard
        </div>
      )}

      {/* Upper Hero Area: Backlit Flacon with Specular Caustic Glow */}
      <div className="relative w-full h-[380px] sm:h-[420px] flex items-center justify-center bg-[#140A0D] overflow-hidden">
        {/* Amber & Burgundy Ambient Glow */}
        <div
          className="absolute w-[360px] h-[360px] rounded-full opacity-35 blur-[90px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #A34F56 0%, #55282F 50%, transparent 80%)',
          }}
        />

        {/* Atomiser Mist Particle Animation Effect */}
        {spritzActive && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-[#D8A6AC]/20 blur-xl animate-ping opacity-75" />
            <div className="absolute top-1/3 w-32 h-32 rounded-full bg-[#F4E9E5]/30 blur-md animate-pulse" />
          </div>
        )}

        {/* Bottle Image */}
        <div className="relative w-full max-w-sm h-full flex items-center justify-center pt-8 px-6">
          <img
            src={fragrance.imageUrl}
            alt={fragrance.name}
            className="w-full h-full object-contain filter drop-shadow-[0_24px_48px_rgba(0,0,0,0.9)] transform transition-transform duration-700"
          />
          {/* Bottom fade blending with sheet */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#10090B] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Fragrance Inset Content Sheet (Smoked burgundy material matching mockup) */}
      <div className="relative z-10 -mt-8 mx-3 sm:mx-4 rounded-[32px] glass-panel p-6 sm:p-7 border border-[rgba(244,233,229,0.18)] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Grabber indicator */}
        <div className="w-10 h-1 rounded-full bg-[rgba(244,233,229,0.25)] mx-auto mb-5" />

        {/* Subtitle / Concentration & Size */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-[#D8A6AC]">
            {fragrance.concentration} · {fragrance.volumeMilliliters} ml
          </span>
          <span className="text-xs font-sans text-[#C8B7B9] opacity-80">
            {fragrance.brand}
          </span>
        </div>

        {/* Fragrance Name (Fraunces Light Display Serif) */}
        <h2 className="font-serif text-3xl sm:text-4xl text-[#F4E9E5] tracking-tight font-normal mb-3">
          {fragrance.name}
        </h2>

        {/* Characteristic Chips (Floral · Woody · Amber) */}
        <div className="flex flex-wrap gap-2 mb-5">
          {fragrance.tags.occasions.slice(0, 2).map((occ) => (
            <span
              key={occ}
              className="bg-[rgba(244,233,229,0.08)] border border-[rgba(244,233,229,0.12)] px-3 py-1 rounded-full text-xs font-sans text-[#F4E9E5]"
            >
              {occ}
            </span>
          ))}
          <span className="bg-[rgba(244,233,229,0.08)] border border-[rgba(244,233,229,0.12)] px-3 py-1 rounded-full text-xs font-sans text-[#D8A6AC]">
            {fragrance.longevityText}
          </span>
          <span className="bg-[rgba(244,233,229,0.08)] border border-[rgba(244,233,229,0.12)] px-3 py-1 rounded-full text-xs font-sans text-[#C8B7B9]">
            {fragrance.tags.sillage}
          </span>
        </div>

        {/* Poetic Description */}
        <p className="text-sm font-sans text-[#C8B7B9] leading-relaxed mb-6 font-normal">
          {fragrance.description}
        </p>

        {/* Metadata Details Rows with Hairline Dividers (Matches Screen 3 Mockup!) */}
        <div className="rounded-2xl bg-[rgba(20,10,13,0.55)] border border-[rgba(244,233,229,0.1)] p-1 divide-y divide-[rgba(244,233,229,0.08)] mb-6">
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <Droplet className="w-4 h-4 text-[#D8A6AC]" strokeWidth={1.75} />
              <span className="text-xs font-sans text-[#C8B7B9]">Size</span>
            </div>
            <span className="text-xs font-sans font-medium text-[#F4E9E5]">
              {fragrance.volumeMilliliters} ml
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#D8A6AC]" strokeWidth={1.75} />
              <span className="text-xs font-sans text-[#C8B7B9]">When</span>
            </div>
            <span className="text-xs font-sans font-medium text-[#F4E9E5]">
              {fragrance.tags.occasions.slice(0, 2).join(' · ')}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-[#D8A6AC]" strokeWidth={1.75} />
              <span className="text-xs font-sans text-[#C8B7B9]">Season</span>
            </div>
            <span className="text-xs font-sans font-medium text-[#F4E9E5]">
              {fragrance.tags.seasons.join(' · ')}
            </span>
          </div>
        </div>

        {/* How It Wears Progression Timeline */}
        <div className="mb-8">
          <h3 className="font-serif text-base text-[#F4E9E5] mb-3">How It Wears</h3>
          <div className="glass-card p-4 rounded-2xl">
            <div className="relative flex items-center justify-between mb-4 px-2">
              {/* Connecting progression line */}
              <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-[1px] bg-gradient-to-r from-[#D8A6AC] via-[#A34F56] to-[#55282F]" />

              {/* Stage 1: Opening */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#F4E9E5] border-2 border-[#10090B] shadow-sm mb-1.5" />
                <span className="text-[11px] font-sans font-semibold text-[#F4E9E5]">
                  Opening
                </span>
                <span className="text-[10px] text-[#D8A6AC] font-sans">
                  {fragrance.howItWears?.opening.time || '0 h'}
                </span>
              </div>

              {/* Stage 2: Heart */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#D8A6AC] border-2 border-[#10090B] shadow-sm mb-1.5" />
                <span className="text-[11px] font-sans font-semibold text-[#F4E9E5]">
                  Heart
                </span>
                <span className="text-[10px] text-[#D8A6AC] font-sans">
                  {fragrance.howItWears?.heart.time || '1 h'}
                </span>
              </div>

              {/* Stage 3: Base */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#A34F56] border-2 border-[#10090B] shadow-sm mb-1.5" />
                <span className="text-[11px] font-sans font-semibold text-[#F4E9E5]">
                  Base
                </span>
                <span className="text-[10px] text-[#D8A6AC] font-sans">
                  {fragrance.howItWears?.base.time || `${fragrance.longevityHours} h`}
                </span>
              </div>
            </div>

            {/* Note details breakdown */}
            <div className="space-y-2 pt-2 border-t border-[rgba(244,233,229,0.08)]">
              <div className="text-xs font-sans">
                <span className="text-[#D8A6AC] font-medium">Top Notes: </span>
                <span className="text-[#F4E9E5]">
                  {fragrance.notes.top.map((n) => n.name).join(', ') || 'Calabrian Bergamot, Pink Pepper'}
                </span>
              </div>
              <div className="text-xs font-sans">
                <span className="text-[#D8A6AC] font-medium">Heart Notes: </span>
                <span className="text-[#F4E9E5]">
                  {fragrance.notes.heart.map((n) => n.name).join(', ') || 'Velvet Rose, Iris Florentina'}
                </span>
              </div>
              <div className="text-xs font-sans">
                <span className="text-[#D8A6AC] font-medium">Base Notes: </span>
                <span className="text-[#F4E9E5]">
                  {fragrance.notes.base.map((n) => n.name).join(', ') || 'Dark Ebony Wood, Warm Amber Resin'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button: Solid Ivory Capsule "Wear Today" */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleWear}
            className={`w-full py-4 px-6 rounded-full font-sans font-semibold text-base transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_24px_rgba(244,233,229,0.22)] ${
              justWorn
                ? 'bg-[#2E181D] text-[#D8A6AC] border border-[#D8A6AC]/40'
                : 'bg-[#F4E9E5] text-[#10090B] hover:bg-white'
            }`}
          >
            {justWorn ? (
              <>
                <Check className="w-5 h-5 text-[#D8A6AC]" />
                <span>Marked as Today's Scent</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-[#A34F56]" />
                <span>Wear Today</span>
              </>
            )}
          </button>

          {fragrance.lastWornAt && (
            <p className="text-[11px] text-center text-[#C8B7B9] font-sans opacity-75">
              Last worn: {new Date(fragrance.lastWornAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
