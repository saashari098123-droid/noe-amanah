import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  Users,
  GraduationCap,
  CreditCard,
  Award,
  Bell,
  MessageSquare,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Settings,
  KeyRound,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const {
    students,
    teachers,
    classes,
    feePayments,
    financialTransactions,
    admissionApplications,
    complaints,
    attendance,
    setActiveAdminTab,
  } = useMadrasa();

  // Financial Stats
  const approvedFees = feePayments.filter((f) => f.status === 'approved');
  const totalCollectedAmount = approvedFees.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingFees = feePayments.filter((f) => f.status === 'pending');
  const pendingFeeAmount = pendingFees.reduce((acc, curr) => acc + curr.amount, 0);

  // Accounts Overview
  const totalIncome = financialTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalExpense = financialTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  // Admission Stats
  const pendingAdmissions = admissionApplications.filter((a) => a.status === 'submitted');

  // Attendance Stats for Today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const activeAttendanceRecords = todayAttendance.length > 0 ? todayAttendance : attendance;
  const todayPresent = activeAttendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
  const todayAbsent = activeAttendanceRecords.filter((a) => a.status === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Top Settings Quick Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-blue-50 to-amber-50 border border-amber-300/80 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              স্কুল এন্ড কলেজ প্রোফাইল, বিকাশ/নগদ নম্বর ও অ্যাডমিন পাসওয়ার্ড সেটিংস
            </h4>
            <p className="text-xs text-slate-600">
              প্রতিষ্ঠানের নাম, ঠিকানা, মুহতামিম বাণী, নামাজের সময়সূচী ও পাসওয়ার্ড পরিবর্তন করতে সেটিংস ট্যাবে যান।
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm"
        >
          <Settings className="w-4 h-4 text-amber-400" />
          ⚙️ সেটিংস ওপেন করুন
        </button>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => setActiveAdminTab('students')}
          className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          role="button"
          title="ছাত্র তালিকা ও আইডি ব্যবস্থাপনা দেখুন"
        >
          <div>
            <span className="text-xs text-slate-400 font-semibold block group-hover:text-blue-600 transition-colors">মোট নিবন্ধিত ছাত্র</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {students.length} জন
            </span>
            <span className="text-[11px] text-blue-700 font-medium">
              {classes.length} টি জামাত / বিভাগ →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => setActiveAdminTab('teachers')}
          className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          role="button"
          title="শিক্ষক ও পাসওয়ার্ড ব্যবস্থাপনা দেখুন"
        >
          <div>
            <span className="text-xs text-slate-400 font-semibold block group-hover:text-blue-600 transition-colors">কর্মরত ওলামা ও শিক্ষক</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {teachers.length} জন
            </span>
            <span className="text-[11px] text-blue-700 font-medium">তালিকা ও লগইন তথ্য →</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Total Collected Fees */}
        <div
          onClick={() => setActiveAdminTab('fees')}
          className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
          role="button"
          title="বেতন ও ফি অনুমোদন কিউ দেখুন"
        >
          <div>
            <span className="text-xs text-slate-400 font-semibold block group-hover:text-amber-600 transition-colors">মোট আদায়কৃত ফি (অনুমোদিত)</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              ৳{totalCollectedAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">
              অপেক্ষমাণ: ৳{pendingFeeAmount.toLocaleString('en-IN')} ({pendingFees.length} টি) →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Online Admissions */}
        <div
          onClick={() => setActiveAdminTab('admissions')}
          className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
          role="button"
          title="অনলাইন ভর্তি আবেদন তালিকা ও অনুমোদন দেখুন"
        >
          <div>
            <span className="text-xs text-slate-400 font-semibold block group-hover:text-purple-600 transition-colors">অনলাইন ভর্তি আবেদন</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {admissionApplications.length} টি
            </span>
            <span className="text-[11px] text-purple-700 font-medium">
              নতুন আবেদন: {pendingAdmissions.length} টি →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Madrasa Accounts & Finance Quick Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-emerald-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                হিসাব বিভাগ
              </span>
              <span className="text-xs text-emerald-300 font-semibold">আয়-ব্যয় ও ক্যাশ স্থিতি</span>
            </div>
            <h4 className="text-lg sm:text-xl font-black text-white">
              বর্তমান মোট ফান্ড স্থিতি: <span className="text-amber-400 font-mono">৳ {netBalance.toLocaleString('bn-BD')}</span>
            </h4>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-emerald-300 font-mono">
                <ArrowDownLeft className="w-3.5 h-3.5" /> মোট আয়: ৳{totalIncome.toLocaleString('bn-BD')}
              </span>
              <span className="flex items-center gap-1 text-rose-300 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5" /> মোট ব্যয়: ৳{totalExpense.toLocaleString('bn-BD')}
              </span>
              <span className="text-slate-400">
                ({financialTransactions.length} টি ভাউচার এন্ট্রি)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveAdminTab('finance')}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md shrink-0"
        >
          <Wallet className="w-4 h-4" />
          <span>আয়-ব্যয় ড্যাশবোর্ড খুলুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Actionable Alerts & Review Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Fee Payments Queue */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                বেতন ও ফি অনুমোদন অপেক্ষমাণ কিউ ({pendingFees.length})
              </h3>
              <p className="text-xs text-slate-500">বিকাশ ও নগদে প্রেরিত লেনদেন যাচাই ও অনুমোদন</p>
            </div>
            <button
              onClick={() => setActiveAdminTab('fees')}
              className="text-xs text-amber-800 font-bold hover:underline flex items-center gap-1"
            >
              সবগুলো দেখুন <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingFees.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              আলহামদুলিল্লাহ! কোন অপেক্ষমাণ পেমেন্ট নেই।
            </div>
          ) : (
            <div className="space-y-3">
              {pendingFees.slice(0, 3).map((fee) => (
                <div
                  key={fee.id}
                  className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{fee.studentName} ({fee.className})</div>
                    <div className="text-[11px] text-slate-500">
                      মাধ্যম: <strong className="uppercase">{fee.paymentMethod}</strong> • TrxID:{' '}
                      <strong className="font-mono text-blue-800">{fee.transactionId}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-sm text-slate-900">৳{fee.amount}</div>
                    <span className="text-[10px] text-amber-700 font-semibold">{fee.month}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: New Admission Applications Queue */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                নতুন ভর্তি আবেদন পর্যালোচনা ({pendingAdmissions.length})
              </h3>
              <p className="text-xs text-slate-500">অনলাইনে জমা হওয়া প্রাথমিক ছাত্র ভর্তি ফরম</p>
            </div>
            <button
              onClick={() => setActiveAdminTab('admissions')}
              className="text-xs text-purple-800 font-bold hover:underline flex items-center gap-1"
            >
              সবগুলো দেখুন <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingAdmissions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              নতুন কোন ভর্তি আবেদন অপেক্ষমাণ নেই।
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAdmissions.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{app.applicantNameBangla}</div>
                    <div className="text-[11px] text-slate-500">
                      ভর্তিচ্ছু জামাত: <strong>{app.applyingClassName}</strong> • মোবাঃ {app.guardianPhone}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-purple-200 text-purple-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                      {app.applicationNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Quick Action Navigation Grid */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-800" />
          জরুরি প্রশাসনিক নিয়ন্ত্রণ ও কুইক শর্টকাট
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveAdminTab('classes')}
            className="p-4 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="font-bold text-blue-950 block text-sm">জামাত ও কিতাব</span>
              <span className="text-[11px] text-blue-700">সিলেবাস ও কিতাব নির্ধারণ</span>
            </div>
            <BookOpen className="w-5 h-5 text-blue-800 group-hover:scale-110 transition" />
          </button>

          <button
            onClick={() => setActiveAdminTab('students')}
            className="p-4 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="font-bold text-blue-950 block text-sm">ছাত্র ও আইডি কার্ড</span>
              <span className="text-[11px] text-blue-700">ইউনিক আইডি ও তথ্য এন্ট্রি</span>
            </div>
            <Users className="w-5 h-5 text-blue-800 group-hover:scale-110 transition" />
          </button>

          <button
            onClick={() => setActiveAdminTab('results')}
            className="p-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="font-bold text-amber-950 block text-sm">পরীক্ষার ফলাফল</span>
              <span className="text-[11px] text-amber-700">নম্বর এন্ট্রি ও মার্কশিট প্রিন্ট</span>
            </div>
            <Award className="w-5 h-5 text-amber-800 group-hover:scale-110 transition" />
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className="p-4 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="font-bold text-purple-950 block text-sm">প্রোফাইল ও পাসওয়ার্ড</span>
              <span className="text-[11px] text-purple-700">ঠিকানা, বিকাশ ও পাসওয়ার্ড বদল</span>
            </div>
            <KeyRound className="w-5 h-5 text-purple-800 group-hover:scale-110 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
