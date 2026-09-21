import React, { useState, useMemo } from 'react';
import {
  FinancialTransaction,
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
  BarChart3,
  CalendarRange,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
} from 'lucide-react';
import { printHtmlElement } from '../../../utils/printHelper';
import { exportAnnualFinanceToExcel } from '../../../utils/excelService';

interface AnnualFinanceViewProps {
  transactions: FinancialTransaction[];
  madrasaInfo: MadrasaInfo;
  onSelectMonthForDetailedView?: (monthIndex: number, year: number) => void;
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

export const AnnualFinanceView: React.FC<AnnualFinanceViewProps> = ({
  transactions,
  madrasaInfo,
  onSelectMonthForDetailedView,
}) => {
  const currentYr = new Date().getFullYear() || 2026;
  const [selectedYear, setSelectedYear] = useState<number>(currentYr);
  const [viewSubTab, setViewSubTab] = useState<'matrix' | 'categories' | 'annual_statement'>('matrix');

  // Filter all transactions for this entire year
  const yearPrefix = `${selectedYear}`;
  const yearTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(yearPrefix));
  }, [transactions, yearPrefix]);

  // Annual Totals
  const totalYearIncome = useMemo(() => {
    return yearTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [yearTransactions]);

  const totalYearExpense = useMemo(() => {
    return yearTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [yearTransactions]);

  const netYearBalance = totalYearIncome - totalYearExpense;
  const avgMonthlyIncome = Math.round(totalYearIncome / 12);
  const avgMonthlyExpense = Math.round(totalYearExpense / 12);

  // 12-Month Matrix
  const monthlyBreakdown = useMemo(() => {
    return MONTH_NAMES_BN.map((monthName, idx) => {
      const monthStr = String(idx + 1).padStart(2, '0');
      const prefix = `${selectedYear}-${monthStr}`;

      const txns = yearTransactions.filter((t) => t.date.startsWith(prefix));
      const income = txns
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const expense = txns
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const balance = income - expense;

      return {
        monthIndex: idx,
        month: monthName,
        income,
        expense,
        balance,
        count: txns.length,
      };
    });
  }, [yearTransactions, selectedYear]);

  // Find max monthly value for comparative bar scaling
  const maxMonthValue = useMemo(() => {
    let max = 1;
    monthlyBreakdown.forEach((m) => {
      if (m.income > max) max = m.income;
      if (m.expense > max) max = m.expense;
    });
    return max;
  }, [monthlyBreakdown]);

  // Annual Category Breakdown - Inflow
  const annualIncomeCategories = useMemo(() => {
    const map: Record<string, { label: string; amount: number; count: number }> = {};
    yearTransactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        const catKey = t.category || 'other_income';
        const label = t.categoryLabel || catKey;
        if (!map[catKey]) map[catKey] = { label, amount: 0, count: 0 };
        map[catKey].amount += Number(t.amount) || 0;
        map[catKey].count += 1;
      });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [yearTransactions]);

  // Annual Category Breakdown - Outflow
  const annualExpenseCategories = useMemo(() => {
    const map: Record<string, { label: string; amount: number; count: number }> = {};
    yearTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catKey = t.category || 'other_expense';
        const label = t.categoryLabel || catKey;
        if (!map[catKey]) map[catKey] = { label, amount: 0, count: 0 };
        map[catKey].amount += Number(t.amount) || 0;
        map[catKey].count += 1;
      });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [yearTransactions]);

  const yearLabel = `${selectedYear} খ্রিস্টাব্দ`;

  const handlePrintAnnualReport = () => {
    printHtmlElement('printable-annual-statement-sheet', {
      title: `বার্ষিক অডিট বিবরণী ও আর্থিক হিসাব - ${selectedYear} - ${madrasaInfo.nameBangla}`,
    });
  };

  const handleExportExcel = () => {
    exportAnnualFinanceToExcel(
      yearLabel,
      monthlyBreakdown,
      {
        totalIncome: totalYearIncome,
        totalExpense: totalYearExpense,
        netBalance: netYearBalance,
      },
      yearTransactions
    );
  };

  return (
    <div className="space-y-6">
      {/* Annual Navigator Banner Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 border border-blue-800/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Mode Badge & Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-500/30 mb-2">
              <CalendarRange className="w-3.5 h-3.5" />
              <span>পুরো বছরের হিসাব ক্যাটাগরি (Full Year Statement & Audit)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{yearLabel}</span>
              <span className="text-xs sm:text-sm font-normal text-blue-300/80">বার্ষিক পূর্ণাঙ্গ আর্থিক হিসাব</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              ১২ মাসের মাসওয়ারি তুলনামূলক চিত্র, বার্ষিক মোট আয়-ব্যয় এবং প্রাতিষ্ঠানিক নিরীক্ষা ও অডিট রিপোর্ট
            </p>
          </div>

          {/* Right: Year Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
              <button
                onClick={() => setSelectedYear((p) => p - 1)}
                className="p-2 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
                title="পূর্বের বছর"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-900 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-hidden cursor-pointer"
              >
                {[2023, 2024, 2025, 2026, 2027, 2028].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} সাল
                  </option>
                ))}
              </select>

              <button
                onClick={() => setSelectedYear((p) => p + 1)}
                className="p-2 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
                title="পরের বছর"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setSelectedYear(currentYr)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
            >
              চলতি বছর
            </button>
          </div>
        </div>

        {/* 4 Annual KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          {/* 1. Yearly Total Income */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 border border-emerald-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-300">বছরের সর্বমোট জমা / আয়</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                ৳ {totalYearIncome.toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-1">
                মাসিক গড় আয়: ৳ {avgMonthlyIncome.toLocaleString('bn-BD')}
              </div>
            </div>
          </div>

          {/* 2. Yearly Total Expense */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 border border-rose-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-300">বছরের সর্বমোট খরচ / ব্যয়</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                ৳ {totalYearExpense.toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-rose-300/80 mt-1">
                মাসিক গড় ব্যয়: ৳ {avgMonthlyExpense.toLocaleString('bn-BD')}
              </div>
            </div>
          </div>

          {/* 3. Yearly Net Surplus */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 border border-amber-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-300">বার্ষিক নিট স্থিতি (তহবিল)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                ৳
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                ৳ {netYearBalance.toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    netYearBalance >= 0 ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />
                <span>{netYearBalance >= 0 ? 'বার্ষিক উদ্বৃত্ত সারপ্লাস' : 'বার্ষিক ঘাটতি'}</span>
              </div>
            </div>
          </div>

          {/* 4. Total Annual Activity */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 border border-blue-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-300">মোট বার্ষিক ভাউচার</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-blue-300 font-mono">
                {yearTransactions.length} <span className="text-sm font-normal text-slate-400">টি</span>
              </div>
              <div className="text-[11px] text-blue-300/80 mt-1">
                {selectedYear} সনের সকল লেনদেন
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtabs & Print/Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setViewSubTab('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewSubTab === 'matrix'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>১২ মাসের মাসওয়ারি তুলনামূলক ছক</span>
          </button>

          <button
            onClick={() => setViewSubTab('categories')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewSubTab === 'categories'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-blue-800 hover:bg-blue-50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>বার্ষিক খাতভিত্তিক বিশ্লেষণ</span>
          </button>

          <button
            onClick={() => setViewSubTab('annual_statement')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewSubTab === 'annual_statement'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-purple-800 hover:bg-purple-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>বার্ষিক অডিট শিট ও ব্যালেন্স রিপোর্ট</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-emerald-200"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>বার্ষিক এক্সেল (.xlsx)</span>
          </button>
          <button
            onClick={handlePrintAnnualReport}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
          >
            <Printer className="w-3.5 h-3.5 text-purple-600" />
            <span>বার্ষিক অডিট প্রিন্ট</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: 12-Month Comparison Matrix */}
      {viewSubTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {selectedYear} সালের ১২ মাসের মাসওয়ারি বিস্তারিত হিসাব
              </h3>
              <p className="text-xs text-slate-500">
                প্রতিটি মাসের মোট আয়, মোট ব্যয় ও নিট স্থিতি (উদ্বৃত্ত/ঘাটতি) একনজরে
              </p>
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              ১২ মাসের সম্পূর্ণ হিসাব
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-100/80 text-slate-800 text-xs font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">মাস</th>
                  <th className="py-3 px-3.5 text-right text-emerald-800">মোট জমা / আয়</th>
                  <th className="py-3 px-3.5 text-right text-rose-800">মোট খরচ / ব্যয়</th>
                  <th className="py-3 px-3.5 text-right">নিট স্থিতি (ব্যালেন্স)</th>
                  <th className="py-3 px-3.5">আয়-ব্যয় তুলনামূলক গ্রাফ</th>
                  <th className="py-3 px-3.5 text-center">ভাউচার</th>
                  <th className="py-3 px-3.5 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyBreakdown.map((m) => {
                  const incomeRatio = maxMonthValue > 0 ? (m.income / maxMonthValue) * 100 : 0;
                  const expenseRatio = maxMonthValue > 0 ? (m.expense / maxMonthValue) * 100 : 0;
                  return (
                    <tr key={m.monthIndex} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        <span>{m.month}</span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700">
                        ৳ {m.income.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-700">
                        ৳ {m.expense.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-lg ${
                            m.balance >= 0
                              ? 'text-emerald-800 bg-emerald-50'
                              : 'text-rose-800 bg-rose-50'
                          }`}
                        >
                          {m.balance >= 0 ? '+' : ''} ৳ {m.balance.toLocaleString('bn-BD')}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 min-w-[140px]">
                        <div className="space-y-1">
                          {/* Income mini bar */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(1, incomeRatio))}%` }}
                            />
                          </div>
                          {/* Expense mini bar */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(1, expenseRatio))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center text-slate-500 font-mono">
                        {m.count} টি
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {onSelectMonthForDetailedView && (
                          <button
                            onClick={() => onSelectMonthForDetailedView(m.monthIndex, selectedYear)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
                            title="এই মাসের বিস্তারিত মাসিক হিসাবে যান"
                          >
                            বিস্তারিত ➔
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Grand Total Row */}
              <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-700 text-xs sm:text-sm">
                <tr>
                  <td className="py-3.5 px-3.5">সর্বমোট বার্ষিক যোগফল:</td>
                  <td className="py-3.5 px-3.5 text-right font-mono text-emerald-400">
                    ৳ {totalYearIncome.toLocaleString('bn-BD')}
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono text-rose-400">
                    ৳ {totalYearExpense.toLocaleString('bn-BD')}
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono text-amber-400">
                    ৳ {netYearBalance.toLocaleString('bn-BD')}
                  </td>
                  <td className="py-3.5 px-3.5 text-xs text-slate-300">
                    {netYearBalance >= 0 ? 'বার্ষিক উদ্বৃত্ত' : 'বার্ষিক ঘাটতি'}
                  </td>
                  <td className="py-3.5 px-3.5 text-center font-mono text-blue-300">
                    {yearTransactions.length} টি
                  </td>
                  <td className="py-3.5 px-3.5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Annual Category Breakdown */}
      {viewSubTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>{selectedYear} সালের বার্ষিক আয়ের খাতসমূহ</span>
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                মোট: ৳ {totalYearIncome.toLocaleString('bn-BD')}
              </span>
            </div>

            <div className="space-y-3">
              {annualIncomeCategories.length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-sm">কোন আয়ের রেকর্ড নেই</p>
              ) : (
                annualIncomeCategories.map((cat, idx) => {
                  const percent = totalYearIncome > 0 ? ((cat.amount / totalYearIncome) * 100).toFixed(1) : '0';
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800">
                        <span>{cat.label} ({cat.count}টি)</span>
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

          {/* Expense Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-rose-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span>{selectedYear} সালের বার্ষিক ব্যয়ের খাতসমূহ</span>
              </h3>
              <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                মোট: ৳ {totalYearExpense.toLocaleString('bn-BD')}
              </span>
            </div>

            <div className="space-y-3">
              {annualExpenseCategories.length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-sm">কোন ব্যয়ের রেকর্ড নেই</p>
              ) : (
                annualExpenseCategories.map((cat, idx) => {
                  const percent = totalYearExpense > 0 ? ((cat.amount / totalYearExpense) * 100).toFixed(1) : '0';
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800">
                        <span>{cat.label} ({cat.count}টি)</span>
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

      {/* VIEW 3: Printable Annual Audit Statement Sheet */}
      {viewSubTab === 'annual_statement' && (
        <div
          id="printable-annual-statement-sheet"
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
              বার্ষিক পূর্ণাঙ্গ আর্থিক বিবরণী ও অডিট নিরীক্ষা প্রতিবেদন: {selectedYear} সাল
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              মুদ্রণ তারিখ: {new Date().toLocaleDateString('bn-BD')} খ্রিস্টাব্দ
            </p>
          </div>

          {/* 12-Month Table in printable format */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              ১. ১২ মাসের মাসভিত্তিক আয়-ব্যয় বিবরণী
            </h4>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">মাস</th>
                  <th className="p-2 text-right border-r border-slate-300">আয় (টাকা)</th>
                  <th className="p-2 text-right border-r border-slate-300">ব্যয় (টাকা)</th>
                  <th className="p-2 text-right border-r border-slate-300">নিট স্থিতি (টাকা)</th>
                  <th className="p-2 text-center">ভাউচার</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {monthlyBreakdown.map((m) => (
                  <tr key={m.monthIndex}>
                    <td className="p-1.5 font-sans font-semibold border-r border-slate-200">{m.month}</td>
                    <td className="p-1.5 text-right border-r border-slate-200">
                      {m.income.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-1.5 text-right border-r border-slate-200">
                      {m.expense.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-1.5 text-right border-r border-slate-200 font-bold">
                      {m.balance.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-1.5 text-center font-sans">{m.count}টি</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-200 font-bold border-t-2 border-slate-400">
                <tr>
                  <td className="p-2 border-r border-slate-300">মোট বার্ষিক:</td>
                  <td className="p-2 text-right border-r border-slate-300 font-mono">
                    ৳ {totalYearIncome.toLocaleString('bn-BD')}
                  </td>
                  <td className="p-2 text-right border-r border-slate-300 font-mono">
                    ৳ {totalYearExpense.toLocaleString('bn-BD')}
                  </td>
                  <td className="p-2 text-right border-r border-slate-300 font-mono">
                    ৳ {netYearBalance.toLocaleString('bn-BD')}
                  </td>
                  <td className="p-2 text-center">{yearTransactions.length}টি</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Annual Net Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                {selectedYear} সালের বার্ষিক মোট তহবিল স্থিতি
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                ৳ {netYearBalance.toLocaleString('bn-BD')}
              </div>
              <p className="text-xs text-slate-300">
                {netYearBalance >= 0 ? 'বার্ষিক নিট উদ্বৃত্ত' : 'বার্ষিক নিট ঘাটতি'}
              </p>
            </div>
            <button
              onClick={handlePrintAnnualReport}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>বার্ষিক অডিট শিট প্রিন্ট করুন</span>
            </button>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-12 text-center text-xs text-slate-600 font-semibold border-t border-slate-200">
            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1">হিসাবরক্ষক</div>
              <span className="text-[10px] text-slate-400">হিসাব শাখা</span>
            </div>
            <div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1">অডিট নিরীক্ষক কমিটি</div>
              <span className="text-[10px] text-slate-400">বার্ষিক অডিট</span>
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
