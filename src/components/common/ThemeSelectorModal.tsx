import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { ThemePresetId } from '../../types';
import { Palette, Check, Sparkles, X, Eye, Laptop, ShieldCheck, Sun, Moon, Award } from 'lucide-react';

export const ThemeSelectorModal: React.FC = () => {
  const {
    themePresetId,
    setThemePresetId,
    themePresets,
    isThemeSelectorOpen,
    setIsThemeSelectorOpen,
  } = useMadrasa();

  if (!isThemeSelectorOpen) return null;

  const themesList = Object.values(themePresets);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg font-bold">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ৫টি আকর্ষণীয় ডিজাইন
                </span>
                <span className="text-xs text-blue-200">লাইভ থিম সুইচার</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                ওয়েবসাইটের ডিজাইন ও লুক পরিবর্তন করুন
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                আপনার পছন্দের ডিজাইনে ক্লিক করুন, তাৎক্ষণিকভাবে পুরো ওয়েবসাইটের লেআউট ও কালার পরিবর্তন হবে।
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsThemeSelectorOpen(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body: 5 Design Choices */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themesList.map((preset) => {
              const isSelected = themePresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    setThemePresetId(preset.id);
                  }}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white group hover:shadow-xl ${
                    isSelected
                      ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-lg'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Active Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                      <Check className="w-3.5 h-3.5" />
                      বর্তমান সক্রিয় ডিজাইন
                    </div>
                  )}

                  {/* Visual Color Palette Preview Card */}
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                    {/* Simulated Mini Header */}
                    <div
                      className="p-3 text-white flex items-center justify-between text-xs font-bold"
                      style={{ backgroundColor: preset.primaryColorHex }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.accentColorHex }}
                        ></div>
                        <span>{preset.nameEnglish}</span>
                      </div>
                      <div
                        className="px-2 py-0.5 rounded text-[10px] text-slate-900 font-bold"
                        style={{ backgroundColor: preset.accentColorHex }}
                      >
                        প্রিভিউ
                      </div>
                    </div>
                    {/* Simulated Mini Body */}
                    <div className="bg-slate-100 p-2.5 flex items-center gap-2 text-[11px]">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: preset.primaryColorHex }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: preset.accentColorHex }}
                      ></div>
                      <div className="h-2 w-16 bg-slate-300 rounded"></div>
                      <div className="h-2 w-10 bg-slate-300 rounded"></div>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      {preset.nameBangla}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {preset.tagline}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      ১-ক্লিকে সক্রিয়
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setThemePresetId(preset.id);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 group-hover:bg-blue-50 group-hover:text-blue-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          সক্রিয় আছে
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          এই ডিজাইনটি প্রয়োগ করুন
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>নির্বাচিত ডিজাইন স্বয়ংক্রিয়ভাবে ব্রাউজারে সংরক্ষিত থাকবে।</span>
          </div>
          <button
            onClick={() => setIsThemeSelectorOpen(false)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2 rounded-xl text-xs sm:text-sm transition"
          >
            সম্পন্ন করুন (ঠিক আছে)
          </button>
        </div>
      </div>
    </div>
  );
};
