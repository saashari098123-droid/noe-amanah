import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { Complaint } from '../../types';
import {
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const StudentFeedback: React.FC = () => {
  const { currentStudent, teachers, complaints, sendComplaint } = useMadrasa();

  const [recipientType, setRecipientType] = useState<'teacher' | 'admin'>('teacher');
  const [recipientId, setRecipientId] = useState<string>(teachers[0]?.id || 'tch-01');
  const [category, setCategory] = useState<'teacher_complaint' | 'suggestion' | 'academics' | 'boarding_food' | 'other'>('teacher_complaint');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!currentStudent) return null;

  // Filter complaints sent from this student's account
  const myComplaints = complaints.filter(
    (c) =>
      c.senderId === currentStudent.id ||
      c.studentId === currentStudent.id ||
      (c.senderName && (c.senderName.includes(currentStudent.nameBangla) || c.senderName.includes(currentStudent.id)))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetName = 'মুহতামিম / প্রশাসন প্রধান';
    if (recipientType === 'teacher') {
      const tch = teachers.find((t) => t.id === recipientId);
      targetName = tch ? `${tch.nameBangla} (${tch.designation})` : 'শ্রেণি শিক্ষক';
    }

    const catLabels: Record<string, string> = {
      teacher_complaint: 'শিক্ষক সম্পর্কিত বিষয়',
      suggestion: 'উন্নয়নমূলক পরামর্শ',
      academics: 'পড়ালেখা ও সবক',
      boarding_food: 'হোস্টেল ও খাবার মান',
      other: 'জরুরি বার্তা',
    };

    sendComplaint({
      senderRole: 'guardian',
      senderId: currentStudent.id,
      studentId: currentStudent.id,
      studentName: currentStudent.nameBangla,
      studentClass: currentStudent.className,
      senderName: `${currentStudent.fatherName || 'অভিভাবক'} (ছাত্র: ${currentStudent.nameBangla})`,
      senderContact: currentStudent.phone || currentStudent.guardianPhone || '',
      recipientType,
      recipientId: recipientType === 'teacher' ? recipientId : undefined,
      recipientName: targetName,
      category,
      categoryLabel: catLabels[category] || 'পরামর্শ',
      subject,
      message,
    });

    setIsSuccess(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-blue-700/50 space-y-2">
        <span className="text-xs text-amber-300 font-bold uppercase tracking-widest bg-blue-800/80 px-3 py-1 rounded-full">
          অভিভাবক সরাসরি যোগাযোগ ও বার্তা ডেস্ক
        </span>
        <h2 className="text-2xl font-bold">
          শিক্ষক বা মুহতামিম বরাবর অভিযোগ ও পরামর্শ
        </h2>
        <p className="text-xs text-blue-200 max-w-2xl leading-relaxed">
          আপনার সন্তানের পড়াশোনা, শৃঙ্খলা, হোস্টেলের সুবিধা বা যেকোনো উস্তাদের প্রতি আপনার বার্তা সম্পূর্ণ গোপনীয়তার সাথে নির্দিষ্ট ব্যক্তির কাছে পৌঁছাবে।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Complaint & Message Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              নতুন বার্তা বা অভিযোগ দাখিল করুন
            </h3>
            <p className="text-xs text-slate-500">প্রেরক: {currentStudent.fatherName} (অভিভাবক)</p>
          </div>

          {isSuccess ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
              <h4 className="font-bold text-base">আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে!</h4>
              <p className="text-xs text-blue-700">
                দায়িত্বপ্রাপ্ত কর্তৃপক্ষ দ্রুততম সময়ে বিষয়টি পর্যালোচনা করে রিপ্লাই প্রদান করবেন।
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Recipient Target Choice */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">কাকে বার্তা পাঠাতে চান? *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecipientType('teacher')}
                    className={`p-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-2 ${
                      recipientType === 'teacher'
                        ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    নির্দিষ্ট উস্তাদ / শিক্ষক
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientType('admin')}
                    className={`p-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-2 ${
                      recipientType === 'admin'
                        ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    মুহতামিম / প্রধান প্রশাসন
                  </button>
                </div>
              </div>

              {/* If Teacher is chosen, show Teacher Select dropdown */}
              {recipientType === 'teacher' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">শিক্ষক বেছে নিন *</label>
                  <select
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameBangla} — {t.designation} ({t.assignedSubjects.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ক্যাটাগরি *</label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as
                        | 'teacher_complaint'
                        | 'suggestion'
                        | 'academics'
                        | 'boarding_food'
                        | 'other'
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="teacher_complaint">উস্তাদ / শিক্ষক সম্পর্কিত বিষয়</option>
                  <option value="academics">পড়ালেখা ও বাড়ির কাজ সম্পর্কিত</option>
                  <option value="boarding_food">আবাসিক হোস্টেল ও খাবার মান</option>
                  <option value="suggestion">সাধারণ গঠনমূলক পরামর্শ</option>
                  <option value="other">অন্যান্য জরুরি কথা</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">বার্তার মূল বিষয় *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="উদাঃ তাজবীদ ক্লাসে আরও বিশেষ নজর দেওয়ার অনুরোধ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">বিস্তারিত বার্তা *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার বক্তব্য পরিষ্কার ও বিস্তারিতভাবে লিখুন..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  বার্তা দাখিল করুন
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Sent Messages & Teacher/Admin Replies History */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">পূর্ববর্তী বার্তা ও কর্তৃপক্ষের উত্তর</h3>
            <p className="text-xs text-slate-500">আপনার দাখিলকৃত বার্তার অগ্রগতি ও ফিরতি উত্তর</p>
          </div>

          {myComplaints.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              পূর্বে প্রেরিত কোন বার্তা পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[520px] pr-1">
              {myComplaints.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded-md">
                      {item.categoryLabel}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.submittedAt}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{item.subject}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                    <div className="text-[11px] text-slate-400 mt-1">প্রাপক: {item.recipientName}</div>
                  </div>

                  {/* Reply section */}
                  {item.responseMessage || (item.replies && item.replies.length > 0) ? (
                    <div className="space-y-2">
                      {item.responseMessage && (!item.replies || item.replies.length === 0) && (
                        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between text-emerald-950 font-bold">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              উত্তর ({item.respondedBy || 'উস্তাদ / প্রশাসন'}):
                            </span>
                            <span className="text-[10px] text-emerald-700 font-normal">{item.respondedAt}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed pl-5">{item.responseMessage}</p>
                        </div>
                      )}
                      {item.replies && item.replies.map((rep) => (
                        <div key={rep.id} className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between text-emerald-950 font-bold">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              উত্তর ({rep.repliedByName}):
                            </span>
                            <span className="text-[10px] text-emerald-700 font-normal">{rep.replyDate}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed pl-5">{rep.replyMessage}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      নির্দিষ্ট উস্তাদ / কর্তৃপক্ষের পর্যালোচনায় রয়েছে, শীঘ্রই উত্তর প্রদান করা হবে।
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
