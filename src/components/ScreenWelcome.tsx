import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SoundService } from '../services/sound';

interface ScreenWelcomeProps {
  onGetStarted: () => void;
  onExploreDirectly: () => void;
  onSignIn: () => void;
}

export const ScreenWelcome: React.FC<ScreenWelcomeProps> = ({
  onGetStarted,
  onExploreDirectly,
  onSignIn,
}) => {
  const handleStart = () => {
    SoundService.playTap();
    onGetStarted();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#10090B] text-[#F4E9E5] overflow-hidden select-none">
      {/* Upper Section: Wordmark Header */}
      <header className="relative z-20 pt-12 pb-2 px-6 flex flex-col items-center text-center">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#F4E9E5]">
          Noiré
        </h1>
        <p className="text-[11px] font-sans font-medium uppercase tracking-[0.22em] text-[#C8B7B9] mt-1 opacity-80">
          Your Fragrance Wardrobe
        </p>
      </header>

      {/* Hero Visual Area: Backlit Flacon with Amber/Rose Warmth */}
      <div className="relative flex-1 w-full flex items-center justify-center -my-4 min-h-[380px]">
        {/* Soft Radial Ambient Glow */}
        <div
          className="absolute w-[320px] h-[320px] rounded-full pointer-events-none opacity-45 blur-[80px]"
          style={{
            background: 'radial-gradient(circle, #A34F56 0%, #55282F 45%, transparent 75%)',
          }}
        />

        {/* Hero Bottle Image with seamless dark gradient fade */}
        <div className="relative w-full max-w-[360px] h-[400px] flex items-center justify-center px-4">
          <img
            src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85"
            alt="Noiré Luxury Flacon"
            className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] transform transition-transform duration-700 hover:scale-[1.02]"
            loading="eager"
          />
          {/* Bottom fade into #10090B */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#10090B] via-[#10090B]/85 to-transparent pointer-events-none" />
          {/* Top fade for soft lighting integration */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#10090B]/60 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Lower Editorial Copy & Primary CTA */}
      <div className="relative z-20 px-6 sm:px-8 pb-10 flex flex-col items-center text-center max-w-md mx-auto w-full">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#F4E9E5] leading-[1.18] tracking-tight mb-3">
          The right scent <br />
          <span className="italic text-[#D8A6AC] font-light">for every moment.</span>
        </h2>

        <p className="text-[14px] sm:text-[15px] text-[#C8B7B9] leading-relaxed max-w-[300px] mb-8 font-sans font-normal opacity-90">
          Organise your fragrance wardrobe and discover the perfect scent for your mood, weather, time and occasion.
        </p>

        {/* Primary CTA: Solid Ivory Pill Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-full bg-[#F4E9E5] text-[#10090B] font-sans font-semibold text-base transition-all duration-200 active:scale-[0.98] hover:bg-white shadow-[0_8px_24px_rgba(244,233,229,0.22)] flex items-center justify-center gap-2 group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D8A6AC]"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Secondary quiet Sign In link */}
        <button
          onClick={() => {
            SoundService.playTap();
            onSignIn();
          }}
          className="mt-4 text-xs font-sans text-[#C8B7B9] hover:text-[#F4E9E5] py-1.5 px-3 transition-colors cursor-pointer"
        >
          Already have an account? <span className="text-[#D8A6AC] font-medium underline underline-offset-2">Sign in</span>
        </button>

        {/* Quiet skip link */}
        <button
          onClick={onExploreDirectly}
          className="mt-1 text-[11px] font-sans text-[#C8B7B9]/60 hover:text-[#C8B7B9] py-1 transition-colors cursor-pointer"
        >
          Explore collection as guest
        </button>
      </div>
    </div>
  );
};
