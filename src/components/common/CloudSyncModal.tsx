import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Lock,
  Database,
  X,
  Clock,
  Layers,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { AdminExcelGoogleDriveModal } from '../admin/AdminExcelGoogleDriveModal';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    cloudSyncStatus,
    lastSyncTime,
    syncAllToCloud,
    students,
    teachers,
    classes,
    attendance,
    feePayments,
    examResults,
    notices,
    mediaEvents,
    complaints,
    admissionApplications,
  } = useMadrasa();

  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  if (!isOpen) return null;

  const totalRecords =
    students.length +
    teachers.length +
    classes.length +
    attendance.length +
    feePayments.length +
    examResults.length +
    notices.length +
    mediaEvents.length +
    complaints.length +
    admissionApplications.length;

  const handleManualSync = async () => {
    setIsSyncingLocal(true);
    await syncAllToCloud();
    setIsSyncingLocal(false);
    setJustSynced(true);
    setTimeout(() => setJustSynced(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-emerald-300 hover:text-white bg-emerald-800/60 hover:bg-emerald-800 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800/70 px-2.5 py-0.5 rounded-full">
                গুগল ক্লাউড ফায়ারস্টোর
              </span>
              <h3 className="text-xl font-extrabold mt-1 text-white">
                ক্লাউড ডাটাবেস ও ব্যাকআপ নিয়ন্ত্রণ
              </h3>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Indicator Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">
                  {cloudSyncStatus === 'synced'
                    ? 'ডাটাবেস সম্পূর্ণ সিঙ্কড ও সুরক্ষিত'
                    : cloudSyncStatus === 'syncing' || isSyncingLocal
                    ? 'ক্লাউডে তথ্য সিঙ্ক হচ্ছে...'
                    : 'ক্লাউড সংযোগ সক্রিয়'}
                </h4>
                <p className="text-xs text-emerald-700 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  সর্বশেষ সিঙ্ক: {lastSyncTime}
                </p>
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncingLocal}
              className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLocal ? 'animate-spin' : ''}`} />
              <span>{isSyncingLocal ? 'সিঙ্ক হচ্ছে...' : 'এখনই সিঙ্ক করুন'}</span>
            </button>
          </div>

          {justSynced && (
            <div className="bg-emerald-600 text-white text-xs p-3 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>সকল তথ্য সফলভাবে গুগল ক্লাউড ফায়ারস্টোরে সিঙ্ক হয়েছে!</span>
            </div>
          )}

          {/* Quick Database Statistics */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Database className="w-4 h-4 text-teal-700" />
                ক্লাউডে সংরক্ষিত মোট রেকর্ডসমূহ
              </span>
              <span className="bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                {totalRecords} টি রেকর্ড
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-900 text-sm">{students.length}</div>
                <div className="text-[11px] text-slate-500">ছাত্র-ছাত্রী</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-900 text-sm">{teachers.length}</div>
                <div className="text-[11px] text-slate-500">শিক্ষকবৃন্দ</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-900 text-sm">{feePayments.length}</div>
                <div className="text-[11px] text-slate-500">ফি ও বেতন রসিদ</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-900 text-sm">{examResults.length}</div>
                <div className="text-[11px] text-slate-500">পরীক্ষার ফলাফল</div>
              </div>
            </div>
          </div>

          {/* Privacy & Security Clarification */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>প্রতিষ্ঠানিক তথ্যের পূর্ণ নিরাপত্তা ও গোপনীয়তা</span>
            </div>
            <p className="leading-relaxed text-slate-700">
              প্রতিষ্ঠানের কোনো ডাটা বা তথ্য সাধারণ দর্শনার্থী বা বহিরাগত কেউ ডাউনলোড করতে পারবে না।
              পূর্ণাঙ্গ ডাটাবেস এক্সপোর্ট এবং সিস্টেম রিস্টোর অপশনটি <strong>শুধুমাত্র অ্যাডমিন পাসওয়ার্ড দিয়ে লগইন করা পরিচালকের জন্যই সংরক্ষিত</strong>।
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
            <span>এক্সেল ও গুগল ড্রাইভ সিঙ্ক টুল</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* Excel & Drive Modal */}
      <AdminExcelGoogleDriveModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />
    </div>
  );
};
