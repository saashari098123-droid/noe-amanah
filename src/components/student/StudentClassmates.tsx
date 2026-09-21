import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
  BarChart3,
  Percent,
  History,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { getHijriDateString } from '../../utils/hijriDate';

// Helper for local date string YYYY-MM-DD
const getLocalTodayDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const StudentClassmates: React.FC = () => {
  const { students, classes, attendance, currentStudent, getStudentAttendanceStats, routines } = useMadrasa();

  // Active view: 'class-roster' or 'my-yearly-attendance'
  const [viewMode, setViewMode] = useState<'class-roster' | 'my-yearly-attendance'>('class-roster');

  // Academic Year (default current year 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  // Class filter (default current student's class)
  const [selectedClassId, setSelectedClassId] = useState<string>(
    currentStudent?.classId || classes[0]?.id || 'cls-madani-1'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected date for attendance checking in class roster
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(getLocalTodayDate());
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('all');

  // Personal log filter (in my-yearly-attendance)
  const [personalLogStatusFilter, setPersonalLogStatusFilter] = useState<'all' | 'absent' | 'present' | 'leave'>('all');

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Filter students by year & class
  const classStudents = students.filter(
    (s) =>
      s.classId === selectedClassId &&
      s.year === selectedYear &&
      (s.nameBangla.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Lookup attendance record for a student on the selected date
  const getAttendanceRecordForStudent = (studentId: string, date: string) => {
    const normId = studentId.trim().toLowerCase();
    const records = attendance.filter(
      (a) => a.studentId?.trim().toLowerCase() === normId && a.date === date
    );
    if (records.length === 0) return null;
    if (selectedPeriodFilter !== 'all') {
      const pNum = Number(selectedPeriodFilter);
      return records.find((r) => Number(r.periodNumber || 1) === pNum) || null;
    }
    // Prioritize absent record if any, otherwise return latest period
    const absentRec = records.find((r) => r.status === 'absent');
    if (absentRec) return absentRec;
    records.sort((a, b) => Number(b.periodNumber || 1) - Number(a.periodNumber || 1));
    return records[0];
  };

  const totalInClass = classStudents.length;
  const recordedStudents = classStudents.map((s) => ({
    student: s,
    record: getAttendanceRecordForStudent(s.id, selectedAttendanceDate),
  }));

  const presentCount = recordedStudents.filter((item) => item.record?.status === 'present').length;
  const absentCount = recordedStudents.filter((item) => item.record?.status === 'absent').length;
  const lateCount = recordedStudents.filter((item) => item.record?.status === 'late').length;
  const leaveCount = recordedStudents.filter((item) => item.record?.status === 'leave').length;
  const pendingCount = recordedStudents.filter((item) => !item.record).length;

  // Student 1-Year Attendance Stats
  const studentStats = getStudentAttendanceStats(currentStudent?.id || '');

  // Class routines for current student
  const studentClassRoutines = routines.filter((r) => r.classId === (currentStudent?.classId || selectedClassId));

  // Personal detailed attendance logs for current student
  const myAttendanceLogs = attendance
    .filter((a) => a.studentId?.trim().toLowerCase() === (currentStudent?.id || '').trim().toLowerCase())
    .sort((a, b) => {
      const dateCmp = (b.date || '').localeCompare(a.date || '');
      if (dateCmp !== 0) return dateCmp;
      return Number(b.periodNumber || 1) - Number(a.periodNumber || 1);
    });

  const filteredMyLogs = myAttendanceLogs.filter((log) => {
    if (personalLogStatusFilter === 'all') return true;
    return log.status === personalLogStatusFilter;
  });

  const setDateToToday = () => setSelectedAttendanceDate(getLocalTodayDate());
  const setDateToYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedAttendanceDate(`${y}-${m}-${day}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Toggle: Classmates List vs 1-Year Personal Attendance Archive */}
      <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setViewMode('class-roster')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
            viewMode === 'class-roster'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          সহপাঠী ও ক্লাসরুম তালিকা
        </button>

        <button
          onClick={() => setViewMode('my-yearly-attendance')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
            viewMode === 'my-yearly-attendance'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          আমার ১ বছরের হাজিরা ও লগ
        </button>
      </div>

      {viewMode === 'class-roster' ? (
        <>
          {/* Filters Bar: Year, Class & Attendance Date Selector */}
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  শ্রেণির সহপাঠীদের তালিকা ও ডিজিটাল ক্লাসরুম হাজিরা
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  বর্তমান শিক্ষাবর্ষ {selectedYear} ও আপনার শ্রেণির শিক্ষার্থীদের উপস্থিতি তথ্য
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">শিক্ষাবর্ষ:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={2026}>২০২৬ শিক্ষাবর্ষ (বর্তমান)</option>
                  <option value={2025}>২০২৫ শিক্ষাবর্ষ</option>
                  <option value={2024}>২০২৪ শিক্ষাবর্ষ</option>
                </select>
              </div>
            </div>

            {/* Attendance Date & Period Selector */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  হাজিরার তারিখ:
                </span>
                <input
                  type="date"
                  value={selectedAttendanceDate}
                  onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1 text-xs font-bold font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={setDateToToday}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedAttendanceDate === getLocalTodayDate()
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  আজ (Today)
                </button>
                <button
                  onClick={setDateToYesterday}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  গতকাল
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">ঘণ্টা ফিল্টার:</span>
                <select
                  value={selectedPeriodFilter}
                  onChange={(e) => setSelectedPeriodFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="all">সব ঘণ্টা (All Periods)</option>
                  <option value="1">১ম ঘণ্টা</option>
                  <option value="2">২য় ঘণ্টা</option>
                  <option value="3">৩য় ঘণ্টা</option>
                  <option value="4">৪র্থ ঘণ্টা</option>
                  <option value="5">৫ম ঘণ্টা</option>
                  <option value="6">৬ষ্ঠ ঘণ্টা</option>
                </select>
              </div>
            </div>

            {/* Class Selection Chips & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">শ্রেণি / জামাত:</span>
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedClassId === cls.id
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cls.nameBangla || cls.name}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Attendance Summary Strip */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span className="font-semibold">
                {selectedClass?.nameBangla || selectedClass?.name} • তারিখ: {selectedAttendanceDate} উপস্থিতি সারসংক্ষেপ:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                মোট ছাত্র: <strong className="text-amber-300 font-mono text-sm">{totalInClass}</strong> জন
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                উপস্থিত: <strong className="text-emerald-300 font-mono text-sm">{presentCount}</strong> জন
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                অনুপস্থিত: <strong className="text-rose-300 font-mono text-sm">{absentCount}</strong> জন
              </div>
              {lateCount > 0 && (
                <div className="bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                  বিলম্ব: <strong className="text-amber-300 font-mono text-sm">{lateCount}</strong> জন
                </div>
              )}
              {pendingCount > 0 && (
                <div className="bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                  হাজিরা বাকি: <strong className="text-slate-300 font-mono text-sm">{pendingCount}</strong> জন
                </div>
              )}
              <div className="bg-amber-400 text-slate-950 px-3 py-1 rounded-xl font-bold">
                উপস্থিতি হার: {presentCount + absentCount > 0 ? ((presentCount / (presentCount + absentCount)) * 100).toFixed(0) : 100}%
              </div>
            </div>
          </div>

          {/* Classmates Grid & Attendance Table */}
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
            {classStudents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                এই শ্রেণিতে কোন শিক্ষার্থী পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 text-center">রোল</th>
                      <th className="p-3">শিক্ষার্থীর ছবি ও নাম</th>
                      <th className="p-3">ছাত্র আইডি</th>
                      <th className="p-3">অভিভাবকের তথ্য</th>
                      <th className="p-3">আবাসন</th>
                      <th className="p-3 text-center">ডিজিটাল হাজিরা স্ট্যাটাস ({selectedAttendanceDate})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {classStudents.map((st) => {
                      const record = getAttendanceRecordForStudent(st.id, selectedAttendanceDate);
                      const isCurrentUser = currentStudent?.id.trim().toLowerCase() === st.id.trim().toLowerCase();

                      return (
                        <tr
                          key={st.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800 transition ${
                            isCurrentUser ? 'bg-emerald-50/60 dark:bg-emerald-950/40 font-semibold' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold font-mono inline-flex items-center justify-center">
                              {st.roll}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                src={st.photoUrl}
                                alt={st.nameBangla}
                                type="student"
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                  {st.nameBangla}
                                  {isCurrentUser && (
                                    <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-normal">
                                      আপনি
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">{st.nameEnglish}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{st.id}</td>

                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            <div>পিতা: {st.fatherName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{st.guardianPhone}</div>
                          </td>

                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                              {st.residentialStatus === 'residential'
                                ? 'আবাসিক'
                                : st.residentialStatus === 'non-residential'
                                ? 'অনাবাসিক'
                                : 'ডে-কেয়ার'}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            {record ? (
                              record.status === 'present' ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  উপস্থিত ({record.periodName || `${record.periodNumber}ম ঘণ্টা`})
                                </span>
                              ) : record.status === 'absent' ? (
                                <span className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold px-2.5 py-1 rounded-full text-[11px]">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  অনুপস্থিত ({record.periodName || `${record.periodNumber}ম ঘণ্টা`})
                                </span>
                              ) : record.status === 'late' ? (
                                <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-1 rounded-full text-[11px]">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  বিলম্ব (Late)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold px-2.5 py-1 rounded-full text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                  ছুটি (Leave)
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium px-2.5 py-1 rounded-full text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                হাজিরা বাকি (Pending)
                              </span>
                            )}
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
        /* Personal 1-Year Attendance Report with Monthly Percentage and Full Log History */
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              আপনার পূর্ণ ১ বছরের হাজিরা ও মাসিক উপস্থিতি শতকরা হার
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              পুরো শিক্ষাবর্ষের মাসভিত্তিক উপস্থিতির শতকরা হার এবং ঘণ্টাভিত্তিক উপস্থিতি রেকর্ড
            </p>
          </div>

          {/* Student 1-Year Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">বার্ষিক মোট ক্লাসের ঘণ্টা</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {studentStats.totalPeriods || studentStats.totalDays} টি
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs text-emerald-700 dark:text-emerald-300">মোট উপস্থিত ঘণ্টা</div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                {studentStats.presentCount} টি
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-800">
              <div className="text-xs text-rose-700 dark:text-rose-300">মোট অনুপস্থিত ঘণ্টা</div>
              <div className="text-2xl font-black text-rose-700 dark:text-rose-300 font-mono mt-1">
                {studentStats.absentCount} টি
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800">
              <div className="text-xs text-amber-700 dark:text-amber-300">বার্ষিক উপস্থিতির গড় হার</div>
              <div className="text-2xl font-black text-amber-800 dark:text-amber-300 font-mono mt-1">
                {studentStats.overallPercentage || studentStats.percentage}%
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-emerald-600" />
              মাসভিত্তিক উপস্থিতি শতকরা হার বিশ্লেষণ (Monthly Attendance Breakdown)
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                  <tr>
                    <th className="p-3">মাস</th>
                    <th className="p-3 text-center">মোট পিরিয়ড</th>
                    <th className="p-3 text-center">উপস্থিত</th>
                    <th className="p-3 text-center">অনুপস্থিত</th>
                    <th className="p-3">মাসিক পার্সেন্টেজ বার</th>
                    <th className="p-3 text-center">হার (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentStats.monthlyBreakdown.map((m) => (
                    <tr key={m.monthKey} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{m.monthLabel || m.monthName}</td>
                      <td className="p-3 text-center font-mono">{m.total}</td>
                      <td className="p-3 text-center font-mono text-emerald-600 font-bold">{m.present}</td>
                      <td className="p-3 text-center font-mono text-rose-600 font-bold">{m.absent}</td>
                      <td className="p-3">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              m.percentage >= 80
                                ? 'bg-emerald-500'
                                : m.percentage >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
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

          {/* Detailed Personal Attendance History Log */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-600" />
                  আমার সকল হাজিরার তারিখভিত্তিক বিস্তারিত লগ ({filteredMyLogs.length}টি রেকর্ড)
                </h3>
                <p className="text-[11px] text-slate-500">
                  শিক্ষকদের গৃহীত প্রতিটি ঘণ্টার উপস্থিতি বা অনুপস্থিতি বিস্তারিত দেখুন
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setPersonalLogStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    personalLogStatusFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  সব ({myAttendanceLogs.length})
                </button>
                <button
                  onClick={() => setPersonalLogStatusFilter('absent')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    personalLogStatusFilter === 'absent'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  অনুপস্থিত ({myAttendanceLogs.filter((l) => l.status === 'absent').length})
                </button>
                <button
                  onClick={() => setPersonalLogStatusFilter('present')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    personalLogStatusFilter === 'present'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  উপস্থিত ({myAttendanceLogs.filter((l) => l.status === 'present').length})
                </button>
              </div>
            </div>

            {filteredMyLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                কোন হাজিরা রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">তারিখ ও সময়</th>
                      <th className="p-3">ঘণ্টা / বিষয়</th>
                      <th className="p-3 text-center">স্ট্যাটাস</th>
                      <th className="p-3">দায়িত্বরত শিক্ষক</th>
                      <th className="p-3 text-center">SMS অ্যালার্ট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredMyLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">{log.date}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{log.timestamp || 'সকাল'}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {log.periodName || `${log.periodNumber}ম ঘণ্টা`}
                          </span>
                          <div className="text-[10px] text-slate-400">{log.className}</div>
                        </td>
                        <td className="p-3 text-center">
                          {log.status === 'present' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              উপস্থিত
                            </span>
                          ) : log.status === 'absent' ? (
                            <span className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              অনুপস্থিত
                            </span>
                          ) : log.status === 'late' ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              বিলম্ব
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold px-2.5 py-1 rounded-full text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                              ছুটি
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {log.recordedBy || 'শ্রেণি শিক্ষক'}
                        </td>
                        <td className="p-3 text-center">
                          {log.smsAlertSent ? (
                            <span className="text-rose-600 font-bold text-[10px] bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                              SMS প্রেরিত ✓
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Daily Class Routine of this student */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              আপনার শ্রেণির দৈনিক ক্লাস ও ঘণ্টাভিত্তিক রুটিন
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {studentClassRoutines.map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-mono">
                      {r.periodNumber}ম ঘণ্টা
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">{r.startTime}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{r.subjectName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">উস্তাদ: {r.teacherName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

