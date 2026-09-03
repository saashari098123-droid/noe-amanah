import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { Complaint } from '../../types';
import {
  MessageSquare,
  Reply,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Calendar,
  Send,
} from 'lucide-react';

export const TeacherComplaints: React.FC = () => {
  const { currentTeacher, complaints, replyToComplaint } = useMadrasa();

  // Selected complaint to reply
  const [activeReplyingId, setActiveReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  if (!currentTeacher) return null;

  // Filter complaints addressed STRICTLY to this teacher
  const myComplaints = complaints.filter((c) => {
    if (c.recipientType === 'admin') return false;
    if (c.recipientId) {
      return c.recipientId === currentTeacher.id;
    }
    if (c.recipientName && currentTeacher.nameBangla) {
      return (
        c.recipientName.includes(currentTeacher.nameBangla) ||
        currentTeacher.nameBangla.includes(c.recipientName)
      );
    }
    return false;
  });

  const handleSendReply = (complaintId: string) => {
    if (!replyText.trim()) return;
    replyToComplaint(complaintId, replyText.trim(), 'teacher', currentTeacher.nameBangla);
    setActiveReplyingId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            অভিভাবকদের প্রেরিত বার্তা, অভিযোগ ও পরামর্শ ইনবক্স
          </h2>
          <p className="text-xs text-slate-500">
            অভিভাবকদের যেকোনো প্রশ্নের উত্তর দিন এবং শিক্ষার্থীদের পড়াশোনার অগ্রগতি অবগত করুন
          </p>
        </div>
        <div className="bg-amber-50 text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-amber-200">
          মোট বার্তা: {myComplaints.length} টি
        </div>
      </div>

      {/* Messages List */}
      {myComplaints.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200 text-xs">
          কোন অভিভাবকের বার্তা পাওয়া যায়নি।
        </div>
      ) : (
        <div className="space-y-4">
          {myComplaints.map((item) => {
            const isReplying = activeReplyingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-lg">
                      {item.categoryLabel}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{item.senderName}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.submittedAt}
                    </span>
                    {item.status === 'answered' ? (
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        উত্তর দেওয়া হয়েছে
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        অপেক্ষমাণ
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.subject}</h4>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {item.message}
                  </p>
                </div>

                {/* Existing Reply */}
                {item.responseMessage && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-1 text-xs">
                    <div className="flex items-center justify-between text-blue-950 font-bold">
                      <span>আপনার প্রদত্ত উত্তর ({item.respondedBy}):</span>
                      <span className="text-[10px] text-blue-700 font-normal">{item.respondedAt}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{item.responseMessage}</p>
                  </div>
                )}

                {/* Reply Button or Interactive Form */}
                <div className="pt-2">
                  {isReplying ? (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-300">
                      <label className="block text-xs font-bold text-slate-800">
                        অভিভাবকের বার্তার উত্তর লিখুন:
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="আপনার স্পষ্ট ও আন্তরিক উত্তর লিখুন..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveReplyingId(null)}
                          className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                        >
                          বাতিল
                        </button>
                        <button
                          onClick={() => handleSendReply(item.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          উত্তর পাঠান
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveReplyingId(item.id);
                        setReplyText(item.responseMessage || '');
                      }}
                      className="text-blue-700 hover:text-blue-800 font-bold text-xs flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition"
                    >
                      <Reply className="w-4 h-4" />
                      {item.responseMessage ? 'উত্তর সম্পাদনা করুন' : 'উত্তর লিখুন'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
