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
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [isExcelDriveModalOpen, setIsExcelDriveModalOpen] = useState(false);
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
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-0.5 rounded-full font-mono">
                সুপার অ্যাডমিন ও মুহতামিম
              </span>
              <span className="bg-blue-800 text-blue-200 text-xs px-2.5 py-0.5 rounded-full">
                কেন্দ্রীয় প্রশাসনিক প্যানেল
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {madrasaInfo.nameBangla} — প্রশাসন
            </h1>
            <p className="text-xs text-blue-200">
              সকল জামাত, কিতাব, ছাত্র আইডি, শিক্ষক, ভর্তি, বেতন অনুমোদন, গ্যালারি ও পরীক্ষার ফলাফল পরিচালনা করুন
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsExcelDriveModalOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-500/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
            title="এক্সেল ব্যাকআপ, বাল্ক ইম্পোর্ট এবং গুগল ড্রাইভ সিঙ্ক"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-300" />
            <span>এক্সেল ও ক্লাউড সিঙ্ক</span>
          </button>

          <button
            id="admin-direct-settings-btn"
            onClick={() => setActiveAdminTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md ${
              activeAdminTab === 'settings'
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                : 'bg-blue-800 hover:bg-blue-700 text-amber-300 border border-amber-400/40'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-400" />
            ⚙️ স্কুল এন্ড কলেজ সেটিংস ও পাসওয়ার্ড
          </button>

          <button
            onClick={logout}
            className="bg-rose-900/50 hover:bg-rose-900 text-rose-200 border border-rose-700/50 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            লগআউট
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
        {activeAdminTab === 'admissions' && <AdminAdmissions />}
        {activeAdminTab === 'fees' && <AdminFees />}
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
