import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { AdminOverview } from './AdminOverview';
import { AdminClasses } from './AdminClasses';
import { AdminStudents } from './AdminStudents';
import { AdminTeachers } from './AdminTeachers';
import { AdminAdmissions } from './AdminAdmissions';
import { AdminFees } from './AdminFees';
import { AdminResults } from './AdminResults';
import { AdminMedia } from './AdminMedia';
import { AdminNotices } from './AdminNotices';
import { AdminComplaints } from './AdminComplaints';
import { AdminSettings } from './AdminSettings';
import { AdminSyllabus } from './AdminSyllabus';
import { AdminFinance } from './AdminFinance';
import { AdminTeacherSalaries } from './AdminTeacherSalaries';
import { AdminExcelGoogleDriveModal } from './AdminExcelGoogleDriveModal';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  CreditCard,
  Award,
  Bell,
  MessageSquare,
  FileCheck,
  LayoutDashboard,
  LogOut,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Settings,
  Cloud,
  FileSpreadsheet,
  BookMarked,
  Wallet,
  Banknote,
  MoreVertical,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [isExcelDriveModalOpen, setIsExcelDriveModalOpen] = useState(false);
  const [isAdminMoreOpen, setIsAdminMoreOpen] = useState(false);
  const {
    activeAdminTab,
    setActiveAdminTab,
    logout,
    madrasaInfo,
    feePayments,
    admissionApplications,
    complaints,
    classes,
    students,
  } = useMadrasa();

  // Pending badges
  const pendingFeesCount = feePayments.filter((f) => f.status === 'pending').length;
  const pendingAdmissionsCount = admissionApplications.filter((a) => a.status === 'submitted').length;
  const pendingComplaintsCount = complaints.filter((c) => c.status === 'pending').length;

  const tabs = [
    { id: 'overview', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'classes', label: `জামাত ও কিতাব (${classes.length})`, icon: BookOpen },
    { id: 'syllabus', label: 'সিলেবাস ও পাঠপরিকল্পনা', icon: BookMarked },
    { id: 'students', label: `ছাত্র ও আইডি (${students.length})`, icon: Users },
    { id: 'teachers', label: 'শিক্ষক ও পাসওয়ার্ড', icon: GraduationCap },
    { id: 'teacher_salaries', label: 'উস্তাদদের হাদিয়া ও বেতন', icon: Banknote },
    {
      id: 'admissions',
      label: `ভর্তি আবেদন (${pendingAdmissionsCount})`,
      icon: FileCheck,
    },
    {
      id: 'fees',
      label: `বেতন অনুমোদন (${pendingFeesCount})`,
      icon: CreditCard,
    },
    { id: 'finance', label: 'আয়-ব্যয় হিসাব ও তহবিল', icon: Wallet },
    { id: 'results', label: 'পরীক্ষার রেজাল্ট', icon: Award },
    { id: 'media', label: 'ছবি ও ভিডিও গ্যালারি', icon: ImageIcon },
    { id: 'notices', label: 'নোটিশ বোর্ড', icon: Bell },
    {
      id: 'complaints',
      label: `পরামর্শ ও অভিযোগ (${pendingComplaintsCount})`,
      icon: MessageSquare,
    },
    { id: 'settings', label: 'স্কুল এন্ড কলেজ প্রোফাইল ও সেটিংস', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-700/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shrink-0">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {madrasaInfo.nameBangla} — প্রশাসন
            </h1>
          </div>
        </div>

        <div className="relative flex items-center gap-2.5">
          {/* Three-Dot Menu for Admin Auxiliary Tools */}
          <div className="relative">
            <button
              id="admin-more-options-btn"
              onClick={() => setIsAdminMoreOpen((prev) => !prev)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95"
              title="অতিরিক্ত অপশন ও টুলস"
            >
              <MoreVertical className="w-4 h-4 text-amber-300" />
              <span>অপশন ও টুলস</span>
            </button>

            {isAdminMoreOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsAdminMoreOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 text-slate-100 border border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 space-y-2 text-xs animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setIsExcelDriveModalOpen(true);
                      setIsAdminMoreOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-emerald-950/80 text-emerald-300 hover:text-emerald-200 transition text-left cursor-pointer border border-emerald-800/50"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-300 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-xs">এক্সেল ও ক্লাউড সিঙ্ক</div>
                      <div className="text-[10px] text-emerald-400">এক্সেল ব্যাকআপ, ইম্পোর্ট ও ড্রাইভ</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('settings');
                      setIsAdminMoreOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition text-left cursor-pointer border border-slate-800"
                  >
                    <Settings className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-xs">মাদরাসা সেটিংস ও পাসওয়ার্ড</div>
                      <div className="text-[10px] text-slate-400">নাম, লোগো, ফি ও নিরাপত্তা</div>
                    </div>
                  </button>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setIsAdminMoreOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-rose-950/70 text-rose-300 transition text-left cursor-pointer font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>অ্যাডমিন থেকে লগআউট</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={logout}
            className="bg-rose-900/60 hover:bg-rose-900 text-rose-100 border border-rose-700/50 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            title="লগআউট"
          >
            <LogOut className="w-4 h-4 text-rose-300" />
            <span className="hidden sm:inline">লগআউট</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex bg-white p-2 rounded-2xl shadow-xs border border-slate-200 overflow-x-auto gap-1.5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          const isSettingsTab = tab.id === 'settings';
          return (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-amber-400 shadow-md ring-1 ring-slate-800'
                  : isSettingsTab
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isSettingsTab && !isActive ? 'text-amber-700' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div>
        {activeAdminTab === 'overview' && <AdminOverview />}
        {activeAdminTab === 'classes' && <AdminClasses />}
        {activeAdminTab === 'syllabus' && <AdminSyllabus />}
        {activeAdminTab === 'students' && <AdminStudents />}
        {activeAdminTab === 'teachers' && <AdminTeachers />}
        {activeAdminTab === 'teacher_salaries' && <AdminTeacherSalaries />}
        {activeAdminTab === 'admissions' && <AdminAdmissions />}
        {activeAdminTab === 'fees' && <AdminFees />}
        {activeAdminTab === 'finance' && <AdminFinance />}
        {activeAdminTab === 'results' && <AdminResults />}
        {activeAdminTab === 'media' && <AdminMedia />}
        {activeAdminTab === 'notices' && <AdminNotices />}
        {activeAdminTab === 'complaints' && <AdminComplaints />}
        {activeAdminTab === 'settings' && <AdminSettings />}
      </div>

      {/* Excel & Google Drive Modal */}
      <AdminExcelGoogleDriveModal
        isOpen={isExcelDriveModalOpen}
        onClose={() => setIsExcelDriveModalOpen(false)}
      />
    </div>
  );
};
