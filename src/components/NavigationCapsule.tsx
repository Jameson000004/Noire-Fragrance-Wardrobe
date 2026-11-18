import React from 'react';
import { Sun, Compass, Droplet } from 'lucide-react';
import { SoundService } from '../services/sound';

export type NavigationTab = 'today' | 'discover' | 'shelf';

interface NavigationCapsuleProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  className?: string;
}

export const NavigationCapsule: React.FC<NavigationCapsuleProps> = ({
  currentTab,
  onSelectTab,
  className = '',
}) => {
  const handleTabClick = (tab: NavigationTab) => {
    SoundService.playTap();
    onSelectTab(tab);
  };

  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: <Sun className="w-5 h-5 transition-transform duration-200" strokeWidth={1.75} />,
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: <Compass className="w-5 h-5 transition-transform duration-200" strokeWidth={1.75} />,
    },
    {
      id: 'shelf',
      label: 'My Shelf',
      icon: <Droplet className="w-5 h-5 transition-transform duration-200" strokeWidth={1.75} />,
    },
  ];

  return (
    <nav
      aria-label="Primary navigation"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 ${className}`}
    >
      <div className="glass-dock flex items-center gap-1.5 p-1.5 rounded-full px-2.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              aria-label={tab.label}
              aria-selected={isActive}
              role="tab"
              className={`relative flex items-center justify-center w-12 h-11 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4E9E5] ${
                isActive
                  ? 'bg-[#F4E9E5] text-[#10090B] shadow-[0_2px_12px_rgba(244,233,229,0.35)] scale-105'
                  : 'text-[#C8B7B9] hover:text-[#F4E9E5] hover:bg-[rgba(244,233,229,0.08)]'
              }`}
            >
              {tab.icon}
              {isActive && (
                <span className="sr-only">Active tab: {tab.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
