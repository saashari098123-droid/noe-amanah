import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { UserRole } from '../../types';
import { ShieldCheck, GraduationCap, BookOpen, Globe, LogOut, Sparkles } from 'lucide-react';

export const QuickRoleBar: React.FC<{ onOpenLogin: (defaultTab?: UserRole) => void }> = ({ onOpenLogin }) => {
  const { currentRole, currentStudent, currentTeacher, isAdminLoggedIn, quickSwitchRole, logout } = useMadrasa();

  return (
    <div id="quick-role-bar" className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs px-3 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            পোর্টাল মোড:
          </span>
          <span className="text-slate-300 font-medium">
            {currentRole === 'public' && '🌐 সাধারণ দর্শক ও ভিজিটর ভিউ'}
            {currentRole === 'student' && `🎓 ছাত্র ড্যাশবোর্ড (${currentStudent?.nameBangla || 'মুহাম্মদ তৌহিদ'} - রোল ${currentStudent?.roll})`}
            {currentRole === 'teacher' && `👨‍🏫 শিক্ষক ড্যাশবোর্ড (${currentTeacher?.nameBangla || 'উস্তাদ'})`}
            {currentRole === 'admin' && '🛡️ সুপার অ্যাডমিন কন্ট্রোল সেন্টার'}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">দ্রুত সুইচ:</span>

          <button
            id="role-btn-public"
            onClick={() => quickSwitchRole('public')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition ${
              currentRole === 'public'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            পাবলিক ওয়েবসাইট
          </button>

          <button
            id="role-btn-student"
            onClick={() => quickSwitchRole('student')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition ${
              currentRole === 'student'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            ছাত্র পোর্টাল
          </button>

          <button
            id="role-btn-teacher"
            onClick={() => quickSwitchRole('teacher')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition ${
              currentRole === 'teacher'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            শিক্ষক পোর্টাল
          </button>

          <button
            id="role-btn-admin"
            onClick={() => quickSwitchRole('admin')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition ${
              currentRole === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            অ্যাডমিন প্যানেল
          </button>

          {currentRole !== 'public' ? (
            <button
              id="logout-btn"
              onClick={logout}
              className="ml-2 px-2.5 py-1 rounded bg-rose-900/40 text-rose-300 hover:bg-rose-900/80 border border-rose-700/50 flex items-center gap-1 font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              লগআউট
            </button>
          ) : (
            <button
              id="open-login-modal-btn"
              onClick={() => onOpenLogin()}
              className="ml-2 px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center gap-1 shadow-sm"
            >
              লগইন করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
