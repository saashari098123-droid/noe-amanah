import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { Notice } from '../../types';
import {
  Bell,
  Search,
  Calendar,
  User,
  Printer,
  X,
  FileText,
  AlertCircle,
  ChevronRight,
  Share2,
} from 'lucide-react';

export const PublicNotices: React.FC = () => {
  const { notices, madrasaInfo } = useMadrasa();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeNoticeModal, setActiveNoticeModal] = useState<Notice | null>(null);

  const filteredNotices = notices.filter((n) => {
    const matchQuery =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || n.category === selectedCategory;
    return matchQuery && matchCat;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center">
        <span className="text-xs text-amber-300 font-bold uppercase tracking-widest bg-blue-800/80 px-3 py-1 rounded-full">
          নোটিশ বোর্ড ও জরুরি বিজ্ঞপ্তি
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-3">
          প্রতিষ্ঠানের অফিশিয়াল নোটিশ বোর্ড
        </h1>
        <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-xl mx-auto">
          ভর্তি, পরীক্ষা, ছুটির তালিকা ও বিশেষ অনুষ্ঠান সংক্রান্ত সকল প্রাতিষ্ঠানিক ঘোষণা।
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নোটিশ খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'admission', 'exam', 'holiday', 'mahfil'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' && 'সকল নোটিশ'}
              {cat === 'admission' && 'ভর্তি'}
              {cat === 'exam' && 'পরীক্ষা'}
              {cat === 'holiday' && 'ছুটি'}
              {cat === 'mahfil' && 'মাহফিল'}
            </button>
          ))}
        </div>
      </div>

      {/* Notice List Table / Cards */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center text-slate-400 border border-slate-200">
            কোন নোটিশ পাওয়া যায়নি।
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setActiveNoticeModal(notice)}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs hover:shadow-md border border-slate-200 hover:border-blue-500/60 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    notice.isUrgent
                      ? 'bg-rose-100 text-rose-600 border border-rose-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  <FileText className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        notice.isUrgent
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {notice.categoryLabel}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {notice.publishDate}
                    </span>
                    <span className="text-xs text-slate-400">• {notice.publishedBy}</span>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-700 transition">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <button className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-xl text-xs group-hover:bg-blue-600 group-hover:text-white transition flex items-center gap-1">
                  বিস্তারিত দেখুন <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notice Viewer Modal / Print View */}
      {activeNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            {/* Official Letterhead Header */}
            <div className="bg-blue-900 text-white p-6 relative">
              <button
                onClick={() => setActiveNoticeModal(null)}
                className="absolute top-4 right-4 text-blue-200 hover:text-white p-1.5 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className="font-['Amiri'] text-amber-300 text-sm">{madrasaInfo.nameArabic}</div>
                <h2 className="text-xl font-bold">{madrasaInfo.nameBangla}</h2>
                <p className="text-xs text-blue-200">{madrasaInfo.address}</p>
                <div className="inline-block mt-2 bg-amber-400 text-slate-950 font-bold text-xs px-3 py-0.5 rounded-full">
                  অফিসিয়াল নোটিশ
                </div>
              </div>
            </div>

            {/* Notice Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-semibold text-slate-700">স্মারক নং:</span> DA/NOT-
                  {activeNoticeModal.id.replace('not-', '')}/২০২৬
                </div>
                <div>
                  <span className="font-semibold text-slate-700">প্রকাশের তারিখ:</span>{' '}
                  {activeNoticeModal.publishDate}
                </div>
              </div>

              <div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md mb-2 inline-block ${
                    activeNoticeModal.isUrgent
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  ক্যাটাগরি: {activeNoticeModal.categoryLabel}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {activeNoticeModal.title}
                </h3>
              </div>

              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-200">
                {activeNoticeModal.content}
              </div>

              {/* Signature area */}
              <div className="pt-4 flex justify-between items-end text-xs text-slate-600">
                <div>
                  <div className="font-semibold text-slate-800">কর্তৃপক্ষ অনুমোদনক্রমে:</div>
                  <div className="text-slate-500">{activeNoticeModal.publishedBy}</div>
                </div>
                <div className="text-right">
                  <div className="font-['Amiri'] text-blue-800 font-bold text-sm">মুহতামিম দফতর</div>
                  <div className="text-slate-500">{madrasaInfo.nameBangla}</div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="bg-slate-100 p-4 px-6 flex items-center justify-between border-t border-slate-200">
              <button
                onClick={handlePrint}
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                প্রিন্ট নোটিশ
              </button>
              <button
                onClick={() => setActiveNoticeModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs"
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
