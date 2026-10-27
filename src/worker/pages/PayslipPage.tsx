import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { Payslip } from '@/shared/types';

export const PayslipPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { payslips } = useData();

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when unmounting
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const workerPayslips = payslips.filter((p) => p.profileId === user?.id);
  const currentSlip: Payslip | undefined = workerPayslips[0];

  const handleReadAloud = () => {
    if (!('speechSynthesis' in window) || !currentSlip) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const langCode = i18n.language.slice(0, 2);
    // Language mapping for Web Speech API
    const langVoiceMap: Record<string, string> = {
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      en: 'en-IN',
    };

    const textToRead = `
      ${t('payslip.title')}. 
      ${t('payslip.period')}: ${currentSlip.periodStart} to ${currentSlip.periodEnd}.
      ${t('payslip.regular_hours')}: ${currentSlip.regularHours} hours at ₹${currentSlip.hourlyRate} per hour.
      ${t('payslip.overtime_hours')}: ${currentSlip.overtimeHours} hours at ₹${currentSlip.overtimeRate} per hour.
      ${t('payslip.gross_pay')}: ₹${Math.round(currentSlip.grossPay)}.
      ${t('payslip.deductions')}: ${currentSlip.deductions.map((d) => `${d.label} ₹${d.amount}`).join(', ')}.
      ${t('payslip.net_pay')}: ₹${Math.round(currentSlip.netPay)}.
    `;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = langVoiceMap[langCode] || 'en-US';
    utterance.rate = 0.9; // Slightly slower for low-literacy clarity

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('payslip.title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            100% Transparent salary breakdown in your language
          </p>
        </div>

        {/* Read Aloud Button */}
        <Button
          variant={isSpeaking ? 'danger' : 'outline'}
          size="sm"
          onClick={handleReadAloud}
          leftIcon={isSpeaking ? <Icons.VolumeX className="w-4 h-4" /> : <Icons.Volume2 className="w-4 h-4" />}
        >
          {isSpeaking ? t('payslip.stop_reading') : t('payslip.read_aloud')}
        </Button>
      </div>

      {!currentSlip ? (
        <Card className="text-center p-8 bg-white">
          <Icons.FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-600">{t('payslip.no_payslips')}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Payslip Card */}
          <Card variant="raised" className="bg-white p-4 sm:p-6 space-y-4 border border-slate-200">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block">
                  FairShift Salary Statement
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">{user?.fullName}</h2>
                <span className="text-xs text-slate-500">{user?.teamName}</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500 block">{t('payslip.period')}</span>
                <span className="text-sm font-semibold text-slate-800">
                  {currentSlip.periodStart} → {currentSlip.periodEnd}
                </span>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Earnings</h3>

              {/* Regular Hours Line */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-800">{t('payslip.regular_hours')}</span>
                  <span className="font-bold text-slate-900">
                    {currentSlip.currency}
                    {(currentSlip.regularHours * currentSlip.hourlyRate).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>{currentSlip.regularHours} hrs × {currentSlip.currency}{currentSlip.hourlyRate}/hr</span>
                  <span className="italic">{t('payslip.regular_pay_desc')}</span>
                </div>
              </div>

              {/* Overtime Hours Line */}
              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-amber-900">{t('payslip.overtime_hours')}</span>
                    <Badge variant="warning" className="text-[10px] py-0 px-1.5">1.5x Multiplier</Badge>
                  </div>
                  <span className="font-bold text-amber-900">
                    {currentSlip.currency}
                    {(currentSlip.overtimeHours * currentSlip.overtimeRate).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-amber-700 flex justify-between">
                  <span>{currentSlip.overtimeHours} hrs × {currentSlip.currency}{currentSlip.overtimeRate}/hr</span>
                  <span className="italic">{t('payslip.overtime_pay_desc')}</span>
                </div>
              </div>

              {/* Gross Total */}
              <div className="flex justify-between items-center py-2 px-3 bg-slate-100 rounded-lg text-sm font-bold text-slate-800">
                <span>{t('payslip.gross_pay')}</span>
                <span>{currentSlip.currency}{Math.round(currentSlip.grossPay).toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions Breakdown (Explained Line by Line) */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('payslip.deductions')}</h3>

              {currentSlip.deductions.map((ded, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-800">{ded.label}</span>
                    <span className="font-semibold text-red-600">
                      -{currentSlip.currency}{ded.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    {t(ded.descriptionKey)}
                  </p>
                </div>
              ))}
            </div>

            {/* Net Pay (Take Home) */}
            <div className="pt-3 border-t-2 border-slate-300">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-emerald-100 uppercase tracking-wider block font-semibold">
                    {t('payslip.net_pay')}
                  </span>
                  <p className="text-xs text-emerald-200 mt-0.5">{t('payslip.net_pay_desc')}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {currentSlip.currency}{Math.round(currentSlip.netPay).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
