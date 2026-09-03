import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { Notice } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  Bell,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  Sparkles,
  X,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminNotices: React.FC = () => {
  const { notices, addNotice, deleteNotice } = useMadrasa();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'academic' | 'exam' | 'holiday' | 'event' | 'general'>('general');
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addNotice({
      title,
      content,
      category,
      isUrgent,
      publishDate: new Date().toLocaleDateString('bn-BD'),
      publisherRole: 'মুহতামিম ও প্রশাসন',
    });

    setIsAddModalOpen(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast('নতুন নোটিশ সফলভাবে প্রকাশিত হয়েছে!');
    setTitle('');
    setContent('');
    setIsUrgent(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            অফিসিয়াল নোটিশ ও বিজ্ঞপ্তি প্রকাশনা ডেস্ক
          </h2>
          <p className="text-xs text-slate-500">
            প্রতিষ্ঠানের ছুটি, পরীক্ষা, বার্ষিক মাহফিল ও প্রশাসনিক নোটিশ ম্যানেজ করুন
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          নতুন নোটিশ জারি করুন
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.map((n) => (
          <div
            key={n.id}
            className={`bg-white rounded-3xl p-6 shadow-xs border transition space-y-3 ${
              n.isUrgent ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {n.isUrgent && (
                  <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    জরুরি বিজ্ঞপ্তি
                  </span>
                )}
                <span className="bg-blue-100 text-blue-900 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                  {n.category === 'academic' && 'একাডেমিক'}
                  {n.category === 'exam' && 'পরীক্ষা'}
                  {n.category === 'holiday' && 'ছুটি'}
                  {n.category === 'event' && 'অনুষ্ঠান/মাহফিল'}
                  {n.category === 'general' && 'সাধারণ'}
                </span>
                <span className="text-xs text-slate-400 font-mono">প্রকাশক: {n.publisherRole}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {n.publishDate}
                </span>
                <button
                  onClick={() => setDeleteTarget({ id: n.id, title: n.title })}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-line">
                {n.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Notice Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">নতুন নোটিশ তৈরি</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="উদাঃ পবিত্র মাহে রমজান উপলক্ষে স্কুল এন্ড কলেজ বন্ধের নোটিশ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="general">সাধারণ বিজ্ঞপ্তি</option>
                    <option value="holiday">ছুটি সংক্রান্ত</option>
                    <option value="exam">পরীক্ষা সংক্রান্ত</option>
                    <option value="academic">একাডেমিক</option>
                    <option value="event">মাহফিল ও অনুষ্ঠান</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>জরুরি বিজ্ঞপ্তি হিসেবে চিহ্নিত করুন</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">নোটিশের বিস্তারিত বিবরণ *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="বিজ্ঞপ্তির পূর্ণ বিবরণ লিখুন..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  নোটিশ প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Notice Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="নোটিশ মুছে ফেলার নিশ্চিতকরণ"
        itemName={deleteTarget?.title}
        description="আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান?"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        onConfirm={() => {
          if (deleteTarget) {
            deleteNotice(deleteTarget.id);
            showToast(`"${deleteTarget.title}" নোটিশটি সফলভাবে মুছে ফেলা হয়েছে!`);
            setDeleteTarget(null);
          }
        }}
        onClose={() => setDeleteTarget(null)}
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
