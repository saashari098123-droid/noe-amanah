import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { FeePayment } from '../../types';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  AlertCircle,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentFees: React.FC = () => {
  const { currentStudent, feePayments, submitFeePayment, madrasaInfo } = useMadrasa();

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('মার্চ ২০২৬');
  const [amount, setAmount] = useState(currentStudent?.monthlyFee || 4000);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');

  // Selected receipt modal
  const [receiptToPrint, setReceiptToPrint] = useState<FeePayment | null>(null);

  if (!currentStudent) return null;

  const myPayments = feePayments.filter((p) => p.studentId === currentStudent.id);

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeePayment({
      studentId: currentStudent.id,
      studentName: currentStudent.nameBangla,
      classId: currentStudent.classId,
      className: currentStudent.className,
      month: selectedMonth,
      year: 2026,
      amount: Number(amount),
      paymentMethod,
      transactionId: transactionId.trim().toUpperCase(),
      senderPhone: senderNumber,
      remarks: remarks || 'অনলাইন পোর্টাল থেকে ফি পরিশোধ',
    });

    setIsPayModalOpen(false);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setSenderNumber('');
    setTransactionId('');
  };

  const handlePrintReceipt = () => {
    const printContent = document.getElementById('printable-receipt');
    if (!printContent) {
      window.print();
      return;
    }
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>মানি রসিদ</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');
              body { font-family: sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            </style>
          </head>
          <body class="bg-white p-8">
            <div class="max-w-md mx-auto border border-slate-300 p-6 rounded-xl text-black">
              ${printContent.innerHTML}
            </div>
            <script>
              // Wait for Tailwind to process
              setTimeout(() => {
                window.print();
              }, 1000);
            </script>
          </body>
        </html>
      `);
      iframeDoc.close();
      
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 120000); // Remove after 2 minutes
    } else {
      window.print();
    }
  };

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* Fee Overview Strip */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-blue-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs text-amber-300 font-bold uppercase tracking-widest bg-blue-800/80 px-3 py-1 rounded-full">
            বেতন ও ফি ব্যবস্থাপনা
          </span>
          <h2 className="text-2xl font-bold">
            {currentStudent.nameBangla} — মাসিক বেতন হিসাব
          </h2>
          <p className="text-xs text-blue-200">
            শ্রেণি: {currentStudent.className} • নির্ধারিত মাসিক ফি: ৳{currentStudent.monthlyFee}/- (আবাসিক/অনাবাসিক)
          </p>
        </div>

        <button
          onClick={() => setIsPayModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition flex items-center gap-2 shrink-0"
        >
          <CreditCard className="w-4 h-4" />
          অনলাইনে ফি জমা দিন
        </button>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            পূর্ববর্তী পেমেন্ট ও লেনদেনের ইতিহাস
          </h3>
          <span className="text-xs text-slate-500">মোট লেনদেন: {myPayments.length} টি</span>
        </div>

        {myPayments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            এখনও কোন পেমেন্ট রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div className="space-y-3">
            <div className="sm:hidden flex items-center justify-between bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold">
              <span>📱 মোবাইলে ফি রসিদ ও ট্রানজেকশন তালিকা দেখতে ডানে স্ক্রল করুন</span>
              <span className="font-mono text-xs">👉</span>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[750px] text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">রসিদ নং</th>
                    <th className="p-3">মাসের নাম</th>
                    <th className="p-3">পরিশোধের মাধ্যম</th>
                    <th className="p-3">ট্রানজেকশন আইডি (TrxID)</th>
                    <th className="p-3">পরিমাণ</th>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3 text-center">অনুমোদন স্ট্যাটাস</th>
                    <th className="p-3 text-center">রসিদ</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-100">
                {myPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-blue-800">{pay.receiptNumber}</td>
                    <td className="p-3 font-semibold text-slate-900">{pay.month}</td>
                    <td className="p-3 uppercase">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{pay.transactionId || 'নগদ কাউন্টার'}</td>
                    <td className="p-3 font-bold text-slate-900 font-mono text-sm">৳{pay.amount}</td>
                    <td className="p-3 text-slate-500">{pay.paidAt}</td>
                    <td className="p-3 text-center">
                      {pay.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          অনুমোদিত (Approved)
                        </span>
                      )}
                      {pay.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          অপেক্ষমাণ (Pending)
                        </span>
                      )}
                      {pay.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                          বাতিল (Rejected)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {pay.status === 'approved' ? (
                        <button
                          onClick={() => setReceiptToPrint(pay)}
                          className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold px-2.5 py-1 rounded-lg text-xs transition inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          মানি রসিদ
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Online Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">অনলাইন স্কুল এন্ড কলেজ বেতন পরিশোধ</h3>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">কোন মাসের ফি?</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  {[
                    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
                    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
                  ].map(m => (
                    <option key={m} value={`${m} ২০২৬`}>{m} ২০২৬</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">টাকার পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-base text-blue-800"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">পেমেন্ট মাধ্যম বেছে নিন</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-500 bg-pink-50 text-pink-700 ring-2 ring-pink-400'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    বিকাশ (bKash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition ${
                      paymentMethod === 'nagad'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-400'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    নগদ (Nagad)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition ${
                      paymentMethod === 'bank'
                        ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-400'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    ব্যাংক ট্রান্সফার
                  </button>
                </div>
              </div>

              {/* Madrasa Official Account Number instruction */}
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                {paymentMethod === 'bkash' && (
                  <div>
                    <span className="font-bold text-pink-700 block">বিকাশ মার্চেন্ট / পার্সোনাল নম্বর:</span>
                    <strong className="font-mono text-sm">01711-223344</strong> (Send Money / Make Payment)
                  </div>
                )}
                {paymentMethod === 'nagad' && (
                  <div>
                    <span className="font-bold text-orange-700 block">নগদ একাউন্ট নম্বর:</span>
                    <strong className="font-mono text-sm">01811-223344</strong> (Send Money)
                  </div>
                )}
                {paymentMethod === 'bank' && (
                  <div>
                    <span className="font-bold text-teal-800 block">ইসলামী ব্যাংক বাংলাদেশ লিঃ:</span>
                    <span>হিসাব নাম: Darul Amanah Al Islamia</span>
                    <br />
                    <span>হিসাব নং: <strong className="font-mono">2050 1122 3344 5566</strong></span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile / Account) *
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ট্রানজেকশন আইডি (Transaction ID / TrxID) *
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="উদাঃ 9H8K2M1L9P"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase font-bold text-blue-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-md"
                >
                  ফি দাখিল নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Printable Money Receipt Modal */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:bg-white print:p-0 print:absolute print:inset-0">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8 print:shadow-none print:border-none print:my-0 print:w-full print:max-w-none print:rounded-none">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center print:hidden">
              <span className="text-xs font-bold text-amber-300">অফিসিয়াল টাকা জমার রসিদ</span>
              <button
                onClick={() => setReceiptToPrint(null)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Madrasa Money Receipt */}
            <div id="printable-receipt" className="p-6 space-y-4 text-xs text-slate-800">
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="font-['Amiri'] text-blue-800 text-sm">{madrasaInfo.nameArabic}</div>
                <h3 className="font-bold text-base text-slate-900">{madrasaInfo.nameBangla}</h3>
                <p className="text-[11px] text-slate-500">{madrasaInfo.address}</p>
                <div className="mt-2 inline-block bg-slate-900 text-white font-bold px-3 py-0.5 rounded-full text-[11px] print:bg-transparent print:border print:border-slate-900 print:text-slate-900">
                  টাকা আদায়ের মানি রসিদ (Money Receipt)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 print:bg-transparent">
                <div>
                  <span className="text-slate-400 print:text-slate-600">রসিদ নং:</span>{' '}
                  <strong className="font-mono text-blue-800 print:text-slate-900">{receiptToPrint.receiptNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600">তারিখ:</span>{' '}
                  <strong>{receiptToPrint.paidAt}</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600">ছাত্র আইডি:</span>{' '}
                  <strong className="font-mono">{receiptToPrint.studentId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600">শ্রেণি:</span>{' '}
                  <strong>{receiptToPrint.className}</strong>
                </div>
              </div>

              <div className="space-y-1.5 border-b border-slate-200 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-700">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold">{receiptToPrint.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-700">পরিশোধের মাস ও বছর:</span>
                  <span className="font-bold">{receiptToPrint.month} ({receiptToPrint.year})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-700">পেমেন্ট মেথড:</span>
                  <span className="uppercase font-semibold">{receiptToPrint.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-700">ট্রানজেকশন আইডি:</span>
                  <span className="font-mono font-bold text-blue-800 print:text-slate-900">
                    {receiptToPrint.transactionId || 'কাউন্টার ক্যাশ'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold">
                  <span>মোট পরিশোধিত টাকা:</span>
                  <span className="text-blue-900 text-base font-mono print:text-slate-900">৳{receiptToPrint.amount}/-</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 text-[10px] text-slate-500 print:text-slate-800">
                <div>
                  <span className="font-semibold text-blue-800 print:text-slate-900">স্ট্যাটাস: অনুমোদিত ও পরিশোধিত</span>
                  <div>{madrasaInfo.phone}</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 w-24 mb-1"></div>
                  <span>ক্যাশিয়ার / হিসাবরক্ষক</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 flex justify-between border-t border-slate-200 print:hidden">
              <button
                onClick={handlePrintReceipt}
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
    </>
  );
};
