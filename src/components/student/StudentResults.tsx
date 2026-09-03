import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { ExamResult } from '../../types';
import {
  Award,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  BookOpen,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

export const StudentResults: React.FC = () => {
  const { currentStudent, examResults, madrasaInfo } = useMadrasa();
  const [selectedExamType, setSelectedExamType] = useState<string>('first_term');

  if (!currentStudent) return null;

  const myResults = examResults.filter((r) => r.studentId === currentStudent.id);
  const activeResult = myResults.find((r) => r.examType === selectedExamType) || myResults[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with Exam Selector */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              একাডেমিক ফলাফল ও মূল্যায়ন ট্রান্সক্রিপ্ট
            </h2>
            <p className="text-xs text-slate-500">
              {currentStudent.nameBangla} • রোল: {currentStudent.roll} • {currentStudent.className}
            </p>
          </div>

          {/* Exam Type Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">পরীক্ষা নির্বাচন:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedExamType('first_term')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedExamType === 'first_term'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                ১ম সাময়িক ২০২৬
              </button>
              <button
                onClick={() => setSelectedExamType('mid_term')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedExamType === 'mid_term'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                অর্ধ-বার্ষিক
              </button>
              <button
                onClick={() => setSelectedExamType('final_term')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedExamType === 'final_term'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                বার্ষিক পরীক্ষা
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeResult ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-blue-200 space-y-6 animate-in fade-in">
          {/* Top Result Banner */}
          <div className="text-center border-b-2 border-blue-800 pb-5">
            <div className="font-['Amiri'] text-blue-800 text-base">{madrasaInfo.nameArabic}</div>
            <h2 className="text-2xl font-black text-slate-900">
              {madrasaInfo.nameBangla}
            </h2>
            <p className="text-xs text-slate-500">{madrasaInfo.address}</p>
            <div className="mt-3 inline-block bg-blue-800 text-amber-300 font-bold text-xs sm:text-sm px-5 py-1 rounded-full shadow-xs">
              অফিশিয়াল ফলাফলপত্র — {activeResult.examName}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-center">
              <span className="text-slate-500 block">শ্রেণিতে মেধা স্থান:</span>
              <span className="text-xl font-black text-blue-900 font-mono">
                {activeResult.positionInClass}ম
              </span>
            </div>
            <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-center">
              <span className="text-slate-500 block">সিজিপিএ (CGPA):</span>
              <span className="text-xl font-black text-blue-900 font-mono">
                {activeResult.cgpa.toFixed(2)}
              </span>
            </div>
            <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-center">
              <span className="text-slate-500 block">লেটার গ্রেড:</span>
              <span className="text-xl font-black text-blue-900">
                {activeResult.overallGrade}
              </span>
            </div>
            <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-center">
              <span className="text-slate-500 block">ইসলামিক মূল্যায়ন:</span>
              <span className="text-xl font-bold text-amber-800">
                {activeResult.overallArabicGrade}
              </span>
            </div>
          </div>

          {/* Marksheet Table */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[600px] text-xs text-left border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-blue-900 text-white font-bold">
                <tr>
                  <th className="p-3">ক্রম</th>
                  <th className="p-3">পাঠ্য বিষয় / কিতাব</th>
                  <th className="p-3 text-center">পূর্ণমান</th>
                  <th className="p-3 text-center">প্রাপ্ত নম্বর</th>
                  <th className="p-3 text-center">লেটার গ্রেড</th>
                  <th className="p-3 text-center">ইসলামিক গ্রেড</th>
                  <th className="p-3 text-center">জিপিএ (GPA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeResult.subjects.map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 font-medium text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">{sub.subjectName}</td>
                    <td className="p-3 text-center text-slate-600">{sub.fullMarks}</td>
                    <td className="p-3 text-center font-bold text-blue-900">{sub.obtainedMarks}</td>
                    <td className="p-3 text-center">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="p-3 text-center font-medium text-slate-700">{sub.arabicGrade}</td>
                    <td className="p-3 text-center font-bold text-slate-900">{sub.gpa.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-blue-50 font-bold text-slate-900 border-t-2 border-blue-800">
                <tr>
                  <td colSpan={2} className="p-3 text-right">
                    সর্বমোট নম্বর ও চূড়ান্ত ফলাফল:
                  </td>
                  <td className="p-3 text-center">{activeResult.totalMarksPossible}</td>
                  <td className="p-3 text-center text-blue-800 font-extrabold text-sm">
                    {activeResult.totalMarksObtained} ({activeResult.percentage.toFixed(1)}%)
                  </td>
                  <td className="p-3 text-center text-blue-800">{activeResult.overallGrade}</td>
                  <td className="p-3 text-center text-blue-800">{activeResult.overallArabicGrade}</td>
                  <td className="p-3 text-center text-blue-800 text-sm">{activeResult.cgpa.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Remarks Box */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 text-xs text-amber-950">
            <strong className="block mb-1 text-amber-900">শ্রেণি শিক্ষক ও মুহতামিমের মন্তব্য:</strong>
            <p className="italic">"{activeResult.generalRemarks}"</p>
          </div>

          {/* Print button */}
          <div className="pt-2 text-center">
            <button
              onClick={handlePrint}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition inline-flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              মার্কশিট প্রিন্ট করুন
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200 text-xs">
          এই পরীক্ষার ফলাফল এখনও প্রকাশিত হয়নি।
        </div>
      )}
    </div>
  );
};
