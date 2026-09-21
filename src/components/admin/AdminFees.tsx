import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { FeePayment, MonthCategory } from '../../types';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Search,
  X,
  FileText,
  DollarSign,
  Download,
  ExternalLink,
  AlertCircle,
  Phone,
  Send,
  Trash2,
  Moon,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { printReceipt, downloadReceiptImage, generateReceiptHtml } from '../../utils/receiptPrinter';
import {
  calculateStudentFeeSummary,
  HIJRI_MONTHS,
  ENGLISH_MONTHS,
  CURRENT_HIJRI_YEAR,
  CURRENT_ENGLISH_YEAR,
  CURRENT_HIJRI_SESSION_LABEL,
  MADRASA_1447_1448_MONTHS,
  detectMonthCategory,
} from '../../utils/feeCalculator';

export const AdminFees: React.FC = () => {
  const { feePayments, updateFeePaymentStatus, submitFeePayment, deleteFeePayment, clearAllFeePayments, students, classes, madrasaInfo } = useMadrasa();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'hijri' | 'english'>('all');
  const [duesCalendarMode, setDuesCalendarMode] = useState<MonthCategory>('hijri');
  const [smsSuccessMsg, setSmsSuccessMsg] = useState<string | null>(null);

  // Fee Deletion State
  const [feeToDelete, setFeeToDelete] = useState<FeePayment | null>(null);
  const [isClearAllFeesOpen, setIsClearAllFeesOpen] = useState(false);

  // Manual Cash Collection Modal
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'DA-2026-101');
  const [cashMonthCategory, setCashMonthCategory] = useState<MonthCategory>('hijri');
  const [cashMonth, setCashMonth] = useState('জিলকদ ১৪৪৭ হিজরি');
  const [regularMonthlyFee, setRegularMonthlyFee] = useState(students[0]?.monthlyFee || 4000);
  const [cashAmount, setCashAmount] = useState(students[0]?.monthlyFee || 4000);
  const [cashWaivedAmount, setCashWaivedAmount] = useState(0);
  const [isWaiveSettled, setIsWaiveSettled] = useState(true);
  const [waiverReason, setWaiverReason] = useState('আর্থিক অসচ্ছলতা ও পারিবারিক সমস্যা');
  const [cashRemarks, setCashRemarks] = useState('মাদরাসা ক্যাশ কাউন্টারে জমা');

  // Receipt Modal
  const [receiptToPrint, setReceiptToPrint] = useState<FeePayment | null>(null);

  // Calculate Madrasa-wide Dues and Defaulters
  const studentsWithDues = students.map((st) => {
    const summary = calculateStudentFeeSummary(st, feePayments, undefined, duesCalendarMode);
    return {
      student: st,
      summary,
    };
  }).filter((item) => item.summary.hasDue);

  const totalMadrasaDue = studentsWithDues.reduce((acc, curr) => acc + curr.summary.totalDue, 0);

  // Calculate Total Fee Waivers Granted by Madrasa (বকেয়ামুক্ত মওকুফ)
  const totalWaivedMadrasa = feePayments
    .filter((f) => f.status === 'approved')
    .reduce((acc, curr) => acc + (curr.waivedAmount || curr.discount || 0), 0);

  const waivedPaymentsCount = feePayments
    .filter((f) => f.status === 'approved' && ((f.waivedAmount && f.waivedAmount > 0) || (f.discount && f.discount > 0))).length;

  const filteredPayments = feePayments.filter((f) => {
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'waived'
        ? Boolean((f.waivedAmount && f.waivedAmount > 0) || (f.discount && f.discount > 0))
        : f.status === statusFilter;
    const itemCategory = f.monthCategory || detectMonthCategory(f.month);
    const matchCalendar = calendarFilter === 'all' || itemCategory === calendarFilter;
    const matchSearch =
      f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.transactionId && f.transactionId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.month && f.month.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.receiptNumber && f.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.receiptNo && f.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.waiverReason && f.waiverReason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchCalendar && matchSearch;
  });

  const filteredDues = studentsWithDues.filter(({ student }) => {
    const matchSearch =
      student.nameBangla.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.guardianPhone && student.guardianPhone.includes(searchQuery));
    return matchSearch;
  });

  const totalCollected = feePayments
    .filter((f) => f.status === 'approved')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = feePayments
    .filter((f) => f.status === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleManualCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    const hasWaiver = isWaiveSettled && Number(cashWaivedAmount) > 0;
    let paymentYear = cashMonthCategory === 'hijri' ? 1448 : 2026;
    if (cashMonthCategory === 'hijri') {
      if (cashMonth.includes('1447') || cashMonth.includes('১৪৪৭')) {
        paymentYear = 1447;
      }
    }

    const newPayment = submitFeePayment({
      studentId: selectedStudentId,
      studentName: st?.nameBangla || 'শিক্ষার্থী',
      studentNameBangla: st?.nameBangla || 'শিক্ষার্থী',
      classId: st?.classId || 'cls-kitab-3',
      className: st?.className || 'জামাত',
      month: cashMonth,
      monthCategory: cashMonthCategory,
      year: paymentYear,
      amount: Number(cashAmount),
      originalFee: Number(regularMonthlyFee),
      waivedAmount: hasWaiver ? Number(cashWaivedAmount) : 0,
      discount: hasWaiver ? Number(cashWaivedAmount) : 0,
      isFullSettledWithWaiver: hasWaiver,
      waiverReason: hasWaiver ? waiverReason : undefined,
      paymentMethod: 'cash',
      transactionId: 'CASH-' + Math.floor(1000 + Math.random() * 9000),
      remarks: cashRemarks + (hasWaiver ? ` (মওকুফ: ৳${cashWaivedAmount}/-, কারণ: ${waiverReason})` : ''),
      status: 'approved',
      approvedBy: 'ক্যাশ কাউন্টার',
    });

    setIsCashModalOpen(false);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  };

  const getStudentDuesForReceipt = (receipt: FeePayment) => {
    const st = students.find((s) => s.id === receipt.studentId);
    if (st) {
      const sum = calculateStudentFeeSummary(st, feePayments);
      return { dueAmount: sum.totalDue, dueNote: sum.dueMonths.join(', ') };
    }
    return { dueAmount: 0, dueNote: '' };
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (!receiptToPrint) return;
    setIsPrinting(true);
    const { dueAmount, dueNote } = getStudentDuesForReceipt(receiptToPrint);
    try {
      await printReceipt(receiptToPrint, madrasaInfo, dueAmount, dueNote);
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadReceiptImage = async () => {
    if (!receiptToPrint) return;
    setIsDownloading(true);
    const { dueAmount, dueNote } = getStudentDuesForReceipt(receiptToPrint);
    try {
      await downloadReceiptImage(receiptToPrint, madrasaInfo, dueAmount, dueNote);
      confetti({ particleCount: 40, spread: 40, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendReminderSms = (studentName: string, phone?: string, dueAmount: number = 0) => {
    setSmsSuccessMsg(`মুহতারাম অভিভাবক, ${studentName}-এর ৳${dueAmount.toLocaleString('en-IN')} বকেয়া ফি পরিশোধের বার্তা ${phone || 'নম্বরে'} সফলভাবে পাঠানো হয়েছে।`);
    setTimeout(() => setSmsSuccessMsg(null), 5000);
  };

  const handleOpenReceiptNewTab = () => {
    if (!receiptToPrint) return;
    const html = generateReceiptHtml(receiptToPrint, madrasaInfo);
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
    } else {
      handlePrint();
    }
  };

  return (
    <div className="space-y-6">
      {smsSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{smsSuccessMsg}</span>
          </div>
          <button onClick={() => setSmsSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200">
          <span className="text-xs text-slate-400 font-semibold block">মোট আদায়কৃত ফি (অনুমোদিত)</span>
          <span className="text-2xl font-black text-blue-800 mt-1 block font-mono">
            ৳{totalCollected.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500">অনলাইন ও ক্যাশ আদায়</span>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200">
          <span className="text-xs text-slate-400 font-semibold block">অপেক্ষমাণ অনলাইন ট্রানজেকশন</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block font-mono">
            ৳{totalPending.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold">
            {feePayments.filter((f) => f.status === 'pending').length} টি পেমেন্ট যাচাইযোগ্য
          </span>
        </div>

        {/* Madrasa Fee Waivers (মওকুফ ও ছাড় খতিয়ান) */}
        <div
          onClick={() => setStatusFilter('waived')}
          className="bg-amber-50/90 border border-amber-200 hover:border-amber-300 p-5 rounded-3xl shadow-xs cursor-pointer transition"
          title="বিশেষ মওকুফ ও ছাড়ের তালিকা দেখুন"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-900 font-bold uppercase tracking-wider block">বিশেষ ছাড় ও মওকুফ</span>
            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              {waivedPaymentsCount} টি লেনদেন
            </span>
          </div>
          <span className="text-2xl font-black text-amber-900 mt-1 block font-mono">
            ৳{totalWaivedMadrasa.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> বকেয়ামুক্ত মওকুফ খতিয়ান
          </span>
        </div>

        {/* Madrasa-wide Dues Card */}
        <div
          id="admin-total-dues-card"
          onClick={() => setStatusFilter('dues')}
          className="bg-rose-50/90 border border-rose-200 hover:border-rose-300 p-5 rounded-3xl shadow-xs cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 font-bold uppercase tracking-wider block">সর্বমোট বকেয়া ফি</span>
            <span className="text-[10px] bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded-full">
              {studentsWithDues.length} জন ছাত্র
            </span>
          </div>
          <span className="text-2xl font-black text-rose-800 mt-1 block font-mono">
            ৳{totalMadrasaDue.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5" /> বকেয়া তালিকা দেখতে ক্লিক করুন
          </span>
        </div>

        <div className="bg-gradient-to-r from-blue-800 to-teal-900 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-200 font-semibold block">ক্যাশ কাউন্টার</span>
            <h4 className="text-base font-bold">ম্যানুয়াল রসিদ প্রদান</h4>
          </div>
          <button
            onClick={() => {
              const st = students[0];
              const fee = st?.monthlyFee || 4000;
              setRegularMonthlyFee(fee);
              setCashAmount(fee);
              setCashWaivedAmount(0);
              setIsCashModalOpen(true);
            }}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            টাকা জমা নিন
          </button>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        {/* Dual Category Filter (আরবি মাস ও ইংরেজি মাস) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700">ক্যালেন্ডার ক্যাটাগরি:</span>
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setCalendarFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  calendarFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সব ক্যাটাগরি
              </button>
              <button
                onClick={() => setCalendarFilter('hijri')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  calendarFilter === 'hijri'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>🌙 আরবি মাস (হিজরি)</span>
              </button>
              <button
                onClick={() => setCalendarFilter('english')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  calendarFilter === 'english'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-blue-800 hover:bg-blue-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>📅 ইংরেজি মাস</span>
              </button>
            </div>
          </div>

          {statusFilter === 'dues' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">বকেয়া নিরীক্ষণ:</span>
              <button
                onClick={() => setDuesCalendarMode(duesCalendarMode === 'hijri' ? 'english' : 'hijri')}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-lg transition inline-flex items-center gap-1 border border-amber-300"
              >
                {duesCalendarMode === 'hijri' ? '🌙 আরবি মাস অনুসারে' : '📅 ইংরেজি মাস অনুসারে'}
                <span className="text-[10px] text-amber-800 underline ml-1">বদলান</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">স্ট্যাটাস:</span>
            {['all', 'pending', 'approved', 'waived', 'rejected', 'dues'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  statusFilter === st
                    ? st === 'dues'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : st === 'waived'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-blue-800 text-white shadow-xs'
                    : st === 'dues'
                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    : st === 'waived'
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st === 'all' && 'সকল লেনদেন'}
                {st === 'pending' && 'অপেক্ষমাণ (Pending)'}
                {st === 'approved' && 'অনুমোদিত (Paid)'}
                {st === 'waived' && `বিশেষ ছাড় ও মওকুফ (${waivedPaymentsCount})`}
                {st === 'rejected' && 'বাতিল'}
                {st === 'dues' && (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-current" />
                    <span>বকেয়া তালিকা ({studentsWithDues.length})</span>
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {feePayments.length > 0 && (
              <button
                onClick={() => setIsClearAllFeesOpen(true)}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200 cursor-pointer shrink-0"
                title="সকল ফি রেকর্ড মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>সকল ফি ক্লিয়ার</span>
              </button>
            )}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ছাত্র আইডি, TrxID বা নাম..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* If statusFilter === 'dues': Show Defaulters Table */}
        {statusFilter === 'dues' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-900 px-4 py-2.5 rounded-2xl text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                বকেয়া ফি হিসাব: মোট {filteredDues.length} জন শিক্ষার্থীর বেতন বকেয়া রয়েছে (মোট বকেয়া: ৳{totalMadrasaDue.toLocaleString('en-IN')}/-)
              </span>
              <span className="text-[11px] text-rose-700 font-mono">২০২৬ শিক্ষাবর্ষ</span>
            </div>

            {filteredDues.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                কোনো বকেয়া শিক্ষার্থী পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full min-w-[780px] text-xs text-left">
                  <thead className="bg-rose-50/70 text-rose-950 font-bold border-b border-rose-200">
                    <tr>
                      <th className="p-3">রোল ও আইডি</th>
                      <th className="p-3">ছাত্রের নাম ও জামাত</th>
                      <th className="p-3">বকেয়া মাসসমূহ</th>
                      <th className="p-3">মোট বকেয়া ফি</th>
                      <th className="p-3">অভিভাবক ও ফোন</th>
                      <th className="p-3 text-center">দ্রুত ব্যবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDues.map(({ student: st, summary }) => (
                      <tr key={st.id} className="hover:bg-rose-50/30 transition">
                        <td className="p-3 font-mono font-bold text-slate-900">
                          <div>রোল: {st.roll}</div>
                          <div className="text-[11px] text-blue-700">{st.id}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{st.nameBangla}</div>
                          <div className="text-[11px] text-slate-500">{st.className}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {summary.dueMonths.map((m) => (
                              <span key={m} className="bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-mono font-extrabold text-rose-700 text-sm">
                          ৳{summary.totalDue.toLocaleString('en-IN')}/-
                        </td>
                        <td className="p-3 text-slate-600">
                          <div>{st.fatherName || 'অভিভাবক'}</div>
                          <div className="font-mono text-blue-800 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {st.guardianPhone || st.phone || 'ফোন নেই'}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudentId(st.id);
                                const fee = st.monthlyFee || 4000;
                                setRegularMonthlyFee(fee);
                                setCashAmount(fee);
                                setCashWaivedAmount(0);
                                if (summary.dueMonths.length > 0) {
                                  const targetM = summary.dueMonths[0];
                                  setCashMonth(`${targetM} ${duesCalendarMode === 'hijri' ? CURRENT_HIJRI_YEAR : CURRENT_ENGLISH_YEAR}`);
                                  setCashMonthCategory(duesCalendarMode);
                                }
                                setIsCashModalOpen(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition shadow-xs flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" /> ক্যাশ ফি নিন
                            </button>
                            <button
                              onClick={() => handleSendReminderSms(st.nameBangla, st.guardianPhone, summary.totalDue)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-lg text-[11px] transition border border-blue-200 flex items-center gap-1"
                            >
                              <Send className="w-3 h-3 text-blue-600" /> SMS তাগাদা
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Payments Table */
          <div className="space-y-3">
          <div className="sm:hidden flex items-center justify-between bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold">
            <span>📱 মোবাইলে ফি ও ট্রানজেকশন তালিকা দেখতে ডানে স্ক্রল করুন</span>
            <span className="font-mono text-xs">👉</span>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[780px] text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">রসিদ নং</th>
                  <th className="p-3">ছাত্রের নাম ও জামাত</th>
                  <th className="p-3">মাস</th>
                  <th className="p-3">মাধ্যম ও ট্রানজেকশন</th>
                  <th className="p-3">পরিমাণ</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                  <th className="p-3 text-center">অনুমোদন / রসিদ</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">কোনো ফি লেনদেন পাওয়া যায়নি</h4>
                        <p className="text-xs text-slate-500">
                          পূর্বের সকল ফি তথ্য ক্লিয়ার করা হয়েছে। নতুন ফি জমা করতে উপরের বাটনে ক্লিক করুন।
                        </p>
                      </div>
                      <button
                        onClick={() => setIsCashModalOpen(true)}
                        className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        নতুন ক্যাশ ফি নিন
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-blue-800">{p.receiptNumber}</td>

                    <td className="p-3">
                      <div className="font-bold text-slate-900">{p.studentName}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.className} • <span className="font-mono text-blue-700">{p.studentId}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(p.monthCategory === 'hijri' || detectMonthCategory(p.month) === 'hijri') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                            <Moon className="w-2.5 h-2.5 text-emerald-600" />
                            আরবি
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                            <Calendar className="w-2.5 h-2.5 text-blue-600" />
                            ইংরেজি
                          </span>
                        )}
                        <span className="font-bold text-slate-800 text-xs">{p.month}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="uppercase font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded mr-1 text-slate-700">
                        {p.paymentMethod}
                      </span>
                      <span className="font-mono text-[11px] text-slate-600">
                        {p.transactionId || 'কাউন্টার ক্যাশ'}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-bold font-mono text-slate-900 text-sm">৳{p.amount.toLocaleString('en-IN')}</div>
                      {((p.waivedAmount && p.waivedAmount > 0) || (p.discount && p.discount > 0)) && (
                        <div className="mt-1 space-y-0.5">
                          <span className="inline-block text-[10px] text-amber-900 font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            ছাড়: ৳{(p.waivedAmount || p.discount || 0).toLocaleString('en-IN')} (বকেয়ামুক্ত)
                          </span>
                          {p.waiverReason && (
                            <div className="text-[10px] text-slate-500 italic max-w-[150px] truncate" title={p.waiverReason}>
                              {p.waiverReason}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">{p.paidAt}</td>

                    <td className="p-3 text-center">
                      {p.status === 'approved' && (
                        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          অনুমোদিত
                        </span>
                      )}
                      {p.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          অপেক্ষমাণ
                        </span>
                      )}
                      {p.status === 'rejected' && (
                        <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          বাতিল
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {p.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateFeePaymentStatus(p.id, 'approved')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                              title="অনুমোদন করুন"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              অনুমোদন
                            </button>
                            <button
                              onClick={() => updateFeePaymentStatus(p.id, 'rejected')}
                              className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-2 py-1 rounded-lg text-[11px] cursor-pointer"
                              title="বাতিল করুন"
                            >
                              বাতিল
                            </button>
                          </>
                        ) : p.status === 'approved' ? (
                          <button
                            onClick={() => setReceiptToPrint(p)}
                            className="bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 p-1.5 rounded-lg transition cursor-pointer"
                            title="রসিদ দেখুন ও প্রিন্ট করুন"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-rose-500 font-semibold px-2 py-1 bg-rose-50 rounded-lg">
                            বাতিলকৃত
                          </span>
                        )}
                        <button
                          onClick={() => setFeeToDelete(p)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                          title="এই ফি রেকর্ডটি মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
      </div>

      {/* Manual Cash Entry Modal */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">ক্যাশ কাউন্টার ফি আদায় এন্ট্রি</h3>
              </div>
              <button
                onClick={() => setIsCashModalOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualCashSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ছাত্র নির্বাচন করুন *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedStudentId(id);
                    const st = students.find((s) => s.id === id);
                    const fee = st?.monthlyFee || 4000;
                    setRegularMonthlyFee(fee);
                    setCashAmount(fee);
                    setCashWaivedAmount(0);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nameBangla} ({st.className} - রোল {st.roll}) — আইডি: {st.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    বেতন ক্যালেন্ডার সিস্টেম নির্বাচন করুন *
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setCashMonthCategory('hijri');
                        setCashMonth('জিলকদ ১৪৪৭ হিজরি');
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        cashMonthCategory === 'hijri'
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-white/60'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>🌙 আরবি মাস (হিজরি)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCashMonthCategory('english');
                        setCashMonth(`সেপ্টেম্বর ${CURRENT_ENGLISH_YEAR}`);
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        cashMonthCategory === 'english'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-white/60'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>📅 ইংরেজি মাস</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {cashMonthCategory === 'hijri' ? 'আরবি মাস বেছে নিন (১৪৪৭-১৪৪৮ শিক্ষাবর্ষ) *' : 'ইংরেজি মাস বেছে নিন *'}
                  </label>
                  <select
                    value={cashMonth}
                    onChange={(e) => setCashMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    {cashMonthCategory === 'hijri' ? (
                      MADRASA_1447_1448_MONTHS.map((m) => (
                        <option key={m.month} value={`${m.displayMonth} হিজরি`}>
                          🌙 {m.displayMonth} {m.badgeNote ? `(${m.badgeNote})` : ''}
                        </option>
                      ))
                    ) : (
                      ENGLISH_MONTHS.map((m) => (
                        <option key={m} value={`${m} ${CURRENT_ENGLISH_YEAR}`}>
                          📅 {m} ({CURRENT_ENGLISH_YEAR})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Financial Calculation & Concession Box */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-600">ছাত্রের নির্ধারিত নিয়মিত মাসিক ফি:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      ৳{regularMonthlyFee.toLocaleString('en-IN')}/-
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        নগদ আদায়ের পরিমাণ (Paid) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 font-bold text-slate-400">৳</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={cashAmount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCashAmount(val);
                            if (val < regularMonthlyFee) {
                              setCashWaivedAmount(regularMonthlyFee - val);
                            } else {
                              setCashWaivedAmount(0);
                            }
                          }}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">কাউন্টারে ছাত্র যত টাকা দিয়েছে</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-amber-900 mb-1 flex items-center justify-between">
                        <span>বিশেষ ছাড় / মওকুফ (Waiver)</span>
                        {cashWaivedAmount > 0 && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                            ছাড় প্রদান
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 font-bold text-amber-600">৳</span>
                        <input
                          type="number"
                          min="0"
                          value={cashWaivedAmount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCashWaivedAmount(val);
                            setCashAmount(Math.max(0, regularMonthlyFee - val));
                          }}
                          className="w-full pl-8 pr-3 py-2 bg-amber-50/60 border border-amber-300 rounded-xl font-mono font-bold text-amber-900 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <span className="text-[10px] text-amber-700 mt-1 block">টাকার ঘাটতিতে মওকুফকৃত অংশ</span>
                    </div>
                  </div>

                  {/* Preset Quick Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-500 font-semibold mr-1">দ্রুত নির্বাচন:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCashAmount(regularMonthlyFee);
                        setCashWaivedAmount(0);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        cashWaivedAmount === 0
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      পূর্ণ আদায় (ছাড় নেই)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const waived = Math.min(500, regularMonthlyFee);
                        setCashWaivedAmount(waived);
                        setCashAmount(regularMonthlyFee - waived);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        cashWaivedAmount === 500
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      ৳৫০০ ছাড়
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const waived = Math.min(1000, regularMonthlyFee);
                        setCashWaivedAmount(waived);
                        setCashAmount(regularMonthlyFee - waived);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        cashWaivedAmount === 1000
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      ৳১,০০০ ছাড়
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const waived = Math.min(2000, regularMonthlyFee);
                        setCashWaivedAmount(waived);
                        setCashAmount(regularMonthlyFee - waived);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        cashWaivedAmount === 2000
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      ৳২,০০০ ছাড়
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCashWaivedAmount(regularMonthlyFee);
                        setCashAmount(0);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        cashAmount === 0 && cashWaivedAmount === regularMonthlyFee
                          ? 'bg-purple-700 text-white'
                          : 'bg-purple-50 border border-purple-300 text-purple-900 hover:bg-purple-100'
                      }`}
                    >
                      পূর্ণ মওকুফ (ফ্রি)
                    </button>
                  </div>

                  {/* Waiver Arrear Exclusion Checkbox & Reason */}
                  {cashWaivedAmount > 0 && (
                    <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3 space-y-2.5 mt-2">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="isWaiveSettled"
                          checked={isWaiveSettled}
                          onChange={(e) => setIsWaiveSettled(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        />
                        <label htmlFor="isWaiveSettled" className="cursor-pointer">
                          <span className="font-bold text-amber-950 block text-xs">
                            মওকুফকৃত টাকা ভবিষ্যতে আর বকেয়া হিসেবে গণ্য হবে না (সম্পূর্ণ নিষ্পত্তি) ✓
                          </span>
                          <span className="text-[10px] text-amber-800 leading-relaxed block mt-0.5">
                            ছাত্রের আর্থিক সংকটে মাদরাসা এই ছাড় মঞ্জুর করেছে। তাই অবশিষ্ট অর্থ বকেয়া তালিকায় উঠবে না।
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="block font-bold text-amber-950 mb-1 text-[11px]">
                          মওকুফ বা বিশেষ ছাড়ের কারণ *
                        </label>
                        <select
                          value={waiverReason}
                          onChange={(e) => setWaiverReason(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="আর্থিক অসচ্ছলতা ও পারিবারিক সমস্যা">আর্থিক অসচ্ছলতা ও পারিবারিক সমস্যা</option>
                          <option value="মুহতামিম / শিক্ষা পরিচালকের বিশেষ সুপারিশ">মুহতামিম / শিক্ষা পরিচালকের বিশেষ সুপারিশ</option>
                          <option value="এতিম ও দুঃস্থ ছাত্র ফান্ড থেকে সহায়তা">এতিম ও দুঃস্থ ছাত্র ফান্ড থেকে সহায়তা</option>
                          <option value="পিতার সাময়িক আয়ের অভাব / অপারগতা">পিতার সাময়িক আয়ের অভাব / অপারগতা</option>
                          <option value="মেধা বৃত্তি ও বিশেষ রেয়াত (মাদরাসা ফান্ড)">মেধা বৃত্তি ও বিশেষ রেয়াত (মাদরাসা ফান্ড)</option>
                          <option value="সাধারণ মৌখিক সম্মতি ও বিবেচনা">সাধারণ মৌখিক সম্মতি ও বিবেচনা</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">মন্তব্য / বিবরণ</label>
                <input
                  type="text"
                  value={cashRemarks}
                  onChange={(e) => setCashRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCashModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-md"
                >
                  টাকা জমা নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptToPrint && receiptToPrint.status === 'approved' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <span className="text-xs font-bold text-amber-300">অফিসিয়াল টাকা জমার রসিদ (PAID)</span>
              <button
                onClick={() => setReceiptToPrint(null)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="font-['Amiri'] text-blue-800 text-sm">{madrasaInfo.nameArabic}</div>
                <h3 className="font-bold text-base text-slate-900">{madrasaInfo.nameBangla}</h3>
                <p className="text-[11px] text-slate-500">{madrasaInfo.address}</p>
                <div className="mt-2 inline-block bg-emerald-700 text-white font-bold px-3 py-0.5 rounded-full text-[11px]">
                  পরিশোধিত অফিসিয়াল রসিদ (PAID RECEIPT)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400">রসিদ নং:</span>{' '}
                  <strong className="font-mono text-blue-800">{receiptToPrint.receiptNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400">তারিখ:</span>{' '}
                  <strong>{receiptToPrint.paidAt}</strong>
                </div>
                <div>
                  <span className="text-slate-400">ছাত্র আইডি:</span>{' '}
                  <strong className="font-mono">{receiptToPrint.studentId}</strong>
                </div>
                <div>
                  <span className="text-slate-400">শ্রেণি:</span>{' '}
                  <strong>{receiptToPrint.className}</strong>
                </div>
              </div>

              <div className="space-y-1.5 border-b border-slate-200 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold">{receiptToPrint.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">পরিশোধের মাস ও বছর:</span>
                  <span className="font-bold">{receiptToPrint.month} ({receiptToPrint.year})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">পেমেন্ট মেথড:</span>
                  <span className="uppercase font-semibold">{receiptToPrint.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ট্রানজেকশন আইডি:</span>
                  <span className="font-mono font-bold text-blue-800">
                    {receiptToPrint.transactionId || 'কাউন্টার ক্যাশ'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold">
                  <span>মোট আদায়কৃত টাকা:</span>
                  <span className="text-emerald-700 text-base font-mono">৳{receiptToPrint.amount}/- (PAID)</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 text-[10px] text-slate-500">
                <div>
                  <span className="font-semibold text-emerald-800">স্ট্যাটাস: অনুমোদিত ও পরিশোধিত (PAID)</span>
                  <div>{madrasaInfo.phone}</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 w-24 mb-1"></div>
                  <span>মুহতামিম / প্রধান ক্যাশিয়ার</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  {isPrinting ? 'প্রিন্ট হচ্ছে...' : 'রসিদ প্রিন্ট করুন'}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadReceiptImage}
                  disabled={isDownloading}
                  className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? 'ডাউনলোড হচ্ছে...' : 'রসিদ ডাউনলোড (ছবি)'}
                </button>

                <button
                  type="button"
                  onClick={handleOpenReceiptNewTab}
                  className="bg-slate-700 hover:bg-slate-800 active:scale-95 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                  title="আলাদা উইন্ডোতে রসিদ খুলুন"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  নতুন ট্যাবে
                </button>
              </div>

              <button
                type="button"
                onClick={() => setReceiptToPrint(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-xl text-xs ml-auto"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Fee Confirmation Modal */}
      {feeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center animate-in fade-in zoom-in-95">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">ফি রেকর্ডটি মুছে ফেলতে চান?</h3>
            <p className="text-xs text-slate-500">
              ছাত্র: <span className="font-bold text-slate-700">{feeToDelete.studentName}</span>
              <br />
              মাস: {feeToDelete.month} (৳{feeToDelete.amount})
              <br />
              এই রেকর্ডটি তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হবে।
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setFeeToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  deleteFeePayment(feeToDelete.id);
                  setFeeToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Fees Confirmation Modal */}
      {isClearAllFeesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center animate-in fade-in zoom-in-95">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">সকল ফি রেকর্ড মুছে ফেলতে চান?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনি কি নিশ্চিত যে পূর্বের সকল ডেমো ফি ও আদায়কৃত রসিদ মুছে ফেলতে চান? এটি স্থায়ীভাবে সকল ফি তথ্য খালি করে দেবে যাতে আপনি নতুন করে হিসাব যোগ করতে পারেন।
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsClearAllFeesOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  clearAllFeePayments();
                  setIsClearAllFeesOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
              >
                হ্যাঁ, সব ক্লিয়ার করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
