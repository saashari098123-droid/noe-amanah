import React, { useState, useMemo } from 'react';
import {
  FinancialTransaction,
  IncomeCategory,
  ExpenseCategory,
  MadrasaInfo,
} from '../../../types';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Printer,
  Download,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PieChart,
  FileText,
  PlusCircle,
  MinusCircle,
  Eye,
  Layers,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sparkles,
  Receipt,
} from 'lucide-react';
import { printHtmlElement } from '../../../utils/printHelper';
import { exportMonthlyFinanceToExcel } from '../../../utils/excelService';
import {
  ENGLISH_MONTHS,
  HIJRI_MONTHS,
  CURRENT_ENGLISH_YEAR,
  CURRENT_HIJRI_YEAR,
} from '../../../utils/feeCalculator';

interface MonthlyFinanceViewProps {
  transactions: FinancialTransaction[];
  madrasaInfo: MadrasaInfo;
  onOpenAddModal: (type: 'income' | 'expense') => void;
  onViewVoucher: (txn: FinancialTransaction) => void;
  onOpenEditModal: (txn: FinancialTransaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const MONTH_NAMES_BN = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export const MonthlyFinanceView: React.FC<MonthlyFinanceViewProps> = ({
  transactions,
  madrasaInfo,
  onOpenAddModal,
  onViewVoucher,
  onOpenEditModal,
  onDeleteTransaction,
}) => {
  // Calendar mode: 'english' | 'hijri'
  const [calendarMode, setCalendarMode] = useState<'english' | 'hijri'>('english');

  // Currently selected English Month (1-12) and Year
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear() || 2026);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(currentDate.getMonth()); // 0-11

  // Currently selected Hijri Month
  const [selectedHijriMonth, setSelectedHijriMonth] = useState<string>('মুহাররম');
  const [selectedHijriYear, setSelectedHijriYear] = useState<number>(
    typeof CURRENT_HIJRI_YEAR === 'number' ? CURRENT_HIJRI_YEAR : parseInt(String(CURRENT_HIJRI_YEAR), 10) || 1448
  );

  // Search & Type Filter inside the month
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [viewSubTab, setViewSubTab] = useState<'summary' | 'vouchers' | 'statement'>('summary');

  // Month prefix in ISO format, e.g. "2026-02"
  const englishMonthPrefix = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}`;
  const currentMonthLabel =
    calendarMode === 'english'
      ? `${MONTH_NAMES_BN[selectedMonthIndex]} ${selectedYear}`
      : `${selectedHijriMonth} ${selectedHijriYear} হিজরি`;

  // Filter transactions for this month
  const monthTransactions = useMemo(() => {
    const hijriYearBn = selectedHijriYear.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
    const hijriYearEn = selectedHijriYear.toString();

    return transactions.filter((t) => {
      if (calendarMode === 'english') {
        return t.date.startsWith(englishMonthPrefix);
      } else {
        // Hijri matching with Year constraint
        const targetHijriMonth = selectedHijriMonth.trim();
        const containsMonth =
          (t.title || '').includes(targetHijriMonth) ||
          (t.description || '').includes(targetHijriMonth) ||
          (t.hijriDate || '').includes(targetHijriMonth) ||
          (t.salaryMonth || '').includes(targetHijriMonth);

        if (!containsMonth) return false;

        // If salaryMonth or hijriDate explicitly contains a year, verify that it matches selected year
        const combinedText = `${t.salaryMonth || ''} ${t.hijriDate || ''} ${t.title || ''}`;
        const containsOtherHijriYear =
          (combinedText.includes('১৪৪৭') || combinedText.includes('1447')) && (selectedHijriYear === 1448);
        const contains1448Year =
          (combinedText.includes('১৪৪৮') || combinedText.includes('1448')) && (selectedHijriYear === 1447);

        if (containsOtherHijriYear || contains1448Year) {
          return false;
        }

        return true;
      }
    });
  }, [transactions, calendarMode, englishMonthPrefix, selectedHijriMonth, selectedHijriYear]);

  // Statistics for selected month
  const monthIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [monthTransactions]);

  const monthExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [monthTransactions]);

  const monthBalance = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? Math.round((monthBalance / monthIncome) * 100) : 0;

  // Category breakdowns for this month
  const incomeCategoriesBreakdown = useMemo(() => {
    const map: Record<string, { label: string; amount: number; count: number }> = {};
    monthTransactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        const catKey = t.category || 'other_income';
        const label = t.categoryLabel || catKey;
        if (!map[catKey]) map[catKey] = { label, amount: 0, count: 0 };
        map[catKey].amount += Number(t.amount) || 0;
        map[catKey].count += 1;
      });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  const expenseCategoriesBreakdown = useMemo(() => {
    const map: Record<string, { label: string; amount: number; count: number }> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catKey = t.category || 'other_expense';
        const label = t.categoryLabel || catKey;
        if (!map[catKey]) map[catKey] = { label, amount: 0, count: 0 };
        map[catKey].amount += Number(t.amount) || 0;
        map[catKey].count += 1;
      });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  // Filtered transactions for table
  const displayedTransactions = useMemo(() => {
    return monthTransactions.filter((txn) => {
      if (filterType === 'income' && txn.type !== 'income') return false;
      if (filterType === 'expense' && txn.type !== 'expense') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (txn.title || '').toLowerCase().includes(q);
        const matchParty = (txn.partyName || '').toLowerCase().includes(q);
        const matchVoucher = (txn.voucherNumber || '').toLowerCase().includes(q);
        const matchCat = (txn.categoryLabel || '').toLowerCase().includes(q);
        if (!matchTitle && !matchParty && !matchVoucher && !matchCat) return false;
      }
      return true;
    });
  }, [monthTransactions, filterType, searchQuery]);

  // Quick navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonthIndex((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    const d = new Date();
    setSelectedYear(d.getFullYear());
    setSelectedMonthIndex(d.getMonth());
  };

  const handlePrintMonthlyStatement = () => {
    printHtmlElement('printable-monthly-statement-sheet', {
      title: `মাসিক আর্থিক বিবরণী - ${currentMonthLabel} - ${madrasaInfo.nameBangla}`,
    });
  };

  const handleExportExcel = () => {
    exportMonthlyFinanceToExcel(currentMonthLabel, monthTransactions, {
      totalIncome: monthIncome,
      totalExpense: monthExpense,
      netBalance: monthBalance,
    });
  };

  return (
    <div className="space-y-6">
      {/* Month Navigator Toolbar Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-emerald-800/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Mode Badge & Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>মাসিক হিসাব ক্যাটাগরি (Monthly Statement)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{currentMonthLabel}</span>
              <span className="text-xs sm:text-sm font-normal text-emerald-300/80">আয়-ব্যয় হিসাব</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              মাসভিত্তিক বাজেট, ক্যাশ ব্যালেন্স, আয়ের উৎস ও ব্যয়ের বিস্তারিত ভাউচার খাতা
            </p>
          </div>

          {/* Right: Month Switcher & Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Calendar Mode Toggle */}
            <div className="bg-slate-800/80 p-1 rounded-2xl border border-slate-700 flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setCalendarMode('english')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  calendarMode === 'english'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>ইংরেজি মাস</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarMode('hijri')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  calendarMode === 'hijri'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>হিজরি মাস</span>
              </button>
            </div>

            {/* Quick Prev / Next Month Controls */}
            {calendarMode === 'english' ? (
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
                  title="পূর্ববর্তী মাস"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <select
                  value={selectedMonthIndex}
                  onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                  className="bg-slate-900 text-white text-xs font-bold px-2 py-1.5 rounded-xl border border-slate-700 focus:outline-hidden"
                >
                  {MONTH_NAMES_BN.map((name, idx) => (
                    <option key={idx} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-900 text-white text-xs font-bold px-2 py-1.5 rounded-xl border border-slate-700 focus:outline-hidden"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
                  title="পরবর্তী মাস"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
                <select
                  value={selectedHijriMonth}
                  onChange={(e) => setSelectedHijriMonth(e.target.value)}
                  className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-hidden"
                >
                  {HIJRI_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      🌙 {m}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedHijriYear}
                  onChange={(e) => setSelectedHijriYear(Number(e.target.value))}
                  className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-hidden"
                >
                  {[1446, 1447, 1448, 1449].map((hYr) => (
                    <option key={hYr} value={hYr}>
                      {hYr} হিজরি
                    </option>
                  ))}
                </select>
              </div>
            )}

            {calendarMode === 'english' && (
              <button
                onClick={handleCurrentMonth}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
              >
                চলতি মাস
              </button>
            )}
          </div>
        </div>

        {/* 4 Monthly KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          {/* 1. Monthly Total Income */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 border border-emerald-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-300">এই মাসের মোট আয়</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                ৳ {monthIncome.toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-1">
                {monthTransactions.filter((t) => t.type === 'income').length} টি আয় ভাউচার
              </div>
            </div>
          </div>

          {/* 2. Monthly Total Expense */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 border border-rose-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-300">এই মাসের মোট ব্যয়</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                ৳ {monthExpense.toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-rose-300/80 mt-1">
                {monthTransactions.filter((t) => t.type === 'expense').length} টি ব্যয় ভাউচার
              </div>
            </div>
          </div>

          {/* 3. Monthly Net Surplus/Deficit */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 border border-amber-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-300">এই মাসের নিট স্থিতি</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                ৳
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                ৳ {monthBalance.toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    monthBalance >= 0 ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />
                <span>{monthBalance >= 0 ? 'উদ্বৃত্ত তহবিল / সারপ্লাস' : 'ঘাটতি বাজেট'}</span>
              </div>
            </div>
          </div>

          {/* 4. Monthly Total Activity */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 border border-blue-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-300">মোট লেনদেন ভাউচার</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-blue-300 font-mono">
                {monthTransactions.length} <span className="text-sm font-normal text-slate-400">টি</span>
              </div>
              <div className="text-[11px] text-blue-300/80 mt-1">
                সঞ্চয় হার: <strong className="text-white">{savingsRate}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-view Toggle Buttons & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setViewSubTab('summary')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewSubTab === 'summary'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>খাতভিত্তিক বিশ্লেষণ</span>
          </button>

          <button
            onClick={() => setViewSubTab('vouchers')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewSubTab === 'vouchers'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>এই মাসের ভাউচার তালিকা ({monthTransactions.length})</span>
          </button>

          <button
            onClick={() => setViewSubTab('statement')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewSubTab === 'statement'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-purple-800 hover:bg-purple-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>মাসিক অডিট স্টেটমেন্ট শিট</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal('income')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ আয় যুক্ত করুন</span>
          </button>
          <button
            onClick={() => onOpenAddModal('expense')}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>- ব্যয় যুক্ত করুন</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
            title="এই মাসের এক্সেল ডাউনলোড"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>এক্সেল</span>
          </button>
          <button
            onClick={handlePrintMonthlyStatement}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
            title="মাসিক বিবরণী প্রিন্ট করুন"
          >
            <Printer className="w-3.5 h-3.5 text-purple-600" />
            <span>প্রিন্ট</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Monthly Category Breakdown */}
      {viewSubTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>{currentMonthLabel} - আয়ের খাতসমূহ</span>
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                মোট: ৳ {monthIncome.toLocaleString('bn-BD')}
              </span>
            </div>

            <div className="space-y-3">
              {incomeCategoriesBreakdown.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  এই মাসে কোনো আয়ের লেনদেন রেকর্ড নেই
                </div>
              ) : (
                incomeCategoriesBreakdown.map((cat, idx) => {
                  const percent = monthIncome > 0 ? ((cat.amount / monthIncome) * 100).toFixed(1) : '0';
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800">
                        <span>{cat.label} ({cat.count}টি ভাউচার)</span>
                        <div className="text-right">
                          <span className="font-bold font-mono text-emerald-800">
                            ৳ {cat.amount.toLocaleString('bn-BD')}
                          </span>
                          <span className="text-slate-400 text-xs ml-1.5 font-mono">({percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(2, Number(percent)))}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Expense Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 border border-rose-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span>{currentMonthLabel} - ব্যয়ের খাতসমূহ</span>
              </h3>
              <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                মোট: ৳ {monthExpense.toLocaleString('bn-BD')}
              </span>
            </div>

            <div className="space-y-3">
              {expenseCategoriesBreakdown.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  এই মাসে কোনো ব্যয়ের লেনদেন রেকর্ড নেই
                </div>
              ) : (
                expenseCategoriesBreakdown.map((cat, idx) => {
                  const percent = monthExpense > 0 ? ((cat.amount / monthExpense) * 100).toFixed(1) : '0';
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800">
                        <span>{cat.label} ({cat.count}টি ভাউচার)</span>
                        <div className="text-right">
                          <span className="font-bold font-mono text-rose-800">
                            ৳ {cat.amount.toLocaleString('bn-BD')}
                          </span>
                          <span className="text-slate-400 text-xs ml-1.5 font-mono">({percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(2, Number(percent)))}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Monthly Vouchers Table */}
      {viewSubTab === 'vouchers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ভাউচার নং, নাম, শিরোনাম খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">সকল ভাউচার</option>
                <option value="income">শুধু আয় / জমা</option>
                <option value="expense">শুধু ব্যয় / খরচ</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-100/80 text-slate-800 text-xs font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">ভাউচার নং ও তারিখ</th>
                  <th className="py-3 px-3.5">খাত ও বিবরণ</th>
                  <th className="py-3 px-3.5">দাতা / গ্রহীতা</th>
                  <th className="py-3 px-3.5">মাধ্যম</th>
                  <th className="py-3 px-3.5 text-right">পরিমাণ (টাকা)</th>
                  <th className="py-3 px-3.5 text-center">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      {currentMonthLabel}-এ কোনো লেনদেন ভাউচার পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  displayedTransactions.map((txn) => {
                    const isIncome = txn.type === 'income';
                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3.5">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>{txn.voucherNumber || 'VR-N/A'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{txn.date}</div>
                        </td>
                        <td className="py-3 px-3.5 max-w-xs">
                          <div className="font-semibold text-slate-900">{txn.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {txn.categoryLabel || txn.category}
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-medium text-slate-800">{txn.partyName || '—'}</div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs">
                            {txn.paymentMethod === 'cash' ? '💵 ক্যাশ' : txn.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold">
                          <span
                            className={
                              isIncome
                                ? 'text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg'
                                : 'text-rose-700 bg-rose-50 px-2 py-1 rounded-lg'
                            }
                          >
                            {isIncome ? '+' : '-'} ৳ {Number(txn.amount).toLocaleString('bn-BD')}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onViewVoucher(txn)}
                              className="p-1.5 hover:bg-slate-200 text-emerald-700 rounded-lg transition cursor-pointer"
                              title="মানি রসিদ প্রিন্ট করুন"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onOpenEditModal(txn)}
                              className="p-1.5 hover:bg-slate-200 text-blue-700 rounded-lg transition cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(txn.id)}
                              className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <MinusCircle className="w-4 h-4" />
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
      )}

      {/* VIEW 3: Printable Monthly Audit Statement Sheet */}
      {viewSubTab === 'statement' && (
        <div
          id="printable-monthly-statement-sheet"
          className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-8"
        >
          {/* Statement Header */}
          <div className="text-center space-y-2 border-b border-slate-200 pb-6">
            <div className="text-xs font-serif font-bold text-emerald-800 tracking-widest">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{madrasaInfo.nameBangla}</h2>
            <p className="text-xs text-slate-500">
              {madrasaInfo.address} | যোগাযোগ: {madrasaInfo.phone}
            </p>
            <div className="inline-block bg-slate-900 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mt-2">
              মাসিক আয়-ব্যয় বিবরণী ও অডিট প্রতিবেদন: {currentMonthLabel}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              মুদ্রণ তারিখ: {new Date().toLocaleDateString('bn-BD')} খ্রিস্টাব্দ
            </p>
          </div>

          {/* Statement Side-by-Side Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Income */}
            <div className="border border-emerald-200 rounded-2xl p-5 bg-emerald-50/30 space-y-4">
              <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wide border-b border-emerald-200 pb-2 flex justify-between">
                <span>আয় / জমা খাত (Inflows)</span>
                <span>টাকা</span>
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                {incomeCategoriesBreakdown.length === 0 ? (
                  <p className="text-slate-400 text-xs py-2">কোন আয়ের রেকর্ড নেই</p>
                ) : (
                  incomeCategoriesBreakdown.map((cat, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 py-1 border-b border-emerald-100">
                      <span>{cat.label} ({cat.count}টি)</span>
                      <span className="font-mono font-bold text-emerald-800">
                        ৳ {cat.amount.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between text-sm font-extrabold text-emerald-900 pt-3 border-t-2 border-emerald-300">
                <span>মোট আয় (Total Inflow):</span>
                <span className="font-mono">৳ {monthIncome.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Right: Expense */}
            <div className="border border-rose-200 rounded-2xl p-5 bg-rose-50/30 space-y-4">
              <h4 className="text-sm font-bold text-rose-900 uppercase tracking-wide border-b border-rose-200 pb-2 flex justify-between">
                <span>ব্যয় / খরচ খাত (Outflows)</span>
                <span>টাকা</span>
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                {expenseCategoriesBreakdown.length === 0 ? (
                  <p className="text-slate-400 text-xs py-2">কোন ব্যয়ের রেকর্ড নেই</p>
                ) : (
                  expenseCategoriesBreakdown.map((cat, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 py-1 border-b border-rose-100">
                      <span>{cat.label} ({cat.count}টি)</span>
                      <span className="font-mono font-bold text-rose-800">
                        ৳ {cat.amount.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between text-sm font-extrabold text-rose-900 pt-3 border-t-2 border-rose-300">
                <span>মোট ব্যয় (Total Outflow):</span>
                <span className="font-mono">৳ {monthExpense.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Statement Bottom Net Result */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                {currentMonthLabel} - মাসিক নিট তহবিল স্থিতি
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                ৳ {monthBalance.toLocaleString('bn-BD')}
              </div>
              <p className="text-xs text-slate-300">
                {monthBalance >= 0 ? 'উদ্বৃত্ত সারপ্লাস ব্যালেন্স' : 'ঘাটতি বাজেট'}
              </p>
            </div>
            <button
              onClick={handlePrintMonthlyStatement}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>মাসিক প্রতিবেদন প্রিন্ট করুন</span>
            </button>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-12 text-center text-xs text-slate-600 font-semibold border-t border-slate-200">
            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1">হিসাবরক্ষক</div>
              <span className="text-[10px] text-slate-400">হিসাব শাখা</span>
            </div>
            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1">অডিট কমিটি</div>
              <span className="text-[10px] text-slate-400">নিরীক্ষক</span>
            </div>
            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1">মুহতামিম / সভাপতি</div>
              <span className="text-[10px] text-slate-400">{madrasaInfo.nameBangla}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
