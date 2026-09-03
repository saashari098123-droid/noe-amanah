import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Award,
  AlertCircle,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { calculateStudentFeeSummary } from '../../utils/feeCalculator';
import { getOrdinalBangla } from '../../utils/meritCalculator';

export const StudentOverview: React.FC = () => {
  const { currentStudent, homework, attendance, feePayments, examResults, setActiveStudentTab } = useMadrasa();

  if (!currentStudent) return null;

  // Filter student specific homework
  const todayHomeworks = homework.filter((h) => h.classId === currentStudent.classId);

  // Student attendance status for today
  const todayAtt = attendance.find((a) => a.studentId === currentStudent.id);

  // Fee summary & dues calculation
  const feeSummary = calculateStudentFeeSummary(currentStudent, feePayments);
  const pendingPayment = feePayments.find((f) => f.studentId === currentStudent.id && f.status === 'pending');

  // Exam result
  const latestResult = examResults.find((r) => r.studentId === currentStudent.id);

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance status */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">আজকের উপস্থিতি স্ট্যাটাস</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  todayAtt?.status === 'present'
                    ? 'bg-blue-500 animate-pulse'
                    : todayAtt?.status === 'absent'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              ></span>
              <span className="text-lg font-bold text-slate-900">
                {todayAtt?.status === 'present'
                  ? 'উপস্থিত (Present)'
                  : todayAtt?.status === 'absent'
                  ? 'অনুপস্থিত'
                  : 'হাজিরা সম্পন্ন'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">ডিজিটাল এটেনডেন্স সিস্টেম</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Homework Count */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">আজকের পড়া ও হোমওয়ার্ক</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {todayHomeworks.length} টি বিষয়
            </span>
            <span className="text-[11px] text-blue-700 font-medium">ঘণ্টাভিত্তিক অ্যাসাইনমেন্ট</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Fee & Due Status Card */}
        <div
          onClick={() => setActiveStudentTab('fees')}
          className={`p-5 rounded-3xl shadow-xs border flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
            feeSummary.hasDue
              ? 'bg-rose-50/80 border-rose-200 hover:border-rose-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-xs font-semibold block flex items-center gap-1">
              {feeSummary.hasDue ? (
                <span className="text-rose-700 font-bold">বকেয়া বেতন ও ফি</span>
              ) : (
                <span className="text-slate-400">মাসিক বেতন ও ফি</span>
              )}
            </span>
            <span
              className={`text-lg font-bold mt-1 block font-mono ${
                feeSummary.hasDue ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {feeSummary.hasDue
                ? `বকেয়া: ৳${feeSummary.totalDue.toLocaleString('en-IN')}/-`
                : pendingPayment
                ? 'অনুমোদনাধীন'
                : 'সব পরিশোধিত ✓'}
            </span>
            <span
              className={`text-[11px] font-medium block ${
                feeSummary.hasDue ? 'text-rose-600' : 'text-amber-600'
              }`}
            >
              {feeSummary.hasDue
                ? `${feeSummary.dueMonthsCount} টি মাসের ফি বকেয়া (বিস্তারিত দেখুন)`
                : `নির্ধারিত ফি: ৳${feeSummary.monthlyFee.toLocaleString('en-IN')}/মাস`}
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              feeSummary.hasDue
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Latest Exam Position */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">সর্বশেষ মেধা স্থান</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {latestResult ? `${getOrdinalBangla(latestResult.positionInClass)} স্থান` : 'শীঘ্রই আসছে'}
            </span>
            <span className="text-[11px] text-blue-700 font-medium">
              গ্রেড: {latestResult?.overallGrade || 'A+'} ({latestResult?.overallArabicGrade || 'মুমতাজ'})
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Homework & Fast Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Period Homework List */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                আজকের ঘণ্টাভিত্তিক হোমওয়ার্ক ও পাঠ
              </h3>
              <p className="text-xs text-slate-500">আপনার শ্রেণির আজকের নির্ধারিত বাড়ির কাজ</p>
            </div>
            <button
              onClick={() => setActiveStudentTab('homework')}
              className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-1"
            >
              বিস্তারিত দেখুন <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayHomeworks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">আজকের কোন হোমওয়ার্ক যুক্ত করা হয়নি।</div>
          ) : (
            <div className="space-y-3">
              {todayHomeworks.map((hw) => (
                <div
                  key={hw.id}
                  className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200 transition space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-700 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg font-mono">
                        {hw.periodNumber === 1 ? '১ম ঘণ্টা' : hw.periodNumber === 2 ? '২য় ঘণ্টা' : `${hw.periodNumber}ম ঘণ্টা`}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{hw.subjectName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">উস্তাদ: {hw.teacherName}</span>
                  </div>

                  <h4 className="font-semibold text-xs sm:text-sm text-blue-950">{hw.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span className="text-amber-700 font-medium">{hw.pageNumbers || 'কিতাবের নির্ধারিত অংশ'}</span>
                    <span>জমা দেওয়ার তারিখ: {hw.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Portal Actions & Guardian Desk */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Pay Box */}
          <div className="bg-gradient-to-br from-blue-900 to-teal-950 text-white rounded-3xl p-6 shadow-md border border-blue-700/50 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-300" />
              অনলাইন বেতন পরিশোধ
            </h3>
            <p className="text-xs text-blue-200 leading-relaxed">
              বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে সহজেই চলতি মাসের ফি জমা দিন ও রসিদ ডাউনলোড করুন।
            </p>
            <button
              onClick={() => setActiveStudentTab('fees')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition shadow-md"
            >
              বেতন পরিশোধ করুন →
            </button>
          </div>

          {/* Guardian direct communication button */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">অভিভাবক যোগাযোগ ও পরামর্শ</h4>
                <p className="text-[11px] text-slate-500">নির্দিষ্ট শিক্ষক বা মুহতামিমকে বার্তা দিন</p>
              </div>
            </div>
            <button
              onClick={() => setActiveStudentTab('feedback')}
              className="w-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold py-2 rounded-xl text-xs transition border border-slate-200"
            >
              মেসেজ বা অভিযোগ লিখুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
