import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { OnlineAdmissionApplication } from '../../types';
import { printHtmlElement } from '../../utils/printHelper';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Printer,
  User,
  Phone,
  Calendar,
  CreditCard,
  X,
  Search,
  BookOpen,
  Info,
  AlertCircle,
  Loader2,
  Check,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PublicAdmission: React.FC = () => {
  const { classes, submitAdmissionApplication, madrasaInfo, admissionApplications } = useMadrasa();

  // Active view: 'apply' or 'search'
  const [activeTab, setActiveTab] = useState<'apply' | 'search'>('apply');

  // Form State
  const [applicantNameBangla, setApplicantNameBangla] = useState('');
  const [applicantNameEnglish, setApplicantNameEnglish] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [applyingClassId, setApplyingClassId] = useState(classes[0]?.id || '');
  const [residentialPreference, setResidentialPreference] = useState<'residential' | 'non-residential' | 'day-care'>('non-residential');
  const [previousSchool, setPreviousSchool] = useState('');
  const [presentAddress, setPresentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');

  // Payment section (like aisc.edu.bd/online/admission-fees)
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank' | 'office'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');

  // Validation & UI State
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submission token output
  const [submittedApplication, setSubmittedApplication] = useState<OnlineAdmissionApplication | null>(null);

  // Search Application State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedApp, setSearchedApp] = useState<OnlineAdmissionApplication | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const currentClassId = applyingClassId || classes[0]?.id || '';
  const selectedClass = classes.find((c) => c.id === currentClassId);
  const admissionFee = selectedClass?.admissionFee || 3000;

  // Resolve monthly fee based on residential status
  const applicableMonthlyFee = selectedClass
    ? residentialPreference === 'non-residential'
      ? selectedClass.monthlyFeeNonResidential || 1500
      : residentialPreference === 'day-care'
      ? selectedClass.monthlyFeeDayCare || 2800
      : selectedClass.monthlyFeeResidential || selectedClass.monthlyFee || 4500
    : 4500;

  const normalizePhoneNumber = (input: string): string => {
    const bnToEn: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    };
    let cleaned = input.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
    cleaned = cleaned.replace(/[\s\-\+\(\)]/g, '');
    if (cleaned.startsWith('880')) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('+880')) {
      cleaned = cleaned.substring(3);
    }
    return cleaned;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errors: Record<string, string> = {};

    // 1. Name validation
    if (!applicantNameBangla.trim()) {
      errors.applicantNameBangla = 'শিক্ষার্থীর নাম বাংলায় লিখুন';
    }

    // 2. Phone validation
    const normalizedPhone = normalizePhoneNumber(guardianPhone);
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!normalizedPhone) {
      errors.guardianPhone = 'অভিভাবকের মোবাইল নম্বর লিখুন';
    } else if (!phoneRegex.test(normalizedPhone)) {
      errors.guardianPhone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)';
    }

    // 3. Father & Mother validation
    if (!fatherName.trim()) {
      errors.fatherName = 'পিতার নাম লিখুন';
    }
    if (!motherName.trim()) {
      errors.motherName = 'মাতার নাম লিখুন';
    }

    // 4. Address validation
    if (!presentAddress.trim()) {
      errors.presentAddress = 'বর্তমান ঠিকানা লিখুন';
    }

    // If there are errors, show them and scroll
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('অনুগ্রহ করে লাল চিহ্নিত প্রয়োজনীয় তথ্যগুলো পূরণ করুন।');
      const errEl = document.getElementById('admission-form-error-banner');
      if (errEl) {
        errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const cls = classes.find((c) => c.id === currentClassId);
      const normalizedSender = senderNumber.trim() ? normalizePhoneNumber(senderNumber) : undefined;
      const hasPaidOnline = paymentMethod !== 'office' && transactionId.trim().length > 0;
      const actualPaymentMethod = hasPaidOnline ? paymentMethod : (paymentMethod === 'office' ? 'office' : 'office');

      const newApp = submitAdmissionApplication({
        applicantNameBangla: applicantNameBangla.trim(),
        applicantNameEnglish: (applicantNameEnglish || applicantNameBangla).trim().toUpperCase(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        guardianPhone: normalizedPhone,
        dateOfBirth: dateOfBirth || '2018-01-01',
        gender,
        bloodGroup,
        institutionId: 'madrasa_main',
        institutionName: madrasaInfo.nameBangla,
        applyingClassId: currentClassId,
        applyingClassName: cls ? cls.name : 'সাধারণ শ্রেণি',
        residentialPreference,
        applicableMonthlyFee,
        admissionFee,
        previousMadrasaOrSchool: previousSchool.trim(),
        presentAddress: presentAddress.trim(),
        permanentAddress: (permanentAddress || presentAddress).trim(),
        paymentMethod: actualPaymentMethod,
        transactionId: transactionId.trim() || undefined,
        senderNumber: normalizedSender,
        paymentStatus: hasPaidOnline ? 'paid' : 'unpaid',
        amountPaid: hasPaidOnline ? admissionFee : 0,
      });

      setSubmittedApplication(newApp);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {
        // Ignored
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      setFormError('আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে, দয়া করে পুনরায় চেষ্টা করুন।');
    }
  };

  const handleSearchApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);
    const q = searchQuery.trim().toUpperCase();
    const found = admissionApplications.find(
      (a) =>
        a.applicationNumber.toUpperCase() === q ||
        a.guardianPhone.trim() === searchQuery.trim() ||
        a.id === searchQuery.trim()
    );
    setSearchedApp(found || null);
  };

  const handlePrintSlip = () => {
    printHtmlElement('public-admission-print-slip', { title: 'ভর্তি আবেদন ও ফি রসিদ - দারুল আমানাহ' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl text-center">
        <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-widest bg-blue-800/80 px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          ২০২৬ শিক্ষাবর্ষে অনলাইন ভর্তি ও ফি আদায়
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          অনলাইন ভর্তি আবেদন ও ফি পরিষদ
        </h1>
        <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-lg mx-auto">
          {madrasaInfo.nameBangla}-এর নূরানী, হিফজ ও কিতাব বিভাগে ঘরে বসেই অনলাইনে ভর্তি আবেদন করুন এবং বিকাশ/নগদে ফি জমা দিন।
        </p>
      </div>

      {/* Main Mode Toggle: Apply vs Search */}
      <div className="flex bg-slate-100 p-1 rounded-2xl max-w-md mx-auto border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab('apply');
            setSubmittedApplication(null);
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'apply' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          নতুন ভর্তি আবেদন ফরম
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'search' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          আবেদন ও ট্র্যাকিং স্লিপ অনুসন্ধান
        </button>
      </div>

      {/* TAB 1: Online Admission Application Flow */}
      {activeTab === 'apply' && (
        <>
          {submittedApplication ? (
            /* Printable Admission Confirmation Slip with Close Button */
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-200 animate-in fade-in zoom-in-95 space-y-6">
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-4 rounded-2xl text-blue-900">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-blue-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">আলহামদুলিল্লাহ! আপনার ভর্তি আবেদন সফলভাবে দাখিল হয়েছে।</h3>
                    <p className="text-xs text-blue-700">
                      ভর্তি পরীক্ষার সময় এই স্লিপটি প্রিন্ট করে সঙ্গে নিয়ে স্কুল এন্ড কলেজে উপস্থিত থাকবেন।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmittedApplication(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-blue-100 rounded-full transition cursor-pointer shrink-0"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Official Slip Card */}
              <div id="public-admission-print-slip" className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 relative space-y-6">
                <div className="text-center border-b border-slate-200 pb-4">
                  <div className="font-['Amiri'] text-blue-800 text-sm">{madrasaInfo.nameArabic}</div>
                  <h2 className="text-xl font-bold text-slate-900">{madrasaInfo.nameBangla}</h2>
                  <p className="text-xs text-slate-500">{madrasaInfo.address}</p>
                  <div className="inline-block mt-2 bg-blue-800 text-amber-300 font-bold text-xs px-4 py-1 rounded-full shadow-xs">
                    অনলাইন ভর্তি আবেদন ও ফি রসিদ
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">আবেদন ট্র্যাকিং নম্বর:</span>
                    <span className="font-bold text-base text-blue-800 font-mono">
                      {submittedApplication.applicationNumber}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">আবেদনের তারিখ:</span>
                    <span className="font-bold text-slate-800">{submittedApplication.submittedAt}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">আবেদনকৃত জামাত:</span>
                    <span className="font-bold text-slate-800">{submittedApplication.applyingClassName}</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <strong>শিক্ষার্থীর নাম:</strong> {submittedApplication.applicantNameBangla} ({submittedApplication.applicantNameEnglish})
                    </div>
                    <div>
                      <strong>পিতা ও মাতার নাম:</strong> {submittedApplication.fatherName} / {submittedApplication.motherName}
                    </div>
                    <div>
                      <strong>অভিভাবকের মোবাইল:</strong> {submittedApplication.guardianPhone}
                    </div>
                    <div>
                      <strong>আবাসন ধরন:</strong>{' '}
                      {submittedApplication.residentialPreference === 'residential'
                        ? 'আবাসিক (বোর্ডিং ও খানা)'
                        : submittedApplication.residentialPreference === 'day-care'
                        ? 'ডে-কেয়ার'
                        : 'অনাবাসিক'}
                    </div>
                    <div>
                      <strong>নির্ধারিত মাসিক বেতন:</strong> ৳ {submittedApplication.applicableMonthlyFee || applicableMonthlyFee}
                    </div>
                    <div>
                      <strong>এককালীন ভর্তি ফি:</strong> ৳ {submittedApplication.admissionFee || submittedApplication.amountPaid || admissionFee} (
                      <span className="text-emerald-700 font-bold">
                        {submittedApplication.paymentStatus === 'paid' ? 'অনলাইন পরিশোধিত' : 'অফিস কাউন্টারে প্রদেয়'}
                      </span>)
                    </div>
                    {submittedApplication.assignedStudentId && (
                      <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-950 font-bold flex items-center justify-between">
                        <span>বরাদ্দকৃত ছাত্র আইডি: {submittedApplication.assignedStudentId}</span>
                        <span>শ্রেণি রোল: {submittedApplication.assignedRoll}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
                  <span>যোগাযোগ ও হেল্পলাইন: {madrasaInfo.phone} | {madrasaInfo.alternatePhone}</span>
                  <span className={`font-bold px-3 py-1 rounded-full ${
                    submittedApplication.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : submittedApplication.status === 'interview'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    স্ট্যাটাস: {
                      submittedApplication.status === 'approved'
                        ? 'ভর্তি চূড়ান্ত অনুমোদিত'
                        : submittedApplication.status === 'interview'
                        ? 'ইন্টারভিউ / মৌখিক পরীক্ষা'
                        : 'আবেদন দাখিলকৃত (অনুমোদন অপেক্ষমাণ)'
                    }
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittedApplication(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  নতুন আবেদন করুন
                </button>
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  ভর্তি স্লিপ প্রিন্ট করুন
                </button>
              </div>
            </div>
          ) : (
            /* Admission Application Form */
            <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 space-y-8">
              {/* Form Global Error Banner */}
              {formError && (
                <div id="admission-form-error-banner" className="bg-rose-50 border-2 border-rose-300 text-rose-900 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="block font-bold mb-0.5">আবেদন দাখিলে ত্রুটি:</strong>
                    <span>{formError}</span>
                  </div>
                </div>
              )}

              {/* Step 1: Academic Choice & Class Selection */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-700" />
                  ১. জামাত / শ্রেণি ও আবাসন পছন্দ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ভর্তিচ্ছু জামাত / শ্রেণি *
                    </label>
                    <select
                      value={currentClassId}
                      onChange={(e) => setApplyingClassId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-blue-50/50 border border-blue-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-blue-950"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} {cls.arabicName ? `(${cls.arabicName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">আবাসন ধরন *</label>
                    <select
                      value={residentialPreference}
                      onChange={(e) =>
                        setResidentialPreference(e.target.value as 'residential' | 'non-residential' | 'day-care')
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      <option value="non-residential">অনাবাসিক (নিয়মিত ক্লাস)</option>
                      <option value="day-care">ডে-কেয়ার (সকাল থেকে আছর পর্যন্ত)</option>
                      <option value="residential">আবাসিক (বোর্ডিং ও খানা সুবিধা সহ)</option>
                    </select>
                  </div>

                  {/* Dynamic Pricing Breakdown Card based on selected class & residence */}
                  <div className="sm:col-span-2 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/50 p-4 sm:p-5 rounded-2xl border border-blue-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest bg-blue-100/80 px-2.5 py-0.5 rounded-md">
                          নির্বাচিত আবাসন ও নির্ধারিত ফি কাঠামো
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-blue-950 mt-1.5 flex items-center gap-1.5">
                          <span>{selectedClass?.name || 'জামাত'}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-purple-900">
                            {residentialPreference === 'non-residential'
                              ? 'অনাবাসিক (নিয়মিত ক্লাস)'
                              : residentialPreference === 'day-care'
                              ? 'ডে-কেয়ার (সকাল থেকে আছর)'
                              : 'আবাসিক (বোর্ডিং ও খানা সুবিধা)'}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          আবাসন ধরন অনুযায়ী নিয়মিত মাসিক বেতন আলাদা নির্ধারিত হবে।
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-white px-3.5 py-2 rounded-xl border border-blue-200 text-center shadow-2xs">
                          <span className="text-[10px] text-slate-500 block font-semibold">মাসিক প্রদেয় বেতন</span>
                          <span className="text-sm sm:text-base font-black text-blue-950">
                            ৳{applicableMonthlyFee}
                          </span>
                        </div>
                        <div className="bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 text-center shadow-2xs">
                          <span className="text-[10px] text-amber-800 block font-semibold">এককালীন ভর্তি ফি</span>
                          <span className="text-sm sm:text-base font-black text-amber-950">
                            ৳{admissionFee}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-blue-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>
                        ভর্তি আবেদন দাখিলের সময় এককালীন ভর্তি ফি (৳{admissionFee}) প্রযোজ্য। দাখিলকৃত আবেদনটি মাদরাসা কর্তৃপক্ষ যাচাই ও অনুমোদন করার পরই ভর্তি চূড়ান্ত ও রোল/আইডি প্রদান করা হবে।
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      পূর্ববর্তী স্কুল এন্ড কলেজ / স্কুলের নাম ও পঠিত কিতাব/শ্রেণি (যদি থাকে)
                    </label>
                    <input
                      type="text"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      placeholder="উদাঃ জামিয়া ইসলামিয়া (৩ পারা সম্পন্ন)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Student Personal Details */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-700" />
                  ২. শিক্ষার্থীর ব্যক্তিগত তথ্য
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      শিক্ষার্থীর নাম (বাংলায়) *
                    </label>
                    <input
                      type="text"
                      value={applicantNameBangla}
                      onChange={(e) => {
                        setApplicantNameBangla(e.target.value);
                        if (fieldErrors.applicantNameBangla) {
                          setFieldErrors((prev) => ({ ...prev, applicantNameBangla: '' }));
                        }
                      }}
                      placeholder="উদাঃ মুহাম্মদ আব্দুল্লাহ আল মাহিন"
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 ${
                        fieldErrors.applicantNameBangla
                          ? 'border-rose-500 ring-2 ring-rose-200'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    {fieldErrors.applicantNameBangla && (
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        {fieldErrors.applicantNameBangla}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Applicant's Name (In English, Capital)
                    </label>
                    <input
                      type="text"
                      value={applicantNameEnglish}
                      onChange={(e) => setApplicantNameEnglish(e.target.value)}
                      placeholder="MUHAMMAD ABDULLAH AL MAHIN"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">জন্ম তারিখ</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">রক্তের গ্রুপ</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Guardian & Contact Details */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-700" />
                  ৩. পিতা, মাতা ও অভিভাবকের তথ্য
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">পিতার নাম *</label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => {
                        setFatherName(e.target.value);
                        if (fieldErrors.fatherName) {
                          setFieldErrors((prev) => ({ ...prev, fatherName: '' }));
                        }
                      }}
                      placeholder="পিতার পূর্ণ নাম"
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 ${
                        fieldErrors.fatherName
                          ? 'border-rose-500 ring-2 ring-rose-200'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    {fieldErrors.fatherName && (
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        {fieldErrors.fatherName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">মাতার নাম *</label>
                    <input
                      type="text"
                      value={motherName}
                      onChange={(e) => {
                        setMotherName(e.target.value);
                        if (fieldErrors.motherName) {
                          setFieldErrors((prev) => ({ ...prev, motherName: '' }));
                        }
                      }}
                      placeholder="মাতার পূর্ণ নাম"
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 ${
                        fieldErrors.motherName
                          ? 'border-rose-500 ring-2 ring-rose-200'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    {fieldErrors.motherName && (
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        {fieldErrors.motherName}
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      অভিভাবকের মোবাইল নম্বর (SMS ও যোগাযোগের জন্য) *
                    </label>
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => {
                        setGuardianPhone(e.target.value);
                        if (fieldErrors.guardianPhone) {
                          setFieldErrors((prev) => ({ ...prev, guardianPhone: '' }));
                        }
                      }}
                      placeholder="017XXXXXXXX"
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 ${
                        fieldErrors.guardianPhone
                          ? 'border-rose-500 ring-2 ring-rose-200'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    {fieldErrors.guardianPhone && (
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        {fieldErrors.guardianPhone}
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">বর্তমান ঠিকানা *</label>
                    <textarea
                      rows={2}
                      value={presentAddress}
                      onChange={(e) => {
                        setPresentAddress(e.target.value);
                        if (fieldErrors.presentAddress) {
                          setFieldErrors((prev) => ({ ...prev, presentAddress: '' }));
                        }
                      }}
                      placeholder="বাসা/রোড, গ্রাম, ডাকঘর, থানা, জেলা..."
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 ${
                        fieldErrors.presentAddress
                          ? 'border-rose-500 ring-2 ring-rose-200'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    ></textarea>
                    {fieldErrors.presentAddress && (
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        {fieldErrors.presentAddress}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 4: Admission Fees & Payment */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-700" />
                    ৪. ভর্তি ফি ও পরিশোধ পদ্ধতি
                  </h3>
                  <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full font-mono">
                    ভর্তি ফি: ৳ {admissionFee}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      paymentMethod === 'bkash'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    বিকাশ (bKash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      paymentMethod === 'nagad'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    নগদ (Nagad)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('rocket')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      paymentMethod === 'rocket'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    রকেট (Rocket)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('office')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      paymentMethod === 'office'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-300'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    মাদরাসা অফিসে জমা (বকেয়া)
                  </button>
                </div>

                {paymentMethod !== 'office' ? (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-xs text-slate-600">
                      নিচের নম্বরে <strong>৳{admissionFee}</strong> Send Money / Payment করুন এবং Transaction ID টি নিচে দিন (যদি এখনই প্রদান না করতে চান তবে মাদরাসা অফিসে জমার বিকল্পটি নির্বাচন করুন):
                    </p>
                    <div className="font-mono text-xs font-bold text-blue-900 bg-blue-50 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between">
                      <span>
                        {paymentMethod === 'bkash'
                          ? `বিকাশ মার্চেন্ট: ${madrasaInfo.bkashMerchantNumber || '01700-000000'}`
                          : paymentMethod === 'nagad'
                          ? `নগদ মার্চেন্ট: ${madrasaInfo.nagadMerchantNumber || '01800-000000'}`
                          : `রকেট একাউন্ট: ${madrasaInfo.rocketNumber || '01900-000000'}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Transaction ID (TrxID)
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="উদাঃ 9X87K2LM (ঐচ্ছিক)"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          যে নম্বর থেকে পেমেন্ট করেছেন (Sender No)
                        </label>
                        <input
                          type="text"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="01XXXXXXXXX (ঐচ্ছিক)"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-blue-800 bg-blue-50 p-3 rounded-xl border border-blue-200">
                    ℹ️ ভর্তি আবেদন অনুমোদনের পর বা উপস্থিতির দিন মাদরাসা ক্যাশ কাউন্টারে ভর্তি ফি (৳{admissionFee}) নগদ জমা দিয়ে অফিশিয়াল রসিদ সংগ্রহ করতে পারবেন।
                  </p>
                )}
              </div>

              {/* Submit Error Warning Banner if any */}
              {formError && (
                <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="text-center pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="submit-admission-application-btn"
                  className="bg-blue-800 hover:bg-blue-900 active:scale-98 disabled:opacity-60 text-white font-bold py-3.5 px-10 rounded-2xl text-sm sm:text-base shadow-xl transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      আবেদন দাখিল হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      ভর্তি আবেদন দাখিল ও স্লিপ সংগ্রহ করুন
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 mt-2">
                  দাখিল করার পরপরই তাৎক্ষণিক প্রিন্টযোগ্য আবেদন স্লিপ প্রদর্শিত হবে।
                </p>
              </div>
            </form>
          )}
        </>
      )}

      {/* TAB 2: Search Application & Tracking Slip */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-base font-bold text-slate-900 text-center">
              ভর্তি আবেদন ট্র্যাকিং ও স্লিপ পুনঃমুদ্রণ
            </h3>
            <form onSubmit={handleSearchApplication} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আবেদন নম্বর (ADM-XXXX) বা অভিভাবকের মোবাইল নম্বর *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="যেমন: ADM-2026-1001 বা 017XXXXXXXX"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                আবেদন অনুসন্ধান করুন
              </button>
            </form>
          </div>

          {searchAttempted && (
            <div className="pt-4 border-t border-slate-200">
              {searchedApp ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-blue-200 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-xs font-bold text-blue-800 font-mono">
                        {searchedApp.applicationNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{searchedApp.applicantNameBangla}</h4>
                      <p className="text-xs text-slate-500">{searchedApp.institutionName} — {searchedApp.applyingClassName}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                      স্ট্যাটাস: {searchedApp.status === 'submitted' ? 'আবেদন গৃহীত' : searchedApp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">পিতার নাম:</span>
                      <strong className="text-slate-800">{searchedApp.fatherName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">মোবাইল:</span>
                      <strong className="text-slate-800">{searchedApp.guardianPhone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">দাখিলের তারিখ:</span>
                      <strong className="text-slate-800">{searchedApp.submittedAt}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">পেমেন্ট মাধ্যম:</span>
                      <strong className="text-blue-800 uppercase">{searchedApp.paymentMethod || 'অফিস'}</strong>
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedApplication(searchedApp);
                        setActiveTab('apply');
                      }}
                      className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      ভর্তি স্লিপ দেখুন ও প্রিন্ট করুন
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  কোন আবেদন পাওয়া যায়নি! দয়া করে সঠিক আবেদন নম্বর বা মোবাইল দিয়ে অনুসন্ধান করুন।
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
