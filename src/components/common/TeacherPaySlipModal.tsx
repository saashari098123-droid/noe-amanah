import React, { useRef } from 'react';
import { Printer, X, Download, CheckCircle, Building2 } from 'lucide-react';
import { Teacher, FinancialTransaction } from '../../types';
import { useMadrasa } from '../../context/MadrasaContext';
import { numberToBanglaWords } from '../../utils/numberToBanglaWords';
import { printHtmlElement } from '../../utils/printHelper';

interface TeacherPaySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
  transaction: FinancialTransaction;
  month: string;
}

export const TeacherPaySlipModal: React.FC<TeacherPaySlipModalProps> = ({
  isOpen,
  onClose,
  teacher,
  transaction,
  month,
}) => {
  const { madrasaInfo } = useMadrasa();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const baseSalary = transaction.baseSalary || teacher.salary || transaction.amount;
  const allowance = transaction.allowanceAmount || 0;
  const deduction = transaction.deductionAmount || 0;
  const netAmount = transaction.amount;

  const handlePrint = () => {
    if (printRef.current) {
      printHtmlElement(printRef.current, {
        title: `বেতন-স্লিপ-${teacher.nameBangla}-${month}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Control Bar (Non-printable) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h3 className="text-sm font-bold tracking-wide">
              উস্তাদের বেতন স্লিপ প্রিভিউ
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট / সেভ করুন
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Pay Slip Container */}
        <div className="p-6 md:p-8 bg-slate-50 overflow-y-auto max-h-[82vh]">
          <div
            ref={printRef}
            id="teacher-pay-slip-print"
            className="bg-white border-2 border-emerald-800/60 rounded-xl p-6 sm:p-8 shadow-sm text-slate-800 relative space-y-5"
          >
            {/* Watermark Logo/Text */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-9xl font-black text-emerald-900">দারুল আমানাহ</span>
            </div>

            {/* Header */}
            <div className="text-center space-y-1 border-b border-emerald-900/20 pb-4">
              <p className="text-xs font-serif text-emerald-800 font-semibold tracking-wider">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight">
                {madrasaInfo.nameBangla || madrasaInfo.name}
              </h1>
              {madrasaInfo.nameArabic && (
                <p className="text-xs font-serif text-emerald-800/80">
                  {madrasaInfo.nameArabic}
                </p>
              )}
              <p className="text-xs text-slate-600">
                {madrasaInfo.address} • ফোন: {madrasaInfo.phone} • ইমেইল: {madrasaInfo.email}
              </p>
              <div className="pt-2 flex justify-center">
                <span className="inline-block px-4 py-1 bg-emerald-800 text-amber-200 text-xs font-bold rounded-full uppercase tracking-wider shadow-xs">
                  উস্তাদ / শিক্ষক সম্মানী ও মাসিক হাদিয়া রসিদ
                </span>
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/60 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">ভাউচার নম্বর:</span>
                <span className="font-mono font-bold text-slate-800">{transaction.voucherNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">পরিশোধের তারিখ:</span>
                <span className="font-semibold text-slate-800">{transaction.date}</span>
                {transaction.hijriDate && (
                  <span className="block text-[10px] text-emerald-700 font-medium">({transaction.hijriDate})</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">পরিশোধের মাস:</span>
                <span className="font-bold text-emerald-900">{month}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">পরিশোধের মাধ্যম:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {transaction.paymentMethod === 'cash'
                    ? 'নগদ ক্যাশ'
                    : transaction.paymentMethod === 'bank'
                    ? 'ব্যাংক ট্রান্সফার'
                    : transaction.paymentMethod === 'bkash'
                    ? 'বিকাশ'
                    : transaction.paymentMethod === 'nagad'
                    ? 'নগদ'
                    : transaction.paymentMethod === 'rocket'
                    ? 'রকেট'
                    : transaction.paymentMethod === 'cheque'
                    ? 'চেক'
                    : transaction.paymentMethod}
                </span>
                {transaction.bankAccountOrNumber && (
                  <span className="block text-[10px] text-slate-500 font-mono">
                    ({transaction.bankAccountOrNumber})
                  </span>
                )}
              </div>
            </div>

            {/* Teacher Details */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-slate-500">উস্তাদের নাম:</span>{' '}
                  <span className="font-bold text-slate-900 text-sm">{teacher.nameBangla}</span>
                  {teacher.nameEnglish && (
                    <span className="text-slate-500 block text-[11px]">({teacher.nameEnglish})</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500">পদবি:</span>{' '}
                  <span className="font-semibold text-slate-800">{teacher.designation}</span>
                </div>
                <div>
                  <span className="text-slate-500">শিক্ষক আইডি:</span>{' '}
                  <span className="font-mono font-bold text-emerald-800">{teacher.id}</span>
                </div>
                <div>
                  <span className="text-slate-500">মোবাইল:</span>{' '}
                  <span className="font-semibold text-slate-800">{teacher.phone}</span>
                </div>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-800 text-white font-semibold">
                    <th className="py-2 px-3 text-center w-12 border-r border-emerald-700">ক্র.নং</th>
                    <th className="py-2 px-3 border-r border-emerald-700">বিবরণ</th>
                    <th className="py-2 px-3 text-right w-36">টাকার পরিমাণ (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 text-center border-r border-slate-200 font-mono">০১</td>
                    <td className="py-2 px-3 border-r border-slate-200">
                      <span className="font-semibold text-slate-800">মাসিক নির্ধারিত মূল হাদিয়া / সম্মানী</span>
                      <span className="block text-[11px] text-slate-500">মাস: {month}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                      ৳ {baseSalary.toLocaleString('bn-BD')}
                    </td>
                  </tr>
                  {allowance > 0 && (
                    <tr className="bg-emerald-50/30">
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-mono">০২</td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <span className="font-semibold text-emerald-800">বিশেষ ভাতা / ঈদ হাদিয়া / উৎসাহ বোনাস</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">
                        + ৳ {allowance.toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  )}
                  {deduction > 0 && (
                    <tr className="bg-rose-50/30">
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-mono">০৩</td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <span className="font-semibold text-rose-800">কর্তন / অগ্রিম সমন্বয়</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-rose-700">
                        - ৳ {deduction.toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-100/70 font-bold border-t-2 border-emerald-800 text-slate-900">
                    <td colSpan={2} className="py-2.5 px-3 text-right border-r border-emerald-200 text-sm">
                      সর্বমোট প্রদেয় ও পরিশোধিত নিট অর্থ:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-base font-black text-emerald-900">
                      ৳ {netAmount.toLocaleString('bn-BD')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* In Words & Status */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
              <div>
                <span className="text-slate-500">টাকা কথায়:</span>{' '}
                <span className="font-bold text-slate-800">
                  {numberToBanglaWords(netAmount)}
                </span>
              </div>
              {transaction.description && (
                <div className="text-[11px] text-slate-600">
                  <span className="text-slate-400">বিবরণ/মন্তব্য:</span> {transaction.description}
                </div>
              )}
            </div>

            {/* Hadith / Respect Note */}
            <div className="text-center py-1">
              <p className="text-[11px] text-emerald-800 font-serif italic">
                “তোমরা উস্তাদ ও শিক্ষকদের সম্মান করো, নিশ্চয়ই তাঁরা ইলমে দ্বীনের রাহবার।”
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs">
              <div>
                <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-700">
                  গ্রহীতা উস্তাদের দস্তখত
                </div>
                <div className="text-[10px] text-slate-400">তারিখ: ..............</div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-1.5 font-semibold text-slate-700">
                  হিসাব শাখা / কোষাধ্যক্ষ
                </div>
                <div className="text-[10px] text-slate-400">যাচাইকৃত</div>
              </div>
              <div>
                <div className="border-t border-emerald-700 pt-1.5 font-bold text-emerald-900">
                  মুহতামিম / প্রিন্সিপাল
                </div>
                <div className="text-[10px] text-emerald-700">অনুমোদিত ও সিল</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            রসিদ প্রিন্ট করুন
          </button>
        </div>
      </div>
    </div>
  );
};
