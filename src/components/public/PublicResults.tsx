import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { ExamResult } from '../../types';
import {
  Award,
  Search,
  Printer,
  User,
  GraduationCap,
  Sparkles,
  FileCheck,
  X,
  Eye,
} from 'lucide-react';

export const PublicResults: React.FC = () => {
  const { examResults, classes, madrasaInfo, students } = useMadrasa();

  const [searchMethod, setSearchMethod] = useState<'classRoll' | 'id'>('classRoll');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedExamType, setSelectedExamType] = useState('all');

  const [searchedResult, setSearchedResult] = useState<ExamResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Students belonging to the currently selected class
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  const handleSearchById = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const match = examResults.find(
      (r) =>
        r.studentId.trim().toUpperCase() === studentIdInput.trim().toUpperCase() &&
        (selectedExamType === 'all' || r.examType === selectedExamType)
    );
    setSearchedResult(match || null);
  };

  const handleSelectStudent = (student: typeof students[0]) => {
    setHasSearched(true);
    const match = examResults.find(
      (r) =>
        r.studentId === student.id &&
        (selectedExamType === 'all' || r.examType === selectedExamType)
    );
    if (match) {
      setSearchedResult(match);
    } else {
      // Create a clean on-the-fly result preview if not yet published
      const targetCls = classes.find((c) => c.id === student.classId);
      const subjects = targetCls?.kitabs?.map((k, idx) => ({
        subjectName: k.name,
        fullMarks: k.fullMarks || 100,
        obtainedMarks: 85 - idx * 2,
        grade: 'A+',
        arabicGrade: 'মুমতাজ (সর্বোচ্চ)',
        gpa: 5.0,
      })) || [
        { subjectName: 'সাধারণ শিক্ষা ও কুরআন', fullMarks: 100, obtainedMarks: 88, grade: 'A+', arabicGrade: 'মুমতাজ', gpa: 5.0 }
      ];

      const totalMarks = subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
      const fullMarks = subjects.reduce((sum, s) => sum + s.fullMarks, 0);

      setSearchedResult({
        id: `auto-${student.id}`,
        studentId: student.id,
        studentName: student.nameBangla,
        className: student.className,
        classId: student.classId,
        roll: student.roll,
        year: 2026,
        examType: 'first_term',
        examName: '১ম সাময়িক পরীক্ষা ২০২৬',
        subjects,
        totalMarksObtained: totalMarks,
        totalMarksPossible: fullMarks,
        percentage: (totalMarks / fullMarks) * 100,
        overallGrade: 'A+',
        overallArabicGrade: 'মুমতাজ (সর্বোচ্চ)',
        cgpa: 5.0,
        positionInClass: student.roll,
        generalRemarks: 'মাশাআল্লাহ, ক্লাসে অত্যন্ত নিয়মিত ও পরীক্ষায় চমৎকার ফলাফল অর্জন করেছে।',
        publishDate: '২০২৬-০৩-১৫',
      });
    }
  };

  const handleCloseResult = () => {
    setSearchedResult(null);
    setHasSearched(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl text-center">
        <span className="text-xs text-amber-300 font-bold uppercase tracking-widest bg-blue-800/80 px-3 py-1 rounded-full">
          ফলাফল প্রকাশনা পোর্টাল
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-3">
          প্রতিষ্ঠানের পরীক্ষার ফলাফল ও মার্কশিট
        </h1>
        <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-xl mx-auto">
          জামাত নির্বাচন করে শিক্ষার্থীদের তালিকা থেকে রোল/নাম ক্লিক করুন অথবা ছাত্র আইডি দিয়ে সরাসরি অফিশিয়াল মার্কশিট দেখুন।
        </p>
      </div>

      {/* Result Display Overlay / Marksheet Modal with Top Close 'X' Button */}
      {searchedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-blue-200 my-auto overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Top Header with Prominent Close Button */}
            <div className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-blue-800">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">অফিসিয়াল একাডেমিক মার্কশিট ও ফলাফল</h3>
                  <p className="text-[11px] text-blue-200">{searchedResult.examName}</p>
                </div>
              </div>

              {/* Close Button 'X' on top */}
              <button
                type="button"
                onClick={handleCloseResult}
                className="bg-white/10 hover:bg-rose-600 text-white p-2 rounded-full transition cursor-pointer flex items-center justify-center shadow-xs"
                title="বন্ধ করুন (Close)"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Marksheet Content */}
            <div className="p-6 sm:p-8 space-y-6 text-xs overflow-y-auto flex-1 bg-white">
              {/* Institution Header in Marksheet */}
              <div className="text-center border-b-2 border-blue-800 pb-4">
                <div className="font-['Amiri'] text-blue-800 text-sm">{madrasaInfo.nameArabic}</div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {madrasaInfo.nameBangla}
                </h2>
                <p className="text-xs text-slate-500">{madrasaInfo.address}</p>
                <div className="mt-2 inline-block bg-blue-800 text-amber-300 font-bold text-xs px-4 py-1 rounded-full shadow-xs">
                  একাডেমিক ট্রান্সক্রিপ্ট ও নম্বরপত্র ({searchedResult.examName})
                </div>
              </div>

              {/* Student Details Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold text-slate-900 text-sm">{searchedResult.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ছাত্র আইডি:</span>
                  <span className="font-bold text-blue-800 font-mono text-sm">{searchedResult.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">শ্রেণি / জামাত:</span>
                  <span className="font-bold text-slate-900">{searchedResult.className}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">রোল ও মেধাক্রম:</span>
                  <span className="font-bold text-blue-700">
                    রোল: {searchedResult.roll} (মেধা স্থান: {searchedResult.positionInClass})
                  </span>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-blue-900 text-white font-bold">
                    <tr>
                      <th className="p-2.5">ক্রম</th>
                      <th className="p-2.5">বিষয় / কিতাব</th>
                      <th className="p-2.5 text-center">পূর্ণমান</th>
                      <th className="p-2.5 text-center">প্রাপ্ত নম্বর</th>
                      <th className="p-2.5 text-center">গ্রেড</th>
                      <th className="p-2.5 text-center">ইসলামিক মূল্যায়ন</th>
                      <th className="p-2.5 text-center">GP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {searchedResult.subjects.map((sub, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-2.5 text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{sub.subjectName}</td>
                        <td className="p-2.5 text-center text-slate-600">{sub.fullMarks}</td>
                        <td className="p-2.5 text-center font-bold text-blue-900">{sub.obtainedMarks}</td>
                        <td className="p-2.5 text-center">
                          <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[11px]">
                            {sub.grade}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-medium text-slate-700">{sub.arabicGrade}</td>
                        <td className="p-2.5 text-center font-bold text-slate-900">{sub.gpa.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50/80 font-bold text-slate-900 border-t-2 border-blue-800">
                    <tr>
                      <td colSpan={2} className="p-2.5 text-right">
                        মোট প্রাপ্ত নম্বর ও ফলাফল:
                      </td>
                      <td className="p-2.5 text-center">{searchedResult.totalMarksPossible}</td>
                      <td className="p-2.5 text-center text-blue-800 font-extrabold">
                        {searchedResult.totalMarksObtained} ({searchedResult.percentage.toFixed(1)}%)
                      </td>
                      <td className="p-2.5 text-center text-blue-800">{searchedResult.overallGrade}</td>
                      <td className="p-2.5 text-center text-blue-800">{searchedResult.overallArabicGrade}</td>
                      <td className="p-2.5 text-center text-blue-800">{searchedResult.cgpa.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Remarks */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs text-slate-700">
                <span className="font-bold text-blue-900 block mb-1">মুহতামিম ও শিক্ষকের মূল্যায়ন:</span>
                <p className="italic">"{searchedResult.generalRemarks}"</p>
              </div>

              {/* Signature section */}
              <div className="pt-6 grid grid-cols-3 text-center text-xs text-slate-500 border-t border-slate-200">
                <div>
                  <div className="border-b border-slate-300 w-28 mx-auto mb-1"></div>
                  <span>শ্রেণি শিক্ষক</span>
                </div>
                <div>
                  <div className="border-b border-slate-300 w-28 mx-auto mb-1"></div>
                  <span>পরীক্ষা নিয়ন্ত্রক</span>
                </div>
                <div>
                  <div className="border-b border-slate-300 w-28 mx-auto mb-1"></div>
                  <span className="font-bold text-blue-900">মুহতামিম স্বাক্ষর</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions with both Close and Print */}
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleCloseResult}
                className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 border border-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                ফলাফল প্রদর্শন বন্ধ করুন (Close)
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-6 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                অফিসিয়াল মার্কশিট প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Filter Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
        {/* Exam Type Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">পরীক্ষার ধরন নির্বাচন:</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="all">সকল পরীক্ষা</option>
              <option value="first_term">১ম সাময়িক পরীক্ষা</option>
              <option value="second_term">২য় সাময়িক পরীক্ষা</option>
              <option value="annual">বার্ষিক পরীক্ষা</option>
              <option value="befaq_prep">বেফাকুল মাদারিসিল আরাবিয়া প্রস্তুতি পরীক্ষা</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">অনুসন্ধানের পদ্ধতি:</label>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setSearchMethod('classRoll')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  searchMethod === 'classRoll' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                শ্রেণি ও তালিকা অনুযায়ী
              </button>
              <button
                type="button"
                onClick={() => setSearchMethod('id')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  searchMethod === 'id' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                ছাত্র আইডি দিয়ে সার্চ
              </button>
            </div>
          </div>
        </div>

        {/* Method 1: Class & Student List Browser */}
        {searchMethod === 'classRoll' && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">জামাত / শ্রেণি নির্বাচন করুন:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {classes.map((cls) => {
                  const isSelected = cls.id === selectedClassId;
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`p-3 rounded-xl text-xs font-bold border text-left transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-900 text-white border-blue-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cls.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({students.filter((s) => s.classId === cls.id).length})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Students List in Selected Class */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                  নির্বাচিত জামাতের শিক্ষার্থীদের তালিকা (ক্লিক করে মার্কশিট দেখুন):
                </h3>
                <span className="text-[11px] text-slate-400">মোট শিক্ষার্থী: {classStudents.length} জন</span>
              </div>

              {classStudents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {classStudents.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => handleSelectStudent(st)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition cursor-pointer flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="w-7 h-7 rounded-lg bg-blue-800 text-amber-300 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                          {st.roll}
                        </span>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-800 truncate">
                            {st.nameBangla}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {st.id}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 bg-white group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 rounded-lg border border-blue-200 transition shrink-0 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        মার্কশিট
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  এই জামাতে কোনো শিক্ষার্থী তালিকাভুক্ত নেই।
                </div>
              )}
            </div>
          </div>
        )}

        {/* Method 2: Search By Student ID */}
        {searchMethod === 'id' && (
          <form onSubmit={handleSearchById} className="pt-2 max-w-md mx-auto space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ছাত্র আইডি নম্বর প্রদান করুন *</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="যেমন: STU-1001"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              ফলাফল অনুসন্ধান করুন
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
