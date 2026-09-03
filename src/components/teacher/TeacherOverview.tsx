import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  Users,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const TeacherOverview: React.FC = () => {
  const { currentTeacher, classes, students, attendance, homework, complaints, setActiveTeacherTab } = useMadrasa();

  if (!currentTeacher) return null;

  // Filter assigned classes
  const assignedClassesList = classes.filter((c) => currentTeacher.assignedClasses.includes(c.id));
  const myAssignedHomeworks = homework.filter((h) => h.teacherId === currentTeacher.id);
  const myComplaints = complaints.filter((c) => {
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
  });

  return (
    <div className="space-y-6">
      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">দায়িত্বপ্রাপ্ত জামাত/শ্রেণি</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {currentTeacher.assignedClasses.length} টি
            </span>
            <span className="text-[11px] text-blue-700 font-medium">ক্লাস পরিচালনা</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">প্রদত্ত সক্রিয় হোমওয়ার্ক</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {myAssignedHomeworks.length} টি
            </span>
            <span className="text-[11px] text-blue-700 font-medium">ঘণ্টাভিত্তিক অ্যাসাইনমেন্ট</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">হাজিরা গ্রহণের তারিখ</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">আজকের তারিখ</span>
            <span className="text-[11px] text-teal-700 font-medium">ডিজিটাল এটেনডেন্স সিস্টেম</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">অভিভাবকদের বার্তা</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {myComplaints.length} টি
            </span>
            <span className="text-[11px] text-amber-700 font-medium">অভিযোগ ও পরামর্শ</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Class Attendance Snapshot & Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Assigned Class Breakdown */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                আপনার দায়িত্বপ্রাপ্ত জামাতসমূহের ছাত্র ও উপস্থিতি চিত্র
              </h3>
              <p className="text-xs text-slate-500">কোন ক্লাসে কতজন ছাত্র উপস্থিত ও অনুপস্থিত</p>
            </div>
            <button
              onClick={() => setActiveTeacherTab('attendance')}
              className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              হাজিরা গ্রহণ করুন <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {assignedClassesList.map((cls) => {
              const clsStudents = students.filter((s) => s.classId === cls.id);
              const presentCount = clsStudents.filter((s) => {
                const att = attendance.find((a) => a.studentId === s.id);
                return att?.status === 'present' || !att;
              }).length;
              const absentCount = clsStudents.length - presentCount;

              return (
                <div
                  key={cls.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-bold text-blue-700">{cls.department}</span>
                    <h4 className="font-bold text-sm text-slate-900">{cls.name}</h4>
                    <p className="text-[11px] text-slate-500">মোট শিক্ষার্থী: {clsStudents.length} জন</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-xl font-bold">
                      উপস্থিত: {presentCount} জন
                    </div>
                    <div className="bg-rose-100 text-rose-800 px-3 py-1.5 rounded-xl font-bold">
                      অনুপস্থিত: {absentCount} জন
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gradient-to-br from-blue-900 to-teal-950 text-white rounded-3xl p-6 shadow-md border border-blue-700/50 space-y-4">
            <h4 className="font-bold text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-300" />
              হোমওয়ার্ক অ্যাসাইনমেন্ট
            </h4>
            <p className="text-xs text-blue-200 leading-relaxed">
              আজকের নির্ধারিত ঘণ্টার সবক, হাদিসের পৃষ্ঠা বা কিতাবের পাঠ শিক্ষার্থীদের পোর্টালে যুক্ত করুন।
            </p>
            <button
              onClick={() => setActiveTeacherTab('homework')}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition"
            >
              নতুন হোমওয়ার্ক যোগ করুন →
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">অভিভাবকের মেসেজ ইনবক্স</h4>
                <p className="text-[11px] text-slate-500">{myComplaints.length} টি বার্তা পর্যালোচনার অপেক্ষায়</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTeacherTab('complaints')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-xl text-xs transition"
            >
              মেসেজের উত্তর দিন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
