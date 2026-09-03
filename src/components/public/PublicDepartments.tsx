import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  Users,
  GraduationCap,
  Layers,
  BookMarked,
  DollarSign,
} from 'lucide-react';

export const PublicDepartments: React.FC = () => {
  const { classes, setActivePublicTab } = useMadrasa();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const deptList = [
    {
      id: 'madani_nisab',
      name: 'মাদানী নেসাব বিভাগ (আধুনিক আরবি ভাষা ও কিতাব কারিকুলাম)',
      desc: 'মুখস্থবিদ্যার পরিবর্তে প্রায়োগিক তামরীন, সরাসরি আরবি কথোপকথন ও কুরআন বুঝার যুগান্তকারী শিক্ষা পদ্ধতি।',
      features: [
        '১ম বছর থেকেই সরাসরি আরবিতে ভাববিনিময় ও লেখালেখির সক্ষমতা অর্জন',
        'এসো আরবি শিখি, আদাবুল মুআশারাত ও তামরীনভিত্তিক কিতাবমালা',
        'নাহু-সরফের ব্যাকরণ মুখস্থের চেয়ে বাক্যে প্রয়োগে সর্বাধিক গুরুত্ব',
        'উচ্চতর তাফসির, হাদিস ও ফিকাহ শাস্ত্রের সহজ-সরল উপস্থাপনা',
        'মাদানী নেসাবের বিশেষ প্রশিক্ষণপ্রাপ্ত দক্ষ উস্তাদদের সার্বক্ষণিক সান্নিধ্য',
      ],
      feeInfo: 'মাসিক বেতন: ৪০০০/- (আবাসিক খাবার ও হোস্টেল সুবিধা অন্তর্ভুক্ত)',
      img: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'hifz',
      name: 'হিফজুল কুরআন বিভাগ (আন্তর্জাতিক তাহফীজ)',
      desc: 'পবিত্র কুরআন মুখস্থ করার জন্য একটি অনন্য ও আদর্শ পরিবেশ। আন্তর্জাতিক সনদপ্রাপ্ত হাফেজ ও ক্বারীদের সার্বক্ষণিক তত্ত্বাবধানে পরিচালিত।',
      features: [
        'দৈনিক নতুন সবক, সবকপাড়া ও পূর্বের পারা মুখস্থ পুনরাবৃত্তি (দৌর)',
        'শুদ্ধ মাখরাজ, তাজবীদ ও সুললিত সুরের বিশেষ তালিম',
        'হিফজের পাশাপাশি প্রয়োজনীয় বাংলা, ইংরেজি ও প্রাথমিক গণিত',
        'জাতীয় ও আন্তর্জাতিক হিফজ প্রতিযোগিতার জন্য বিশেষ প্রস্তুতি',
        '৩ বছর মেয়াদী নিয়মিত এবং মেধাবীদের জন্য ২ বছর মেয়াদী বিশেষ কোর্স',
      ],
      feeInfo: 'মাসিক ফি: ৩৫০০/- (আবাসিক খাবার ও হোস্টেল সুবিধা অন্তর্ভুক্ত)',
      img: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'kitab',
      name: 'দাওরায়ে হাদিস ও উচ্চতর কিতাব বিভাগ',
      desc: 'উচ্চতর ইসলামিক শিক্ষা অনুষদ। সিহাহ সিত্তাহ হাদিসগ্রন্থের পূর্ণাঙ্গ পাঠ ও সনদ প্রদান (মাস্টার্স সমমান)।',
      features: [
        'সিহাহ সিত্তাহসহ প্রধান প্রধান হাদিস গ্রন্থের পাঠ ও গভীর গবেষণা',
        'ফিকহ ও উসুলুল ফিকহের আলোকে আধুনিক জীবনের নিত্যনতুন সমস্যার সমাধান',
        'আরবি বক্তৃতা ও লেখালেখির সাপ্তাহিক সাহিত্য মজলিস',
        'কওমি মাদরাসা শিক্ষা বোর্ড (বেফাকুল মাদারিসিল আরাবিয়া) অনুমোদিত',
      ],
      feeInfo: 'মাসিক ফি: ৪৫০০/- (আবাসিক)',
      img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center border border-blue-700/40">
        <span className="text-xs text-amber-300 font-bold uppercase tracking-widest bg-blue-800/80 px-3 py-1 rounded-full">
          শিক্ষা কার্যক্রম ও কারিকুলাম
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-3">
          প্রতিষ্ঠানের শিক্ষা বিভাগ ও জামাতসমূহ
        </h1>
        <p className="text-sm sm:text-base text-blue-200 mt-2 max-w-2xl mx-auto">
          মাদানী নেসাব ও কুরআন-হাদিসের সমন্বয়ে গঠিত আদর্শ দ্বীনি সিলেবাস ও কিতাব তালিকা
        </p>
      </div>

      {/* Dynamic Jamat & Kitab Syllabus Explorer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
              <BookMarked className="w-4 h-4" />
              <span>শ্রেণি ও কিতাব তালিকা (সিলেবাস)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">জামাতভিত্তিক পাঠ্যসূচী ও কিতাবসমূহ</h2>
          </div>

          <button
            onClick={() => setActivePublicTab('admission')}
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            ভর্তি আবেদন করুন
          </button>
        </div>

        {/* Jamat Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {classes.map((cls) => {
            const isSelected = cls.id === (activeClass?.id || '');
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-800 text-white border-blue-900 shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{cls.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-blue-950 text-blue-200' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {cls.kitabs?.length || 0} কিতাব
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Jamat Details & Kitabs */}
        {activeClass && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
              <div>
                <span className="bg-blue-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {activeClass.departmentLabel || activeClass.department}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{activeClass.name}</h3>
                {activeClass.arabicName && (
                  <p className="text-sm font-arabic text-blue-800 font-semibold">{activeClass.arabicName}</p>
                )}
                <p className="text-xs font-mono text-slate-500 mt-0.5">কোড: {activeClass.code}</p>
              </div>

              {activeClass.description && (
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {activeClass.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200/60 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">মাসিক বেতন</span>
                  <span className="text-sm font-extrabold text-blue-900">৳{activeClass.monthlyFee}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">ভর্তি ফি</span>
                  <span className="text-sm font-extrabold text-slate-900">৳{activeClass.admissionFee || 3000}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700" />
                নির্ধারিত কিতাব ও বিষয়সমূহ:
              </h4>

              {activeClass.kitabs && activeClass.kitabs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeClass.kitabs.map((k, idx) => (
                    <div
                      key={k.id || idx}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 hover:bg-blue-50/40 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{k.name}</h5>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold shrink-0">
                          {k.subjectTypeLabel || k.subjectType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>পূর্ণমান: <strong>{k.fullMarks}</strong></span>
                        <span>পাস: <strong className="text-blue-700">{k.passMarks}</strong></span>
                        {k.assignedTeacherName && (
                          <span className="text-blue-800">উস্তাদ: {k.assignedTeacherName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  এই জামাতের কিতাব তালিকা আপডেট করা হচ্ছে।
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Department Cards */}
      <div className="space-y-10">
        {deptList.map((dept, idx) => (
          <div
            key={dept.id}
            className={`bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 grid grid-cols-1 lg:grid-cols-12 ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            <div className={`lg:col-span-5 relative ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <img
                src={dept.img}
                alt={dept.name}
                className="w-full h-64 sm:h-80 lg:h-full object-cover"
              />
            </div>

            <div className={`lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
                  অনুষদ #{idx + 1}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  {dept.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {dept.desc}
                </p>

                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    প্রধান বৈশিষ্ট্য ও পাঠদান পদ্ধতি:
                  </h4>
                  <ul className="space-y-2">
                    {dept.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200">
                  {dept.feeInfo}
                </div>
                <button
                  onClick={() => setActivePublicTab('admission')}
                  className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  ভর্তি আবেদন করুন
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
