import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { ExamResult } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { ClassResultTabulationSheet } from './ClassResultTabulationSheet';
import { exportResultsToExcel } from '../../utils/excelService';
import { getOrdinalBangla, previewMeritPosition } from '../../utils/meritCalculator';
import { printHtmlElement } from '../../utils/printHelper';
import {
  Award,
  Plus,
  Trash2,
  Printer,
  X,
  BookOpen,
  Eye,
  Building2,
  User,
  GraduationCap,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Sparkles,
  Trophy,
  Medal,
  Calculator,
  Pencil,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminResults: React.FC = () => {
  const {
    examResults,
    classes,
    students,
    addExamResult,
    updateExamResult,
    deleteExamResult,
    recalculateAllMeritPositions,
    madrasaInfo,
  } = useMadrasa();

  const [selectedExamType, setSelectedExamType] = useState('first_term');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'cls-madani-1');

  // Full Class Offline Result Tabulation Sheet / Batch Print Modal
  const [isTabulationModalOpen, setIsTabulationModalOpen] = useState(false);
  const [tabulationModalMode, setTabulationModalMode] = useState<'tabulation' | 'batch_marksheet'>('tabulation');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; studentName: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form Fields inside Modal
  const [modalClassId, setModalClassId] = useState(selectedClassId);
  const [studentId, setStudentId] = useState('');
  const [examName, setExamName] = useState('১ম সাময়িক পরীক্ষা ২০২৬');
  const [generalRemarks, setGeneralRemarks] = useState('');

  // Ranking Mode inside Modal (auto based on marks vs manual custom)
  const [rankingMode, setRankingMode] = useState<'auto' | 'manual'>('auto');
  const [manualPositionInClass, setManualPositionInClass] = useState<number>(1);

  // Subject marks state
  const [subjectsList, setSubjectsList] = useState<
    Array<{ subjectName: string; fullMarks: number; obtainedMarks: number; passMarks?: number }>
  >([]);

  const [viewingResult, setViewingResult] = useState<ExamResult | null>(null);

  // Students belonging to the currently selected class in the modal
  const modalClassStudents = students.filter((s) => s.classId === modalClassId);
  const currentModalClass = classes.find((c) => c.id === modalClassId);

  // Filtered results for the list view - sorted by merit position / marks
  const filteredResults = examResults
    .filter((r) => r.examType === selectedExamType && r.classId === selectedClassId)
    .sort((a, b) => {
      if (a.positionInClass && b.positionInClass) {
        return a.positionInClass - b.positionInClass;
      }
      return (b.totalMarksObtained || 0) - (a.totalMarksObtained || 0);
    });

  // Modal live calculations
  const modalTotalObtained = subjectsList.reduce((acc, sub) => acc + (Number(sub.obtainedMarks) || 0), 0);
  const modalTotalPossible = subjectsList.reduce((acc, sub) => acc + (Number(sub.fullMarks) || 0), 0);
  const modalPercentage = modalTotalPossible > 0 ? (modalTotalObtained / modalTotalPossible) * 100 : 0;
  const modalMeritPreview = previewMeritPosition(
    modalClassId,
    examName,
    studentId,
    modalTotalObtained,
    examResults
  );

  const calculateSubjectGrade = (obtained: number, full: number) => {
    const pct = full > 0 ? (obtained / full) * 100 : 0;
    if (pct >= 80) return { grade: 'A+', arabic: 'মুমতাজ (সর্বোচ্চ)', gpa: 5.0 };
    if (pct >= 70) return { grade: 'A', arabic: 'জাইয়্যিদ জিদ্দান', gpa: 4.0 };
    if (pct >= 60) return { grade: 'A-', arabic: 'জাইয়্যিদ', gpa: 3.5 };
    if (pct >= 50) return { grade: 'B', arabic: 'মাকবুল', gpa: 3.0 };
    if (pct >= 40) return { grade: 'C', arabic: 'মাকবুল', gpa: 2.0 };
    return { grade: 'F', arabic: 'রাসিব (অনুত্তীর্ণ)', gpa: 0.0 };
  };

  // Helper to load kitabs for a specific class
  const loadKitabsForClass = (clsId: string) => {
    const targetCls = classes.find((c) => c.id === clsId);
    if (targetCls && targetCls.kitabs && targetCls.kitabs.length > 0) {
      return targetCls.kitabs.map((k) => ({
        subjectName: k.name,
        fullMarks: k.fullMarks || 100,
        obtainedMarks: Math.floor((k.fullMarks || 100) * 0.85),
        passMarks: k.passMarks || 40,
      }));
    }
    return [
      { subjectName: 'এসো আরবি শিখি', fullMarks: 100, obtainedMarks: 85, passMarks: 40 },
      { subjectName: 'মিফতাহুল আরাবিয়্যাহ', fullMarks: 100, obtainedMarks: 85, passMarks: 40 },
      { subjectName: 'আত-তামরীনুল কিতাবী', fullMarks: 100, obtainedMarks: 85, passMarks: 40 },
      { subjectName: 'এসো কুরআন শিখি ও তাজবীদ', fullMarks: 100, obtainedMarks: 90, passMarks: 40 },
      { subjectName: 'বাংলা সাহিত্য ও ব্যাকরণ', fullMarks: 100, obtainedMarks: 80, passMarks: 40 },
      { subjectName: 'সাধারণ গণিত ও ইংরেজি', fullMarks: 100, obtainedMarks: 80, passMarks: 40 },
    ];
  };

  const handleOpenAdd = () => {
    setEditingResultId(null);
    const initialClassId = selectedClassId || classes[0]?.id || '';
    setModalClassId(initialClassId);

    const initialClassStudents = students.filter((s) => s.classId === initialClassId);
    setStudentId(initialClassStudents[0]?.id || '');
    setExamName(
      selectedExamType === 'first_term'
        ? '১ম সাময়িক পরীক্ষা ২০২৬'
        : selectedExamType === 'mid_term'
        ? 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬'
        : 'বার্ষিক পরীক্ষা ২০২৬'
    );
    setGeneralRemarks('');
    setSubjectsList(loadKitabsForClass(initialClassId));
    setRankingMode('auto');
    setManualPositionInClass(1);
    setIsModalOpen(true);
  };

  const handleEditResult = (res: ExamResult) => {
    setEditingResultId(res.id);
    setModalClassId(res.classId);
    setStudentId(res.studentId);
    setExamName(res.examName);
    setGeneralRemarks(res.generalRemarks || '');
    setSubjectsList(
      res.subjects.map((s) => ({
        subjectName: s.subjectName,
        fullMarks: s.fullMarks,
        obtainedMarks: s.obtainedMarks,
        passMarks: s.passMarks || 40,
      }))
    );
    setRankingMode(res.isManualPosition ? 'manual' : 'auto');
    setManualPositionInClass(res.positionInClass || 1);
    setIsModalOpen(true);
  };

  // When class changes inside the modal
  const handleModalClassChange = (newClassId: string) => {
    setModalClassId(newClassId);
    const classSts = students.filter((s) => s.classId === newClassId);
    setStudentId(classSts[0]?.id || '');
    setSubjectsList(loadKitabsForClass(newClassId));
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId) {
      alert('অনুগ্রহ করে একজন শিক্ষার্থী নির্বাচন করুন।');
      return;
    }

    const targetStudent = students.find((s) => s.id === studentId);
    const selClass = classes.find((c) => c.id === modalClassId);

    const calculatedSubjects = subjectsList.map((sub) => {
      const { grade, arabic, gpa } = calculateSubjectGrade(sub.obtainedMarks, sub.fullMarks);
      return {
        ...sub,
        grade,
        arabicGrade: arabic,
        gpa,
      };
    });

    const totalPossible = calculatedSubjects.reduce((a, b) => a + b.fullMarks, 0);
    const totalObtained = calculatedSubjects.reduce((a, b) => a + b.obtainedMarks, 0);
    const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
    const avgGpa =
      calculatedSubjects.length > 0
        ? calculatedSubjects.reduce((a, b) => a + b.gpa, 0) / calculatedSubjects.length
        : 0;

    const overall =
      percentage >= 80
        ? { grade: 'A+', arabic: 'মুমতাজ (স্টার)' }
        : percentage >= 70
        ? { grade: 'A', arabic: 'জাইয়্যিদ জিদ্দান (১ম বিভাগ)' }
        : percentage >= 60
        ? { grade: 'A-', arabic: 'জাইয়্যিদ (২য় বিভাগ)' }
        : percentage >= 40
        ? { grade: 'B', arabic: 'মাকবুল (৩য় বিভাগ)' }
        : { grade: 'F', arabic: 'রাসিব (অকৃতকার্য)' };

    const finalPosition =
      rankingMode === 'manual'
        ? Number(manualPositionInClass) || 1
        : modalMeritPreview.predictedRank || 1;

    const resultData: ExamResult = {
      id: editingResultId || `res-${Date.now()}`,
      studentId: studentId.trim(),
      studentName: targetStudent?.nameBangla || 'শিক্ষার্থী',
      roll: targetStudent?.roll || 1,
      classId: modalClassId,
      className: selClass?.name || 'জামাত',
      examType: selectedExamType as 'first_term' | 'mid_term' | 'final_term',
      examName: examName.trim(),
      publishDate: new Date().toLocaleDateString('bn-BD'),
      totalMarksPossible: totalPossible,
      totalMarksObtained: totalObtained,
      percentage,
      overallGrade: overall.grade,
      overallArabicGrade: overall.arabic,
      cgpa: avgGpa,
      positionInClass: finalPosition,
      isManualPosition: rankingMode === 'manual',
      subjects: calculatedSubjects,
      generalRemarks: generalRemarks.trim(),
    };

    if (editingResultId) {
      updateExamResult(resultData);
      showToast('ফলাফল সফলভাবে আপডেট হয়েছে এবং মেধাস্থান সংরক্ষিত হয়েছে!');
    } else {
      if (addExamResult) {
        addExamResult(resultData);
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      showToast(
        rankingMode === 'manual'
          ? 'নতুন ফলাফল ও কাস্টম মেধাস্থান সফলভাবে সংরক্ষিত হয়েছে!'
          : 'নতুন পরীক্ষার ফলাফল প্রকাশিত হয়েছে এবং প্রাপ্ত নম্বরের ভিত্তিতে মেধাস্থান স্বয়ংক্রিয়ভাবে নির্ধারণ করা হয়েছে!'
      );
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-700" />
              পরীক্ষার ফলাফল প্রকাশ ও ট্রান্সক্রিপ্ট প্রস্তুতকরণ
            </h2>
            <p className="text-xs text-slate-500">
              মাদানী নেসাব ও সকল জামাতের কিতাবভিত্তিক নম্বর এন্ট্রি, মুমতাজ/জাইয়্যিদ গ্রেডিং ও মার্কশিট
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Offline Class Tabulation Broadsheet */}
            <button
              onClick={() => {
                setTabulationModalMode('tabulation');
                setIsTabulationModalOpen(true);
              }}
              className="bg-indigo-900 hover:bg-indigo-950 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="নির্দিষ্ট জামাতের সকল শিক্ষার্থীর বিষয়ভিত্তিক পূর্ণাঙ্গ ফলাফল ও ট্যাবুলেশন শিট অফলাইনে প্রিন্ট করুন"
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>জামাতের ট্যাবুলেশন শিট</span>
            </button>

            {/* 2. Offline Batch Marksheets Print */}
            <button
              onClick={() => {
                setTabulationModalMode('batch_marksheet');
                setIsTabulationModalOpen(true);
              }}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="নির্দিষ্ট জামাতের সকল শিক্ষার্থীর ব্যক্তিগত মার্কশিট একসাথে অফলাইনে প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>সব মার্কশিট প্রিন্ট</span>
            </button>

            <button
              onClick={() => {
                const count = recalculateAllMeritPositions();
                confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
                showToast(`সফলভাবে ${count}টি পরীক্ষার ফলাফলের মেধাস্থান (১ম, ২য়, ৩য়...) প্রাপ্ত নম্বরের ভিত্তিতে স্বয়ংক্রিয়ভাবে নির্ধারণ করা হয়েছে!`);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="সকল শ্রেণির শিক্ষার্থীদের প্রাপ্ত নম্বরের ভিত্তিতে মেধাস্থান (১ম, ২য়, ৩য়...) স্বয়ংক্রিয়ভাবে নির্ধারণ করুন"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>অটো মেধাস্থান নির্ধারণ</span>
            </button>

            <button
              onClick={() => exportResultsToExcel(examResults)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="সকল ফলাফল এক্সেলে ডাউনলোড করুন"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>ফলাফল এক্সেল</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ফলাফল এন্ট্রি</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedExamType('first_term')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedExamType === 'first_term' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              ১ম সাময়িক
            </button>
            <button
              onClick={() => setSelectedExamType('mid_term')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedExamType === 'mid_term' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              অর্ধ-বার্ষিক
            </button>
            <button
              onClick={() => setSelectedExamType('final_term')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedExamType === 'final_term' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              বার্ষিক পরীক্ষা
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">জামাত / শ্রেণি ফিল্টার:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200 overflow-hidden space-y-3">
        {/* Mobile scroll indicator */}
        <div className="sm:hidden flex items-center justify-between bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold">
          <span>📱 মোবাইলে ফলাফল ও গ্রেড তালিকা দেখতে ডানে স্ক্রল করুন</span>
          <span className="font-mono text-xs">👉</span>
        </div>

        {filteredResults.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            এই শ্রেণির জন্য কোন ফলাফল প্রকাশ করা হয়নি। উপরের বাটনে ক্লিক করে ফলাফল এন্ট্রি করুন।
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[780px] text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center">মেধা স্থান</th>
                  <th className="p-3">ছাত্রের নাম ও আইডি</th>
                  <th className="p-3">মোট নম্বর</th>
                  <th className="p-3">শতাংশ (%)</th>
                  <th className="p-3">লেটার গ্রেড</th>
                  <th className="p-3">ইসলামিক মূল্যায়ন</th>
                  <th className="p-3">সিজিপিএ</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-center">
                      {r.positionInClass === 1 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-900 font-bold px-2.5 py-1 rounded-full text-xs shadow-2xs">
                          ১ম স্থান
                        </span>
                      ) : r.positionInClass === 2 ? (
                        <span className="inline-flex items-center gap-1 bg-slate-200 border border-slate-300 text-slate-800 font-bold px-2.5 py-1 rounded-full text-xs shadow-2xs">
                          ২য় স্থান
                        </span>
                      ) : r.positionInClass === 3 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 font-bold px-2.5 py-1 rounded-full text-xs shadow-2xs">
                          ৩য় স্থান
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold px-2.5 py-1 rounded-full text-xs">
                          {getOrdinalBangla(r.positionInClass)} স্থান
                        </span>
                      )}
                      {r.isManualPosition && (
                        <span className="block text-[9px] text-amber-700 font-bold mt-0.5">
                          (কাস্টম)
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-900">{r.studentName}</div>
                      <div className="text-[11px] text-slate-400">
                        আইডি: <span className="font-mono text-blue-800 font-bold">{r.studentId}</span> • রোল: {r.roll}
                      </div>
                    </td>

                    <td className="p-3 font-mono font-bold text-slate-900">
                      {r.totalMarksObtained} / {r.totalMarksPossible}
                    </td>

                    <td className="p-3 font-mono font-bold text-blue-800">
                      {r.percentage.toFixed(1)}%
                    </td>

                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                        {r.overallGrade}
                      </span>
                    </td>

                    <td className="p-3 font-medium text-amber-800">{r.overallArabicGrade}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{r.cgpa.toFixed(2)}</td>

                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleEditResult(r)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="নম্বর ও ফলাফল এডিট করুন"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewingResult(r)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="মার্কশিট দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: r.id, studentName: r.studentName })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Result Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-blue-800 sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">মার্কশিট ও পরীক্ষার নম্বর এন্ট্রি</h3>
                  <p className="text-[11px] text-blue-200">শ্রেণিভিত্তিক শিক্ষার্থী ও নির্ধারিত কিতাবের নম্বর প্রদান</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition cursor-pointer"
                title="বন্ধ করুন (Close)"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveResult} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* STEP 1: Select Class FIRST, then Student */}
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-3">
                <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <span>১. জামাত ও শিক্ষার্থী নির্বাচন (প্রথমে জামাত নির্বাচন করুন)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      শ্রেণি / জামাত নির্বাচন করুন *
                    </label>
                    <select
                      value={modalClassId}
                      onChange={(e) => handleModalClassChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl font-bold text-blue-950 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      এই জামাতের শিক্ষার্থী নির্বাচন করুন *
                    </label>
                    {modalClassStudents.length === 0 ? (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                        এই জামাতে কোনো শিক্ষার্থী পাওয়া যায়নি!
                      </div>
                    ) : (
                      <select
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
                      >
                        {modalClassStudents.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.nameBangla} (রোল {st.roll}) — {st.id}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* STEP 2: Exam & Auto Merit Ranking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">পরীক্ষার নাম *</label>
                  <input
                    type="text"
                    required
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="যেমন: ১ম সাময়িক পরীক্ষা ২০২৬"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Dual-Mode Merit Rank (Auto vs Manual) */}
                <div className="bg-linear-to-br from-amber-50 to-blue-50 border border-amber-200/80 p-3 rounded-2xl flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      মেধাস্থান নির্ধারণ:
                    </span>
                    {/* Mode Toggle Buttons */}
                    <div className="flex items-center bg-white/90 p-0.5 rounded-xl border border-amber-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setRankingMode('auto')}
                        className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                          rankingMode === 'auto'
                            ? 'bg-blue-800 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        ⚡ স্বয়ংক্রিয় (অটো)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRankingMode('manual');
                          if (!manualPositionInClass) {
                            setManualPositionInClass(modalMeritPreview.predictedRank || 1);
                          }
                        }}
                        className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                          rankingMode === 'manual'
                            ? 'bg-blue-800 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        ✍️ ম্যানুয়াল (কাস্টম)
                      </button>
                    </div>
                  </div>

                  {rankingMode === 'auto' ? (
                    <div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-black text-blue-950">
                            {modalMeritPreview.ordinalBangla} স্থান
                          </span>
                          {modalMeritPreview.predictedRank === 1 && (
                            <span className="text-[11px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                              ১ম স্থান
                            </span>
                          )}
                          {modalMeritPreview.predictedRank === 2 && (
                            <span className="text-[11px] bg-slate-500 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                              ২য় স্থান
                            </span>
                          )}
                          {modalMeritPreview.predictedRank === 3 && (
                            <span className="text-[11px] bg-amber-700 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                              ৩য় স্থান
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-600">
                          মোট প্রাপ্ত: {modalTotalObtained} / {modalTotalPossible}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        নম্বর অনুযায়ী স্বয়ংক্রিয় মেধাস্থান হিসাব হচ্ছে।
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-700">কাস্টম মেধা স্থান:</span>
                          <input
                            type="number"
                            min={1}
                            value={manualPositionInClass}
                            onChange={(e) => setManualPositionInClass(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-center font-black font-mono text-xs bg-white border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="font-bold text-slate-900 text-xs">
                            ({getOrdinalBangla(manualPositionInClass)} স্থান)
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded-md">
                          ম্যানুয়ালি সংরক্ষিত হবে
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        কর্তৃপক্ষের বিশেষ বিবেচনায় কাস্টম মেধাস্থান সেট করতে পারেন।
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 3: Subject Marks Inputs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-800">
                    নির্ধারিত কিতাব ও বিষয়ভিত্তিক প্রাপ্ত নম্বর ({currentModalClass?.name || 'জামাত'})
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSubjectsList([
                        ...subjectsList,
                        { subjectName: 'নতুন কিতাব / বিষয়', fullMarks: 100, obtainedMarks: 80, passMarks: 40 },
                      ])
                    }
                    className="text-xs font-bold text-blue-800 hover:text-blue-950 flex items-center gap-1 bg-blue-100/80 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> বিষয় যোগ করুন
                  </button>
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-56 overflow-y-auto">
                  {subjectsList.map((sub, sidx) => (
                    <div key={sidx} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        value={sub.subjectName}
                        onChange={(e) => {
                          const updated = [...subjectsList];
                          updated[sidx].subjectName = e.target.value;
                          setSubjectsList(updated);
                        }}
                        placeholder="কিতাবের নাম"
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">পূর্ণ:</span>
                        <input
                          type="number"
                          value={sub.fullMarks}
                          onChange={(e) => {
                            const updated = [...subjectsList];
                            updated[sidx].fullMarks = Number(e.target.value);
                            setSubjectsList(updated);
                          }}
                          className="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold font-mono text-center text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">প্রাপ্ত:</span>
                        <input
                          type="number"
                          min={0}
                          max={sub.fullMarks || 100}
                          value={sub.obtainedMarks}
                          onChange={(e) => {
                            const updated = [...subjectsList];
                            updated[sidx].obtainedMarks = Number(e.target.value);
                            setSubjectsList(updated);
                          }}
                          className="w-16 px-2 py-1 bg-blue-50 border border-blue-300 rounded-lg font-bold font-mono text-blue-950 text-center text-xs focus:bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubjectsList(subjectsList.filter((_, idx) => idx !== sidx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="বিষয় মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">মুহতামিম / উস্তাদের মূল্যায়ন ও মন্তব্য</label>
                <input
                  type="text"
                  value={generalRemarks}
                  onChange={(e) => setGeneralRemarks(e.target.value)}
                  placeholder="যেমন: মাশাআল্লাহ, পড়াশোনায় ভালো অগ্রগতি..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sticky Modal Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-bold border border-slate-300 transition cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  ফলাফল সংরক্ষণ ও প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Marksheet Modal */}
      {viewingResult && (
        <div className="print-modal-active fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:static print:p-0 print:m-0 print:bg-white print:overflow-visible print:block">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:m-0 print:overflow-visible print:block">
            {/* Marksheet Modal Header */}
            <div className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-blue-800 no-print">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">অফিসিয়াল একাডেমিক মার্কশিট</h3>
                  <p className="text-[11px] text-blue-200">{viewingResult.examName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingResult(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition cursor-pointer"
                title="বন্ধ করুন (Close)"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Marksheet Body */}
            <div id="admin-marksheet-printable" className="p-6 space-y-4 text-xs overflow-y-auto flex-1 bg-white">
              <div className="text-center border-b border-slate-200 pb-3 space-y-1">
                <div className="font-['Amiri'] text-base text-slate-800 font-bold" dir="rtl">
                  {madrasaInfo.nameArabic || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">{madrasaInfo.nameBangla}</h3>
                <p className="text-[11px] text-slate-600">{madrasaInfo.address || 'ঢাকা, বাংলাদেশ'} • ফোনঃ {madrasaInfo.phone || ''}</p>
                <h4 className="font-extrabold text-blue-900 text-sm pt-1">{viewingResult.examName}</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">শিক্ষার্থীর নাম</span>
                  <strong className="text-slate-900">{viewingResult.studentName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">ছাত্র আইডি</span>
                  <strong className="font-mono text-blue-800">{viewingResult.studentId}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">জামাত</span>
                  <strong>{viewingResult.className}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">মেধা স্থান</span>
                  <strong className="text-amber-800">
                    {getOrdinalBangla(viewingResult.positionInClass)} স্থান
                  </strong>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[500px] text-xs text-left">
                  <thead className="bg-blue-950 text-white">
                    <tr>
                      <th className="p-2.5">কিতাব / বিষয়</th>
                      <th className="p-2.5 text-center">পূর্ণমান</th>
                      <th className="p-2.5 text-center">প্রাপ্ত নম্বর</th>
                      <th className="p-2.5 text-center">গ্রেড</th>
                      <th className="p-2.5 text-center">মূল্যায়ন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingResult.subjects.map((sub, sidx) => (
                      <tr key={sidx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">{sub.subjectName}</td>
                        <td className="p-2.5 text-center font-mono">{sub.fullMarks}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-blue-800">{sub.obtainedMarks}</td>
                        <td className="p-2.5 text-center font-bold">{sub.grade}</td>
                        <td className="p-2.5 text-center text-amber-900 font-semibold">{sub.arabicGrade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                <div>
                  <span className="text-[10px] text-blue-700 block">মোট প্রাপ্ত নম্বর</span>
                  <span className="text-base font-extrabold text-blue-950">
                    {viewingResult.totalMarksObtained} / {viewingResult.totalMarksPossible}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 block">শতাংশ</span>
                  <span className="text-base font-extrabold text-blue-950">
                    {viewingResult.percentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 block">ইসলামিক বিভাগ</span>
                  <span className="text-base font-extrabold text-blue-950">
                    {viewingResult.overallArabicGrade}
                  </span>
                </div>
              </div>

              {/* Signatures for Print */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
                <div>
                  <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <span>শ্রেণি শিক্ষকের স্বাক্ষর</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <span>নাজেমে তা'লীমাত</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <span className="font-bold text-slate-900">মুহতামিমের স্বাক্ষর ও সিল</span>
                </div>
              </div>
            </div>

            {/* Marksheet Footer with Print AND Close buttons */}
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 no-print">
              <button
                type="button"
                onClick={() => setViewingResult(null)}
                className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 border border-slate-300 font-bold transition cursor-pointer flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                বন্ধ করুন
              </button>

              <button
                type="button"
                onClick={() =>
                  printHtmlElement('admin-marksheet-printable', {
                    title: `${viewingResult.studentName} - মার্কশিট (${viewingResult.examName})`,
                    landscape: false,
                  })
                }
                className="px-6 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                মার্কশিট প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Result Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="পরীক্ষার ফলাফল মুছে ফেলার নিশ্চিতকরণ"
        itemName={deleteTarget ? `${deleteTarget.studentName} এর পরীক্ষার ফলাফল` : undefined}
        description="আপনি কি নিশ্চিতভাবে এই শিক্ষার্থীর পরীক্ষার মার্কশিট ও ফলাফল ডাটাবেজ থেকে মুছে ফেলতে চান?"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        onConfirm={() => {
          if (deleteTarget) {
            deleteExamResult(deleteTarget.id);
            showToast(`ফলাফল সফলভাবে মুছে ফেলা হয়েছে!`);
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

      {/* Full Class Offline Result Tabulation Sheet & Batch Marksheets Modal */}
      <ClassResultTabulationSheet
        isOpen={isTabulationModalOpen}
        onClose={() => setIsTabulationModalOpen(false)}
        initialClassId={selectedClassId}
        initialExamType={selectedExamType}
        initialMode={tabulationModalMode}
      />
    </div>
  );
};
