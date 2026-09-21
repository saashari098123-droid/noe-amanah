import React, { useState, useMemo } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  DollarSign,
  Receipt,
  Download,
  AlertCircle,
  Building2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MADRASA_1447_1448_MONTHS, getTeacherBaseSalaryForMonth } from '../../utils/feeCalculator';
import { TeacherPaySlipModal } from '../common/TeacherPaySlipModal';
import { FinancialTransaction } from '../../types';

export const TeacherSalaryView: React.FC = () => {
  const { currentTeacher, financialTransactions, madrasaInfo } = useMadrasa();
  const [selectedSlip, setSelectedSlip] = useState<{
    transaction: FinancialTransaction;
    month: string;
  } | null>(null);

  if (!currentTeacher) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        কোনো শিক্ষক লগইন করা নেই।
      </div>
    );
  }

  // Get all salary transactions for this teacher
  const mySalaryTransactions = useMemo(() => {
    return financialTransactions.filter(
      (t) =>
        t.category === 'teacher_salary' &&
        (t.referenceId === currentTeacher.id ||
          t.title.includes(currentTeacher.nameBangla) ||
          (t.partyName && t.partyName.includes(currentTeacher.nameBangla)))
    );
  }, [financialTransactions, currentTeacher]);

  // Session summary
  const totalReceived = mySalaryTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const baseMonthlySalary = currentTeacher.salary || 18000;

  // Month-by-month records with accurate historical scale
  const monthRecords = useMemo(() => {
    return MADRASA_1447_1448_MONTHS.map((m) => {
      const txn = mySalaryTransactions.find(
        (t) =>
          (t.salaryMonth && t.salaryMonth === m.displayMonth) ||
          t.title.includes(m.displayMonth) ||
          (t.description && t.description.includes(m.displayMonth))
      );

      const calculatedSalary = getTeacherBaseSalaryForMonth(currentTeacher, m.displayMonth, txn);

      // Check if this month has a specific scale change note
      const scaleEntry = currentTeacher.salaryHistory?.find(
        (sh) =>
          sh.effectiveFromMonth === m.displayMonth ||
          sh.effectiveFromMonth.includes(m.displayMonth)
      );

      return {
        ...m,
        isPaid: !!txn,
        transaction: txn,
        amount: calculatedSalary,
        scaleEntry,
      };
    });
  }, [mySalaryTransactions, currentTeacher]);

  const paidMonthsCount = monthRecords.filter((m) => m.isPaid).length;
  const pendingMonthsCount = monthRecords.length - paidMonthsCount;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold rounded-full">
                আসাতাজায়ে কেরামের হাদিয়া পোর্টাল
              </span>
              <span className="text-xs text-emerald-200">১৪৪৭-১৪৪৮ হিজরি সেশন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Banknote className="w-8 h-8 text-amber-400" />
              আমার মাসিক হাদিয়া ও বেতন বিবরণী
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              মুহতারাম {currentTeacher.nameBangla}, আপনার মাসিক নির্ধারিত হাদিয়া, সেশনের মাসভিত্তিক পরিশোধ বিবরণী এবং অফিসিয়াল পে-স্লিপ এখান থেকে দেখতে ও প্রিন্ট করতে পারবেন।
            </p>
          </div>

          {/* Quick Base Salary Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
            <span className="text-xs text-amber-200 block font-medium">বর্তমান নির্ধারিত হাদিয়া</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono block mt-0.5">
              ৳ {baseMonthlySalary.toLocaleString('bn-BD')}
            </span>
            <span className="text-[10px] text-emerald-200 mt-1 block">
              {currentTeacher.designation}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Received */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">চলতি সেশনে মোট প্রাপ্ত হাদিয়া</p>
            <h4 className="text-2xl font-black text-emerald-700 mt-1">
              ৳ {totalReceived.toLocaleString('bn-BD')}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">{paidMonthsCount} টি মাসের পরিশোধ সম্পন্ন</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Paid Months */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">পরিশোধিত মাস</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">
              {paidMonthsCount} <span className="text-xs font-normal text-slate-500">টি মাস</span>
            </h4>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">ভাউচার জেনারেট সম্পন্ন</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Remaining Months */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">অপেক্ষমান মাস</p>
            <h4 className="text-2xl font-black text-amber-700 mt-1">
              {pendingMonthsCount} <span className="text-xs font-normal text-slate-500">টি মাস</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">সেশনের অবশিষ্ট মাস</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Month By Month Cards Grid */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              ১৪৪৭-১৪৪৮ সেশনের মাসভিত্তিক হাদিয়া রেজিস্টার
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              প্রতিটি মাসের নির্ধারিত স্কেল, পরিশোধ অবস্থা এবং অফিসিয়াল বেতন স্লিপ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {monthRecords.map((m) => {
            return (
              <div
                key={m.index}
                className={`p-4 rounded-2xl border transition ${
                  m.isPaid
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">
                      {m.displayMonth}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {m.yearLabel}
                    </span>
                    {m.scaleEntry && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-100 border border-amber-300/60 text-amber-900 text-[9px] font-bold rounded-md">
                        <TrendingUp className="w-2.5 h-2.5 text-amber-700" />
                        {m.scaleEntry.note || 'নতুন স্কেল কার্যকর'}
                      </span>
                    )}
                  </div>
                  {m.isPaid ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      পরিশোধিত
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-200 text-slate-600 font-semibold text-[10px] rounded-full">
                      <Clock className="w-3 h-3 text-slate-400" />
                      অপেক্ষমান
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {m.isPaid ? 'পরিশোধিত হাদিয়া:' : 'নির্ধারিত হাদিয়া:'}
                    </span>
                    <span className="text-sm font-black font-mono text-slate-800">
                      ৳ {m.amount.toLocaleString('bn-BD')}
                    </span>
                  </div>

                  {m.isPaid && m.transaction ? (
                    <button
                      onClick={() =>
                        setSelectedSlip({
                          transaction: m.transaction!,
                          month: m.displayMonth,
                        })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      পে-স্লিপ
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">প্রক্রিয়াধীন</span>
                  )}
                </div>

                {m.isPaid && m.transaction && (
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                    <span className="font-mono">ভাউচার: {m.transaction.voucherNumber}</span>
                    <span>{m.transaction.date}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pay Slip Modal */}
      {selectedSlip && (
        <TeacherPaySlipModal
          isOpen={true}
          onClose={() => setSelectedSlip(null)}
          teacher={currentTeacher}
          transaction={selectedSlip.transaction}
          month={selectedSlip.month}
        />
      )}
    </div>
  );
};
