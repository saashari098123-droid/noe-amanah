import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { PrayerWidget } from '../common/PrayerWidget';
import {
  BookOpen,
  Award,
  Users,
  GraduationCap,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bell,
  Play,
  Image as ImageIcon,
  ChevronRight,
  Send,
  Quote,
  Clock,
  MapPin,
  Trophy,
  Star,
  Check,
} from 'lucide-react';
import { getHijriDateString, formatDualDate, toBnDigits, toArDigits } from '../../utils/hijriDate';

interface PublicHomeProps {
  onOpenLogin: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onOpenLogin }) => {
  const {
    madrasaInfo,
    students,
    teachers,
    classes,
    notices,
    mediaEvents,
    routines,
    setActivePublicTab,
    sendComplaint,
    getTopStudentsByClass,
    language,
    t,
  } = useMadrasa();

  // Selected class filter for the Home Class Routine viewer
  const [selectedRoutineClassId, setSelectedRoutineClassId] = useState<string>(classes[0]?.id || 'cls-madani-1');

  // Quick feedback / complaint state
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackPhone, setFeedbackPhone] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const topStudentsList = getTopStudentsByClass();

  const filteredRoutines = routines.filter((r) => r.classId === selectedRoutineClassId);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendComplaint({
      senderRole: 'guardian',
      senderId: 'public-guest',
      senderName: `${feedbackName} (ফোন: ${feedbackPhone})`,
      recipientType: 'admin',
      recipientName: 'মুহতামিম / প্রশাসন দফতর',
      category: 'suggestion',
      categoryLabel: 'পাবলিক মতামত ও পরামর্শ',
      subject: 'ওয়েবসাইট থেকে আগত সাধারণ পরামর্শ',
      message: feedbackMessage,
    });
    setFeedbackSuccess(true);
    setFeedbackName('');
    setFeedbackPhone('');
    setFeedbackMessage('');
    setTimeout(() => setFeedbackSuccess(false), 5000);
  };

  return (
    <div className="space-y-12 pb-16 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 transition-colors duration-500 shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-700/80 px-3.5 py-1.5 rounded-full text-xs font-medium text-amber-300 shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {madrasaInfo.nameBangla} • স্থাপিত {madrasaInfo.establishedYear} খ্রি.
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              কুরআন-সুন্নাহর আলোয় <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                আদর্শ ও চরিত্রবান প্রজন্ম
              </span>{' '}
              গড়ার বিশ্বস্ত প্রতিষ্ঠান
            </h1>

            <p className="text-sm sm:text-base opacity-90 max-w-2xl leading-relaxed text-emerald-100">
              আন্তর্জাতিক মানসম্পন্ন হিফজুল কুরআন, কিতাব বিভাগ (দাওরায়ে হাদিস পর্যন্ত) ও সমকালীন সাধারণ শিক্ষার সমন্বয়। আপনার সন্তানের নৈতিক ও ইহকালীন-পরকালীন সাফল্যের ঠিকানা।
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="hero-admission-btn"
                onClick={() => setActivePublicTab('admission')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition transform hover:-translate-y-0.5 shadow-md cursor-pointer"
              >
                <GraduationCap className="w-5 h-5" />
                অনলাইন ভর্তি আবেদন করুন
              </button>

              <button
                id="hero-result-btn"
                onClick={() => setActivePublicTab('results')}
                className="bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 border border-white/20 transition cursor-pointer"
              >
                <Award className="w-5 h-5 text-amber-400" />
                পরীক্ষার রেজাল্ট দেখুন
              </button>
            </div>

            {/* Highlights Bar */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-white/20">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 text-center">
                <div className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                  {language === 'ar'
                    ? `${toArDigits(students.length)}+`
                    : language === 'en'
                    ? `${students.length}+`
                    : `${toBnDigits(students.length)}+`}
                </div>
                <div className="text-[11px] opacity-80">
                  {language === 'ar' ? 'إجمالي الطلاب' : language === 'en' ? 'Total Students' : 'মোট শিক্ষার্থী'}
                </div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 text-center">
                <div className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                  {language === 'ar'
                    ? `${toArDigits(teachers.length)}+`
                    : language === 'en'
                    ? `${teachers.length}+`
                    : `${toBnDigits(teachers.length)}+`}
                </div>
                <div className="text-[11px] opacity-80">
                  {language === 'ar' ? 'الأساتذة والمحدثون' : language === 'en' ? 'Teachers & Scholars' : 'অভিজ্ঞ মুহাদ্দিস ও শিক্ষক'}
                </div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 text-center">
                <div className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                  {language === 'ar' ? '١٠٠٪' : language === 'en' ? '100%' : '১০০%'}
                </div>
                <div className="text-[11px] opacity-80">
                  {language === 'ar' ? 'نسبة نجاح الامتحانات' : language === 'en' ? 'Exam Success Rate' : 'বোর্ড পরীক্ষার সাফল্য'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero: Campus & Muhtamim Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 group">
              <img
                src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80"
                alt="মাদরাসা ক্যাম্পাস"
                className="w-full h-64 sm:h-72 object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs text-amber-300 font-semibold font-['Amiri']">مدرسة الأمانة الإسلامية</span>
                <h3 className="text-lg font-bold text-white">দারুল আমানাহ ক্যাম্পাস</h3>
                <p className="text-xs text-slate-300">নিরিবিলি ও মনোরম পরিবেশে দ্বীনি ও আধুনিক শিক্ষার শান্তিময় পরিবেশ।</p>
              </div>
            </div>

            {/* Muhtamim Quote Box */}
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 shadow-lg relative">
              <Quote className="w-8 h-8 text-amber-400/20 absolute right-4 top-4" />
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={madrasaInfo.principalPhotoUrl}
                  alt={madrasaInfo.principalName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-amber-400"
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{madrasaInfo.principalName}</h4>
                  <p className="text-[11px] text-amber-300">{madrasaInfo.principalDesignation}</p>
                </div>
              </div>
              <p className="text-xs text-white/90 italic leading-relaxed line-clamp-3">
                "{madrasaInfo.principalMessage}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Top Scoring Students per Class (Deeply Calculated from Exam Results) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <Trophy className="w-4 h-4 text-amber-500" />
                {t('topAchieversTitle')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                সর্বোচ্চ নম্বর পেয়ে উত্তীর্ণ কৃতী শিক্ষার্থীদের তালিকা
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('topAchieversSubtitle')}
              </p>
            </div>

            <button
              onClick={() => setActivePublicTab('results')}
              className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              সম্পূর্ণ মেধা তালিকা ও রেজাল্ট দেখুন <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {topStudentsList.map((rank, index) => (
              <div
                key={rank.studentId}
                className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-850 p-5 rounded-2xl border-2 border-amber-400/40 dark:border-amber-500/30 shadow-md hover:shadow-xl transition flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Ribbon Rank Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  ক্লাসে ১ম স্থান
                </div>

                <div>
                  <div className="flex items-center gap-3.5 mb-3.5 mt-2">
                    <img
                      src={
                        rank.photoUrl ||
                        rank.avatar ||
                        'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={rank.studentName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80';
                      }}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-xs group-hover:scale-105 transition shrink-0 bg-slate-100"
                    />
                    <div className="overflow-hidden">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {rank.studentName}
                      </h3>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        আইডি: {rank.studentId} • রোল: {rank.roll}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate mt-0.5">
                        {rank.className}
                      </div>
                    </div>
                  </div>

                  {/* Marks & Achievement Card */}
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200/70 dark:border-amber-800/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">মোট প্রাপ্ত নম্বর:</span>
                      <span className="font-bold text-slate-900 dark:text-amber-300 font-mono">
                        {rank.totalMarksObtained} / {rank.totalMarksPossible}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">প্রাপ্ত শতকরা হার:</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                        {rank.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200/50 dark:border-amber-800/30">
                      <span className="text-slate-600 dark:text-slate-300">গ্রেড ও কৃতিত্ব:</span>
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md font-['Amiri']">
                        {rank.overallArabicGrade}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
                  <span>মূল্যায়ন: {rank.examName}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> উত্তীর্ণ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Class Routine Timetable Schedule Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {t('classRoutineTitle')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                দৈনিক ক্লাস ও ঘণ্টা ভিত্তিক সময়সূচি
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                প্রতিটি জামাতের সুবিন্যস্ত ঘণ্টাভিত্তিক রুটিন, নির্ধারিত কিতাব ও দায়িত্বপ্রাপ্ত উস্তাদগণের তালিকা
              </p>
            </div>

            {/* Class Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">জামাত নির্বাচন:</span>
              <select
                value={selectedRoutineClassId}
                onChange={(e) => setSelectedRoutineClassId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameBangla || c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Routine Table Grid */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-emerald-900 text-white text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">ঘণ্টা / পিরিয়ড</th>
                  <th className="py-3 px-4">সময়সূচি</th>
                  <th className="py-3 px-4">বিষয় / কিতাবের নাম</th>
                  <th className="py-3 px-4">দায়িত্বপ্রাপ্ত উস্তাদ</th>
                  <th className="py-3 px-4 text-center">কক্ষ নম্বর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-850">
                {filteredRoutines.length > 0 ? (
                  filteredRoutines.map((item) => (
                    <tr key={item.id} className="hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
                          {item.periodNumber}
                        </span>
                        <span>{item.periodName}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {item.startTime} - {item.endTime}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-800 dark:text-emerald-300">
                        {item.subjectName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {item.teacherName}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1 rounded-md font-mono">
                          {item.roomNo || '১০১'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      এই জামাতের জন্য নির্ধারিত রুটিন লোড হচ্ছে...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. Prayer Times Clean Widget Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <PrayerWidget />
      </section>

      {/* 5. Notice Board */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-600" />
              নোটিশ ও হালনাগাদ তথ্য
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              প্রতিষ্ঠানের সাম্প্রতিক নোটিশ বোর্ড
            </h2>
          </div>
          <button
            onClick={() => setActivePublicTab('notices')}
            className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-2 md:mt-0 cursor-pointer"
          >
            সকল নোটিশ দেখুন ({notices.length}) <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.slice(0, 4).map((notice) => (
            <div
              key={notice.id}
              onClick={() => setActivePublicTab('notices')}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md border border-slate-200 dark:border-slate-700 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      notice.isUrgent
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200'
                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                    }`}
                  >
                    {notice.categoryLabel}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {notice.publishDate}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition text-base line-clamp-2">
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {notice.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
                <span>প্রচারক: {notice.publishedBy}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  সম্পূর্ণ পড়ুন <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Academic Departments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200">
            আমাদের শিক্ষা বিভাগসমূহ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            আধুনিক ও দ্বীনি শিক্ষার সুবিন্যস্ত কারিকুলাম
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            নূরানী থেকে দাওরায়ে হাদিস পর্যন্ত যুগোপযোগী ও খাঁটি ইসলামী শিক্ষা ব্যবস্থা
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Hifz */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg border border-slate-200 dark:border-slate-700 transition group flex flex-col justify-between">
            <div>
              <div className="h-40 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&auto=format&fit=crop&q=80"
                  alt="হিফজুল কুরআন"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                  আন্তর্জাতিক তাহফীজ
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  হিফজুল কুরআন বিভাগ
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  আন্তর্জাতিক সনদপ্রাপ্ত হাফেজ ও ক্বারীদের নিবিড় তত্ত্বাবধানে সহিহ তাজবীদ ও সুমধুর সুরে হিফজ সমাপন।
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>দৈনিক সবক, সবকপাড়া ও দৌর মনিটরিং</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>হিফজের পাশাপাশি বাংলা ও সাধারণ গণিত</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={() => setActivePublicTab('admission')}
                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-800 dark:text-slate-200 font-semibold py-2 rounded-xl text-xs transition text-center cursor-pointer"
              >
                হিফজে ভর্তি তথ্য দেখুন
              </button>
            </div>
          </div>

          {/* Card 2: Kitab */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg border border-slate-200 dark:border-slate-700 transition group flex flex-col justify-between">
            <div>
              <div className="h-40 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80"
                  alt="কিতাব বিভাগ"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 text-blue-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                  দাওরায়ে হাদিস পর্যন্ত
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  কিতাব ও হাদিস বিভাগ
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  মিজান-নাহবেমীর থেকে শুরু করে মিশকাত ও দাওরায়ে হাদিস পর্যন্ত সুবিশাল কিতাবী তা'লীম।
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>আরবি ব্যাকরণ ও সাহিত্যের গভীর বিশ্লেষণ</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>সিহাহ সিত্তাহর বিশুদ্ধ হাদিস শাস্ত্র</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={() => setActivePublicTab('departments')}
                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-800 dark:text-slate-200 font-semibold py-2 rounded-xl text-xs transition text-center cursor-pointer"
              >
                সিলেবাস ও জামাতসমূহ
              </button>
            </div>
          </div>

          {/* Card 3: Noorani */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg border border-slate-200 dark:border-slate-700 transition group flex flex-col justify-between">
            <div>
              <div className="h-40 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80"
                  alt="নূরানী বিভাগ"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-amber-900/90 text-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                  শিশু শিক্ষা
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  নূরানী ও নাজেরা বিভাগ
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  ছোট শিশুদের জন্য অত্যন্ত সহজ ও আনন্দময় পদ্ধতিতে কুরআন তিলাওয়াত, মাসনূন দোয়া ও বর্ণমালা শিক্ষা।
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>শুদ্ধ মাখরাজ ও তাজবীদ শিক্ষা</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>বাংলা, ইংরেজি ও গণিতের মজবুত বুনিয়াদ</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={() => setActivePublicTab('admission')}
                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-800 dark:text-slate-200 font-semibold py-2 rounded-xl text-xs transition text-center cursor-pointer"
              >
                নূরানী ভর্তি আবেদন
              </button>
            </div>
          </div>

          {/* Card 4: General & ICT */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg border border-slate-200 dark:border-slate-700 transition group flex flex-col justify-between">
            <div>
              <div className="h-40 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
                  alt="কম্পিউটার ও গবেষণা"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-purple-900/90 text-purple-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                  আইসিটি ও ভাষা
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  কম্পিউটার ও আইসিটি ল্যাব
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  প্রতিষ্ঠানের শিক্ষার্থীদের আধুনিক প্রযুক্তিতে দক্ষ করতে সুসজ্জিত কম্পিউটার ল্যাব ও ইংরেজি ভাষা প্রশিক্ষণ।
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কম্পিউটার অফিস অ্যাপ্লিকেশন ও টাইপিং</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>স্পোকেন অ্যারাবিক ও ইংলিশ ক্লাব</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={() => setActivePublicTab('departments')}
                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-800 dark:text-slate-200 font-semibold py-2 rounded-xl text-xs transition text-center cursor-pointer"
              >
                সুবিধাসমূহ জানুন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Events & Gallery */}
      <section className="bg-slate-100 dark:bg-slate-950 py-12 px-4 sm:px-6 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200">
                অনুষ্ঠানের ছবি ও ভিডিও
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                প্রতিষ্ঠানের কার্যক্রম ও স্মরণীয় মুহূর্তসমূহ
              </h2>
            </div>
            <button
              onClick={() => setActivePublicTab('gallery')}
              className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-2 md:mt-0 cursor-pointer"
            >
              সম্পূর্ণ গ্যালারি দেখুন <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mediaEvents.map((media) => (
              <div
                key={media.id}
                onClick={() => setActivePublicTab('gallery')}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition cursor-pointer group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={media.thumbnailUrl}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                  {media.type === 'video' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      ছবি
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                    {media.date}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 transition line-clamp-1">
                    {media.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{media.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Public Suggestion / Complaint Quick Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-xs font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200">
              অভিযোগ ও পরামর্শ বক্স
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              প্রতিষ্ঠান পরিচালনা ও উন্নয়নে আপনার মতামত আমাদের জানান
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              যেকোনো গঠনমূলক পরামর্শ বা অভিযোগ সরাসরি প্রধান প্রশাসন দফতরে পৌঁছে যাবে।
            </p>
          </div>

          {feedbackSuccess ? (
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl text-center text-sm font-medium">
              ✅ আপনার মূল্যবান পরামর্শ সফলভাবে জমা হয়েছে। জাযাকুমুল্লাহু খাইরান।
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    placeholder="উদাঃ মোঃ আব্দুল করিম"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={feedbackPhone}
                    onChange={(e) => setFeedbackPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  আপনার মতামত / পরামর্শ / অভিযোগ *
                </label>
                <textarea
                  required
                  rows={3}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="আপনার সুনির্দিষ্ট বক্তব্য বিস্তারিত লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="text-center pt-2">
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  মতামত পাঠান
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
