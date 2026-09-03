import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MessageSquarePlus, X, Send, CheckCircle2, User, Phone, Tag } from 'lucide-react';

export const ComplaintsModal: React.FC = () => {
  const { isComplaintsModalOpen, setIsComplaintsModalOpen, sendComplaint, language } = useMadrasa();

  const [senderName, setSenderName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'complaint' | 'suggestion' | 'academic' | 'facility' | 'other'>('suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isComplaintsModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catLabels = {
      suggestion: 'পরামর্শ ও উন্নয়ন প্রস্তাব',
      complaint: 'অভিযোগ',
      academic: 'শিক্ষা ও পাঠদান সংক্রান্ত',
      facility: 'আবাসিক ও পরিবেশ সংক্রান্ত',
      other: 'অন্যান্য বিষয়',
    };

    sendComplaint({
      senderRole: 'guardian',
      senderId: 'public-guardian',
      senderName: `${senderName || 'সাধারণ অভিভাবক'} (মোবাইল: ${phone || 'অনুল্লেখিত'})`,
      recipientType: 'admin',
      recipientName: 'মুহতামিম দফতর / শৃঙ্খলা কমিটি',
      category,
      categoryLabel: catLabels[category],
      subject: subject || 'পরামর্শ ও অভিযোগ বার্তা',
      message,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsComplaintsModalOpen(false);
      setSenderName('');
      setPhone('');
      setSubject('');
      setMessage('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative transition">
        {/* Close Button */}
        <button
          onClick={() => setIsComplaintsModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {language === 'ar'
                ? 'صندوق الشكاوى والمقترحات'
                : language === 'en'
                ? 'Complaints & Suggestions Box'
                : 'অভিযোগ ও পরামর্শের বক্স'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar'
                ? 'يمكنك إرسال أي ملاحظة أو اقتراح مباشرة إلى الإدارة'
                : language === 'en'
                ? 'Submit your valuable suggestions or complaints directly to the administration'
                : 'আপনার যেকোনো গঠনমূলক পরামর্শ বা অভিযোগ সরাসরি প্রধান প্রশাসন দফতরে পৌঁছাবে।'}
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">
              {language === 'ar' ? 'تم إرسال رسالتكم بنجاح' : language === 'en' ? 'Submitted Successfully' : 'আলহামদুলিল্লাহ! আপনার বার্তা গৃহীত হয়েছে'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {language === 'ar'
                ? 'شكراً لكم على مساهمتكم القيمة في تطوير المؤسسة.'
                : language === 'en'
                ? 'Thank you for your valuable feedback in improving our institution.'
                : 'প্রতিষ্ঠান কর্তৃপক্ষ দ্রুত বিষয়টি পর্যালোচনা করে যথাযথ পদক্ষেপ গ্রহণ করবেন।'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  আপনার নাম (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="নাম লিখুন"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  মোবাইল নম্বর
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১৭XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিষয় ক্যাটাগরি
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="suggestion">পরামর্শ ও উন্নয়ন প্রস্তাবনা</option>
                  <option value="complaint">নির্দিষ্ট অভিযোগ</option>
                  <option value="academic">শিক্ষা ও পাঠদান সংক্রান্ত</option>
                  <option value="facility">আবাসিক ও পরিবেশ ব্যবস্থা</option>
                  <option value="other">অন্যান্য সাধারণ মতামত</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বার্তার মূল শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="সংক্ষেপে বিষয়টি লিখুন..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিস্তারিত বার্তা / পরামর্শ *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="আপনার পরামর্শ বা অভিযোগের বিস্তারিত বিবরণ লিখুন..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsComplaintsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                পাঠিয়ে দিন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
