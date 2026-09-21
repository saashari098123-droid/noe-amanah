import React, { useState, useMemo, useRef } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Search,
  Plus,
  ArrowRight,
  Filter,
  CreditCard,
  Building2,
  UserCheck,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  Trash2,
  Edit2,
  History,
  AlertCircle,
  Eye,
  Send,
  X,
  TrendingUp,
} from 'lucide-react';
import { useMadrasa } from '../../context/MadrasaContext';
import { Teacher, FinancialTransaction, PaymentAccountMethod, TeacherSalaryScale } from '../../types';
import { MADRASA_1447_1448_MONTHS, getTeacherBaseSalaryForMonth } from '../../utils/feeCalculator';
import { printHtmlElement } from '../../utils/printHelper';
import { numberToBanglaWords } from '../../utils/numberToBanglaWords';
import { TeacherPaySlipModal } from '../common/TeacherPaySlipModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const AdminTeacherSalaries: React.FC = () => {
  const {
    teachers,
    updateTeacher,
    financialTransactions,
    deleteFinancialTransaction,
    generateBulkSalaryVouchers,
    payTeacherSalary,
    madrasaInfo,
    setActiveAdminTab,
  } = useMadrasa();

  // Selected Month state - default to current month "রবিউল আউয়াল ১৪৪৮" or first
  const [selectedMonth, setSelectedMonth] = useState<string>('রবিউল আউয়াল ১৪৪৮');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Modals state
  const [payModalTeacher, setPayModalTeacher] = useState<Teacher | null>(null);
  const [payModalData, setPayModalData] = useState({
    baseSalary: 18000,
    allowance: 0,
    deduction: 0,
    paymentMethod: 'cash' as PaymentAccountMethod,
    bankAccountOrNumber: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [activePaySlip, setActivePaySlip] = useState<{
    teacher: Teacher;
    transaction: FinancialTransaction;
    month: string;
  } | null>(null);

  const [historyTeacher, setHistoryTeacher] = useState<Teacher | null>(null);
  const [editingSalaryTeacher, setEditingSalaryTeacher] = useState<Teacher | null>(null);
  const [newSalaryValue, setNewSalaryValue] = useState<number>(18000);
  const [salaryEffectiveMonth, setSalaryEffectiveMonth] = useState<string>('মুহাররম ১৪৪৮');
  const [salaryIncrementNote, setSalaryIncrementNote] = useState<string>('');
  const [salaryApplyScope, setSalaryApplyScope] = useState<'from_effective_month' | 'all_session_months'>('from_effective_month');
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [deleteVoucherTarget, setDeleteVoucherTarget] = useState<{
    id: string;
    teacherName: string;
    month: string;
    amount: number;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const sheetPrintRef = useRef<HTMLDivElement>(null);

  // Filter all salary transactions
  const salaryTransactions = useMemo(() => {
    return financialTransactions.filter((t) => t.category === 'teacher_salary');
  }, [financialTransactions]);

  // Map each teacher to their payment transaction for the selected month
  const teacherSalaryList = useMemo(() => {
    return teachers.map((teacher) => {
      // Find matching transaction by referenceId or title/partyName
      const txn = salaryTransactions.find((t) => {
        const matchesMonth =
          (t.salaryMonth && t.salaryMonth === selectedMonth) ||
          t.title.includes(selectedMonth) ||
          (t.description && t.description.includes(selectedMonth));

        const matchesTeacher =
          t.referenceId === teacher.id ||
          t.title.includes(teacher.nameBangla) ||
          (t.partyName && t.partyName.includes(teacher.nameBangla));

        return matchesMonth && matchesTeacher;
      });

      const isPaid = !!txn;
      const baseSalary = getTeacherBaseSalaryForMonth(teacher, selectedMonth, txn);
      const paidAmount = txn ? txn.amount : 0;

      return {
        teacher,
        isPaid,
        transaction: txn,
        baseSalary,
        paidAmount,
      };
    });
  }, [teachers, salaryTransactions, selectedMonth]);

  // Filtered by search and status
  const filteredTeachers = useMemo(() => {
    return teacherSalaryList.filter((item) => {
      const matchesSearch =
        item.teacher.nameBangla.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.teacher.nameEnglish && item.teacher.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.teacher.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.teacher.phone && item.teacher.phone.includes(searchQuery)) ||
        item.teacher.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'paid'
          ? item.isPaid
          : !item.isPaid;

      return matchesSearch && matchesStatus;
    });
  }, [teacherSalaryList, searchQuery, statusFilter]);

  // Statistics for selected month
  const stats = useMemo(() => {
    const totalTeachers = teachers.length;
    const totalBudget = teachers.reduce((sum, t) => sum + getTeacherBaseSalaryForMonth(t, selectedMonth), 0);
    const paidList = teacherSalaryList.filter((item) => item.isPaid);
    const paidCount = paidList.length;
    const paidTotalAmount = paidList.reduce((sum, item) => sum + item.paidAmount, 0);
    const unpaidCount = totalTeachers - paidCount;
    const unpaidBudget = teacherSalaryList
      .filter((item) => !item.isPaid)
      .reduce((sum, item) => sum + item.baseSalary, 0);

    return {
      totalTeachers,
      totalBudget,
      paidCount,
      paidTotalAmount,
      unpaidCount,
      unpaidBudget,
    };
  }, [teachers, teacherSalaryList, selectedMonth]);

  // Open Pay Modal
  const handleOpenPayModal = (teacher: Teacher) => {
    const expectedBaseSalary = getTeacherBaseSalaryForMonth(teacher, selectedMonth);
    setPayModalTeacher(teacher);
    setPayModalData({
      baseSalary: expectedBaseSalary,
      allowance: 0,
      deduction: 0,
      paymentMethod: 'cash',
      bankAccountOrNumber: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Open Edit Salary Modal
  const handleOpenEditSalary = (teacher: Teacher) => {
    const currentMonthSalary = getTeacherBaseSalaryForMonth(teacher, selectedMonth);
    setEditingSalaryTeacher(teacher);
    setNewSalaryValue(currentMonthSalary || teacher.salary || 18000);
    setSalaryEffectiveMonth(selectedMonth);
    setSalaryIncrementNote(
      selectedMonth === 'মুহাররম ১৪৪৮'
        ? 'মুহাররম ১৪৪৮ নতুন সেশন ইনক্রিমেন্ট'
        : `${selectedMonth} স্কেল পরিবর্তন`
    );
    setSalaryApplyScope('from_effective_month');
  };

  // Submit Salary Payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalTeacher) return;

    const netAmount =
      Number(payModalData.baseSalary) +
      Number(payModalData.allowance || 0) -
      Number(payModalData.deduction || 0);

    if (payTeacherSalary) {
      const txn = payTeacherSalary({
        teacherId: payModalTeacher.id,
        month: selectedMonth,
        baseSalary: Number(payModalData.baseSalary),
        allowance: Number(payModalData.allowance || 0),
        deduction: Number(payModalData.deduction || 0),
        netAmount: netAmount > 0 ? netAmount : 0,
        paymentMethod: payModalData.paymentMethod,
        bankAccountOrNumber: payModalData.bankAccountOrNumber,
        notes: payModalData.notes,
        date: payModalData.date,
      });

      // Automatically open pay slip for instant printing if requested
      setActivePaySlip({
        teacher: payModalTeacher,
        transaction: txn,
        month: selectedMonth,
      });
    }

    setPayModalTeacher(null);
  };

  // Bulk Payment Execution
  const handleExecuteBulkPayment = () => {
    if (generateBulkSalaryVouchers) {
      generateBulkSalaryVouchers(selectedMonth);
    }
    setIsBulkConfirmOpen(false);
  };

  // Update teacher salary & salary scale history
  const handleSaveTeacherSalary = () => {
    if (!editingSalaryTeacher) return;
    const newAmount = Number(newSalaryValue) || 18000;

    let updatedHistory: TeacherSalaryScale[] = editingSalaryTeacher.salaryHistory
      ? [...editingSalaryTeacher.salaryHistory]
      : [];

    if (salaryApplyScope === 'all_session_months') {
      // Overwrite all history or reset to base
      updatedHistory = [
        {
          id: `sh-${Date.now()}`,
          effectiveFromMonth: MADRASA_1447_1448_MONTHS[0].displayMonth,
          amount: newAmount,
          note: salaryIncrementNote || 'সম্পূর্ণ সেশনের নির্ধারিত মূল বেতন',
          updatedAt: new Date().toISOString().split('T')[0],
        },
      ];
    } else {
      // From effective month
      const effectiveIdx = MADRASA_1447_1448_MONTHS.findIndex(
        (m) => m.displayMonth === salaryEffectiveMonth || m.fullName.includes(salaryEffectiveMonth)
      );

      // If no history exists and effective month is not the first month, preserve previous salary for first month
      if (updatedHistory.length === 0 && effectiveIdx > 0) {
        const previousAmount = editingSalaryTeacher.salary || 18000;
        updatedHistory.push({
          id: `sh-base-${Date.now()}`,
          effectiveFromMonth: MADRASA_1447_1448_MONTHS[0].displayMonth,
          amount: previousAmount,
          note: 'সেশন প্রারম্ভিক স্কেল',
          updatedAt: new Date().toISOString().split('T')[0],
        });
      }

      // Check if an entry for this exact effective month already exists
      const existingIdx = updatedHistory.findIndex(
        (sh) => sh.effectiveFromMonth === salaryEffectiveMonth
      );

      if (existingIdx !== -1) {
        updatedHistory[existingIdx] = {
          ...updatedHistory[existingIdx],
          amount: newAmount,
          note: salaryIncrementNote || updatedHistory[existingIdx].note,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      } else {
        updatedHistory.push({
          id: `sh-${Date.now()}`,
          effectiveFromMonth: salaryEffectiveMonth,
          amount: newAmount,
          note: salaryIncrementNote || `${salaryEffectiveMonth} হতে কার্যকর ইনক্রিমেন্ট`,
          updatedAt: new Date().toISOString().split('T')[0],
        });
      }
    }

    updateTeacher({
      ...editingSalaryTeacher,
      salary: newAmount,
      salaryHistory: updatedHistory,
    });

    setEditingSalaryTeacher(null);
  };

  // Print Salary Sheet
  const handlePrintSalarySheet = () => {
    if (sheetPrintRef.current) {
      printHtmlElement(sheetPrintRef.current, {
        title: `মাসিক-শিক্ষক-বেতন-শিট-${selectedMonth}`,
        landscape: true,
      });
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['আইডি', 'নাম', 'পদবি', 'মোবাইল', 'মাসিক হাদিয়া', 'পরিশোধ অবস্থা', 'পরিশোধিত টাকা', 'ভাউচার নং', 'তারিখ'];
    const rows = teacherSalaryList.map((item) => [
      item.teacher.id,
      item.teacher.nameBangla,
      item.teacher.designation,
      item.teacher.phone,
      item.baseSalary,
      item.isPaid ? 'পরিশোধিত' : 'বকেয়া',
      item.paidAmount,
      item.transaction?.voucherNumber || '-',
      item.transaction?.date || '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `উস্তাদদের_বেতন_রেজিস্টার_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold rounded-full">
                হাদিয়া ও পেরোল ব্যবস্থাপনা
              </span>
              <span className="text-xs text-emerald-200">১৪৪৭-১৪৪৮ সেশন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Banknote className="w-8 h-8 text-amber-400" />
              উস্তাদ ও শিক্ষকবৃন্দের হাদিয়া/বেতন রেজিস্টার
            </h2>
            <p className="text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              মাদরাসার সম্মানিত আসাতাজায়ে কেরামের মাসিক নির্ধারিত হাদিয়া প্রদান, বোনাস ও কর্তন হিসাব, এক ক্লিকে বাল্ক বেতন পরিশোধ এবং রসিদ ও পে-স্লিপ প্রিন্ট করুন।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBulkConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              এক ক্লিকে সবার বেতন পরিশোধ
            </button>
            <button
              onClick={handlePrintSalarySheet}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl border border-emerald-600/60 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              বেতন শিট প্রিন্ট
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 shadow-xs transition cursor-pointer"
              title="এক্সেল ডাউনলোড"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              এক্সেল
            </button>
          </div>
        </div>
      </div>

      {/* Month Selector Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-sm text-slate-900">
              হিসাবের মাস নির্বাচন করুন:
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
              {selectedMonth}
            </span>
          </div>

          <div className="text-xs text-slate-500">
            ১৪৪৭ জিলকদ হতে ১৪৪৮ রমজান সেশনের নির্ধারিত মাসসমূহ
          </div>
        </div>

        {/* Month Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {MADRASA_1447_1448_MONTHS.map((m) => {
            const isSelected = selectedMonth === m.displayMonth;
            return (
              <button
                key={m.index}
                onClick={() => setSelectedMonth(m.displayMonth)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{m.displayMonth}</span>
                {m.badgeNote && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {m.badgeNote}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Stat Overview Cards for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Teachers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">মোট উস্তাদ ও শিক্ষক</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">
              {stats.totalTeachers} <span className="text-xs font-normal text-slate-500">জন</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">প্রতিষ্ঠানের নিয়মিত শিক্ষক</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Monthly Salary Budget */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">মাসিক নির্ধারিত বাজেট</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">
              ৳ {stats.totalBudget.toLocaleString('bn-BD')}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">সর্বমোট মাসিক হাদিয়া</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Paid This Month */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-800">পরিশোধিত হাদিয়া ({selectedMonth})</p>
            <h4 className="text-2xl font-black text-emerald-700 mt-1">
              ৳ {stats.paidTotalAmount.toLocaleString('bn-BD')}
            </h4>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {stats.paidCount} জনের পরিশোধ সম্পন্ন
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Pending This Month */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200 bg-rose-50/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-800">বকেয়া / প্রদেয় ({selectedMonth})</p>
            <h4 className="text-2xl font-black text-rose-700 mt-1">
              ৳ {stats.unpaidBudget.toLocaleString('bn-BD')}
            </h4>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              {stats.unpaidCount} জনের বাকি রয়েছে
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="উস্তাদের নাম, পদবি বা মোবাইল..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">ফিল্টার:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সকল ({teacherSalaryList.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'paid'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            পরিশোধিত ({stats.paidCount})
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'unpaid'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            বকেয়া ({stats.unpaidCount})
          </button>
        </div>
      </div>

      {/* Main Teacher Salary Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-3 px-4">উস্তাদ / শিক্ষক</th>
                <th className="py-3 px-4">পদবি ও বিভাগ</th>
                <th className="py-3 px-4 text-right">নির্ধারিত হাদিয়া</th>
                <th className="py-3 px-4 text-center">পরিশোধ অবস্থা ({selectedMonth})</th>
                <th className="py-3 px-4">পরিশোধের বিবরণ</th>
                <th className="py-3 px-4 text-center">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    কোনো উস্তাদ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredTeachers.map(({ teacher, isPaid, transaction, baseSalary, paidAmount }) => {
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/70 transition">
                      {/* Teacher Profile */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={teacher.photoUrl}
                            alt={teacher.nameBangla}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {teacher.nameBangla}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="font-mono">{teacher.id}</span>
                              <span>•</span>
                              <span>{teacher.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {teacher.designation}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {teacher.assignedSubjects?.slice(0, 2).join(', ') || 'পাঠদান'}
                        </span>
                      </td>

                      {/* Assigned Base Salary */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-900 text-sm">
                          ৳ {baseSalary.toLocaleString('bn-BD')}
                          <button
                            onClick={() => handleOpenEditSalary(teacher)}
                            title="নির্ধারিত বেতন ও ইনক্রিমেন্ট স্কেল পরিচালনা করুন"
                            className="p-1 hover:bg-emerald-50 rounded text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Status for selected month */}
                      <td className="py-3 px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            পরিশোধিত
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 font-bold text-[11px] rounded-full">
                            <Clock className="w-3.5 h-3.5 text-rose-600" />
                            বকেয়া / প্রদেয়
                          </span>
                        )}
                      </td>

                      {/* Payment Details */}
                      <td className="py-3 px-4">
                        {isPaid && transaction ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-emerald-800">
                                ৳ {transaction.amount.toLocaleString('bn-BD')}
                              </span>
                              <span className="text-slate-500 capitalize">
                                ({transaction.paymentMethod === 'cash'
                                  ? 'ক্যাশ'
                                  : transaction.paymentMethod === 'bank'
                                  ? 'ব্যাংক'
                                  : transaction.paymentMethod})
                              </span>
                            </div>
                            <div className="text-slate-500 text-[10px]">
                              ভাউচার: <span className="font-mono">{transaction.voucherNumber}</span> ({transaction.date})
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            হাদিয়া পরিশোধ করা হয়নি
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPaid && transaction ? (
                            <>
                              <button
                                onClick={() =>
                                  setActivePaySlip({
                                    teacher,
                                    transaction,
                                    month: selectedMonth,
                                  })
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 transition cursor-pointer"
                                title="পে-স্লিপ প্রিন্ট করুন"
                              >
                                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                                পে-স্লিপ
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteVoucherTarget({
                                    id: transaction.id,
                                    teacherName: teacher.nameBangla,
                                    month: selectedMonth,
                                    amount: transaction.amount,
                                  });
                                }}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                title="লেনদেন বাতিল/মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenPayModal(teacher)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              হাদিয়া দিন
                            </button>
                          )}

                          {/* View history */}
                          <button
                            onClick={() => setHistoryTeacher(teacher)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
                            title="বার্ষিক বেতন খতিয়ান দেখুন"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Printable Tabulation Sheet for Whole Month */}
      <div className="hidden">
        <div ref={sheetPrintRef} id="payroll-sheet-print" className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-slate-300 pb-4">
            <h2 className="text-2xl font-black text-slate-900">{madrasaInfo.name}</h2>
            <p className="text-xs text-slate-600">{madrasaInfo.address} • ফোন: {madrasaInfo.phone}</p>
            <div className="pt-2">
              <span className="px-4 py-1 bg-slate-900 text-white text-xs font-bold rounded-full">
                উস্তাদ ও শিক্ষকবৃন্দের মাসিক হাদিয়া/বেতন শিট - {selectedMonth}
              </span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                <th className="p-2 border border-slate-300 text-center">ক্র.নং</th>
                <th className="p-2 border border-slate-300 text-left">উস্তাদের নাম ও আইডি</th>
                <th className="p-2 border border-slate-300 text-left">পদবি</th>
                <th className="p-2 border border-slate-300 text-right">মূল হাদিয়া</th>
                <th className="p-2 border border-slate-300 text-right">ভাতা/বোনাস</th>
                <th className="p-2 border border-slate-300 text-right">কর্তন</th>
                <th className="p-2 border border-slate-300 text-right">নিট পরিশোধ</th>
                <th className="p-2 border border-slate-300 text-center">ভাউচার ও মাধ্যম</th>
                <th className="p-2 border border-slate-300 text-center w-36">গ্রহীতার স্বাক্ষর</th>
              </tr>
            </thead>
            <tbody>
              {teacherSalaryList.map((item, idx) => {
                return (
                  <tr key={item.teacher.id} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-slate-300">
                      <span className="font-bold block">{item.teacher.nameBangla}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.teacher.id}</span>
                    </td>
                    <td className="p-2 border border-slate-300">{item.teacher.designation}</td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      ৳ {item.baseSalary.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      {item.transaction?.allowanceAmount ? `৳ ${item.transaction.allowanceAmount}` : '-'}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      {item.transaction?.deductionAmount ? `৳ ${item.transaction.deductionAmount}` : '-'}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                      {item.isPaid ? `৳ ${item.paidAmount.toLocaleString('bn-BD')}` : 'বকেয়া'}
                    </td>
                    <td className="p-2 border border-slate-300 text-center text-[10px]">
                      {item.isPaid ? (
                        <span>{item.transaction?.voucherNumber} ({item.transaction?.paymentMethod})</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <span className="inline-block w-28 border-b border-dotted border-slate-400 mt-4"></span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td colSpan={3} className="p-2 border border-slate-300 text-right">সর্বমোট:</td>
                <td className="p-2 border border-slate-300 text-right font-mono">
                  ৳ {stats.totalBudget.toLocaleString('bn-BD')}
                </td>
                <td colSpan={2} className="p-2 border border-slate-300"></td>
                <td className="p-2 border border-slate-300 text-right font-mono font-black">
                  ৳ {stats.paidTotalAmount.toLocaleString('bn-BD')}
                </td>
                <td colSpan={2} className="p-2 border border-slate-300"></td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-16 text-center text-xs">
            <div className="border-t border-slate-400 pt-1 font-semibold">হিসাবরক্ষক</div>
            <div className="border-t border-slate-400 pt-1 font-semibold">নাজেমে তালিমাত</div>
            <div className="border-t border-slate-400 pt-1 font-bold">মুহতামিম / সভাপতি</div>
          </div>
        </div>
      </div>

      {/* Modal: Pay Salary Form */}
      {payModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-emerald-900 text-white">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">হাদিয়া ও বেতন পরিশোধ ফরম</h3>
              </div>
              <button
                onClick={() => setPayModalTeacher(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              {/* Teacher Info Card */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
                <img
                  src={payModalTeacher.photoUrl}
                  alt={payModalTeacher.nameBangla}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-200"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {payModalTeacher.nameBangla}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {payModalTeacher.designation} • আইডি: {payModalTeacher.id}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                    মাস: <span className="underline">{selectedMonth}</span>
                  </p>
                </div>
              </div>

              {/* Financial Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    মূল হাদিয়া (৳)
                  </label>
                  <input
                    type="number"
                    required
                    value={payModalData.baseSalary}
                    onChange={(e) =>
                      setPayModalData({ ...payModalData, baseSalary: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-700 mb-1">
                    + বিশেষ ভাতা / বোনাস
                  </label>
                  <input
                    type="number"
                    value={payModalData.allowance}
                    onChange={(e) =>
                      setPayModalData({ ...payModalData, allowance: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-700 mb-1">
                    - কর্তন / সমন্বয়
                  </label>
                  <input
                    type="number"
                    value={payModalData.deduction}
                    onChange={(e) =>
                      setPayModalData({ ...payModalData, deduction: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-xl text-xs font-mono text-rose-900 focus:bg-white focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">সর্বমোট প্রদেয় নিট হাদিয়া:</span>
                  <span className="text-xs text-amber-300">
                    {numberToBanglaWords(
                      Number(payModalData.baseSalary) +
                        Number(payModalData.allowance || 0) -
                        Number(payModalData.deduction || 0)
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-amber-400 font-mono">
                    ৳{' '}
                    {(
                      Number(payModalData.baseSalary) +
                      Number(payModalData.allowance || 0) -
                      Number(payModalData.deduction || 0)
                    ).toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              {/* Payment Method & Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    পরিশোধের মাধ্যম
                  </label>
                  <select
                    value={payModalData.paymentMethod}
                    onChange={(e) =>
                      setPayModalData({
                        ...payModalData,
                        paymentMethod: e.target.value as PaymentAccountMethod,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="cash">নগদ ক্যাশ (Cash)</option>
                    <option value="bank">ব্যাংক একাউন্ট (Bank)</option>
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="rocket">রকেট (Rocket)</option>
                    <option value="cheque">চেক (Cheque)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    পরিশোধের তারিখ
                  </label>
                  <input
                    type="date"
                    required
                    value={payModalData.date}
                    onChange={(e) =>
                      setPayModalData({ ...payModalData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Account/Phone ref if non-cash */}
              {payModalData.paymentMethod !== 'cash' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    হিসাব নম্বর / মোবাইল ব্যাংকিং / চেক নম্বর
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ব্যাংক হিসাব নং অথবা বিকাশ নম্বর"
                    value={payModalData.bankAccountOrNumber}
                    onChange={(e) =>
                      setPayModalData({ ...payModalData, bankAccountOrNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  মন্তব্য / বিবরণ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মাহে রমজানের বিশেষ হাদিয়া সহ"
                  value={payModalData.notes}
                  onChange={(e) =>
                    setPayModalData({ ...payModalData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModalTeacher(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  পরিশোধ সম্পন্ন ও রসিদ তৈরি
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Payment Confirmation */}
      {isBulkConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-7 h-7" />
              <h3 className="font-bold text-base text-slate-900">
                এক ক্লিকে সকল উস্তাদের বেতন পরিশোধ
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি <span className="font-bold text-emerald-800">{selectedMonth}</span> মাসের অপরিশোধিত <span className="font-bold text-rose-700">{stats.unpaidCount} জন</span> উস্তাদের নির্ধারিত হাদিয়া ভাউচার তৈরি করতে চান?
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">বাকি উস্তাদ সংখ্যা:</span>
                <span className="font-bold text-slate-800">{stats.unpaidCount} জন</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">প্রদেয় মোট বাজেট:</span>
                <span className="font-bold text-emerald-800 font-mono">
                  ৳ {stats.unpaidBudget.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBulkConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                না, বাতিল
              </button>
              <button
                onClick={handleExecuteBulkPayment}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                হ্যাঁ, ভাউচার তৈরি করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Monthly Salary & Increments */}
      {editingSalaryTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  মাসিক হাদিয়া স্কেল ও ইনক্রিমেন্ট নির্ধারণ
                </h3>
              </div>
              <button
                onClick={() => setEditingSalaryTeacher(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {editingSalaryTeacher.nameBangla}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {editingSalaryTeacher.designation} • আইডি: {editingSalaryTeacher.id}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">বর্তমান মূল স্কেল</span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    ৳ {(editingSalaryTeacher.salary || 18000).toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              {/* Input for new amount */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  নতুন মাসিক হাদিয়া / স্কেল (৳) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={newSalaryValue}
                    onChange={(e) => setNewSalaryValue(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="যেমন: 10000"
                  />
                </div>
              </div>

              {/* Effective from month */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  কোন মাস থেকে কার্যকর হবে? <span className="text-rose-500">*</span>
                </label>
                <select
                  value={salaryEffectiveMonth}
                  onChange={(e) => {
                    setSalaryEffectiveMonth(e.target.value);
                    setSalaryIncrementNote(`${e.target.value} হতে কার্যকর ইনক্রিমেন্ট`);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {MADRASA_1447_1448_MONTHS.map((m) => (
                    <option key={m.index} value={m.displayMonth}>
                      {m.displayMonth} ({m.yearLabel})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  উদাহরণস্বরূপ: মুহাররম ১৪৪৮ মাস থেকে বেতন বৃদ্ধি কার্যকর করলে জিলকদ ১৪৪৭ এর বেতন ৯,০০০ অপরিবর্তিত থাকবে।
                </p>
              </div>

              {/* Application Scope */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-800">
                  প্রয়োগের পরিসীমা:
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="salaryScope"
                      checked={salaryApplyScope === 'from_effective_month'}
                      onChange={() => setSalaryApplyScope('from_effective_month')}
                      className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        শুধুমাত্র &apos;{salaryEffectiveMonth}&apos; ও পরবর্তী মাসগুলোতে কার্যকর হবে (সুপারিশকৃত)
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        আগের মাসগুলোর বকেয়া বা পরিশোধিত হিসাব পূর্বের স্কেলেই সংরক্ষিত থাকবে।
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="salaryScope"
                      checked={salaryApplyScope === 'all_session_months'}
                      onChange={() => setSalaryApplyScope('all_session_months')}
                      className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        পুরো শিক্ষাবর্ষের সকল মাসের মূল বেতন হিসেবে পরিবর্তন করুন
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        সেশনের প্রথম মাস থেকেই এই নতুন স্কেল হিসেব হবে।
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ইনক্রিমেন্ট বা স্কেলের বিবরণ / নোট (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  value={salaryIncrementNote}
                  onChange={(e) => setSalaryIncrementNote(e.target.value)}
                  placeholder="যেমন: মুহাররম ১৪৪৮ ইনক্রিমেন্ট অনুমোদন"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Existing salary scales */}
              {editingSalaryTeacher.salaryHistory && editingSalaryTeacher.salaryHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    সংরক্ষিত স্কেল ইতিহাস ({editingSalaryTeacher.salaryHistory.length}টি):
                  </span>
                  <div className="space-y-1.5">
                    {editingSalaryTeacher.salaryHistory.map((sh) => (
                      <div
                        key={sh.id}
                        className="flex items-center justify-between px-3 py-1.5 bg-slate-100/70 rounded-lg text-xs"
                      >
                        <span className="font-medium text-slate-800">
                          {sh.effectiveFromMonth} হতে
                        </span>
                        <span className="font-mono font-bold text-emerald-800">
                          ৳ {sh.amount.toLocaleString('bn-BD')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingSalaryTeacher(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveTeacherSalary}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                স্কেল সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Teacher Salary History / Ledger */}
      {historyTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {historyTeacher.nameBangla} - বার্ষিক হাদিয়া ও স্কেল খতিয়ান
                </h3>
              </div>
              <button
                onClick={() => setHistoryTeacher(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">উস্তাদের নাম ও পদবি</span>
                  <span className="font-bold text-slate-900 text-sm">{historyTeacher.nameBangla}</span>
                  <span className="text-slate-500 block text-[11px]">{historyTeacher.designation} • {historyTeacher.phone}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">সর্বশেষ নির্ধারিত মূল হাদিয়া</span>
                  <span className="font-bold text-emerald-800 font-mono text-base">
                    ৳ {(historyTeacher.salary || 18000).toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              {/* Salary Scale Timeline if multiple scales exist */}
              {historyTeacher.salaryHistory && historyTeacher.salaryHistory.length > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                    বেতন বৃদ্ধি / স্কেল পরিবর্তনের ইতিহাস:
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {historyTeacher.salaryHistory.map((sh) => (
                      <span
                        key={sh.id}
                        className="px-2.5 py-1 bg-white border border-amber-300/80 rounded-lg text-xs text-amber-950 font-medium"
                      >
                        <strong className="text-emerald-800 font-bold">{sh.effectiveFromMonth}</strong> হতে ৳ {sh.amount.toLocaleString('bn-BD')} {sh.note ? `(${sh.note})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>১৪৪৭-১৪৪৮ সেশনের মাসভিত্তিক পূর্ণাঙ্গ রেজিস্টার:</span>
                  <span className="text-[11px] text-slate-500 font-normal">মাসভিত্তিক সঠিক স্কেল প্রদর্শিত হচ্ছে</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-semibold text-slate-700">
                      <tr>
                        <th className="p-2.5">শিক্ষাবর্ষের মাস</th>
                        <th className="p-2.5 text-right">নির্ধারিত স্কেল</th>
                        <th className="p-2.5 text-center">অবস্থা</th>
                        <th className="p-2.5 text-right">পরিশোধিত অর্থ</th>
                        <th className="p-2.5 text-center">ভাউচার</th>
                        <th className="p-2.5 text-center">স্লিপ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MADRASA_1447_1448_MONTHS.map((m) => {
                        const txn = salaryTransactions.find(
                          (t) =>
                            (t.referenceId === historyTeacher.id ||
                              t.title.includes(historyTeacher.nameBangla) ||
                              (t.partyName && t.partyName.includes(historyTeacher.nameBangla))) &&
                            ((t.salaryMonth && t.salaryMonth === m.displayMonth) ||
                              t.title.includes(m.displayMonth) ||
                              (t.description && t.description.includes(m.displayMonth)))
                        );
                        const expectedMonthScale = getTeacherBaseSalaryForMonth(historyTeacher, m.displayMonth, txn);

                        return (
                          <tr key={m.index} className="hover:bg-slate-50">
                            <td className="p-2.5 font-medium">
                              <span className="font-semibold text-slate-800">{m.displayMonth}</span>
                              <span className="text-[10px] text-slate-400 block">{m.yearLabel}</span>
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-700">
                              ৳ {expectedMonthScale.toLocaleString('bn-BD')}
                            </td>
                            <td className="p-2.5 text-center">
                              {txn ? (
                                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                                  পরিশোধিত
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-semibold rounded-full">
                                  বকেয়া
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono font-semibold">
                              {txn ? (
                                <span className="text-emerald-800 font-bold">
                                  ৳ {txn.amount.toLocaleString('bn-BD')}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="p-2.5 text-center text-[10px] font-mono text-slate-600">
                              {txn ? txn.voucherNumber : '-'}
                            </td>
                            <td className="p-2.5 text-center">
                              {txn ? (
                                <button
                                  onClick={() => {
                                    setHistoryTeacher(null);
                                    setActivePaySlip({
                                      teacher: historyTeacher,
                                      transaction: txn,
                                      month: m.displayMonth,
                                    });
                                  }}
                                  className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer"
                                >
                                  স্লিপ
                                </button>
                              ) : (
                                <span className="text-slate-300 text-[10px]">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setHistoryTeacher(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Slip Modal */}
      {activePaySlip && (
        <TeacherPaySlipModal
          isOpen={true}
          onClose={() => setActivePaySlip(null)}
          teacher={activePaySlip.teacher}
          transaction={activePaySlip.transaction}
          month={activePaySlip.month}
        />
      )}

      {/* Delete Voucher Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteVoucherTarget)}
        title="বেতন ভাউচার মুছে ফেলার নিশ্চিতকরণ"
        itemName={
          deleteVoucherTarget
            ? `${deleteVoucherTarget.teacherName} এর ${deleteVoucherTarget.month} মাসের বেতন ভাউচার (${deleteVoucherTarget.amount.toLocaleString('bn-BD')} ৳)`
            : undefined
        }
        description="আপনি কি নিশ্চিতভাবে এই উস্তাদের বেতন পরিশোধের ভাউচারটি হিসাব খাতা থেকে মুছে ফেলতে চান? এটি মুছে ফেললে এই মাসের বেতন পুনরায় 'অপরিশোধিত' অবস্থায় ফিরে যাবে।"
        confirmText="হ্যাঁ, ভাউচার মুছুন"
        cancelText="বাতিল"
        onConfirm={() => {
          if (deleteVoucherTarget) {
            deleteFinancialTransaction(deleteVoucherTarget.id);
            showToast(`${deleteVoucherTarget.teacherName} এর ${deleteVoucherTarget.month} মাসের বেতন ভাউচার সফলভাবে মুছে ফেলা হয়েছে!`);
            setDeleteVoucherTarget(null);
          }
        }}
        onClose={() => setDeleteVoucherTarget(null)}
      />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
