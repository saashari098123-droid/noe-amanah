import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { Palette, Sparkles } from 'lucide-react';
import { ThemePresetId } from '../../types';

export const ThemeFloatingTrigger: React.FC = () => {
  const {
    themePresetId,
    setThemePresetId,
    themePresets,
    setIsThemeSelectorOpen,
  } = useMadrasa();

  const themesList = Object.values(themePresets);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Quick Color Dots Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-full border border-slate-700 shadow-2xl flex items-center gap-1.5 animate-fadeIn">
        <span className="text-[10px] font-bold text-slate-300 px-2 uppercase tracking-wider hidden sm:inline">
          ডিজাইন:
        </span>
        {themesList.map((preset) => {
          const isSelected = themePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setThemePresetId(preset.id as ThemePresetId)}
              title={`${preset.nameBangla} - ক্লিক করুন`}
              className={`w-6 h-6 rounded-full transition-transform cursor-pointer border-2 relative ${
                isSelected
                  ? 'scale-125 ring-2 ring-white border-white shadow-lg'
                  : 'hover:scale-110 opacity-75 hover:opacity-100 border-slate-600'
              }`}
              style={{ backgroundColor: preset.primaryColorHex }}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold">
                  ✓
                </span>
              )}
            </button>
          );
        })}

        {/* Main Theme Modal Trigger Button */}
        <button
          id="theme-selector-trigger-btn"
          onClick={() => setIsThemeSelectorOpen(true)}
          className="ml-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition transform hover:-translate-y-0.5"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">৫টি ডিজাইন দেখুন</span>
          <span className="sm:hidden">ডিজাইন</span>
          <Sparkles className="w-3 h-3 text-slate-900" />
        </button>
      </div>
    </div>
  );
};
