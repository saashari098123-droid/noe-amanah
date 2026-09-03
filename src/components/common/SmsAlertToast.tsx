import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MessageSquare, X, Send, ShieldAlert } from 'lucide-react';

export const SmsAlertToast: React.FC = () => {
  const { latestSmsAlert, dismissSmsAlert, language } = useMadrasa();

  if (!latestSmsAlert) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full p-4 bg-slate-950 text-white rounded-2xl shadow-2xl border border-amber-500/40 animate-slideUp">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
          <Send className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              স্বয়ংক্রিয় SMS পাঠানো হয়েছে
            </span>
            <button
              onClick={dismissSmsAlert}
              className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-slate-100 mt-1">
            {latestSmsAlert.studentName} ({latestSmsAlert.periodName}) - অনুপস্থিত
          </h4>

          <div className="bg-slate-900/90 rounded-xl p-2.5 mt-2 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed">
            <div className="text-[10px] text-slate-400 mb-1">
              প্রেরণকৃত নম্বর: {latestSmsAlert.guardianPhone} • সময়: {latestSmsAlert.sentAt}
            </div>
            "{latestSmsAlert.messageText || latestSmsAlert.message}"
          </div>
        </div>
      </div>
    </div>
  );
};
