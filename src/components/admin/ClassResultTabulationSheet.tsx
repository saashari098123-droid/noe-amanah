import React, { useState, useMemo, useEffect } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { ExamResult } from '../../types';
import { getOrdinalBangla } from '../../utils/meritCalculator';
import { exportClassTabulationExcel } from '../../utils/excelService';
import { printHtmlElement } from '../../utils/printHelper';
import {
  Printer,
  X,
  Award,
  FileSpreadsheet,
  Users,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Medal,
  SlidersHorizontal,
  Sparkles,
  Save,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClassResultTabulationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialClassId?: string;
  initialExamType?: string;
  initialMode?: 'tabulation' | 'batch_marksheet';
}

export const ClassResultTabulationSheet: React.FC<ClassResultTabulationSheetProps> = ({
  isOpen,
  onClose,
  initialClassId,
  initialExamType,
  initialMode = 'tabulation',
}) => {
  const {
    classes,
    students,
    examResults,
    madrasaInfo,
    updateExamResult,
    recalculateAllMeritPositions,
  } = useMadrasa();

  // Selected filters
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );
  const [selectedExamType, setSelectedExamType] = useState<string>(
    initialExamType || 'first_term'
  );

  // View & Print Mode: 'tabulation' (Master broadsheet) vs 'batch_marksheet' (All individual student cards)
  const [printMode, setPrintMode] = useState<'tabulation' | 'batch_marksheet'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      if (initialClassId) setSelectedClassId(initialClassId);
      if (initialExamType) setSelectedExamType(initialExamType);
      if (initialMode) setPrintMode(initialMode);
    }
  }, [isOpen, initialClassId, initialExamType, initialMode]);

  // Manual Inline Merit Position Adjustment Mode
  const [isManualEditMode, setIsManualEditMode] = useState(false);
  const [manualRanks, setManualRanks] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentClass = classes.find((c) => c.id === selectedClassId);

  // Filter and sort results for this class and exam
  const classResults = useMemo(() => {
    const list = examResults.filter(
      (r) => r.classId === selectedClassId && r.examType === selectedExamType
    );

    return list.sort((a, b) => {
      // Prioritize merit rank if present
      if (a.positionInClass && b.positionInClass) {
        return a.positionInClass - b.positionInClass;
      }
      return (b.totalMarksObtained || 0) - (a.totalMarksObtained || 0);
    });
  }, [examResults, selectedClassId, selectedExamType]);

  // Extract all distinct subjects across this class's exam results
  const distinctSubjects = useMemo(() => {
    const map = new Map<string, number>();

    // First, if class has predefined kitabs, prioritize their order
    if (currentClass?.kitabs && currentClass.kitabs.length > 0) {
      currentClass.kitabs.forEach((k) => {
        map.set(k.name, k.fullMarks || 100);
      });
    }

    // Then merge any subjects from student results
    classResults.forEach((res) => {
      (res.subjects || []).forEach((s) => {
        if (!map.has(s.subjectName)) {
          map.set(s.subjectName, s.fullMarks || 100);
        }
      });
    });

    return Array.from(map.entries()).map(([name, fullMarks]) => ({
      name,
      fullMarks,
    }));
  }, [currentClass, classResults]);

  // Exam Name display string
  const currentExamTitle = useMemo(() => {
    if (classResults[0]?.examName) return classResults[0].examName;
    if (selectedExamType === 'first_term') return '১ম সাময়িক পরীক্ষা ২০২৬';
    if (selectedExamType === 'mid_term') return 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬';
    if (selectedExamType === 'final_term') return 'বার্ষিক পরীক্ষা ২০২৬';
    return 'সাময়িক পরীক্ষা ২০২৬';
  }, [classResults, selectedExamType]);

  // Statistics
  const totalStudents = classResults.length;
  const passedStudents = classResults.filter((r) => (r.percentage || 0) >= 40).length;
  const failedStudents = totalStudents - passedStudents;
  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : '0';
  const highestMarks =
    totalStudents > 0
      ? Math.max(...classResults.map((r) => r.totalMarksObtained || 0))
      : 0;

  // Initialize manual ranks state when toggling manual edit
  const handleStartManualEdit = () => {
    const ranks: Record<string, number> = {};
    classResults.forEach((r) => {
      ranks[r.id] = r.positionInClass || 1;
    });
    setManualRanks(ranks);
    setIsManualEditMode(true);
  };

  // Save all manual merit positions
  const handleSaveManualRanks = () => {
    classResults.forEach((r) => {
      const newRank = manualRanks[r.id];
      if (newRank !== undefined && newRank !== r.positionInClass) {
        updateExamResult({
          ...r,
          positionInClass: Number(newRank),
          isManualPosition: true,
        });
      }
    });
    setIsManualEditMode(false);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.5 } });
    showToast('সকল শিক্ষার্থীর কাস্টম মেধাস্থান সফলভাবে সংরক্ষিত হয়েছে!');
  };

  // Reset to automated scoring
  const handleResetToAuto = () => {
    if (window.confirm('আপনি কি এই জামাতের সকল শিক্ষার্থীর মেধাস্থান পুনরায় স্বয়ংক্রিয় নম্বর অনুযায়ী রিসেট করতে চান?')) {
      classResults.forEach((r) => {
        updateExamResult({
          ...r,
          isManualPosition: false,
        });
      });
      recalculateAllMeritPositions();
      setIsManualEditMode(false);
      showToast('সকল শিক্ষার্থীর মেধাস্থান নম্বরের ভিত্তিতে অটোমেটিক নির্ধারণ করা হয়েছে!');
    }
  };

  const handlePrint = () => {
    showToast('প্রিন্ট প্রস্তুত হচ্ছে...');
    printHtmlElement('madrasa-printable-area', {
      title: `${currentClass?.name || 'জামাত'} - ${currentExamTitle}`,
      landscape: printMode === 'tabulation',
    });
  };

  const handleExportExcel = () => {
    if (classResults.length === 0) {
      alert('এক্সেলে এক্সপোর্ট করার মত কোন ফলাফল পাওয়া যায়নি।');
      return;
    }
    exportClassTabulationExcel(
      classResults,
      currentClass?.name || 'জামাত',
      currentExamTitle
    );
    showToast('ট্যাবুলেশন শিট এক্সেলে সফলভাবে ডাউনলোড হয়েছে!');
  };

  if (!isOpen) return null;

  return (
    <div className="print-modal-active fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-1 sm:p-4 overflow-y-auto print:static print:p-0 print:m-0 print:bg-white print:overflow-visible print:block">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:m-0 print:overflow-visible print:block">
        {/* Modal Toolbar (Sticky & Hidden during actual paper print) */}
        <div className="bg-blue-950 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-blue-900 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight flex items-center gap-2">
                জামাতভিত্তিক পূর্ণাঙ্গ অফলাইন ফলাফল বিবরণী
                <span className="text-[10px] bg-amber-400 text-blue-950 font-black px-2 py-0.5 rounded-full">
                  অফলাইন প্রিন্ট
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">
                বিষয়ভিত্তিক পূর্ণাঙ্গ নম্বরপত্র, ট্যাবুলেশন শিট ও প্রগ্রেস রিপোর্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition cursor-pointer"
              title="বন্ধ করুন"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls & Print Options Bar (No-Print) */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print text-xs">
          {/* Class & Exam Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">জামাত নির্বাচন:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">পরীক্ষা:</span>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <option value="first_term">১ম সাময়িক পরীক্ষা ২০২৬</option>
                <option value="mid_term">অর্ধ-বার্ষিক পরীক্ষা ২০২৬</option>
                <option value="final_term">বার্ষিক পরীক্ষা ২০২৬</option>
              </select>
            </div>

            {/* Print Mode Switch */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPrintMode('tabulation')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  printMode === 'tabulation'
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                ট্যাবুলেশন শিট (ব্রডশীট)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('batch_marksheet')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  printMode === 'batch_marksheet'
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                সকল ছাত্রের মার্কশিট (একসাথে)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Manual Merit Edit */}
            {printMode === 'tabulation' && (
              <>
                {!isManualEditMode ? (
                  <button
                    type="button"
                    onClick={handleStartManualEdit}
                    className="bg-white hover:bg-slate-100 text-blue-900 border border-blue-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="প্রয়োজনে ম্যানুয়ালি মেধা স্থান পরিবর্তন করুন"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
                    <span>ম্যানুয়াল মেধাস্থান এডিট</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={handleSaveManualRanks}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      সেভ করুন
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToAuto}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      title="নম্বর অনুযায়ী অটো মেধাস্থানে রিসেট"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      অটো রিসেট
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualEditMode(false)}
                      className="text-slate-500 hover:text-slate-800 px-2 py-1 font-semibold"
                    >
                      বাতিল
                    </button>
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              onClick={handleExportExcel}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="এক্সেলে এক্সপোর্ট করুন"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>এক্সেল ডাউনলোড</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>
                {printMode === 'tabulation'
                  ? 'ট্যাবুলেশন শিট প্রিন্ট'
                  : 'সকল মার্কশিট প্রিন্ট'}
              </span>
            </button>
          </div>
        </div>

        {/* Printable Scrollable Content Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-white" id="madrasa-printable-area">
          {classResults.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300 my-6">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-base">
                এই জামাতের জন্য এখনো কোনো পরীক্ষার ফলাফল পাওয়া যায়নি
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                উপরে অন্য কোনো জামাত নির্বাচন করুন অথবা ফলাফল এন্ট্রি সেকশন থেকে শিক্ষার্থীদের প্রাপ্ত নম্বর যোগ করুন।
              </p>
            </div>
          ) : printMode === 'tabulation' ? (
            /* ========================================================== */
            /* MODE 1: MASTER TABULATION SHEET (ব্রডশীট / ফলাফল বিবরণী) */
            /* ========================================================== */
            <div className="space-y-6">
              {/* Official Madrasa Header for Print */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="font-['Amiri'] text-base sm:text-lg text-slate-800 font-bold" dir="rtl">
                  {madrasaInfo.nameArabic || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {madrasaInfo.nameBangla || 'দারুল আমানাহ আল ইসলামিয়া'}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {madrasaInfo.address || 'ঢাকা, বাংলাদেশ'} • মোবাঃ {madrasaInfo.phone || ''}
                </p>

                {/* Exam & Class Details Line */}
                <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-800 pt-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">জামাত / শ্রেণি:</span>
                    <span className="text-blue-900 font-black text-sm bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                      {currentClass?.name || 'জামাত'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">পরীক্ষার নাম:</span>
                    <span className="text-slate-900 font-extrabold">{currentExamTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">শিক্ষাবর্ষ:</span>
                    <span className="font-mono text-slate-900">২০২৬ খ্রি.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">প্রকাশের তারিখ:</span>
                    <span className="text-slate-900">{classResults[0]?.publishDate || new Date().toLocaleDateString('bn-BD')}</span>
                  </div>
                </div>
              </div>

              {/* Master Tabulation Sheet Table */}
              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-2xs">
                <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                  <thead>
                    {/* Primary Header */}
                    <tr className="bg-slate-900 text-white font-bold border-b border-slate-800 text-[11px]">
                      <th className="p-2.5 text-center border-r border-slate-800 w-16">মেধা স্থান</th>
                      <th className="p-2.5 text-center border-r border-slate-800 w-12">রোল</th>
                      <th className="p-2.5 border-r border-slate-800 min-w-[150px]">শিক্ষার্থীর নাম ও আইডি</th>
                      {/* Subject Columns Header */}
                      {distinctSubjects.map((sub, idx) => (
                        <th
                          key={idx}
                          className="p-2 text-center border-r border-slate-800 max-w-[110px] leading-tight"
                          title={`${sub.name} (পূর্ণমান: ${sub.fullMarks})`}
                        >
                          <div className="font-bold truncate">{sub.name}</div>
                          <div className="text-[9px] text-amber-300 font-mono font-normal">
                            ({sub.fullMarks})
                          </div>
                        </th>
                      ))}
                      <th className="p-2 text-center border-r border-slate-800 w-20">মোট প্রাপ্ত</th>
                      <th className="p-2 text-center border-r border-slate-800 w-14">শতাংশ</th>
                      <th className="p-2 text-center border-r border-slate-800 w-12">গ্রেড</th>
                      <th className="p-2 text-center border-r border-slate-800 min-w-[90px]">ইসলামিক মান</th>
                      <th className="p-2 text-center border-r border-slate-800 w-12">সিজিপিএ</th>
                      <th className="p-2 text-center w-16">ফলাফল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {classResults.map((res, rIdx) => {
                      const isPassed = (res.percentage || 0) >= 40;
                      return (
                        <tr
                          key={res.id}
                          className={`hover:bg-blue-50/40 transition ${
                            !isPassed ? 'bg-rose-50/30' : rIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                          }`}
                        >
                          {/* Merit Rank Column */}
                          <td className="p-2 text-center font-bold border-r border-slate-200">
                            {isManualEditMode ? (
                              <input
                                type="number"
                                min={1}
                                value={manualRanks[res.id] || res.positionInClass || 1}
                                onChange={(e) =>
                                  setManualRanks({
                                    ...manualRanks,
                                    [res.id]: Number(e.target.value),
                                  })
                                }
                                className="w-12 px-1 py-0.5 text-center font-bold font-mono border border-blue-400 bg-blue-50 rounded text-xs"
                              />
                            ) : (
                              <span className="font-mono text-slate-900 font-bold text-xs">
                                {getOrdinalBangla(res.positionInClass)}
                              </span>
                            )}
                            {res.isManualPosition && !isManualEditMode && (
                              <span className="block text-[8px] text-blue-600 font-semibold no-print">
                                (কাস্টম)
                              </span>
                            )}
                          </td>

                          {/* Roll No */}
                          <td className="p-2 text-center font-mono font-bold text-slate-800 border-r border-slate-200">
                            {res.roll}
                          </td>

                          {/* Student Name & ID */}
                          <td className="p-2 border-r border-slate-200">
                            <div className="font-bold text-slate-900 leading-tight">{res.studentName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{res.studentId}</div>
                          </td>

                          {/* Dynamic Subject Marks Columns */}
                          {distinctSubjects.map((sub, sIdx) => {
                            const subMatch = (res.subjects || []).find(
                              (s) => s.subjectName === sub.name
                            );
                            const obtained = subMatch ? subMatch.obtainedMarks : null;
                            const isFail = obtained !== null && obtained < (subMatch?.passMarks || 40);

                            return (
                              <td
                                key={sIdx}
                                className={`p-2 text-center font-mono border-r border-slate-200 ${
                                  isFail
                                    ? 'bg-rose-100/70 text-rose-800 font-black'
                                    : 'font-semibold text-slate-800'
                                }`}
                              >
                                {obtained !== null ? (
                                  <span>
                                    {obtained}
                                    {isFail && <span className="text-[9px] text-rose-600 ml-0.5">!</span>}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            );
                          })}

                          {/* Total Marks */}
                          <td className="p-2 text-center font-mono font-bold text-slate-950 border-r border-slate-200 bg-slate-50/70">
                            {res.totalMarksObtained}
                            <span className="text-[9px] text-slate-400 block font-normal">
                              /{res.totalMarksPossible}
                            </span>
                          </td>

                          {/* Percentage */}
                          <td className="p-2 text-center font-mono font-bold text-blue-900 border-r border-slate-200">
                            {res.percentage ? res.percentage.toFixed(1) : '0'}%
                          </td>

                          {/* Letter Grade */}
                          <td className="p-2 text-center font-bold border-r border-slate-200">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                res.overallGrade === 'A+'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : res.overallGrade === 'A'
                                  ? 'bg-blue-100 text-blue-800'
                                  : res.overallGrade === 'F'
                                  ? 'bg-rose-100 text-rose-800 font-black'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {res.overallGrade}
                            </span>
                          </td>

                          {/* Islamic Grade */}
                          <td className="p-2 text-center text-slate-700 font-semibold border-r border-slate-200 text-[10px]">
                            {res.overallArabicGrade}
                          </td>

                          {/* CGPA */}
                          <td className="p-2 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                            {res.cgpa ? res.cgpa.toFixed(2) : '-'}
                          </td>

                          {/* Final Status */}
                          <td className="p-2 text-center font-bold">
                            {isPassed ? (
                              <span className="text-emerald-700 text-[10px]">উত্তীর্ণ</span>
                            ) : (
                              <span className="text-rose-700 text-[10px] font-black">অনুত্তীর্ণ</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Official Signatures Section for Offline Archival / Print */}
              <div className="pt-12 pb-4 grid grid-cols-4 gap-4 text-center text-xs border-t border-slate-300 avoid-break-inside">
                <div>
                  <div className="border-t border-dashed border-slate-400 pt-1 mx-4 font-semibold text-slate-700">
                    শ্রেণি উস্তাদ / পরীক্ষক
                  </div>
                  <span className="text-[10px] text-slate-400 block">Class Teacher / Examiner</span>
                </div>
                <div>
                  <div className="border-t border-dashed border-slate-400 pt-1 mx-4 font-semibold text-slate-700">
                    পরীক্ষা নিয়ন্ত্রক
                  </div>
                  <span className="text-[10px] text-slate-400 block">Controller of Exams</span>
                </div>
                <div>
                  <div className="border-t border-dashed border-slate-400 pt-1 mx-4 font-semibold text-slate-700">
                    মুহতামিম / অধ্যক্ষ
                  </div>
                  <span className="text-[10px] text-slate-400 block">Principal / Rector</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border border-dashed border-slate-400 rounded-full flex items-center justify-center text-[9px] text-slate-400 font-bold">
                    অফিসিয়াল সিল
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">মাদরাসার সীলমোহর</span>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* MODE 2: BATCH PRINT ALL INDIVIDUAL MARKSHEETS (প্রগ্রেস কার্ড) */
            /* ========================================================== */
            <div className="space-y-8">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-xs text-blue-900 flex items-center justify-between no-print">
                <span className="font-semibold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-700" />
                  এই জামাতের সকল ({classResults.length} জন) শিক্ষার্থীর স্বতন্ত্র মার্কশিট প্রস্তুত। প্রিন্ট বাটনে ক্লিক করলে প্রতিটি মার্কশিট আলাদা পৃষ্ঠায় প্রিন্ট হবে।
                </span>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-blue-800 text-white font-bold px-3 py-1 rounded-xl shadow-xs hover:bg-blue-900"
                >
                  সব প্রিন্ট করুন
                </button>
              </div>

              {classResults.map((res) => (
                <div
                  key={res.id}
                  className="bg-white border-2 border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs page-break-after avoid-break-inside max-w-3xl mx-auto"
                >
                  {/* Marksheet Header */}
                  <div className="text-center border-b-2 border-slate-800 pb-3 space-y-1">
                    <div className="font-['Amiri'] text-base text-slate-800 font-bold" dir="rtl">
                      {madrasaInfo.nameArabic || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
                    </div>
                    <h2 className="text-xl font-black text-slate-950">
                      {madrasaInfo.nameBangla || 'দারুল আমানাহ আল ইসলামিয়া'}
                    </h2>
                    <p className="text-[11px] text-slate-600">
                      {madrasaInfo.address || 'ঢাকা, বাংলাদেশ'} • ফোনঃ {madrasaInfo.phone || ''}
                    </p>
                    <p className="text-xs font-bold text-blue-900 pt-1">{res.examName}</p>
                  </div>

                  {/* Student Details Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block">শিক্ষার্থীর নাম</span>
                      <strong className="text-slate-950 text-sm">{res.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">ছাত্র আইডি ও রোল</span>
                      <strong className="font-mono text-blue-900">
                        {res.studentId} • রোল: {res.roll}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">জামাত / শ্রেণি</span>
                      <strong>{res.className}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">মেধা স্থান (Merit Rank)</span>
                      <strong className="text-amber-800 text-sm">
                        {getOrdinalBangla(res.positionInClass)} স্থান
                      </strong>
                    </div>
                  </div>

                  {/* Subject Breakdown Table */}
                  <table className="w-full text-xs text-left border-collapse border border-slate-300">
                    <thead className="bg-slate-900 text-white text-[11px]">
                      <tr>
                        <th className="p-2 border border-slate-700">কিতাব ও বিষয়</th>
                        <th className="p-2 text-center border border-slate-700 w-16">পূর্ণমান</th>
                        <th className="p-2 text-center border border-slate-700 w-16">পাস মার্ক</th>
                        <th className="p-2 text-center border border-slate-700 w-20">প্রাপ্ত নম্বর</th>
                        <th className="p-2 text-center border border-slate-700 w-16">লেটার গ্রেড</th>
                        <th className="p-2 text-center border border-slate-700">ইসলামিক মূল্যায়ন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      {res.subjects.map((sub, sIdx) => {
                        const isFail = sub.obtainedMarks < (sub.passMarks || 40);
                        return (
                          <tr key={sIdx} className={isFail ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                            <td className="p-2 font-bold text-slate-800 border border-slate-200">
                              {sub.subjectName}
                            </td>
                            <td className="p-2 text-center font-mono border border-slate-200">
                              {sub.fullMarks}
                            </td>
                            <td className="p-2 text-center font-mono text-slate-500 border border-slate-200">
                              {sub.passMarks || 40}
                            </td>
                            <td
                              className={`p-2 text-center font-mono font-bold border border-slate-200 ${
                                isFail ? 'text-rose-700 font-black' : 'text-blue-900'
                              }`}
                            >
                              {sub.obtainedMarks}
                            </td>
                            <td className="p-2 text-center font-bold border border-slate-200">
                              {sub.grade}
                            </td>
                            <td className="p-2 text-center text-slate-700 font-medium border border-slate-200">
                              {sub.arabicGrade}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Overall Result Summary Box */}
                  <div className="grid grid-cols-4 gap-2 bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-blue-700 block">মোট প্রাপ্ত নম্বর</span>
                      <strong className="text-base text-blue-950 font-mono">
                        {res.totalMarksObtained} / {res.totalMarksPossible}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-700 block">শতকরা হার (%)</span>
                      <strong className="text-base text-blue-950 font-mono">
                        {res.percentage ? res.percentage.toFixed(1) : 0}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-700 block">লেটার গ্রেড ও জিপিএ</span>
                      <strong className="text-base text-blue-950 font-mono">
                        {res.overallGrade} ({res.cgpa ? res.cgpa.toFixed(2) : '-'})
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-700 block">চূড়ান্ত ইসলামিক মান</span>
                      <strong className="text-sm text-blue-950 block leading-tight">
                        {res.overallArabicGrade}
                      </strong>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
                    <div>
                      <div className="border-t border-slate-400 pt-1 mx-4 font-semibold">শ্রেণি উস্তাদ</div>
                    </div>
                    <div>
                      <div className="border-t border-slate-400 pt-1 mx-4 font-semibold">পরীক্ষা নিয়ন্ত্রক</div>
                    </div>
                    <div>
                      <div className="border-t border-slate-400 pt-1 mx-4 font-semibold">মুহতামিম / অধ্যক্ষ</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (No-Print) */}
        <div className="p-3 px-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print text-xs">
          <div className="text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              প্রিন্ট কমান্ড দিলে পেপার অথবা PDF এ স্বয়ংক্রিয়ভাবে ঝকঝকে ফরম্যাটে মুদ্রিত হবে।
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 border border-slate-300 font-bold transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>প্রিন্ট করুন (Print)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
