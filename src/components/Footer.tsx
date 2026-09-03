import React from 'react';
import { useMadrasa } from '../context/MadrasaContext';
import {
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Heart,
  CreditCard,
  Send,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  Palette,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    madrasaInfo,
    setActivePublicTab,
    currentRole,
    quickSwitchRole,
    themePreset,
    setIsThemeSelectorOpen,
  } = useMadrasa();

  return (
    <footer id="main-madrasa-footer" className={`${themePreset.footerBg} text-slate-300 transition-colors duration-500`}>
      {/* Top Quranic Verse Banner */}
      <div className="bg-white/5 py-4 px-4 text-center border-b border-white/10">
        <p className="font-['Amiri'] text-amber-300 text-lg sm:text-xl tracking-wider">
          {madrasaInfo.mottoArabic}
        </p>
        <p className="text-white/80 text-xs sm:text-sm mt-0.5">
          "{madrasaInfo.mottoBangla}"
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: About Institution */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {madrasaInfo.nameBangla}
                </h3>
                <p className="text-[11px] text-amber-300 font-['Amiri']">{madrasaInfo.nameArabic}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              আমানত ইসলামিক স্কুল উত্তরা, ঢাকায় অবস্থিত একটি শীর্ষস্থানীয় আদর্শ দ্বীনি ও আধুনিক শিক্ষাপ্রতিষ্ঠান। এখানে কওমি ও সমকালীন সাধারণ শিক্ষার এক অপূর্ব সমন্বিত পাঠ্যক্রম পরিচালিত হয়।
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>ইআইআইএন: {madrasaInfo.eiinNumber} | কোড: {madrasaInfo.codeNumber}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              গুরুত্বপূর্ণ লিংকসমূহ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    quickSwitchRole('public');
                    setActivePublicTab('about');
                  }}
                  className="hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  স্কুল পরিচিতি ও ইতিহাস
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    quickSwitchRole('public');
                    setActivePublicTab('departments');
                  }}
                  className="hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  শিক্ষা বিভাগসমূহ ও পাঠ্যক্রম
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    quickSwitchRole('public');
                    setActivePublicTab('admission');
                  }}
                  className="hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  অনলাইন ভর্তি আবেদন
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    quickSwitchRole('public');
                    setActivePublicTab('notices');
                  }}
                  className="hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  নোটিশ বোর্ড
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    quickSwitchRole('public');
                    setActivePublicTab('results');
                  }}
                  className="hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  পরীক্ষার রেজাল্ট অনুসন্ধান
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Fee Payment Numbers */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              বেতন ও ফি হিসাব
            </h4>
            <div className="space-y-3 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="text-pink-400 font-semibold mb-0.5">বিকাশ (bKash) পেমেন্ট:</div>
                <div className="text-white font-mono font-bold text-sm">{madrasaInfo.bkashMerchantNumber}</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="text-amber-400 font-semibold mb-0.5">নগদ (Nagad) পেমেন্ট:</div>
                <div className="text-white font-mono font-bold text-sm">{madrasaInfo.nagadMerchantNumber}</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="text-sky-300 font-semibold mb-0.5">ব্যাংক হিসাব:</div>
                <div className="text-slate-300 text-[11px] leading-tight">{madrasaInfo.bankAccountDetails}</div>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              যোগাযোগ ও ঠিকানা
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{madrasaInfo.addressBangla || madrasaInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{madrasaInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{madrasaInfo.email}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsThemeSelectorOpen(true)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-white/15"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                ডিজাইন পরিবর্তন করুন (৫টি অপশন)
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & credits */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            © {new Date().getFullYear()} {madrasaInfo.nameBangla}। সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => quickSwitchRole('admin')}
              className="text-slate-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              অ্যাডমিন পোর্টাল
            </button>
            <span>•</span>
            <span className="text-slate-400">এডুকেশন ম্যানেজমেন্ট সিস্টেম</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
