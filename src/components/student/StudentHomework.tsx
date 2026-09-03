import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bookmark,
  Sparkles,
} from 'lucide-react';

export const StudentHomework: React.FC = () => {
  const { homework, currentStudent, classes } = useMadrasa();
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<number | 'all'>('all');

  if (!currentStudent) return null;

  // Filter homework for current student's class
  const classHomework = homework.filter((h) => h.classId === currentStudent.classId);

  const filtered = classHomework.filter((h) => {
    if (selectedPeriodFilter === 'all') return true;
    return h.periodNumber === selectedPeriodFilter;
  });

  const periodLabels: Record<number, string> = {
    1: '১ম ঘণ্টা (সকাল ৮:০০ - ৯:০০)',
    2: '২য় ঘণ্টা (সকাল ৯:০০ - ১০:০০)',
    3: '৩য় ঘণ্টা (সকাল ১০:১৫ - ১১:১৫)',
    4: '৪র্থ ঘণ্টা (সকাল ১১:১৫ - ১২:১৫)',
    5: '৫ম ঘণ্টা (দুপুর ২:০০ - ৩:০০)',
    6: '৬ষ্ঠ ঘণ্টা (বিকাল ৩:০০ - ৪:০০)',
  };

  return (
    <div className="space-y-6">
      {/* Header & Period Filter */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              আজকের ঘণ্টাভিত্তিক পড়ার রুটিন ও হোমওয়ার্ক
            </h2>
            <p className="text-xs text-slate-500">
              {currentStudent.className} • প্রতিদিনের কোন ঘণ্টায় কোন উস্তাদ কী পড়া ও বাড়ির কাজ দিয়েছেন তার পূর্ণ বিবরণ
            </p>
          </div>

          <div className="bg-blue-50 text-blue-900 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-blue-200">
            মোট পাঠ্য বিষয়: {classHomework.length} টি
          </div>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-2">ঘণ্টা ফিল্টার:</span>
          <button
            onClick={() => setSelectedPeriodFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedPeriodFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            সব ঘণ্টা ({classHomework.length})
          </button>
          {[1, 2, 3, 4, 5].map((period) => {
            const count = classHomework.filter((h) => h.periodNumber === period).length;
            if (count === 0 && selectedPeriodFilter !== period) return null;
            return (
              <button
                key={period}
                onClick={() => setSelectedPeriodFilter(period)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedPeriodFilter === period
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {period === 1 ? '১ম ঘণ্টা' : period === 2 ? '২য় ঘণ্টা' : `${period}ম ঘণ্টা`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Homework Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200 text-xs">
          এই ঘণ্টায় নির্ধারিত কোন হোমওয়ার্ক নেই।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((hw) => (
            <div
              key={hw.id}
              className="bg-white rounded-3xl p-6 shadow-xs hover:shadow-md border border-slate-200 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-800 text-amber-300 font-mono font-bold text-xs px-3 py-1 rounded-xl shadow-xs">
                    {periodLabels[hw.periodNumber] || `${hw.periodNumber}ম ঘণ্টা`}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    দেওয়া হয়েছে: {hw.assignedDate}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                    বিষয়: {hw.subjectName}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{hw.title}</h3>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {hw.description}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">দায়িত্বপ্রাপ্ত উস্তাদ:</span>
                  <span className="font-bold text-slate-800">{hw.teacherName}</span>
                </div>

                <div className="flex items-center justify-between text-xs bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                  <span className="font-semibold text-amber-900 flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                    কিতাবের পৃষ্ঠা/সবক:
                  </span>
                  <span className="font-bold text-amber-900">{hw.pageNumbers || 'মৌখিক সবক'}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>জমা দেওয়ার শেষ সময়:</span>
                  <span className="font-bold text-rose-600">{hw.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
