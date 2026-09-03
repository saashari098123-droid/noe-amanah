import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  BookOpen,
  Award,
  ShieldCheck,
  CheckCircle2,
  Users,
  Target,
  Heart,
  Calendar,
  Sparkles,
  UserCheck,
  Building2,
  Layers,
} from 'lucide-react';

export const PublicAbout: React.FC = () => {
  const { madrasaInfo, teachers } = useMadrasa();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-700/40 text-center relative overflow-hidden">
        <div className="font-arabic text-amber-300 text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-['Hind_Siliguri']">
          স্কুল এন্ড কলেজ পরিচিতি, ইতিহাস ও লক্ষ্য
        </h1>
        <p className="text-sm sm:text-base text-blue-200 mt-2 max-w-2xl mx-auto">
          {madrasaInfo.nameBangla} ({madrasaInfo.nameArabic}) — {madrasaInfo.mottoBangla}
        </p>
      </div>

      {/* 2. Principal Message Section */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-4 text-center">
          <div className="relative inline-block">
            <img
              src={madrasaInfo.principalPhotoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80'}
              alt={madrasaInfo.principalName}
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl object-cover border-4 border-blue-700 shadow-xl mx-auto bg-slate-100"
            />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
              {madrasaInfo.principalDesignation}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-5">{madrasaInfo.principalName}</h3>
          <p className="text-xs text-blue-800 font-semibold">{madrasaInfo.nameBangla}</p>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>মুহতামিমের বাণী</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            কুরআন-সুন্নাহর জ্ঞান ও প্রায়োগিক জীবনের অপূর্ব সমন্বয়
          </h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line bg-blue-50/40 p-5 rounded-2xl border border-blue-100">
            {madrasaInfo.principalMessage}
          </div>
        </div>
      </div>

      {/* 3. History & Madani Nisab Specialty */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
            আমাদের ইতিহাস ও পটভূমি
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Hind_Siliguri']">
            {madrasaInfo.establishedYear} সাল থেকে দ্বীনি শিক্ষার আলোকবর্তিকা
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {madrasaInfo.aboutHistory}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl">
              <div className="text-xl font-bold text-blue-800 font-mono">মাদানী নেসাব</div>
              <div className="text-xs text-slate-600">আধুনিক তামরীনভিত্তিক কারিকুলাম</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
              <div className="text-xl font-bold text-amber-800 font-mono">১০০% সহিহ তরবিয়ত</div>
              <div className="text-xs text-slate-600">আমল ও আখলাক চর্চা</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <img
              src={madrasaInfo.campusPhotoUrl || 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80'}
              alt="আমানত ক্যাম্পাস"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </div>

      {/* 4. Madani Nisab Feature Highlight */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-blue-800/50 space-y-6">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>মাদানী নেসাব শিক্ষা পদ্ধতির অনন্য বৈশিষ্ট্য</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-['Hind_Siliguri']">
          মুখস্থবিদ্যার বিকল্প: সরাসরি আরবি ভাষা ও কুরআন বুঝার পদ্ধতি
        </h2>
        <p className="text-sm text-blue-100 leading-relaxed whitespace-pre-line max-w-4xl">
          {madrasaInfo.aboutMadaniNisab}
        </p>
      </div>

      {/* 5. Aims and Core Objectives */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
            আমাদের লক্ষ্য ও উদ্দেশ্য
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2 font-['Hind_Siliguri']">
            কেন আমানত প্রতিষ্ঠানে ভর্তি হবেন?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center mb-4 shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">খাঁটি কুরআন ও সুন্নাহর অনুসারী</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              সালাফে সালেহীন ও আহলুস সুন্নাহ ওয়াল জামায়াতের মূলনীতি অনুযায়ী বিশুদ্ধ আকিদা ও আমলের সঠিক প্রশিক্ষণ দান।
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">আন্তর্জাতিক মানের হিফজ ও তাজবীদ</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              মিশর ও মদিনা মুনাওয়ারার তাহফীজুল কুরআন কারিকুলাম অনুসরণ করে মাখরাজ ও সিফাত সহকারে সুললিত তিলাওয়াত।
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center mb-4 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">নৈতিকতা ও সার্বিক তত্ত্বাবধান</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              শিক্ষার্থীদের অন্তরে তাকওয়া, পিতামাতা ও উস্তাদদের প্রতি শ্রদ্ধা, বিনয় ও সমাজসেবামূলক মানসিকতা বিকাশ।
            </p>
          </div>
        </div>
      </div>

      {/* 6. Faculty & Esteemed Teachers */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
            আমাদের শিক্ষকমণ্ডলী
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2 font-['Hind_Siliguri']">
            অভিজ্ঞ ও নিবেদিতপ্রাণ ওলামায়ে কেরাম
          </h2>
          <p className="text-xs text-slate-500 mt-1">দেশবরেণ্য প্রতিষ্ঠানের শীর্ষ সনদপ্রাপ্ত উস্তাদবৃন্দ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200 p-5 text-center transition flex flex-col justify-between"
            >
              <div>
                <img
                  src={teacher.photoUrl}
                  alt={teacher.nameBangla}
                  className="w-24 h-24 rounded-2xl mx-auto object-cover border-2 border-blue-600 mb-3 shadow-md bg-slate-100"
                />
                <h3 className="font-bold text-base text-slate-900">{teacher.nameBangla}</h3>
                <p className="text-xs text-amber-700 font-semibold">{teacher.designation}</p>
                <p className="text-[11px] text-slate-500 mt-1">{teacher.qualification}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-blue-800 font-medium">
                পাঠদান: {teacher.assignedSubjects.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
