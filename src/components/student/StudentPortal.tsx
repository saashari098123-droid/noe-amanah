import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { StudentOverview } from './StudentOverview';
import { StudentClassmates } from './StudentClassmates';
import { StudentHomework } from './StudentHomework';
import { StudentFees } from './StudentFees';
import { StudentResults } from './StudentResults';
import { StudentFeedback } from './StudentFeedback';
import {
  GraduationCap,
  Users,
  BookOpen,
  CreditCard,
  Award,
  MessageSquare,
  LayoutDashboard,
  Calendar,
  LogOut,
  Sparkles,
  Phone,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const { currentStudent, activeStudentTab, setActiveStudentTab, logout } = useMadrasa();

  if (!currentStudent) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center shadow-lg border border-slate-200">
        <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">কোন ছাত্র লগইন করা নেই</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">অনুগ্রহ করে আপনার ছাত্র আইডি দিয়ে লগইন করুন।</p>
        <button
          onClick={logout}
          className="bg-blue-600 text-white font-bold px-6 py-2 rounded-xl text-xs"
        >
          লগইন পেজে যান
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
    { id: 'classmates', label: 'সহপাঠী ও ডিজিটাল হাজিরা', icon: Users },
    { id: 'homework', label: 'ঘণ্টাভিত্তিক হোমওয়ার্ক', icon: BookOpen },
    { id: 'fees', label: 'বেতন ও ফি পরিশোধ', icon: CreditCard },
    { id: 'results', label: 'পরীক্ষার রেজাল্ট', icon: Award },
    { id: 'feedback', label: 'অভিভাবকের অভিযোগ/পরামর্শ', icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Student Identity Profile Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={currentStudent.photoUrl}
            alt={currentStudent.nameBangla}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-amber-400 shadow-lg shrink-0"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-0.5 rounded-full font-mono">
                আইডি: {currentStudent.id}
              </span>
              <span className="bg-blue-700 text-blue-100 font-bold text-xs px-2.5 py-0.5 rounded-full">
                রোল: {currentStudent.roll}
              </span>
              <span className="bg-teal-700 text-teal-100 text-xs px-2.5 py-0.5 rounded-full font-medium">
                সাল: {currentStudent.year}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentStudent.nameBangla}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200">
              {currentStudent.className} • অভিভাবক: {currentStudent.fatherName}
            </p>
            <p className="text-xs text-blue-300 flex items-center justify-center sm:justify-start gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              জরুরি যোগাযোগ: {currentStudent.guardianPhone}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="bg-blue-950/60 border border-blue-700/60 p-3 rounded-2xl text-center text-xs">
            <div className="text-blue-300">আবাসিক স্ট্যাটাস</div>
            <div className="text-sm font-bold text-amber-300">
              {currentStudent.residentialStatus === 'residential'
                ? 'আবাসিক হোস্টেল'
                : currentStudent.residentialStatus === 'non-residential'
                ? 'অনাবাসিক'
                : 'ডে-কেয়ার'}
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

      {/* Portal Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-xs border border-slate-200 overflow-x-auto scrollbar-none gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStudentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`student-tab-${tab.id}`}
              onClick={() => setActiveStudentTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-800 hover:bg-blue-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="transition-all duration-200">
        {activeStudentTab === 'overview' && <StudentOverview />}
        {activeStudentTab === 'classmates' && <StudentClassmates />}
        {activeStudentTab === 'homework' && <StudentHomework />}
        {activeStudentTab === 'fees' && <StudentFees />}
        {activeStudentTab === 'results' && <StudentResults />}
        {activeStudentTab === 'feedback' && <StudentFeedback />}
      </div>
    </div>
  );
};
