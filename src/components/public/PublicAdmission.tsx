import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { OnlineAdmissionApplication } from '../../types';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find((c) => c.id === currentClassId);

    const newApp = submitAdmissionApplication({
      applicantNameBangla,
      applicantNameEnglish,
      fatherName,
      motherName,
      guardianPhone,
      dateOfBirth,
      gender,
      bloodGroup,
      institutionId: 'madrasa_main',
      institutionName: madrasaInfo.nameBangla,
      applyingClassId: currentClassId,
      applyingClassName: cls ? cls.name : 'সাধারণ শ্রেণি',
      residentialPreference,
      applicableMonthlyFee,
      admissionFee,
      previousMadrasaOrSchool: previousSchool,
      presentAddress,
      permanentAddress,
      paymentMethod,
      transactionId: transactionId || undefined,
      paymentStatus: paymentMethod === 'office' ? 'unpaid' : 'paid',
      amountPaid: admissionFee,
    });

    setSubmittedApplication(newApp);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
    window.print();
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
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 relative space-y-6">
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
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 space-y-8">
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
                      required
                      value={applicantNameBangla}
                      onChange={(e) => setApplicantNameBangla(e.target.value)}
                      placeholder="উদাঃ মুহাম্মদ আব্দুল্লাহ আল মাহিন"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Applicant's Name (In English, Capital) *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantNameEnglish}
                      onChange={(e) => setApplicantNameEnglish(e.target.value)}
                      placeholder="MUHAMMAD ABDULLAH AL MAHIN"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">জন্ম তারিখ *</label>
                    <input
                      type="date"
                      required
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
                      required
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="পিতার পূর্ণ নাম"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">মাতার নাম *</label>
                    <input
                      type="text"
                      required
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="মাতার পূর্ণ নাম"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      অভিভাবকের মোবাইল নম্বর (SMS প্রাপ্তির জন্য) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">বর্তমান ঠিকানা *</label>
                    <textarea
                      required
                      rows={2}
                      value={presentAddress}
                      onChange={(e) => setPresentAddress(e.target.value)}
                      placeholder="বাসা/রোড, গ্রাম, ডাকঘর, থানা, জেলা..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Step 4: Admission Fees & Payment (Modeled after aisc.edu.bd/online/admission-fees) */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-700" />
                    ৪. অনলাইন ভর্তি ফি ও পেমেন্ট বিবরণী
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
                    স্কুল এন্ড কলেজ অফিসে জমা
                  </button>
                </div>

                {paymentMethod !== 'office' ? (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-xs text-slate-600">
                      নিচের নম্বরে <strong>৳{admissionFee}</strong> Send Money / Payment করুন এবং Transaction ID টি নিচে প্রদান করুন:
                    </p>
                    <div className="font-mono text-xs font-bold text-blue-900 bg-blue-50 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between">
                      <span>
                        {paymentMethod === 'bkash'
                          ? `বিকাশ মার্চেন্ট: ${madrasaInfo.bkashMerchantNumber}`
                          : paymentMethod === 'nagad'
                          ? `নগদ মার্চেন্ট: ${madrasaInfo.nagadMerchantNumber}`
                          : `রকেট একাউন্ট: ${madrasaInfo.rocketNumber}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Transaction ID (TrxID) *
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="উদাঃ 9X87K2LM"
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
                          placeholder="01XXXXXXXXX"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    * ভর্তি পরীক্ষার দিন স্কুল এন্ড কলেজ ক্যাশ কাউন্টারে ভর্তি ফি জমা দিয়ে অফিশিয়াল রসিদ সংগ্রহ করতে পারবেন।
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="text-center pt-2">
                <button
                  type="submit"
                  className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3.5 px-10 rounded-2xl text-sm sm:text-base shadow-xl transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  ভর্তি আবেদন দাখিল ও স্লিপ সংগ্রহ করুন
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
