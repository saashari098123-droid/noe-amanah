import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { Palette, Sparkles, MoreVertical, X } from 'lucide-react';
import { ThemePresetId } from '../../types';

export const ThemeFloatingTrigger: React.FC = () => {
  const {
    themePresetId,
    setThemePresetId,
    themePresets,
    setIsThemeSelectorOpen,
  } = useMadrasa();

  const [isOpen, setIsOpen] = useState(false);
  const themesList = Object.values(themePresets);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Expanded Popup Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-40 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-2xl flex flex-col gap-2.5 animate-in fade-in zoom-in-95 text-xs w-60">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                কালার ও ডিজাইন থিম
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-slate-400">কুইক কালার:</span>
              <div className="flex items-center gap-1.5">
                {themesList.map((preset) => {
                  const isSelected = themePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setThemePresetId(preset.id as ThemePresetId)}
                      title={preset.nameBangla}
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
              </div>
            </div>

            <button
              id="theme-selector-trigger-btn"
              onClick={() => {
                setIsThemeSelectorOpen(true);
                setIsOpen(false);
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>সব প্রিভিউ ও ডিজাইন দেখুন</span>
              <Sparkles className="w-3 h-3 text-slate-900" />
            </button>
          </div>
        </>
      )}

      {/* Main Single Floating Action Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="থিম ও ডিজাইন অপশন"
        className="w-11 h-11 rounded-full bg-slate-900/90 hover:bg-slate-900 text-amber-300 border border-slate-700 shadow-2xl flex items-center justify-center cursor-pointer transition transform hover:scale-105 active:scale-95 group"
      >
        <Palette className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};
