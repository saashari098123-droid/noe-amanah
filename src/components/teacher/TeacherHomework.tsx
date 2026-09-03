import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Bookmark,
  Sparkles,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getHijriDateString } from '../../utils/hijriDate';

export const TeacherHomework: React.FC = () => {
  const { currentTeacher, classes, homework, routines, addHomework, deleteHomework } = useMadrasa();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [selectedClassId, setSelectedClassId] = useState(
    currentTeacher?.assignedClasses[0] || classes[0]?.id || 'cls-madani-1'
  );
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [subjectName, setSubjectName] = useState(
    currentTeacher?.assignedSubjects[0] || 'নাহবেমীর (আরবি ব্যাকরণ)'
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pageNumbers, setPageNumbers] = useState('');
  const [dueDate, setDueDate] = useState('আগামীকাল সকাল ৮:০০');

  if (!currentTeacher) return null;

  // Filter homework assigned by current teacher
  const myHomeworkList = homework.filter((h) => h.teacherId === currentTeacher.id);

  // Routines for selected class
  const classRoutines = routines.filter((r) => r.classId === selectedClassId);

  const todayHijri = getHijriDateString(new Date());
  const todayGregorian = new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find((c) => c.id === selectedClassId);

    addHomework({
      classId: selectedClassId,
      className: cls?.nameBangla || cls?.name || 'জামাত',
      subjectName,
      periodNumber: Number(periodNumber),
      title,
      description,
      pageNumbers,
      assignedDate: `${todayGregorian} (${todayHijri})`,
      dueDate,
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.nameBangla,
    });

    setIsAddModalOpen(false);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    setTitle('');
    setDescription('');
    setPageNumbers('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ঘণ্টাভিত্তিক হোমওয়ার্ক ও পড়ার রুটিন তৈরি
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ক্লাস রুটিন অনুযায়ী শিক্ষার্থীদের প্রতিদিনের পড়ার সবক ও বাড়ির কাজ নির্দিষ্ট ঘণ্টায় নির্ধারণ করুন
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          নতুন হোমওয়ার্ক যোগ করুন
        </button>
      </div>

      {/* Homework List Grid */}
      <div className="space-y-4">
        {myHomeworkList.length === 0 ? (
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 text-xs">
            আপনি এখনও কোন হোমওয়ার্ক যুক্ত করেননি। উপরের বাটনে ক্লিক করে নতুন হোমওয়ার্ক যোগ করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myHomeworkList.map((hw) => (
              <div
                key={hw.id}
                className="bg-white dark:bg-slate-850 rounded-3xl p-6 shadow-xs hover:shadow-md border border-slate-200 dark:border-slate-800 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs px-3 py-1 rounded-xl">
                        {hw.className}
                      </span>
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {hw.periodNumber}ম ঘণ্টা
                      </span>
                    </div>

                    <button
                      onClick={() => deleteHomework(hw.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                      {hw.subjectName}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{hw.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                      {hw.description}
                    </p>
                  </div>

                  {hw.pageNumbers && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Bookmark className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>
                        <strong>পৃষ্ঠা / কিতাবের অংশ:</strong> {hw.pageNumbers}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>তারিখ: {hw.assignedDate}</span>
                  </div>
                  <div className="font-semibold text-amber-600 dark:text-amber-400">
                    জমা: {hw.dueDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Homework Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              রুটিন অনুযায়ী নতুন হোমওয়ার্ক যুক্ত করুন
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    শ্রেণি / জামাত নির্বাচন *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nameBangla || cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    রুটিনের পিরিয়ড / ঘণ্টা *
                  </label>
                  <select
                    value={periodNumber}
                    onChange={(e) => {
                      const pNum = Number(e.target.value);
                      setPeriodNumber(pNum);
                      const matchingRoutine = classRoutines.find((r) => r.periodNumber === pNum);
                      if (matchingRoutine) {
                        setSubjectName(matchingRoutine.subjectName);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    {classRoutines.length > 0 ? (
                      classRoutines.map((r) => (
                        <option key={r.id} value={r.periodNumber}>
                          {r.periodName} ({r.startTime})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={1}>১ম ঘণ্টা</option>
                        <option value={2}>২য় ঘণ্টা</option>
                        <option value={3}>৩য় ঘণ্টা</option>
                        <option value={4}>৪র্থ ঘণ্টা</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিষয় / কিতাবের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="উদাঃ শরহে বেকায়া / নাহবেমীর"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পড়ার শিরোনাম / সবকের বিবরণ *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="উদাঃ কিতাবুত্তাহারাত - উযুর ফরযসমূহ ও মূল এবারত"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  হোমওয়ার্কের বিস্তারিত নির্দেশনা
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="শিক্ষার্থীদের কী কী মুখস্থ বা খাতায় লিখে আনতে হবে..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পৃষ্ঠা নম্বর / অনুচ্ছেদ
                  </label>
                  <input
                    type="text"
                    value={pageNumbers}
                    onChange={(e) => setPageNumbers(e.target.value)}
                    placeholder="উদাঃ পৃষ্ঠা ১২ হতে ১৫"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    জমা দেওয়ার সময়
                  </label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="আগামীকাল সকাল ৮:০০"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
