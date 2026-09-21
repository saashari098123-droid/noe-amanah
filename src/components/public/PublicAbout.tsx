import React from 'react';
import { motion } from 'motion/react';
import { useMadrasa } from '../../context/MadrasaContext';
import { UserAvatar } from '../common/UserAvatar';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12 text-slate-900 dark:text-slate-100">
      {/* 1. Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-700/40 text-center relative overflow-hidden"
      >
        <div className="font-['Amiri'] text-amber-300 text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          মাদরাসা পরিচিতি, ইতিহাস ও লক্ষ্য
        </h1>
        <p className="text-sm sm:text-base text-emerald-200 mt-2 max-w-2xl mx-auto">
          {madrasaInfo.nameBangla} ({madrasaInfo.nameArabic}) — {madrasaInfo.mottoBangla}
        </p>
      </motion.div>

      {/* 2. Principal Message Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-700 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
      >
        <div className="lg:col-span-4 text-center">
          <div className="relative inline-block">
            <img
              src={madrasaInfo.principalPhotoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80'}
              alt={madrasaInfo.principalName}
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl object-cover border-4 border-emerald-600 shadow-xl mx-auto bg-slate-100 dark:bg-slate-700"
            />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
              {madrasaInfo.principalDesignation}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-5">{madrasaInfo.principalName}</h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{madrasaInfo.nameBangla}</p>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>মুহতামিমের বাণী</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            কুরআন-সুন্নাহর জ্ঞান ও প্রায়োগিক জীবনের অপূর্ব সমন্বয়
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 whitespace-pre-line bg-emerald-50/50 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
            {madrasaInfo.principalMessage}
          </div>
        </div>
      </motion.div>

      {/* 3. History & Specialty */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            আমাদের ইতিহাস ও পটভূমি
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {madrasaInfo.establishedYear} সাল থেকে দ্বীনি শিক্ষার আলোকবর্তিকা
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {madrasaInfo.aboutHistory}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-2xl">
              <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300 font-mono">মাদানী নেসাব</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">আধুনিক তামরীনভিত্তিক কারিকুলাম</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3.5 rounded-2xl">
              <div className="text-xl font-bold text-amber-800 dark:text-amber-300 font-mono">১০০% সহিহ তরবিয়ত</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">আমল ও আখলাক চর্চা</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-700"
          >
            <img
              src={madrasaInfo.campusPhotoUrl || 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80'}
              alt="ক্যাম্পাস"
              className="w-full h-80 object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* 4. Madani Nisab Feature Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-800/50 space-y-4"
      >
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>শিক্ষা পদ্ধতির অনন্য বৈশিষ্ট্য</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          সরাসরি আরবি ভাষা ও কুরআন বুঝার আধুনিক পদ্ধতি
        </h2>
        <p className="text-sm text-emerald-100 leading-relaxed whitespace-pre-line max-w-4xl">
          {madrasaInfo.aboutMadaniNisab}
        </p>
      </motion.div>

      {/* 5. Aims and Core Objectives */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            আমাদের লক্ষ্য ও উদ্দেশ্য
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            কেন আমাদের প্রতিষ্ঠানে ভর্তি হবেন?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-4 shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">খাঁটি কুরআন ও সুন্নাহর অনুসারী</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              সালাফে সালেহীন ও আহলুস সুন্নাহ ওয়াল জামায়াতের মূলনীতি অনুযায়ী বিশুদ্ধ আকিদা ও আমলের সঠিক প্রশিক্ষণ।
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">আন্তর্জাতিক মানের হিফজ ও তাজবীদ</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              মিশর ও মদিনা মুনাওয়ারার তাহফীজুল কুরআন কারিকুলাম অনুসরণ করে সহিহ মাখরাজ ও সিফাত সহকারে সুললিত তিলাওয়াত।
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center mb-4 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">নৈতিকতা ও সার্বিক তত্ত্বাবধান</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              শিক্ষার্থীদের অন্তরে তাকওয়া, পিতামাতা ও উস্তাদদের প্রতি শ্রদ্ধা, বিনয় ও সমাজসেবামূলক মানসিকতা বিকাশ।
            </p>
          </motion.div>
        </div>
      </div>

      {/* 6. Faculty & Esteemed Teachers */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            আমাদের শিক্ষকমণ্ডলী
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            অভিজ্ঞ ও নিবেদিতপ্রাণ ওলামায়ে কেরাম
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">দেশবরেণ্য প্রতিষ্ঠানের শীর্ষ সনদপ্রাপ্ত উস্তাদবৃন্দ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg border border-slate-200 dark:border-slate-700 p-5 text-center transition flex flex-col justify-between"
            >
              <div>
                <UserAvatar
                  src={teacher.photoUrl}
                  alt={teacher.nameBangla}
                  type="teacher"
                  className="w-24 h-24 rounded-2xl mx-auto object-cover border-2 border-emerald-600 mb-3 shadow-md"
                />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{teacher.nameBangla}</h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{teacher.designation}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{teacher.qualification}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                পাঠদান: {teacher.assignedSubjects.join(', ')}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
