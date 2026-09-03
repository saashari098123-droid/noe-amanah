import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { OnlineAdmissionApplication } from '../../types';
import {
  FileCheck,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Printer,
  X,
  Phone,
  User,
  GraduationCap,
  Sparkles,
  DollarSign,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const AdminAdmissions: React.FC = () => {
  const {
    admissionApplications,
    updateAdmissionStatus,
    approveAdmissionApplication,
    madrasaInfo,
    classes,
    students,
  } = useMadrasa();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<OnlineAdmissionApplication | null>(null);

  // Approval Enrollment Modal State
  const [approvingApp, setApprovingApp] = useState<OnlineAdmissionApplication | null>(null);
  const [customRoll, setCustomRoll] = useState<number>(1);
  const [customMonthlyFee, setCustomMonthlyFee] = useState<number>(4500);
  const [adminNote, setAdminNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredApps = admissionApplications.filter((app) => {
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchSearch =
      app.applicantNameBangla.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.guardianPhone.includes(searchQuery) ||
      (app.assignedStudentId && app.assignedStudentId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleOpenApproveModal = (app: OnlineAdmissionApplication) => {
    const targetClass = classes.find((c) => c.id === app.applyingClassId);
    const classStudents = students.filter((s) => s.classId === app.applyingClassId);
    const nextRoll = classStudents.length > 0 ? Math.max(...classStudents.map((s) => s.roll || 0)) + 1 : 1;

    let defaultFee = app.applicableMonthlyFee;
    if (!defaultFee && targetClass) {
      if (app.residentialPreference === 'non-residential') {
        defaultFee = targetClass.monthlyFeeNonResidential || 1500;
      } else if (app.residentialPreference === 'day-care') {
        defaultFee = targetClass.monthlyFeeDayCare || 2800;
      } else {
        defaultFee = targetClass.monthlyFeeResidential || targetClass.monthlyFee || 4500;
      }
    }

    setApprovingApp(app);
    setCustomRoll(app.assignedRoll || nextRoll);
    setCustomMonthlyFee(defaultFee || 4500);
    setAdminNote(app.adminNote || 'মৌখিক পরীক্ষায় উত্তীর্ণ ও ভর্তি অনুমোদিত');
  };

  const handleConfirmApproval = () => {
    if (!approvingApp) return;

    if (approveAdmissionApplication) {
      const created = approveAdmissionApplication(approvingApp.id, {
        customRoll: Number(customRoll),
        customMonthlyFee: Number(customMonthlyFee),
        adminNote: adminNote.trim(),
      });
      if (created) {
        showToast(`ভর্তি সফলভাবে অনুমোদিত! ছাত্র আইডি: ${created.id}, রোল: ${created.roll}`);
      }
    } else {
      updateAdmissionStatus(approvingApp.id, 'approved');
      showToast('ভর্তি সফলভাবে অনুমোদিত হয়েছে!');
    }

    setApprovingApp(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-emerald-100 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-700 animate-in fade-in slide-in-from-bottom-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Stats */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-purple-600" />
              অনলাইন ভর্তি আবেদন পর্যালোচনা ও চূড়ান্ত অনুমোদন
            </h2>
            <p className="text-xs text-slate-500">
              আবেদনসমূহ যাচাই করে আবাসন ধরন ও নির্ধারিত বেতন অনুযায়ী ছাত্র আইডি এবং রোল বরাদ্দ দিয়ে চূড়ান্ত ভর্তি সম্পন্ন করুন
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-purple-50 text-purple-900 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-purple-200">
              মোট আবেদন: {admissionApplications.length} টি
            </div>
            <div className="bg-emerald-50 text-emerald-900 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
              অনুমোদিত: {admissionApplications.filter((a) => a.status === 'approved' || a.status === 'accepted').length} জন
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">ফিল্টার:</span>
            {['all', 'submitted', 'interview', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st === 'all' && 'সকল আবেদন'}
                {st === 'submitted' && 'অপেক্ষমাণ (নতুন)'}
                {st === 'interview' && 'ইন্টারভিউ কল'}
                {st === 'approved' && 'ভর্তি অনুমোদিত'}
                {st === 'rejected' && 'বাতিল'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আবেদন নং, নাম বা আইডি খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200 overflow-hidden space-y-3">
        <div className="sm:hidden flex items-center justify-between bg-purple-50 text-purple-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold">
          <span>📱 মোবাইলে ভর্তি আবেদন তালিকা দেখতে ডানে স্ক্রল করুন</span>
          <span className="font-mono text-xs">👉</span>
        </div>

        {filteredApps.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">কোন ভর্তি আবেদন পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[860px] text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">আবেদন নং ও ট্র্যাকিং</th>
                  <th className="p-3">শিক্ষার্থীর নাম ও মোবাইল</th>
                  <th className="p-3">জামাত ও আবাসন</th>
                  <th className="p-3 text-center">নির্ধারিত মাসিক বেতন</th>
                  <th className="p-3 text-center">ভর্তি ফি</th>
                  <th className="p-3 text-center">বর্তমান স্ট্যাটাস</th>
                  <th className="p-3 text-center">অ্যাকশন ও অনুমোদন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const targetClass = classes.find((c) => c.id === app.applyingClassId);
                  const isApproved = app.status === 'approved' || app.status === 'accepted';
                  
                  let feeAmount = app.applicableMonthlyFee;
                  if (!feeAmount && targetClass) {
                    if (app.residentialPreference === 'non-residential') feeAmount = targetClass.monthlyFeeNonResidential || 1500;
                    else if (app.residentialPreference === 'day-care') feeAmount = targetClass.monthlyFeeDayCare || 2800;
                    else feeAmount = targetClass.monthlyFeeResidential || targetClass.monthlyFee || 4500;
                  }

                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="font-mono font-bold text-purple-900">{app.applicationNumber}</div>
                        <div className="text-[10px] text-slate-400">{app.submittedAt}</div>
                        {app.assignedStudentId && (
                          <div className="text-[10px] font-bold text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            আইডি: {app.assignedStudentId}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{app.applicantNameBangla}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{app.guardianPhone}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{app.applicantNameEnglish}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{app.applyingClassName}</div>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${
                          app.residentialPreference === 'residential'
                            ? 'bg-purple-100 text-purple-800'
                            : app.residentialPreference === 'day-care'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {app.residentialPreference === 'residential'
                            ? 'আবাসিক'
                            : app.residentialPreference === 'day-care'
                            ? 'ডে-কেয়ার'
                            : 'অনাবাসিক'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-blue-900">৳{feeAmount || 4500}</span>
                        <span className="text-[10px] text-slate-400 block">প্রতি মাস</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-amber-900 font-mono">৳{app.admissionFee || app.amountPaid || 3000}</span>
                        <span className={`text-[10px] block font-semibold ${app.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {app.paymentStatus === 'paid' ? 'পরিশোধিত' : 'অফিস কাউন্টার'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        {app.status === 'submitted' && (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            নতুন দাখিল
                          </span>
                        )}
                        {app.status === 'interview' && (
                          <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                            <FileCheck className="w-3 h-3" />
                            ইন্টারভিউ কল
                          </span>
                        )}
                        {isApproved && (
                          <div className="space-y-0.5">
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              ভর্তি অনুমোদিত
                            </span>
                            {app.assignedRoll && (
                              <div className="text-[10px] font-bold text-slate-600">
                                রোল: {app.assignedRoll}
                              </div>
                            )}
                          </div>
                        )}
                        {app.status === 'rejected' && (
                          <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            বাতিল
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {!isApproved ? (
                            <button
                              onClick={() => handleOpenApproveModal(app)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-2xs transition flex items-center gap-1 cursor-pointer"
                              title="অনুমোদন করে ছাত্র তালিকায় যুক্ত করুন"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              অনুমোদন
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenApproveModal(app)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded-lg text-[10px] transition cursor-pointer"
                              title="তথ্য পুনর্নির্ধারণ"
                            >
                              সম্পাদনা
                            </button>
                          )}

                          <select
                            value={app.status}
                            onChange={(e) => {
                              const newSt = e.target.value as any;
                              if (newSt === 'approved') {
                                handleOpenApproveModal(app);
                              } else {
                                updateAdmissionStatus(app.id, newSt);
                              }
                            }}
                            className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-800"
                          >
                            <option value="submitted">নতুন</option>
                            <option value="interview">ইন্টারভিউ</option>
                            <option value="approved">অনুমোদিত</option>
                            <option value="rejected">বাতিল</option>
                          </select>

                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-1.5 rounded-lg transition cursor-pointer"
                            title="বিস্তারিত ও প্রিন্ট"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve & Finalize Admission Modal */}
      {approvingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">ভর্তি চূড়ান্ত অনুমোদন ও ছাত্র তালিকাভুক্তি</h3>
                  <p className="text-[11px] text-emerald-200">আবেদন নম্বর: {approvingApp.applicationNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setApprovingApp(null)}
                className="text-emerald-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Student Quick Card */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-200/80 text-emerald-900 flex items-center justify-center font-bold text-base shrink-0">
                  {approvingApp.applicantNameBangla.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{approvingApp.applicantNameBangla}</h4>
                  <p className="text-xs text-slate-600">
                    {approvingApp.applyingClassName} •{' '}
                    <span className="font-semibold text-emerald-800">
                      {approvingApp.residentialPreference === 'residential'
                        ? 'আবাসিক'
                        : approvingApp.residentialPreference === 'day-care'
                        ? 'ডে-কেয়ার'
                        : 'অনাবাসিক'}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">মোবাইল: {approvingApp.guardianPhone}</p>
                </div>
              </div>

              {/* Enrollment Assignment Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বরাদ্দকৃত শ্রেণি রোল *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={customRoll}
                    onChange={(e) => setCustomRoll(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">শ্রেণির বর্তমান ক্রম অনুযায়ী প্রস্তাবিত</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নির্ধারিত মাসিক বেতন (টাকা) *
                  </label>
                  <input
                    type="number"
                    required
                    value={customMonthlyFee}
                    onChange={(e) => setCustomMonthlyFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-blue-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">আবাসন ধরন অনুযায়ী স্বয়ংক্রিয় গণনাকৃত</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রশাসনিক নোট / অনুমোদনের মন্তব্য
                  </label>
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="উদাঃ মৌখিক পরীক্ষায় উত্তীর্ণ ও সকল কাগজপত্র যাচাই সম্পন্ন।"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  চূড়ান্ত অনুমোদন করলে শিক্ষার্থী মূল ছাত্র তালিকায় যুক্ত হবে, ইউনিক ছাত্র আইডি জেনারেট হবে এবং একাউন্টস শাখায় ভর্তি ফি রসিদ সংরক্ষিত হবে।
                </span>
              </div>
            </div>

            <div className="bg-slate-100 p-4 flex justify-between border-t border-slate-200">
              <button
                type="button"
                onClick={() => setApprovingApp(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                অনুমোদন ও তালিকায় যুক্ত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Slip Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="bg-purple-950 text-white p-4 flex justify-between items-center">
              <span className="text-xs font-bold text-amber-300">ভর্তি আবেদনপত্র ও প্রবেশপত্র</span>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-purple-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="font-['Amiri'] text-blue-800 text-sm">{madrasaInfo.nameArabic}</div>
                <h3 className="font-bold text-base text-slate-900">{madrasaInfo.nameBangla}</h3>
                <p className="text-[11px] text-slate-500">{madrasaInfo.address}</p>
                <div className="mt-2 inline-block bg-purple-900 text-white font-bold px-3 py-0.5 rounded-full text-[11px]">
                  ভর্তি পরীক্ষার প্রবেশপত্র / আবেদন স্লিপ
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400">আবেদন নং:</span>{' '}
                  <strong className="font-mono text-purple-900">{selectedApplication.applicationNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400">তারিখ:</span>{' '}
                  <strong>{selectedApplication.submittedAt}</strong>
                </div>
                <div>
                  <span className="text-slate-400">ভর্তিচ্ছু জামাত:</span>{' '}
                  <strong>{selectedApplication.applyingClassName}</strong>
                </div>
                <div>
                  <span className="text-slate-400">আবাসন ধরন:</span>{' '}
                  <strong>
                    {selectedApplication.residentialPreference === 'residential'
                      ? 'আবাসিক'
                      : selectedApplication.residentialPreference === 'day-care'
                      ? 'ডে-কেয়ার'
                      : 'অনাবাসিক'}
                  </strong>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div>
                  <strong>নাম:</strong> {selectedApplication.applicantNameBangla} (
                  {selectedApplication.applicantNameEnglish})
                </div>
                <div>
                  <strong>পিতার নাম:</strong> {selectedApplication.fatherName}
                </div>
                <div>
                  <strong>মাতার নাম:</strong> {selectedApplication.motherName}
                </div>
                <div>
                  <strong>মোবাইল:</strong> {selectedApplication.guardianPhone}
                </div>
                <div>
                  <strong>মাসিক বেতন:</strong> ৳{selectedApplication.applicableMonthlyFee || 4500}
                </div>
                <div>
                  <strong>ভর্তি ফি:</strong> ৳{selectedApplication.admissionFee || 3000}
                </div>
                {selectedApplication.assignedStudentId && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-emerald-950 font-bold">
                    বরাদ্দকৃত ছাত্র আইডি: {selectedApplication.assignedStudentId} | রোল: {selectedApplication.assignedRoll}
                  </div>
                )}
                <div>
                  <strong>ঠিকানা:</strong> {selectedApplication.presentAddress}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <span className="font-bold text-purple-900">
                    স্ট্যাটাস: {selectedApplication.status.toUpperCase()}
                  </span>
                  <div>হেল্পলাইন: {madrasaInfo.phone}</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 w-24 mb-1"></div>
                  <span>ভর্তি শাখা কর্মকর্তা</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 flex justify-between border-t border-slate-200">
              <button
                onClick={handlePrint}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                স্লিপ প্রিন্ট করুন
              </button>
              <button
                onClick={() => setSelectedApplication(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
