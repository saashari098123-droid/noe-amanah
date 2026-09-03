import React, { useState, useRef } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  downloadStudentTemplateExcel,
  exportStudentsToExcel,
  exportResultsToExcel,
  exportFullMadrasaDataToExcel,
  parseStudentExcelFile,
} from '../../utils/excelService';
import {
  requestGoogleAccessToken,
  uploadBackupToGoogleDrive,
  fetchGoogleSheetRows,
} from '../../utils/googleDriveService';
import * as XLSX from 'xlsx';
import { Student } from '../../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Cloud,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FolderUp,
  Table,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminExcelGoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'excel_import' | 'excel_export' | 'google_drive';
}

export const AdminExcelGoogleDriveModal: React.FC<AdminExcelGoogleDriveModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'excel_import',
}) => {
  const {
    students,
    teachers,
    classes,
    feePayments,
    examResults,
    notices,
    addStudent,
    updateStudent,
    syncAllToCloud,
  } = useMadrasa();

  const [activeTab, setActiveTab] = useState<'excel_import' | 'excel_export' | 'google_drive'>(defaultTab);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseStats, setParseStats] = useState<{ added: number; updated: number }>({ added: 0, updated: 0 });
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Google Drive & Sheets state
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState<{ fileName: string; link?: string } | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetSyncResult, setSheetSyncResult] = useState<string | null>(null);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParseErrors([]);
    setImportSuccessMsg(null);

    const result = await parseStudentExcelFile(file, classes, students);
    setIsParsing(false);

    if (result.success) {
      setParsedStudents(result.students);
      setParseErrors(result.errors);
      setParseStats(result.stats);
    } else {
      setParsedStudents([]);
      setParseErrors(result.errors);
    }
  };

  // Confirm and save parsed students to App State & Firebase
  const handleConfirmImport = async () => {
    if (parsedStudents.length === 0) return;
    setIsImporting(true);

    try {
      const existingIdSet = new Set(students.map((s) => s.id.toLowerCase().trim()));

      for (const st of parsedStudents) {
        if (existingIdSet.has(st.id.toLowerCase().trim())) {
          updateStudent(st);
        } else {
          addStudent(st);
        }
      }

      // Sync directly to Firestore
      await syncAllToCloud();

      setIsImporting(false);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setImportSuccessMsg(
        `সফলভাবে ${parsedStudents.length} জন শিক্ষার্থীর তথ্য এক্সেল থেকে ইম্পোর্ট এবং ক্লাউড ফায়ারবেসে সিঙ্ক করা হয়েছে!`
      );
      setParsedStudents([]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setIsImporting(false);
      setParseErrors([`ডাটাবেসে সেভ করতে সমস্যা হয়েছে: ${err?.message || 'অজানা ত্রুটি'}`]);
    }
  };

  // Google OAuth connect
  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    setGoogleAuthError(null);
    try {
      const auth = await requestGoogleAccessToken();
      setGoogleAccessToken(auth.token);
      setIsConnectingGoogle(false);
    } catch (err: any) {
      setIsConnectingGoogle(false);
      setGoogleAuthError(err?.message || 'গুগল সংযোগ ব্যর্থ হয়েছে।');
    }
  };

  // Upload Full Database Backup to Google Drive
  const handleBackupToGoogleDrive = async () => {
    if (!googleAccessToken) {
      await handleConnectGoogle();
      return;
    }

    setIsUploadingToDrive(true);
    setDriveUploadSuccess(null);
    setGoogleAuthError(null);

    try {
      // Build Excel Binary
      const wb = XLSX.utils.book_new();
      const studentsRows = students.map((s) => ({
        'ছাত্র আইডি': s.id,
        'নাম': s.nameBangla,
        'শ্রেণি': s.className || s.classId,
        'রোল': s.roll,
        'পিতা': s.fatherName || '',
        'ফোন': s.guardianPhone || '',
        'মাসিক ফি': s.monthlyFee || 0,
        'পাসওয়ার্ড': s.password || '',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentsRows), 'Students');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const fileName = `Darul_Amanah_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;

      const uploadResult = await uploadBackupToGoogleDrive(googleAccessToken, fileName, blob);
      setIsUploadingToDrive(false);
      setDriveUploadSuccess({ fileName, link: uploadResult.webViewLink });
      confetti({ particleCount: 50, spread: 60 });
    } catch (err: any) {
      setIsUploadingToDrive(false);
      setGoogleAuthError(err?.message || 'গুগল ড্রাইভে ব্যাকআপ পাঠাতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-emerald-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-amber-300 shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800/70 px-2.5 py-0.5 rounded-full">
                Excel & Cloud Sync Manager
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold mt-1 text-white">
                এক্সেল ডাটা ইম্পোর্ট, এক্সপোর্ট ও গুগল ড্রাইভ সিঙ্ক
              </h3>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-emerald-800/50">
            <button
              onClick={() => setActiveTab('excel_import')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'excel_import'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-800/80 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>এক্সেল ফাইল থেকে ইম্পোর্ট</span>
            </button>

            <button
              onClick={() => setActiveTab('excel_export')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'excel_export'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-800/80 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>এক্সেল ডাউনলোড / এক্সপোর্ট</span>
            </button>

            <button
              onClick={() => setActiveTab('google_drive')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'google_drive'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-800/80 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>গুগল ড্রাইভ ও শিট</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: EXCEL IMPORT */}
          {activeTab === 'excel_import' && (
            <div className="space-y-5">
              {/* Instructions and Template Download */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    সহজে একাধিক শিক্ষার্থীর তথ্য এক্সেলে পূরণ করে আপলোড করুন
                  </h4>
                  <p className="text-[11px] sm:text-xs text-emerald-800">
                    আমাদের প্রস্তুতকৃত স্ট্যান্ডার্ড এক্সেল টেমপ্লেটটি ডাউনলোড করে পূরণ করুন এবং নিচে ড্রপ করুন।
                  </p>
                </div>

                <button
                  onClick={downloadStudentTemplateExcel}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>নমুনা এক্সেল টেমপ্লেট (.xlsx)</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/40 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />

                <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200 group-hover:border-emerald-300 flex items-center justify-center text-emerald-700 shadow-sm transition mb-3">
                  <FolderUp className="w-7 h-7 group-hover:scale-110 transition" />
                </div>

                <h4 className="font-bold text-slate-800 text-sm">
                  {selectedFile ? selectedFile.name : 'কম্পিউটার বা ফোন থেকে এক্সেল বা CSV ফাইল বেছে নিন'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  সাপোর্ট করে: .xlsx, .xls, .csv (সর্বোচ্চ ৫০০ ছাত্র একসাথে আপলোড করা সম্ভব)
                </p>

                {selectedFile && (
                  <span className="inline-block mt-3 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                    ফাইল সিলেক্ট করা হয়েছে (সাইজ: {(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              {/* Status & Messages */}
              {isParsing && (
                <div className="p-4 bg-blue-50 text-blue-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>এক্সেল ফাইলের ডাটা বিশ্লেষণ করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
                </div>
              )}

              {importSuccessMsg && (
                <div className="p-4 bg-emerald-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-amber-300" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {parseErrors.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>সতর্কতা / ত্রুটি পাওয়া গেছে ({parseErrors.length} টি):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700 max-h-28 overflow-y-auto">
                    {parseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table of Parsed Students */}
              {parsedStudents.length > 0 && (
                <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                        <Table className="w-4 h-4 text-teal-700" />
                        আপলোডকৃত শিক্ষার্থীর প্রিভিউ ({parsedStudents.length} জন)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        নতুন ভর্তি: {parseStats.added} জন • পূর্ববর্তী আপডেট: {parseStats.updated} জন
                      </p>
                    </div>

                    <button
                      onClick={handleConfirmImport}
                      disabled={isImporting}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>
                        {isImporting ? 'ক্লাউডে সেভ হচ্ছে...' : 'ইম্পোর্ট ও ফায়ারবেসে সেভ করুন'}
                      </span>
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 text-[11px] sticky top-0">
                        <tr>
                          <th className="p-2.5">আইডি</th>
                          <th className="p-2.5">নাম</th>
                          <th className="p-2.5">শ্রেণি</th>
                          <th className="p-2.5">রোল</th>
                          <th className="p-2.5">পিতা / মোবাইল</th>
                          <th className="p-2.5">ফি</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
                        {parsedStudents.slice(0, 50).map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-emerald-800">{st.id}</td>
                            <td className="p-2.5 font-bold">{st.nameBangla}</td>
                            <td className="p-2.5">{st.className || st.classId}</td>
                            <td className="p-2.5">{st.roll}</td>
                            <td className="p-2.5">{st.fatherName || st.guardianPhone || '-'}</td>
                            <td className="p-2.5">৳{st.monthlyFee}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedStudents.length > 50 && (
                      <div className="text-center p-2 text-[11px] text-slate-400 bg-slate-50">
                        আরও {parsedStudents.length - 50} জন শিক্ষার্থী নিচে রয়েছে...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXCEL EXPORT */}
          {activeTab === 'excel_export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                মাদরাসার সকল বিভাগ ও ছাত্র-ছাত্রী, পরীক্ষার ফলাফল বা ফি-এর তথ্য সরাসরি Microsoft Excel (.xlsx) ফাইলে ডাউনলোড করুন:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Export Students */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      <span>সকল ছাত্র-ছাত্রীর তালিকা</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      মোট {students.length} জন শিক্ষার্থীর রোল, শ্রেণি, মোবাইল, আবাসন ও ফি সহ পূর্ণ ডাটাবেস এক্সেল।
                    </p>
                  </div>
                  <button
                    onClick={() => exportStudentsToExcel(students, classes)}
                    className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ছাত্র তালিকা এক্সেল (.xlsx)</span>
                  </button>
                </div>

                {/* Export Results */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>পরীক্ষার ফলাফল ও নম্বরপত্র</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      মোট {examResults.length} টি পরীক্ষার ফলাফল, প্রাপ্ত নম্বর, গ্রেড ও পজিশন এক্সেল।
                    </p>
                  </div>
                  <button
                    onClick={() => exportResultsToExcel(examResults)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ফলাফল এক্সেল (.xlsx)</span>
                  </button>
                </div>

                {/* Export Full Database */}
                <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-teal-950 text-sm">
                      <Layers className="w-4 h-4 text-teal-700" />
                      <span>সম্পূর্ণ মাদরাসা ডাটাবেস এক্সেল (Multi-Sheet Master Backup)</span>
                    </div>
                    <p className="text-[11px] text-teal-800">
                      একক এক্সেল ফাইলের ভেতর আলাদা শিটে (Students, Teachers, Classes, Fees, Results, Notices) সংরক্ষিত হবে।
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      exportFullMadrasaDataToExcel({
                        students,
                        teachers,
                        classes,
                        feePayments,
                        examResults,
                        notices,
                      })
                    }
                    className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>মাস্টার ব্যাকআপ ডাউনলোড</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE & SHEETS */}
          {activeTab === 'google_drive' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <Cloud className="w-4 h-4 text-emerald-700" />
                  <span>গুগল ড্রাইভ ও ক্লাউড অটো-ব্যাকআপ</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  আপনার গুগল একাউন্ট (`saashari098123@gmail.com`) কানেক্ট করে এক ক্লিকেই সম্পূর্ণ মাদরাসার ডাটাবেসের একটি এক্সেল ব্যাকআপ কপি সরাসরি আপনার গুগল ড্রাইভে সেভ রাখতে পারেন।
                </p>
              </div>

              {googleAuthError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{googleAuthError}</span>
                </div>
              )}

              {driveUploadSuccess && (
                <div className="p-4 bg-emerald-600 text-white rounded-2xl text-xs space-y-2 shadow-sm animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                    <span>সফলভাবে গুগল ড্রাইভে ব্যাকআপ ফাইল আপলোড হয়েছে!</span>
                  </div>
                  <p className="text-emerald-100 text-[11px]">ফাইল নাম: {driveUploadSuccess.fileName}</p>
                  {driveUploadSuccess.link && (
                    <a
                      href={driveUploadSuccess.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-white text-emerald-900 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-50 transition"
                    >
                      <span>গুগল ড্রাইভে ফাইলটি খুলুন</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Direct Drive Backup Upload */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <FolderUp className="w-4 h-4 text-teal-600" />
                      গুগল ড্রাইভে ব্যাকআপ পাঠান
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      বর্তমান সকল ছাত্র, শিক্ষক, ফলাফল ও ফি-এর সর্বশেষ এক্সেল কপি আপনার পার্সোনাল ড্রাইভে জমা হবে।
                    </p>
                  </div>

                  <button
                    onClick={handleBackupToGoogleDrive}
                    disabled={isUploadingToDrive || isConnectingGoogle}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Cloud className="w-4 h-4 text-amber-300" />
                    <span>
                      {isUploadingToDrive
                        ? 'ড্রাইভে আপলোড হচ্ছে...'
                        : isConnectingGoogle
                        ? 'গুগল অথেনটিকেশন হচ্ছে...'
                        : 'গুগল ড্রাইভে ব্যাকআপ সংরক্ষণ করুন'}
                    </span>
                  </button>
                </div>

                {/* 2. Firebase Cloud Direct Link */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      ফায়ারবেস ক্লাউড কনসোল
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      আপনার ফায়ারবেস প্রজেক্ট আইডিতে সরাসরি লগইন করে লাইভ ডাটা টেবিল দেখতে পারবেন:
                    </p>
                    <code className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono block truncate">
                      gen-lang-client-0273478653
                    </code>
                  </div>

                  <a
                    href="https://console.firebase.google.com/project/gen-lang-client-0273478653/firestore/databases/-default-/data"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-2 text-center"
                  >
                    <span>ফায়ারবেস ডাটাবেস ভিউ করুন</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>গুগল ড্রাইভ ও ফায়ারস্টোর ক্লাউড সিঙ্ক সিকিউরড</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
