import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { TeacherOverview } from './TeacherOverview';
import { TeacherAttendance } from './TeacherAttendance';
import { TeacherHomework } from './TeacherHomework';
import { TeacherComplaints } from './TeacherComplaints';
import { TeacherSyllabus } from './TeacherSyllabus';
import {
  Users,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Phone,
  Mail,
  GraduationCap,
  BookMarked,
} from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const { currentTeacher, activeTeacherTab, setActiveTeacherTab, logout, complaints } = useMadrasa();

  if (!currentTeacher) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center shadow-lg border border-slate-200">
        <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">কোন শিক্ষক লগইন করা নেই</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">অনুগ্রহ করে উস্তাদ লগইন করুন।</p>
        <button
          onClick={logout}
          className="bg-blue-600 text-white font-bold px-6 py-2 rounded-xl text-xs"
        >
          লগইন পেজে যান
        </button>
      </div>
    );
  }

  // Count unread or pending complaints for this teacher
  const teacherComplaintsCount = complaints.filter((c) => {
    if (c.recipientType === 'admin') return false;
    if (c.recipientId) {
      return c.recipientId === currentTeacher.id;
    }
    if (c.recipientName && currentTeacher.nameBangla) {
      return (
        c.recipientName.includes(currentTeacher.nameBangla) ||
        currentTeacher.nameBangla.includes(c.recipientName)
      );
    }
    return false;
  }).length;

  const tabs = [
    { id: 'overview', label: 'শিক্ষক ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'attendance', label: 'ডিজিটাল ও ম্যানুয়াল হাজিরা', icon: CalendarCheck },
    { id: 'homework', label: 'ঘণ্টাভিত্তিক হোমওয়ার্ক প্রদান', icon: BookOpen },
    { id: 'syllabus', label: 'সিলেবাস ও পাঠপরিকল্পনা', icon: BookMarked },
    { id: 'complaints', label: `অভিভাবকের বার্তা (${teacherComplaintsCount})`, icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Teacher Profile Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={currentTeacher.photoUrl}
            alt={currentTeacher.nameBangla}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-amber-400 shadow-lg shrink-0"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-0.5 rounded-full font-mono">
                আইডি: {currentTeacher.id}
              </span>
              <span className="bg-blue-700 text-blue-100 font-bold text-xs px-2.5 py-0.5 rounded-full">
                {currentTeacher.designation}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentTeacher.nameBangla}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200">{currentTeacher.qualification}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-blue-300 pt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                {currentTeacher.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                {currentTeacher.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="bg-blue-950/70 border border-blue-700/50 p-3 rounded-2xl text-center text-xs">
            <div className="text-blue-300">দায়িত্বপ্রাপ্ত বিষয়সমূহ</div>
            <div className="text-xs font-bold text-amber-300 mt-0.5">
              {currentTeacher.assignedSubjects.join(', ')}
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-rose-900/50 hover:bg-rose-900 text-rose-200 border border-rose-700/50 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-4 h-4" />
            লগআউট
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-xs border border-slate-200 overflow-x-auto scrollbar-none gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTeacherTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`teacher-tab-${tab.id}`}
              onClick={() => setActiveTeacherTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-800 hover:bg-blue-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div>
        {activeTeacherTab === 'overview' && <TeacherOverview />}
        {activeTeacherTab === 'attendance' && <TeacherAttendance />}
        {activeTeacherTab === 'homework' && <TeacherHomework />}
        {activeTeacherTab === 'syllabus' && <TeacherSyllabus />}
        {activeTeacherTab === 'complaints' && <TeacherComplaints />}
      </div>
    </div>
  );
};
