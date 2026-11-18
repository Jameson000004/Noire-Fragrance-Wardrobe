import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Volume2 } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  // Check if screen is small (mobile view) or large
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [frameEnabled, setFrameEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobileDevice(mobile);
      // Auto enable device frame on larger desktop screens for stunning showcase
      if (!mobile && window.innerWidth >= 1024) {
        setFrameEnabled(true);
      } else {
        setFrameEnabled(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Update status clock
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(interval);
    };
  }, []);

  // On true mobile viewports, render direct full bleed
  if (isMobileDevice || !frameEnabled) {
    return (
      <div className="relative min-h-screen w-full bg-[#10090B]">
        {/* Frame Toggle Button for Desktop */}
        {!isMobileDevice && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setFrameEnabled(true)}
              className="glass-dock py-2 px-3.5 rounded-full text-xs font-sans text-[#F4E9E5] hover:text-white flex items-center gap-2 border border-[rgba(244,233,229,0.2)] shadow-xl cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#D8A6AC]" />
              <span>iPhone Frame Mode</span>
            </button>
          </div>
        )}
        <div className="max-w-md mx-auto min-h-screen relative">{children}</div>
      </div>
    );
  }

  // Showcase iPhone 16 Pro Frame view on desktop
  return (
    <div className="min-h-screen w-full bg-[#0a0507] flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden select-none">
      {/* Ambient background studio lighting */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[130px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #55282F 0%, #28171B 50%, transparent 80%)',
        }}
      />

      {/* Floating View Switcher Header */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <div className="glass-dock py-1.5 px-3 rounded-full flex items-center gap-2 border border-[rgba(244,233,229,0.18)] shadow-2xl">
          <span className="text-xs font-serif text-[#F4E9E5] px-2 border-r border-[rgba(244,233,229,0.15)]">
            Noiré
          </span>
          <button
            onClick={() => setFrameEnabled(true)}
            className={`py-1 px-3 rounded-full text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
              frameEnabled
                ? 'bg-[#F4E9E5] text-[#10090B] font-semibold shadow-sm'
                : 'text-[#C8B7B9] hover:text-[#F4E9E5]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone View</span>
          </button>
          <button
            onClick={() => setFrameEnabled(false)}
            className={`py-1 px-3 rounded-full text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
              !frameEnabled
                ? 'bg-[#F4E9E5] text-[#10090B] font-semibold shadow-sm'
                : 'text-[#C8B7B9] hover:text-[#F4E9E5]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Bleed</span>
          </button>
        </div>
      </div>

      {/* iPhone 16 Pro Bezel Container (393px width reference) */}
      <div className="relative w-[393px] h-[852px] rounded-[54px] bg-[#1a0e12] p-[10px] shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-[rgba(216,166,172,0.2)] my-8 transform hover:scale-[1.005] transition-transform duration-300">
        {/* Outer Titanium Trim Highlight */}
        <div className="absolute inset-0 rounded-[54px] border border-[rgba(244,233,229,0.18)] pointer-events-none" />

        {/* Screen Display Area */}
        <div className="relative w-full h-full rounded-[44px] bg-[#10090B] overflow-hidden flex flex-col">
          {/* iOS Status Bar */}
          <div className="relative z-40 w-full h-11 px-7 flex items-center justify-between text-[#F4E9E5] text-xs font-sans font-semibold select-none pt-2">
            <span>{currentTime}</span>

            {/* Dynamic Island Pill */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[116px] h-[32px] bg-black rounded-full flex items-center justify-between px-3 border border-white/5 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]" />
              <div className="w-3 h-3 rounded-full bg-[#111] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#201015]" />
              </div>
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5" />
              <div className="w-5 h-2.5 rounded-sm border border-current p-0.5 flex items-center">
                <div className="w-full h-full bg-current rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Screen Content Container with Smooth Scrolling */}
          <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none">
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="absolute bottom-1.5 inset-x-0 z-40 flex justify-center pointer-events-none pb-1">
            <div className="w-36 h-1 bg-[#F4E9E5]/45 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
