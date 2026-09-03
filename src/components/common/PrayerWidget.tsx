import React, { useState, useEffect } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { Clock, Moon, Sun, Sunrise, Sunset } from 'lucide-react';

export const PrayerWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { prayerTimes } = useMadrasa();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPrayerIcon = (name: string) => {
    switch (name) {
      case 'ফজর':
        return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'যোহর':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'আসর':
        return <Sun className="w-4 h-4 text-orange-400" />;
      case 'মাগরিব':
        return <Sunset className="w-4 h-4 text-rose-400" />;
      case 'এশা':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  if (compact) {
    return (
      <div id="prayer-ticker-bar" className="bg-blue-950 text-blue-100 py-1.5 px-4 text-xs flex flex-wrap items-center justify-between border-b border-blue-800/60">
        <div className="flex items-center space-x-2 space-x-reverse font-medium">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-blue-300 font-semibold">আজকের নামাজের ওয়াক্ত:</span>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto py-1 scrollbar-none">
          {prayerTimes.map((p, idx) => (
            <div key={idx} className="flex items-center gap-1.5 whitespace-nowrap bg-blue-900/60 px-2 py-0.5 rounded border border-blue-800/40">
              {getPrayerIcon(p.nameBangla)}
              <span className="text-blue-200 font-medium">{p.nameBangla}:</span>
              <span className="text-amber-300 font-bold">{p.iqamahTime}</span>
            </div>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-1 text-blue-300">
          <Clock className="w-3.5 h-3.5" />
          <span>বর্তমান সময়: {currentTime}</span>
        </div>
      </div>
    );
  }

  return (
    <div id="prayer-times-card" className="bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-blue-700/50">
      <div className="flex items-center justify-between border-b border-blue-800/80 pb-4 mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-blue-400 font-semibold font-['Amiri']">مواقيت الصلاة</div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            দৈনিক নামাজের সময়সূচী (উত্তরা, ঢাকা)
          </h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-blue-300">লাইভ সময়</div>
          <div className="text-sm font-bold text-amber-300 font-mono">{currentTime}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {prayerTimes.map((p, idx) => (
          <div
            key={idx}
            className="bg-blue-800/40 hover:bg-blue-800/70 transition-all rounded-xl p-3 text-center border border-blue-700/40 flex flex-col justify-between"
          >
            <div className="flex justify-center mb-1">{getPrayerIcon(p.nameBangla)}</div>
            <div className="text-sm font-semibold text-blue-200">{p.nameBangla}</div>
            <div className="text-xs text-blue-400 font-['Amiri']">{p.nameArabic}</div>
            <div className="mt-2 pt-2 border-t border-blue-700/30">
              <div className="text-[10px] text-blue-300">আযান: {p.adhanTime}</div>
              <div className="text-sm font-bold text-amber-300">ইকামত: {p.iqamahTime}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
