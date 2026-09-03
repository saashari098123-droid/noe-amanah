import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Building,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const PublicContact: React.FC = () => {
  const { madrasaInfo, sendComplaint } = useMadrasa();

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [category, setCategory] = useState<'suggestion' | 'academics' | 'boarding_food' | 'other'>('suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendComplaint({
      senderRole: 'guardian',
      senderId: 'public-contact',
      senderName: `${senderName} (${senderPhone})`,
      recipientType: 'admin',
      recipientName: 'মুহতামিম / প্রশাসন শাখা',
      category,
      categoryLabel: category === 'suggestion' ? 'পরামর্শ' : category === 'academics' ? 'পড়ালেখা' : category === 'boarding_food' ? 'হোস্টেল' : 'অন্যান্য',
      subject,
      message,
    });
    setSubmitted(true);
    setSenderName('');
    setSenderPhone('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center">
        <span className="text-xs text-amber-300 font-bold uppercase tracking-widest bg-blue-800/80 px-3 py-1 rounded-full">
          সরাসরি যোগাযোগ ও তথ্য কেন্দ্র
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-3">
          স্কুল এন্ড কলেজ কার্যালয় ও অভিযোগ-পরামর্শ
        </h1>
        <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-xl mx-auto">
          যেকোনো তথ্য জানতে সরাসরি যোগাযোগ করুন অথবা আপনার সুপরামর্শ ও অভিযোগ লিখিতভাবে জানান।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Information & Office Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              ঠিকানা ও যোগাযোগ সূত্র
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">স্কুল এন্ড কলেজ ক্যাম্পাস:</span>
                  <span>{madrasaInfo.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">মোবাইল ও হেল্পলাইন:</span>
                  <div>{madrasaInfo.phone}</div>
                  <div>{madrasaInfo.alternatePhone}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">ইমেইল:</span>
                  <span>{madrasaInfo.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">সাক্ষাতের সময়:</span>
                  <span>প্রতিদিন সকাল ৮:৩০ হতে দুপুর ১২:৩০ এবং আসর হতে মাগরিব পর্যন্ত</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Simulation */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>📍 গুগল ম্যাপ লোকেশন (উত্তরা সেক্টর-১০)</span>
              <span className="text-blue-700 font-semibold">লাইভ ভিউ</span>
            </div>
            <div className="h-60 bg-blue-950 relative flex items-center justify-center text-center p-6 text-white overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:12px_12px]"></div>
              <div className="relative space-y-2">
                <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white">{madrasaInfo.nameBangla}</h4>
                <p className="text-[11px] text-blue-200">আমীন জামে মসজিদ সংলগ্ন, উত্তরা, ঢাকা</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback / Complaint Box */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
                অভিযোগ ও পরামর্শ ডেস্ক
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                আপনার মতামত সরাসরি কর্তৃপক্ষকে জানান
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                প্রতিষ্ঠানের শিক্ষার মান, আবাসিক পরিবেশ বা যেকোনো বিষয়ে আপনার সুচিন্তিত মতামত আন্তরিকতার সাথে গ্রহণ করা হয়।
              </p>
            </div>

            {submitted ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
                <h3 className="font-bold text-base">আপনার বার্তা সফলভাবে দাখিল হয়েছে!</h3>
                <p className="text-xs text-blue-700">
                  আমাদের প্রশাসন টিম আপনার বার্তাটি পর্যালোচনা করে দ্রুততম সময়ে প্রয়োজনীয় ব্যবস্থা গ্রহণ করবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">আপনার নাম *</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="নাম লিখুন"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">বিষয় ক্যাটাগরি *</label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as 'suggestion' | 'academics' | 'boarding_food' | 'other')
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="suggestion">সাধারণ পরামর্শ ও মতামত</option>
                    <option value="academics">পড়ালেখা ও সিলেবাস সম্পর্কিত</option>
                    <option value="boarding_food">আবাসিক হোস্টেল ও খাবার মান</option>
                    <option value="other">অন্যান্য জরুরি বিষয়</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">বার্তার মূল বিষয় *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="উদাঃ প্রতিষ্ঠানের নতুন লাইব্রেরির বই সংগ্রহ বৃদ্ধি প্রসঙ্গে"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">বিস্তারিত বার্তা *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="আপনার অভিযোগ বা পরামর্শের পূর্ণ বিবরণ লিখুন..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-xs sm:text-sm shadow-md transition inline-flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    বার্তা পাঠান
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
