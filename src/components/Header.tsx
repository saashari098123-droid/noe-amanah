import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMadrasa } from '../context/MadrasaContext';
import { CloudSyncModal } from './common/CloudSyncModal';
import {
  BookOpen,
  GraduationCap,
  Menu,
  X,
  UserCheck,
  Award,
  Sparkles,
  Settings,
  LogOut,
  LayoutDashboard,
  Moon,
  Sun,
  Globe,
  MessageSquarePlus,
  Calendar,
  Clock,
  Cloud,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';
import { getHijriDateString, formatDualDate } from '../utils/hijriDate';
import { Language } from '../types';

interface HeaderProps {
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const {
    madrasaInfo,
    activePublicTab,
    setActivePublicTab,
    currentRole,
    logout,
    activeAdminTab,
    setActiveAdminTab,
    setActiveTeacherTab,
    setActiveStudentTab,
    language,
    setLanguage,
    themeMode,
    toggleThemeMode,
    setIsComplaintsModalOpen,
    cloudSyncStatus,
    t,
  } = useMadrasa();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isTopToolsOpen, setIsTopToolsOpen] = useState(false);

  const todayGregorian = new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const todayHijri = getHijriDateString(new Date());

  const navItems = [
    { id: 'home', labelBn: 'মূল পাতা', labelEn: 'Home', labelAr: 'الرئيسية' },
    { id: 'about', labelBn: 'পরিচিতি ও ইতিহাস', labelEn: 'About', labelAr: 'عن المؤسسة' },
    { id: 'departments', labelBn: 'শিক্ষা বিভাগসমূহ', labelEn: 'Departments', labelAr: 'الأقسام' },
    { id: 'admission', labelBn: 'অনলাইন ভর্তি', labelEn: 'Admission', labelAr: 'القبول والتসجيل' },
    { id: 'notices', labelBn: 'নোটিশ বোর্ড', labelEn: 'Notices', labelAr: 'الإعلانات' },
    { id: 'gallery', labelBn: 'ছবি ও ভিডিও', labelEn: 'Gallery', labelAr: 'الصور' },
    { id: 'results', labelBn: 'ফলাফল অনুসন্ধান', labelEn: 'Results', labelAr: 'النتائج' },
    { id: 'contact', labelBn: 'যোগাযোগ ও মতামত', labelEn: 'Contact', labelAr: 'اتصل بنا' },
  ];

  return (
    <header id="main-madrasa-header" className="relative z-40">
      {/* 0. Top Scrolling Announcement & Date Bar (Scrolls away with page to save screen space) */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-900/60 transition">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Dual Date Display (Hijri + Gregorian) */}
          <div className="flex items-center gap-2.5 text-[11px] sm:text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium text-amber-300">{todayHijri}</span>
            <span className="text-emerald-400">|</span>
            <span className="text-emerald-200">{todayGregorian}</span>
          </div>

          {/* Three-Dot Menu for Utility Buttons (Cloud, Language, Theme, Complaints) */}
          <div className="relative">
            <button
              id="header-top-tools-btn"
              onClick={() => setIsTopToolsOpen((prev) => !prev)}
              className="flex items-center gap-1.5 bg-emerald-900/90 hover:bg-emerald-800 text-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-700/80 text-[11px] font-medium transition cursor-pointer shadow-xs active:scale-95"
              title="মেনু, ভাষা ও সেটিংস"
            >
              <span className={`w-2 h-2 rounded-full ${cloudSyncStatus === 'synced' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              <span className="hidden sm:inline">টুলস ও সেটিংস</span>
              <MoreVertical className="w-3.5 h-3.5 text-amber-300" />
            </button>

            {/* Dropdown Menu with Animation */}
            <AnimatePresence>
              {isTopToolsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTopToolsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-1.5 w-64 bg-slate-900 text-slate-100 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 space-y-2.5 text-xs"
                  >
                    {/* 1. Cloud Sync Status & Action */}
                    <div className="pb-2 border-b border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                        ক্লাউড ডাটাবেস
                      </div>
                      <button
                        onClick={() => {
                          setIsCloudSyncModalOpen(true);
                          setIsTopToolsOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Cloud className={`w-4 h-4 ${
                            cloudSyncStatus === 'synced' ? 'text-emerald-400' :
                            cloudSyncStatus === 'syncing' ? 'text-amber-400 animate-spin' :
                            cloudSyncStatus === 'error' ? 'text-rose-400' : 'text-slate-400'
                          }`} />
                          <span className="font-medium text-slate-200">
                            {cloudSyncStatus === 'synced'
                              ? 'ক্লাউড সিঙ্কড'
                              : cloudSyncStatus === 'syncing'
                              ? 'সিঙ্ক হচ্ছে...'
                              : cloudSyncStatus === 'error'
                              ? 'সিঙ্ক ত্রুটি'
                              : 'অফলাইন মোড'}
                          </span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                          ক্লিক করুন
                        </span>
                      </button>
                    </div>

                    {/* 2. Language Selector */}
                    <div className="pb-2 border-b border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                        ভাষা নির্বাচন (Language)
                      </div>
                      <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                        <button
                          onClick={() => {
                            setLanguage('bn');
                            setIsTopToolsOpen(false);
                          }}
                          className={`py-1 rounded text-center font-medium transition cursor-pointer ${
                            language === 'bn' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          বাংলা
                        </button>
                        <button
                          onClick={() => {
                            setLanguage('en');
                            setIsTopToolsOpen(false);
                          }}
                          className={`py-1 rounded text-center font-medium transition cursor-pointer ${
                            language === 'en' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => {
                            setLanguage('ar');
                            setIsTopToolsOpen(false);
                          }}
                          className={`py-1 rounded text-center font-medium font-["Amiri"] transition cursor-pointer ${
                            language === 'ar' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          العربية
                        </button>
                      </div>
                    </div>

                    {/* 3. Theme Mode Toggle */}
                    <div className="pb-2 border-b border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                        ডিসপ্লে থিম
                      </div>
                      <button
                        onClick={() => {
                          toggleThemeMode();
                          setIsTopToolsOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-slate-200">
                          {themeMode === 'light' ? (
                            <>
                              <Sun className="w-4 h-4 text-amber-400" />
                              <span>লাইট মোড সক্রিয়</span>
                            </>
                          ) : (
                            <>
                              <Moon className="w-4 h-4 text-amber-300" />
                              <span>ডার্ক মোড সক্রিয়</span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] bg-slate-700 text-amber-300 px-2 py-0.5 rounded font-medium">
                          টগল করুন
                        </span>
                      </button>
                    </div>

                    {/* 4. Complaints & Suggestions Box */}
                    <div>
                      <button
                        onClick={() => {
                          setIsComplaintsModalOpen(true);
                          setIsTopToolsOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-xs cursor-pointer"
                      >
                        <MessageSquarePlus className="w-4 h-4 text-slate-950" />
                        <span>অভিযোগ ও পরামর্শ বক্স</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 1. Main Brand & Identity Navbar */}
      <div className="bg-emerald-900 dark:bg-slate-950 text-white border-b border-emerald-800/80 dark:border-slate-800 py-3.5 px-4 sm:px-6 transition-colors duration-300 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActivePublicTab('home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 dark:bg-emerald-950/60 p-1 shadow-lg flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
              {madrasaInfo.logoUrl ? (
                <img
                  src={madrasaInfo.logoUrl}
                  alt={madrasaInfo.nameBangla}
                  className="w-full h-full object-contain drop-shadow"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-amber-400">
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              )}
            </div>

            <div>
              <div className="font-['Amiri'] text-amber-300 text-xs sm:text-sm tracking-wide leading-tight">
                {madrasaInfo.nameArabic}
              </div>
              <h1 className="text-base sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                {language === 'ar'
                  ? madrasaInfo.nameArabic
                  : language === 'en'
                  ? madrasaInfo.nameEnglish || 'Darul Amanah Al Islamia Madrasa'
                  : madrasaInfo.nameBangla}
              </h1>
              <p className="text-[11px] sm:text-xs opacity-85 hidden sm:block">
                {madrasaInfo.mottoBangla} • স্থাপিত: {madrasaInfo.establishedYear} খ্রি.
              </p>
            </div>
          </div>

          {/* Header Action Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {currentRole === 'admin' ? (
              <>
                <button
                  id="header-admin-settings-btn"
                  onClick={() => {
                    setActiveAdminTab('settings');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                    activeAdminTab === 'settings'
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title="প্রতিষ্ঠানের তথ্য ও সেটিংস"
                >
                  <Settings className="w-4 h-4" />
                  সেটিংস
                </button>

                <button
                  id="header-admin-portal-btn"
                  onClick={() => {
                    setActiveAdminTab('dashboard');
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-300" />
                  ড্যাশবোর্ড
                </button>

                <button
                  onClick={logout}
                  className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="লগআউট"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  লগআউট
                </button>
              </>
            ) : currentRole === 'teacher' ? (
              <>
                <button
                  onClick={() => setActiveTeacherTab('attendance')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  উস্তাদ প্যানেল
                </button>
                <button
                  onClick={logout}
                  className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="লগআউট"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : currentRole === 'student' ? (
              <>
                <button
                  onClick={() => setActiveStudentTab('overview')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-amber-300" />
                  ছাত্র প্যানেল
                </button>
                <button
                  onClick={logout}
                  className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="লগআউট"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  id="cta-online-admission"
                  onClick={() => setActivePublicTab('admission')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition shadow-sm hover:shadow cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {language === 'ar' ? 'طلب القبول' : language === 'en' ? 'Admission' : 'অনলাইন ভর্তি'}
                </button>

                <button
                  id="header-login-btn"
                  onClick={onOpenLogin}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-amber-300" />
                  {language === 'ar' ? 'تسجيل الدخول' : language === 'en' ? 'Portal Login' : 'পোর্টাল লগইন'}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Action Buttons */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleThemeMode}
              className="bg-emerald-950 text-amber-300 p-2 rounded-xl text-xs flex items-center justify-center border border-emerald-800 shadow-xs"
              title="ডার্ক / লাইট মোড"
            >
              {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {currentRole === 'public' && (
              <button
                onClick={onOpenLogin}
                className="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs"
              >
                লগইন
              </button>
            )}

            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-black/30 text-white hover:bg-black/50"
              title="থ্রি মেন্যু"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Navigation Links Bar (Desktop) */}
      {currentRole === 'public' && (
        <nav className="bg-emerald-800 dark:bg-slate-900 border-b border-emerald-700/60 dark:border-slate-800 text-white hidden lg:block transition-colors duration-300 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActivePublicTab(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                    activePublicTab === item.id
                      ? 'bg-emerald-950 dark:bg-emerald-900 text-amber-300 font-bold shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-700/60 dark:hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? item.labelAr : language === 'en' ? item.labelEn : item.labelBn}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActivePublicTab('results')}
                className="text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition"
              >
                <Award className="w-3.5 h-3.5 text-slate-950" />
                ফলাফল ২০২৬
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* 3. Three-Bar Mobile Drawer Menu (Includes Complaints Box) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden bg-slate-900 text-white border-b border-slate-800 p-4 space-y-2.5"
          >
            {/* Quick Date Display in 3-Bar Menu */}
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="text-amber-400 font-medium">{todayHijri}</span>
              <span>{todayGregorian}</span>
            </div>

            {/* Explicit Complaints & Suggestions Box in 3-Bar Menu */}
            <button
              onClick={() => {
                setIsComplaintsModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <MessageSquarePlus className="w-5 h-5 text-slate-950" />
              <span>অভিযোগ ও পরামর্শের বক্স (ওপেন করুন)</span>
            </button>

            {/* Navigation Items */}
            <div className="space-y-1 pt-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePublicTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between ${
                    activePublicTab === item.id
                      ? 'bg-emerald-800 text-amber-300 font-bold'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <span>{language === 'ar' ? item.labelAr : language === 'en' ? item.labelEn : item.labelBn}</span>
                  {activePublicTab === item.id && <span className="text-amber-400">●</span>}
                </button>
              ))}
            </div>

            {/* Online Admission Quick CTA */}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setActivePublicTab('admission');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm text-center shadow-xs cursor-pointer"
              >
                অনলাইন ভর্তি আবেদন ফরম
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cloud Sync Status & Backup Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
      />
    </header>
  );
};
