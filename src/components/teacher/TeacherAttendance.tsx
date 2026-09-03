import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Users,
  Save,
  Sparkles,
  Calendar,
  Filter,
  CheckCheck,
  RotateCcw,
  Clock,
  PlusCircle,
  History,
  Send,
  BarChart3,
  Percent,
  Search,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getHijriDateString, formatDualDate } from '../../utils/hijriDate';
import { ClassRoutine } from '../../types';

export const TeacherAttendance: React.FC = () => {
  const {
    currentTeacher,
    classes,
    students,
    attendance,
    routines,
    addRoutine,
    saveBulkAttendance,
    markBulkAttendance,
    getStudentAttendanceStats,
    language,
    t,
  } = useMadrasa();

  // Active sub-tab: 'live-attendance' or 'yearly-archive'
  const [activeTab, setActiveTab] = useState<'live-attendance' | 'yearly-archive'>('live-attendance');

  const [selectedClassId, setSelectedClassId] = useState<string>(
    currentTeacher?.assignedClasses[0] || classes[0]?.id || 'cls-madani-1'
  );
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Period / Hour Selection
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<number>(1);
  const [customPeriodName, setCustomPeriodName] = useState<string>('১ম ঘণ্টা (কুরআন/হাদিস)');
  const [showAddPeriodModal, setShowAddPeriodModal] = useState<boolean>(false);

  // New Period Form State
  const [newPeriodSubject, setNewPeriodSubject] = useState('');
  const [newPeriodStartTime, setNewPeriodStartTime] = useState('08:00 AM');
  const [newPeriodEndTime, setNewPeriodEndTime] = useState('09:00 AM');
  const [newPeriodRoom, setNewPeriodRoom] = useState('১০১');

  // Filter students
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Status map
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'leave' | 'late'>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Routine periods for this class
  const classRoutines = routines.filter((r) => r.classId === selectedClassId);

  // Initializing status map
  React.useEffect(() => {
    const initialMap: Record<string, 'present' | 'absent' | 'leave' | 'late'> = {};
    classStudents.forEach((st) => {
      const existing = attendance.find(
        (a) =>
          a.studentId === st.id &&
          a.date === attendanceDate &&
          (a.periodNumber === selectedPeriodNumber || !a.periodNumber)
      );
      initialMap[st.id] = existing ? existing.status : 'present';
    });
    setAttendanceMap(initialMap);
  }, [selectedClassId, attendanceDate, selectedPeriodNumber]);

  // Update custom period name when selecting routine
  const handleSelectPeriod = (periodNum: number, name: string) => {
    setSelectedPeriodNumber(periodNum);
    setCustomPeriodName(name);
  };

  // Add custom period
  const handleAddNewPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const newPeriodNum = classRoutines.length + 1;
    const newRoutineItem: ClassRoutine = {
      id: `rt-custom-${Date.now()}`,
      classId: selectedClassId,
      className: classes.find((c) => c.id === selectedClassId)?.name || 'জামাত',
      periodNumber: newPeriodNum,
      periodName: `${newPeriodNum}ম ঘণ্টা (${newPeriodSubject || 'পাঠদান'})`,
      subjectName: newPeriodSubject || 'ইসলামিক স্টাডিজ',
      startTime: newPeriodStartTime,
      endTime: newPeriodEndTime,
      teacherId: currentTeacher?.id || 'T-101',
      teacherName: currentTeacher?.nameBangla || 'উস্তাদ',
      roomNo: newPeriodRoom,
    };
    addRoutine(newRoutineItem);
    setSelectedPeriodNumber(newPeriodNum);
    setCustomPeriodName(newRoutineItem.periodName);
    setShowAddPeriodModal(false);
    setNewPeriodSubject('');
  };

  // 1-Click Mark All Present
  const handleMarkAllPresent = () => {
    const updated: Record<string, 'present' | 'absent' | 'leave' | 'late'> = {};
    classStudents.forEach((st) => {
      updated[st.id] = 'present';
    });
    setAttendanceMap(updated);
  };

  // 1-Click Mark All Absent
  const handleMarkAllAbsent = () => {
    const updated: Record<string, 'present' | 'absent' | 'leave' | 'late'> = {};
    classStudents.forEach((st) => {
      updated[st.id] = 'absent';
    });
    setAttendanceMap(updated);
  };

  const toggleStudentStatus = (studentId: string, status: 'present' | 'absent' | 'leave' | 'late') => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Save Attendance & auto-dispatch SMS
  const handleSaveAttendance = () => {
    const selectedClass = classes.find((c) => c.id === selectedClassId);
    const records = classStudents.map((st) => ({
      studentId: st.id,
      studentName: st.nameBangla,
      classId: selectedClassId,
      className: selectedClass?.nameBangla || selectedClass?.name || 'জামাত',
      date: attendanceDate,
      status: attendanceMap[st.id] || 'present',
      periodNumber: selectedPeriodNumber,
      periodName: customPeriodName,
      recordedByTeacherId: currentTeacher?.id || 'T-101',
      recordedBy: currentTeacher?.nameBangla || 'শ্রেণি শিক্ষক',
      guardianPhone: st.guardianPhone,
    }));

    if (markBulkAttendance) {
      markBulkAttendance(records);
    } else {
      saveBulkAttendance(records);
    }
    setIsSaved(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setIsSaved(false), 4000);
  };

  const presentCount = classStudents.filter((s) => (attendanceMap[s.id] || 'present') === 'present').length;
  const absentCount = classStudents.length - presentCount;

  // Selected date Hijri calculation
  const selectedDateObj = new Date(attendanceDate);
  const hijriFormatted = getHijriDateString(isNaN(selectedDateObj.getTime()) ? new Date() : selectedDateObj);

  // Search filter for 1-Year Attendance Archive
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveSelectedStudentId, setArchiveSelectedStudentId] = useState<string>(classStudents[0]?.id || '');

  const activeArchiveStats = getStudentAttendanceStats(archiveSelectedStudentId || classStudents[0]?.id || '');

  return (
    <div className="space-y-6">
      {/* Top Tab Switcher (Live Attendance vs 1-Year History & Percentage) */}
      <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('live-attendance')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === 'live-attendance'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          ঘণ্টা ভিত্তিক লাইভ হাজিরা প্রদান
        </button>

        <button
          onClick={() => setActiveTab('yearly-archive')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === 'yearly-archive'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          ১ বছরের হাজিরা রেকর্ড ও মাসিক পার্সেন্টেজ
        </button>
      </div>

      {activeTab === 'live-attendance' ? (
        <>
          {/* Header & Filter Controls */}
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ঘণ্টা ভিত্তিক ডিজিটাল ক্লাসরুম হাজিরা রেজিস্টার
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  নির্ধারিত ঘণ্টা নির্বাচন করুন। কোনো ছাত্র অনুপস্থিত থাকলে স্বয়ংক্রিয়ভাবে অভিভাবকের কাছে SMS প্রেরিত হবে।
                </p>
              </div>

              {/* Dual Date Picker (English + Arabic / Hijri) */}
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">ইংরেজি তারিখ</div>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">
                    হিজরি / আরবি তারিখ
                  </div>
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-['Amiri']">
                    {hijriFormatted}
                  </div>
                </div>
              </div>
            </div>

            {/* Class Selection & Hour/Period Selector with "ঘন্টা যোগ করার অপশন" */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">শ্রেণি / জামাত:</span>
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedClassId === cls.id
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {cls.nameBangla || cls.name}
                    </button>
                  ))}
                </div>

                {/* Add New Custom Period / Hour Button */}
                <button
                  onClick={() => setShowAddPeriodModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  নতুন ঘণ্টা / পিরিয়ড যোগ করুন
                </button>
              </div>

              {/* Hourly Periods Navigation */}
              <div className="bg-emerald-50/60 dark:bg-slate-900/80 p-3 rounded-2xl border border-emerald-200/60 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>হাজিরার ঘণ্টা নির্বাচন করুন:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {classRoutines.length > 0 ? (
                    classRoutines.map((rt) => {
                      const isSelected = selectedPeriodNumber === rt.periodNumber;
                      return (
                        <button
                          key={rt.id}
                          onClick={() => handleSelectPeriod(rt.periodNumber, rt.periodName)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-700 text-white border-emerald-600 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-100/50'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-mono">
                            {rt.periodNumber}
                          </span>
                          <span>{rt.periodName}</span>
                          <span className="text-[10px] opacity-75 font-mono">({rt.startTime})</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-500">
                      ডিফল্ট ঘণ্টা: ১ম ঘণ্টা
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllPresent}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  ১-ক্লিকে সবাইকে উপস্থিত করুন
                </button>
                <button
                  onClick={handleMarkAllAbsent}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  রিসেট
                </button>
              </div>

              <button
                onClick={handleSaveAttendance}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                হাজিরা সংরক্ষণ ও SMS প্রেরণ
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {isSaved && (
            <div className="bg-emerald-600 text-white p-3.5 rounded-2xl text-center text-xs sm:text-sm font-bold shadow-md animate-bounce">
              ✅ {customPeriodName} এর হাজিরা সফলভাবে সংরক্ষিত হয়েছে এবং অনুপস্থিত শিক্ষার্থীদের অভিভাবকদের SMS পাঠানো হয়েছে!
            </div>
          )}

          {/* Attendance Stats Bar */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-amber-300">
                {classes.find((c) => c.id === selectedClassId)?.nameBangla || classes.find((c) => c.id === selectedClassId)?.name}
              </span>
              <span>• ঘণ্টা: {customPeriodName}</span>
              <span className="text-emerald-300">• তারিখ: {attendanceDate} ({hijriFormatted})</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                মোট শিক্ষার্থী: <strong className="text-amber-300 font-mono text-sm">{classStudents.length}</strong> জন
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                উপস্থিত: <strong className="text-emerald-300 font-mono text-sm">{presentCount}</strong> জন
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                অনুপস্থিত: <strong className="text-rose-300 font-mono text-sm">{absentCount}</strong> জন (SMS প্রস্তুত)
              </div>
            </div>
          </div>

          {/* Student Attendance List */}
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="sm:hidden flex items-center justify-between bg-blue-50 dark:bg-slate-800 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-xl text-[11px] font-semibold">
              <span>📱 মোবাইলে উপস্থিতি তালিকা দেখতে ডানে স্ক্রল করুন</span>
              <span className="font-mono text-xs">👉</span>
            </div>

            {classStudents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">এই শ্রেণিতে কোন শিক্ষার্থী নেই।</div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full min-w-[680px] text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 text-center">রোল</th>
                      <th className="p-3">শিক্ষার্থীর ছবি ও নাম</th>
                      <th className="p-3">ছাত্র আইডি</th>
                      <th className="p-3">অভিভাবকের মোবাইল (SMS Target)</th>
                      <th className="p-3 text-center">উপস্থিতি স্থিতি (Toggle)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {classStudents.map((st) => {
                      const currentStatus = attendanceMap[st.id] || 'present';
                      return (
                        <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                          <td className="p-3 text-center">
                            <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold font-mono inline-flex items-center justify-center">
                              {st.roll}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={st.photoUrl}
                                alt={st.nameBangla}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">{st.nameBangla}</div>
                                <div className="text-[11px] text-slate-400">{st.nameEnglish}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{st.id}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">{st.guardianPhone}</td>

                          <td className="p-3 text-center">
                            <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                              <button
                                type="button"
                                onClick={() => toggleStudentStatus(st.id, 'present')}
                                className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition cursor-pointer ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                উপস্থিত
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleStudentStatus(st.id, 'absent')}
                                className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition cursor-pointer ${
                                  currentStatus === 'absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                অনুপস্থিত (SMS)
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* 1-Year Attendance Archive & Monthly Percentage View */
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ১ বছরের পূর্ণাঙ্গ হাজিরা রেকর্ড ও মাসিক শতকরা হার (Analytics)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                পুরো এক বছরের প্রতিটি মাসের উপস্থিতি/অনুপস্থিতি হার ও কোন কোন ঘণ্টায় অনুপস্থিত ছিল তার বিস্তারিত তালিকা
              </p>
            </div>

            {/* Student Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">শিক্ষার্থী নির্বাচন:</span>
              <select
                value={archiveSelectedStudentId}
                onChange={(e) => setArchiveSelectedStudentId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                {classStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    রোল {st.roll}: {st.nameBangla} ({st.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student 1-Year Summary Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">বার্ষিক মোট ক্লাস পিরিয়ড</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {activeArchiveStats.totalPeriods || activeArchiveStats.totalDays} টি
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs text-emerald-700 dark:text-emerald-300">মোট উপস্থিত পিরিয়ড</div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                {activeArchiveStats.presentCount} টি
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-800">
              <div className="text-xs text-rose-700 dark:text-rose-300">মোট অনুপস্থিত পিরিয়ড</div>
              <div className="text-2xl font-black text-rose-700 dark:text-rose-300 font-mono mt-1">
                {activeArchiveStats.absentCount} টি
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800">
              <div className="text-xs text-amber-700 dark:text-amber-300">বার্ষিক গড় উপস্থিতির হার</div>
              <div className="text-2xl font-black text-amber-800 dark:text-amber-300 font-mono mt-1">
                {activeArchiveStats.overallPercentage || activeArchiveStats.percentage}%
              </div>
            </div>
          </div>

          {/* Month-by-Month Percentage Breakdown Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-emerald-600" />
              মাসভিত্তিক হাজিরা পার্সেন্টেজ বিশ্লেষণ (Monthly Breakdown)
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 -mx-2 sm:mx-0">
              <table className="w-full min-w-[600px] text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                  <tr>
                    <th className="p-3">মাস</th>
                    <th className="p-3 text-center">মোট ক্লাস</th>
                    <th className="p-3 text-center">উপস্থিত</th>
                    <th className="p-3 text-center">অনুপস্থিত</th>
                    <th className="p-3">মাসিক পার্সেন্টেজ বার</th>
                    <th className="p-3 text-center">হার (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeArchiveStats.monthlyBreakdown.map((m) => (
                    <tr key={m.monthKey} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{m.monthLabel || m.monthName}</td>
                      <td className="p-3 text-center font-mono">{m.total}</td>
                      <td className="p-3 text-center font-mono text-emerald-600 font-bold">{m.present}</td>
                      <td className="p-3 text-center font-mono text-rose-600 font-bold">{m.absent}</td>
                      <td className="p-3">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              m.percentage >= 80 ? 'bg-emerald-500' : m.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${m.percentage}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {m.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Period Modal */}
      {showAddPeriodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                নতুন পিরিয়ড / ঘণ্টা যোগ করুন
              </h3>
              <button
                onClick={() => setShowAddPeriodModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewPeriod} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিষয় / কিতাবের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={newPeriodSubject}
                  onChange={(e) => setNewPeriodSubject(e.target.value)}
                  placeholder="উদাঃ তাইসীরুল মুবতাদী / তাজবীদ"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    শুরুর সময়
                  </label>
                  <input
                    type="text"
                    value={newPeriodStartTime}
                    onChange={(e) => setNewPeriodStartTime(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    শেষ সময়
                  </label>
                  <input
                    type="text"
                    value={newPeriodEndTime}
                    onChange={(e) => setNewPeriodEndTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  কক্ষ নম্বর
                </label>
                <input
                  type="text"
                  value={newPeriodRoom}
                  onChange={(e) => setNewPeriodRoom(e.target.value)}
                  placeholder="১০১"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPeriodModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl"
                >
                  ঘণ্টা যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
