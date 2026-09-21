import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { GraduationCap, Award, MapPin, Phone, Sparkles, CheckCircle2, BookOpen, Star, ArrowRight, ShieldCheck, Compass } from 'lucide-react';

export const MadrasaBannerCard: React.FC = () => {
  const { setActivePublicTab, madrasaInfo } = useMadrasa();

  // Official Madrasa Logo Emblem from Banner
  const officialLogoUrl = madrasaInfo.logoUrl || 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=200&auto=format&fit=crop&q=80';

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-400/50 mb-10 transition-all duration-300 relative">
      {/* Background Islamic Geometric Pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"></div>

      {/* Top Prominent Headline Tagline */}
      <div className="relative z-10 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 py-4 px-4 text-center border-b-2 border-amber-400/40 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-1">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest bg-emerald-950/60 px-4 py-1 rounded-full border border-amber-400/30">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>সুবর্ণ সুযোগ ও আধুনিক দ্বীনি শিক্ষালয়</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-amber-200 font-['Amiri'] tracking-tight drop-shadow-md leading-relaxed mt-1">
            ভৈরবে এই প্রথম ইসলাম ও সাধারণ শিক্ষার সমন্বয়ে (ফোর ল্যাঙ্গুয়েজ) একটি ব্যতিক্রমধর্মী শিক্ষা প্রতিষ্ঠান
          </h2>
        </div>
      </div>

      <div className="relative z-10 p-5 sm:p-8 space-y-6">
        {/* Main Title & Authorities Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-5 text-center md:text-left bg-emerald-900/40 backdrop-blur-md p-5 sm:p-7 rounded-2xl border border-amber-400/30 shadow-inner">
          <div className="md:col-span-2 flex justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-300/30 border-2 border-amber-400 p-2 flex items-center justify-center shadow-xl group bg-white">
              <img
                src={officialLogoUrl}
                alt="Madrasa Logo"
                className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition duration-300"
              />
            </div>
          </div>

          <div className="md:col-span-7 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
              <Compass className="w-3.5 h-3.5" /> আন্তর্জাতিক মানের দ্বীনি ও আধুনিক বিদ্যাপীঠ
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-300 font-['Amiri'] tracking-tight drop-shadow-lg">
              {madrasaInfo.nameBangla}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              📍 {madrasaInfo.address} • স্থাপিত: {madrasaInfo.establishedYear} খ্রি.
            </p>
          </div>

          <div className="md:col-span-3 text-xs text-left sm:text-right space-y-1.5 bg-black/30 p-3.5 rounded-xl border border-amber-400/20 shadow-sm">
            <div className="text-amber-300 font-bold border-b border-white/10 pb-1.5 flex items-center md:justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>উপদেষ্টা: <span className="text-white font-normal">মাওলানা সাইফুল হক</span></span>
            </div>
            <div className="text-amber-300 font-bold pt-0.5 flex items-center md:justify-end gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>পরিচালক: <span className="text-white font-normal">হাফেজ মাওলানা তানভীর আহমাদ</span></span>
            </div>
          </div>
        </div>

        {/* Admissions Open Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left Notice Box */}
          <div className="bg-emerald-900/60 backdrop-blur-md border-2 border-amber-400/50 rounded-2xl p-6 text-center shadow-xl relative overflow-hidden group hover:border-amber-400 transition flex flex-col justify-between">
            <div>
              <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl shadow-xs">
                ২০২৬ শিক্ষাবর্ষ
              </div>
              <div className="text-amber-300 font-extrabold text-xs mb-1.5 font-mono">২০২৬ সেশনের ভর্তি চলছে</div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                নূরানী থেকে মাদানী নেসাব ২য় বর্ষ
              </h3>
              <div className="mt-3.5 inline-block bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-bold px-3.5 py-1 rounded-full">
                আবাসিক / অনাবাসিক
              </div>
            </div>
            <div className="mt-5">
              <button
                onClick={() => setActivePublicTab('admission')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 shadow-lg cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" /> অনলাইন ভর্তি আবেদন <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Notice Box */}
          <div className="bg-emerald-900/60 backdrop-blur-md border-2 border-amber-400/50 rounded-2xl p-6 text-center shadow-xl relative overflow-hidden group hover:border-amber-400 transition flex flex-col justify-between">
            <div>
              <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl shadow-xs">
                ২০২৬ শিক্ষাবর্ষ
              </div>
              <div className="text-amber-300 font-extrabold text-xs mb-1.5 font-mono">২০২৬ সেশনের ভর্তি চলছে</div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                হিফজ ফারেগ ছাত্রদের মাদানী নেসাব ১ম বর্ষ
              </h3>
              <div className="mt-3.5 inline-block bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-bold px-3.5 py-1 rounded-full">
                আবাসিক / অনাবাসিক
              </div>
            </div>
            <div className="mt-5">
              <button
                onClick={() => setActivePublicTab('admission')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 shadow-lg cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" /> অনলাইন ভর্তি আবেদন <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed 8 Years Plan & Classes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-amber-400/30">
          {/* Left: 8 Years Plan */}
          <div className="bg-emerald-900/40 backdrop-blur-md p-6 rounded-2xl border border-amber-400/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
              <h3 className="text-base font-extrabold text-amber-300 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                ৮ বছরের পরিকল্পনা (মাদানী নেসাব + সাধারণ শিক্ষা)
              </h3>
              <span className="text-[11px] bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-md">
                ২০২৬ কারিকুলাম
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { year: '১ম বছর', title: 'মাদানী নেসাব ১ম বর্ষ' },
                { year: '২য় বছর', title: 'PSC (সরকারি বোর্ড পরীক্ষা)' },
                { year: '৩য় বছর', title: 'মাদানী নেসাব ২য় বর্ষ' },
                { year: '৪র্থ বছর', title: 'মাদানী নেসাব ৩য় বর্ষ' },
                { year: '৫ম বছর', title: 'সানাবিয়া উলিয়া (সরহেবেকায়া)' },
                { year: '৬ষ্ঠ বছর', title: 'SSC (সরকারি বোর্ড পরীক্ষা)' },
                { year: '৭ম বছর', title: 'ফাজিলত (মেশকাত)' },
                { year: '৮ম বছর', title: 'তাকমিল (দাওরায়ে হাদিস) ও HSC' },
              ].map((item, idx) => (
                <div key={idx} className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 font-mono shadow-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-amber-200 font-bold">{item.title}</div>
                    <div className="text-[10px] text-emerald-300/80 font-mono">{item.year}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-amber-200/90 pt-2 border-t border-amber-400/20 italic flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>বিঃদ্রঃ হিফজ বিভাগের ছাত্রদের জন্য হিফজের পাশাপাশি জেনারেল শিক্ষার বিশেষ সুযোগ রয়েছে।</span>
            </div>
          </div>

          {/* Right: Class Categories & Features */}
          <div className="bg-emerald-900/40 backdrop-blur-md p-6 rounded-2xl border border-amber-400/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
              <h3 className="text-base font-extrabold text-amber-300 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                ২০২৬ সেশনের শ্রেণি সমূহ
              </h3>
              <span className="text-[11px] bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-md">
                ভর্তি চলছে
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { num: '১', name: 'আদর্শ নূরানী / মাদানী নূরানী বিভাগ' },
                { num: '২', name: 'আদর্শ নাজেরা / রহমানী নাজেরা বিভাগ' },
                { num: '৩', name: 'হিফজুল কুরআন ও হিফজ রিভিশন' },
                { num: '৪', name: 'ই\'দাদী জামাত, মাদানী নেসাব ১য় ও ২য় বর্ষ' },
              ].map((cls, idx) => (
                <div key={idx} className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-800/60 flex items-center gap-3.5">
                  <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-xs font-mono">
                    {cls.num}
                  </span>
                  <span className="font-extrabold text-white text-sm">{cls.name}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-400/20 p-3.5 rounded-xl border border-amber-400/40 text-xs text-amber-200 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>৫ বছরের বাচ্চার জন্য রয়েছে আদর্শ নূরানী বিভাগে বিশেষ সুযোগ ও আধুনিক পরিচর্যা ব্যবস্থা।</span>
            </div>
          </div>
        </div>

        {/* Refined Ultra-Modern Footer Design */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 p-5 rounded-2xl border-2 border-amber-400/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-100 font-medium">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-300">প্রধান ক্যাম্পাস ও ঠিকানা</div>
              <div>{madrasaInfo.address} (ভৈরবপুর উত্তর, ভৈরব, কিশোরগঞ্জ)</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:01723233886"
              className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg cursor-pointer transform hover:scale-105"
            >
              <Phone className="w-4 h-4" /> 01723-233886, 01861-446626
            </a>
            <button
              onClick={() => setActivePublicTab('contact')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition border border-white/25 cursor-pointer shadow"
            >
              যোগাযোগ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
