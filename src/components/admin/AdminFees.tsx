import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { FeePayment } from '../../types';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminFees: React.FC = () => {
  const { feePayments, updateFeePaymentStatus, submitFeePayment, students, classes, madrasaInfo } = useMadrasa();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Manual Cash Collection Modal
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'DA-2026-101');
  const [cashMonth, setCashMonth] = useState('মার্চ ২০২৬');
  const [cashAmount, setCashAmount] = useState(4000);
  const [cashRemarks, setCashRemarks] = useState('মাদরাসা ক্যাশ কাউন্টারে জমা');

  // Receipt Modal
  const [receiptToPrint, setReceiptToPrint] = useState<FeePayment | null>(null);

  const filteredPayments = feePayments.filter((f) => {
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchSearch =
      f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.transactionId && f.transactionId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
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

    const newPayment = submitFeePayment({
      studentId: selectedStudentId,
      studentName: st?.nameBangla || 'শিক্ষার্থী',
      classId: st?.classId || 'cls-kitab-3',
      className: st?.className || 'জামাত',
      month: cashMonth,
      year: 2026,
      amount: Number(cashAmount),
      paymentMethod: 'cash',
      transactionId: 'CASH-' + Math.floor(1000 + Math.random() * 9000),
      remarks: cashRemarks,
    });

    // Auto approve cash counter payments
    updateFeePaymentStatus(newPayment.id, 'approved');

    setIsCashModalOpen(false);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <div className="bg-gradient-to-r from-blue-800 to-teal-900 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-200 font-semibold block">ক্যাশ কাউন্টার</span>
            <h4 className="text-base font-bold">ম্যানুয়াল রসিদ প্রদান</h4>
          </div>
          <button
            onClick={() => setIsCashModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            টাকা জমা নিন
          </button>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">ফিল্টার:</span>
            {['all', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  statusFilter === st
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st === 'all' && 'সকল লেনদেন'}
                {st === 'pending' && 'অপেক্ষমাণ (Pending)'}
                {st === 'approved' && 'অনুমোদিত (Paid)'}
                {st === 'rejected' && 'বাতিল'}
              </button>
            ))}
          </div>

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

        {/* Payments Table */}
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
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-blue-800">{p.receiptNumber}</td>

                  <td className="p-3">
                    <div className="font-bold text-slate-900">{p.studentName}</div>
                    <div className="text-[11px] text-slate-500">
                      {p.className} • <span className="font-mono text-blue-700">{p.studentId}</span>
                    </div>
                  </td>

                  <td className="p-3 font-semibold text-slate-800">{p.month}</td>

                  <td className="p-3">
                    <span className="uppercase font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded mr-1 text-slate-700">
                      {p.paymentMethod}
                    </span>
                    <span className="font-mono text-[11px] text-slate-600">
                      {p.transactionId || 'কাউন্টার ক্যাশ'}
                    </span>
                  </td>

                  <td className="p-3 font-bold font-mono text-slate-900 text-sm">৳{p.amount}</td>
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
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 shadow-xs"
                            title="অনুমোদন করুন"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            অনুমোদন
                          </button>
                          <button
                            onClick={() => updateFeePaymentStatus(p.id, 'rejected')}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-2 py-1 rounded-lg text-[11px]"
                            title="বাতিল করুন"
                          >
                            বাতিল
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setReceiptToPrint(p)}
                          className="bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 p-1.5 rounded-lg transition"
                          title="রসিদ দেখুন ও প্রিন্ট করুন"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
                    setSelectedStudentId(e.target.value);
                    const st = students.find((s) => s.id === e.target.value);
                    if (st) setCashAmount(st.monthlyFee);
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কোন মাসের বেতন? *</label>
                  <select
                    value={cashMonth}
                    onChange={(e) => setCashMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="জানুয়ারি ২০২৬">জানুয়ারি ২০২৬</option>
                    <option value="ফেব্রুয়ারি ২০২৬">ফেব্রুয়ারি ২০২৬</option>
                    <option value="মার্চ ২০২৬">মার্চ ২০২৬</option>
                    <option value="এপ্রিল ২০২৬">এপ্রিল ২০২৬</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">টাকার পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    value={cashAmount}
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-blue-900"
                  />
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
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <span className="text-xs font-bold text-amber-300">অফিসিয়াল টাকা জমার রসিদ</span>
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
                <div className="mt-2 inline-block bg-slate-900 text-white font-bold px-3 py-0.5 rounded-full text-[11px]">
                  টাকা আদায়ের অফিসিয়াল রসিদ
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
                  <span className="text-blue-900 text-base font-mono">৳{receiptToPrint.amount}/-</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 text-[10px] text-slate-500">
                <div>
                  <span className="font-semibold text-blue-800">স্ট্যাটাস: অনুমোদিত ও জমাভুক্ত</span>
                  <div>{madrasaInfo.phone}</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 w-24 mb-1"></div>
                  <span>মুহতামিম / প্রধান ক্যাশিয়ার</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 flex justify-between border-t border-slate-200">
              <button
                onClick={handlePrint}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                রসিদ প্রিন্ট করুন
              </button>
              <button
                onClick={() => setReceiptToPrint(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-xl text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
