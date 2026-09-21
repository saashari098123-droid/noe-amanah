import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { ExamResult, Student } from '../../types';
import { getOrdinalBangla } from '../../utils/meritCalculator';
import { printHtmlElement } from '../../utils/printHelper';
import {
  Award,
  Search,
  Printer,
  GraduationCap,
  X,
  Eye,
  ShieldCheck,
  AlertCircle,
  Phone,
  Calendar,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export const PublicResults: React.FC = () => {
  const { examResults, classes, madrasaInfo, students } = useMadrasa();

  const [searchMethod, setSearchMethod] = useState<'id' | 'classRoll'>('id');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [guardianPhoneInput, setGuardianPhoneInput] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedExamType, setSelectedExamType] = useState('all');

  // Verification and Results state
  const [verifiedStudent, setVerifiedStudent] = useState<Student | null>(null);
  const [matchedResultsList, setMatchedResultsList] = useState<ExamResult[]>([]);
  const [searchedResult, setSearchedResult] = useState<ExamResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [noResultsMessage, setNoResultsMessage] = useState<string | null>(null);

  // Quick Verification Modal when selecting from Class List
  const [selectedStudentForVerification, setSelectedStudentForVerification] = useState<Student | null>(null);
  const [modalPhoneInput, setModalPhoneInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Helper to normalize phone numbers (convert Bangla digits to English and strip non-digits)
  const normalizePhone = (str?: string): string => {
    if (!str) return '';
    const bnToEnMap: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    };
    const converted = str.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
    return converted.replace(/\D/g, '');
  };

  const verifyStudentAndPhone = (studentId: string, phone: string): { student?: Student; error?: string } => {
    const cleanId = studentId.trim().toUpperCase();
    const inputDigits = normalizePhone(phone);

    if (!cleanId) {
      return { error: 'অনুগ্রহ করে ছাত্র আইডি প্রদান করুন।' };
    }
    if (!inputDigits || inputDigits.length < 6) {
      return { error: 'অনুগ্রহ করে শিক্ষার্থীর নিবন্ধিত অভিভাবকের মোবাইল নম্বর (কমপক্ষে ৬ ডিজিট) প্রদান করুন।' };
    }

    const student = students.find((s) => s.id.trim().toUpperCase() === cleanId);
    if (!student) {
      return { error: `ছাত্র আইডি "${studentId}" পাওয়া যায়নি! সঠিক আইডি দিন।` };
    }

    const guardianDigits = normalizePhone(student.guardianPhone);
    const studentDigits = normalizePhone(student.phone);

    const isMatch =
      (guardianDigits && (guardianDigits === inputDigits || guardianDigits.endsWith(inputDigits) || inputDigits.endsWith(guardianDigits))) ||
      (studentDigits && (studentDigits === inputDigits || studentDigits.endsWith(inputDigits) || inputDigits.endsWith(studentDigits)));

    if (!isMatch) {
      return {
        error: 'ছাত্র আইডি অথবা অভিভাবকের মোবাইল নম্বর মেলেনি! সঠিক নিবন্ধিত মোবাইল নম্বর দিন।',
      };
    }

    return { student };
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError(null);
    setNoResultsMessage(null);
    setMatchedResultsList([]);
    setSearchedResult(null);

    const verification = verifyStudentAndPhone(studentIdInput, guardianPhoneInput);
    if (verification.error) {
      setSearchError(verification.error);
      return;
    }

    const student = verification.student!;
    setVerifiedStudent(student);

    // Look up real published results for this student
    const matches = examResults.filter(
      (r) =>
        r.studentId.trim().toUpperCase() === student.id.trim().toUpperCase() &&
        (selectedExamType === 'all' || r.examType === selectedExamType)
    );

    if (matches.length === 0) {
      setNoResultsMessage(`শিক্ষার্থী ${student.nameBangla} (আইডি: ${student.id})-এর জন্য কোনো ফলাফল প্রকাশিত হয়নি।`);
      return;
    }

    if (matches.length === 1) {
      setSearchedResult(matches[0]);
      setMatchedResultsList(matches);
    } else {
      // Multiple exam results available: let user choose
      setMatchedResultsList(matches);
    }
  };

  const handleVerifyModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForVerification) return;

    setModalError(null);
    const verification = verifyStudentAndPhone(selectedStudentForVerification.id, modalPhoneInput);
    if (verification.error) {
      setModalError(verification.error);
      return;
    }

    const student = verification.student!;
    setSelectedStudentForVerification(null);
    setModalPhoneInput('');
    setStudentIdInput(student.id);
    setGuardianPhoneInput(modalPhoneInput);
    setVerifiedStudent(student);
    setSearchError(null);
    setNoResultsMessage(null);

    const matches = examResults.filter(
      (r) =>
        r.studentId.trim().toUpperCase() === student.id.trim().toUpperCase() &&
        (selectedExamType === 'all' || r.examType === selectedExamType)
    );

    if (matches.length === 0) {
      setNoResultsMessage(`শিক্ষার্থী ${student.nameBangla} (আইডি: ${student.id})-এর জন্য কোনো ফলাফল প্রকাশিত হয়নি।`);
      setMatchedResultsList([]);
      setSearchedResult(null);
    } else if (matches.length === 1) {
      setSearchedResult(matches[0]);
      setMatchedResultsList(matches);
    } else {
      setMatchedResultsList(matches);
      setSearchedResult(null);
    }
  };

  const handleCloseMarksheet = () => {
    setSearchedResult(null);
  };

  const handlePrint = () => {
    printHtmlElement('public-result-marksheet-printable', {
      title: `মার্কশিট - ${searchedResult?.studentName || 'ফলাফল'} (${searchedResult?.examName || ''})`,
    });
  };

  const classStudents = students.filter((s) => s.classId === selectedClassId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl text-center">
        <span className="text-xs text-amber-300 font-bold uppercase tracking-widest bg-blue-800/80 px-3 py-1 rounded-full border border-amber-400/30">
          অফিসিয়াল ফলাফল প্রকাশনা পোর্টাল
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-3">
          পরীক্ষার ফলাফল ও একাডেমিক ট্রান্সক্রিপ্ট
        </h1>
        <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-xl mx-auto">
          গোপনীয়তা ও নিরাপত্তার স্বার্থে ছাত্র আইডি এবং নিবন্ধিত অভিভাবকের মোবাইল নম্বর প্রদান করে ফলাফল ও মার্কশিট অনুসন্ধান করুন।
        </p>
      </div>

      {/* Marksheet Modal Overlay */}
      {searchedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-blue-200 my-auto overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Top Header */}
            <div className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-blue-800">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">অফিসিয়াল একাডেমিক মার্কশিট ও ফলাফল</h3>
                  <p className="text-[11px] text-blue-200">{searchedResult.examName}</p>
                </div>
              </div>

              {/* Close Button 'X' */}
              <button
                type="button"
                onClick={handleCloseMarksheet}
                className="bg-white/10 hover:bg-rose-600 text-white p-2 rounded-full transition cursor-pointer flex items-center justify-center"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Marksheet Content */}
            <div id="public-result-marksheet-printable" className="p-6 sm:p-8 space-y-6 text-xs overflow-y-auto flex-1 bg-white">
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
                    রোল: {searchedResult.roll} {searchedResult.positionInClass ? `(মেধা স্থান: ${getOrdinalBangla(searchedResult.positionInClass)} স্থান)` : ''}
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
              {searchedResult.generalRemarks && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs text-slate-700 no-print print:hidden">
                  <span className="font-bold text-blue-900 block mb-1">মুহতামিম ও শিক্ষকের মূল্যায়ন:</span>
                  <p className="italic">"{searchedResult.generalRemarks}"</p>
                </div>
              )}

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

            {/* Bottom Actions */}
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleCloseMarksheet}
                className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 border border-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                ফলাফল প্রদর্শন বন্ধ করুন
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

      {/* Modal for Guardian Verification from Class List */}
      {selectedStudentForVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-800" />
                <h3 className="font-bold text-slate-900 text-sm">অভিভাবক ভেরিফিকেশন</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentForVerification(null);
                  setModalError(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-blue-900 text-sm">{selectedStudentForVerification.nameBangla}</div>
              <div className="text-slate-600">আইডি: <span className="font-mono font-bold">{selectedStudentForVerification.id}</span> | জামাত: {selectedStudentForVerification.className}</div>
            </div>

            <form onSubmit={handleVerifyModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  নিবন্ধিত অভিভাবকের মোবাইল নম্বর দিন *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={modalPhoneInput}
                    onChange={(e) => setModalPhoneInput(e.target.value)}
                    placeholder="যেমন: 01711223344"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">ভর্তি ফরমে দেওয়া অভিভাবকের মোবাইল নম্বর প্রবেশ করুন।</p>
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentForVerification(null);
                    setModalError(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-md transition"
                >
                  মার্কশিট দেখুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Search Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
        {/* Method Toggle and Exam Filter */}
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
                onClick={() => {
                  setSearchMethod('id');
                  setSearchError(null);
                  setNoResultsMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  searchMethod === 'id' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                ছাত্র আইডি ও ফোন দিয়ে সার্চ
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMethod('classRoll');
                  setSearchError(null);
                  setNoResultsMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  searchMethod === 'classRoll' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                শ্রেণি ও তালিকা অনুযায়ী
              </button>
            </div>
          </div>
        </div>

        {/* Method 1: Search By Student ID & Guardian Phone */}
        {searchMethod === 'id' && (
          <form onSubmit={handleSearch} className="pt-2 max-w-lg mx-auto space-y-4">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>নিরাপত্তা নিশ্চিত করতে ছাত্র আইডি এবং অভিভাবকের মোবাইল নম্বর উভয়টি দিন।</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ছাত্র আইডি নম্বর *</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    placeholder="যেমন: DA-2026-101"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">অভিভাবকের মোবাইল নম্বর *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={guardianPhoneInput}
                    onChange={(e) => setGuardianPhoneInput(e.target.value)}
                    placeholder="যেমন: 01711223344"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {searchError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{searchError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              ফলাফল অনুসন্ধান করুন
            </button>
          </form>
        )}

        {/* Method 2: Class & Student List Browser */}
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
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setSearchError(null);
                        setNoResultsMessage(null);
                      }}
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
                  শিক্ষার্থীদের তালিকা (ক্লিক করে অভিভাবক ভেরিফিকেশনসহ মার্কশিট দেখুন):
                </h3>
                <span className="text-[11px] text-slate-400">মোট শিক্ষার্থী: {classStudents.length} জন</span>
              </div>

              {classStudents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {classStudents.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedStudentForVerification(st);
                        setModalPhoneInput('');
                        setModalError(null);
                      }}
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

        {/* No Results Message - Strict Truthful display with no fake fabrication */}
        {noResultsMessage && (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <h4 className="font-bold text-amber-900 text-sm">ফলাফল প্রকাশিত হয়নি</h4>
            <p className="text-xs text-amber-800 max-w-md mx-auto">{noResultsMessage}</p>
          </div>
        )}

        {/* Multiple Exam Selection List (when student has multiple exams published) */}
        {matchedResultsList.length > 1 && !searchedResult && (
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {verifiedStudent?.nameBangla}-এর প্রকাশিত পরীক্ষাসমূহ:
                </h3>
                <p className="text-xs text-slate-500">যেকোনো পরীক্ষার ওপর ক্লিক করে পূর্ণাঙ্গ নম্বরপত্র ও ফলাফল দেখুন</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-lg">
                মোট পরীক্ষা: {matchedResultsList.length}টি
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchedResultsList.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setSearchedResult(res)}
                  className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-blue-900 group-hover:text-blue-700">
                      {res.examName}
                    </span>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                      গ্রেড: {res.overallGrade}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>প্রাপ্ত নম্বর: <strong className="text-slate-900">{res.totalMarksObtained}/{res.totalMarksPossible}</strong> ({res.percentage.toFixed(1)}%)</span>
                    <span>GPA: <strong className="text-blue-800">{res.cgpa.toFixed(2)}</strong></span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {res.publishDate || '২০২৬'}
                    </span>
                    <span className="text-blue-700 font-bold flex items-center gap-1 group-hover:underline">
                      মার্কশিট দেখুন <Eye className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
