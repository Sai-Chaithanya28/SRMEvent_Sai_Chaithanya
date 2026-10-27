import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { getSectorConfig } from '@/config/sectors';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';

export const WorkerHomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, sectorId } = useAuth();
  const { checkins, activeCheckin, performCheckout, hazards } = useData();
  const sectorConfig = getSectorConfig(sectorId);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('worker.good_morning');
    if (hour < 17) return t('worker.good_afternoon');
    return t('worker.good_evening');
  };

  // Calculate stats for current worker
  const userCheckins = checkins.filter((c) => c.profileId === user?.id);
  const totalOvertimeMinutes = userCheckins.reduce((acc, c) => acc + (c.overtimeMinutes || 0), 0);
  const totalRegularMinutes = userCheckins.reduce((acc, c) => {
    if (!c.checkOut) return acc;
    const dur = Math.round((new Date(c.checkOut).getTime() - new Date(c.checkIn).getTime()) / 60000);
    return acc + Math.min(dur, sectorConfig.overtimeThresholdMinutes);
  }, 0);

  // Active elapsed time
  let activeElapsedStr = '';
  let isOvertimeNow = false;
  let overtimeExtraMinutes = 0;
  if (activeCheckin) {
    const start = new Date(activeCheckin.checkIn).getTime();
    const elapsedMinutes = Math.floor((currentTime.getTime() - start) / 60000);
    const hrs = Math.floor(elapsedMinutes / 60);
    const mins = elapsedMinutes % 60;
    activeElapsedStr = `${hrs}h ${mins}m`;

    if (elapsedMinutes > sectorConfig.overtimeThresholdMinutes) {
      isOvertimeNow = true;
      overtimeExtraMinutes = elapsedMinutes - sectorConfig.overtimeThresholdMinutes;
    }
  }

  const activeHazardsCount = hazards.filter(
    (h) => h.profileId === user?.id && h.status !== 'resolved' && h.status !== 'dismissed'
  ).length;

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 text-white rounded-token p-4 sm:p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-brand-100 text-xs sm:text-sm font-medium">{getGreeting()}</p>
            <h1 className="text-xl sm:text-2xl font-bold mt-0.5">{user?.fullName}</h1>
            <p className="text-brand-200 text-xs mt-1 flex items-center gap-1">
              <span>{user?.teamName}</span> • <span>{user?.hourlyRate ? `₹${user.hourlyRate}/hr` : ''}</span>
            </p>
          </div>
          <Badge variant="neutral" className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
            {sectorConfig.name}
          </Badge>
        </div>
      </div>

      {/* Today's Shift Status Card */}
      <Card
        variant="raised"
        className={`border-l-4 ${
          activeCheckin ? 'border-l-green-500 bg-white' : 'border-l-amber-500 bg-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                activeCheckin ? 'bg-green-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <h2 className="text-base font-bold text-slate-800">{t('worker.today_shift')}</h2>
          </div>
          <Badge variant={activeCheckin ? 'success' : 'warning'}>
            {activeCheckin ? t('employer.status_active') : t('employer.status_off')}
          </Badge>
        </div>

        {activeCheckin ? (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Check-in Time</span>
                <span className="text-base font-semibold text-slate-900">
                  {new Date(activeCheckin.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[11px] text-slate-500 block uppercase font-mono mt-0.5">
                  via {activeCheckin.method.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Elapsed Time</span>
                <span className="text-base font-bold text-brand-600">{activeElapsedStr}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Target: {Math.floor(sectorConfig.overtimeThresholdMinutes / 60)}h
                </span>
              </div>
            </div>

            {isOvertimeNow && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center gap-2">
                <Icons.AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  {t('worker.overtime_alert', { minutes: overtimeExtraMinutes })} ({sectorConfig.overtimeMultiplier}x
                  pay rate applied)
                </span>
              </div>
            )}

            <Button
              variant="danger"
              fullWidth
              size="lg"
              leftIcon={<Icons.Clock className="w-5 h-5" />}
              onClick={() => performCheckout()}
            >
              {t('worker.checkout')}
            </Button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-slate-600">{t('worker.not_checked_in')}</p>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              leftIcon={<Icons.Clock className="w-5 h-5" />}
              onClick={() => navigate('/worker/checkin')}
            >
              {t('worker.checkin')}
            </Button>
          </div>
        )}
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="text-center p-3 bg-white">
          <span className="text-[11px] font-medium text-slate-500 block truncate">{t('worker.hours_this_week')}</span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 mt-1 block">
            {(totalRegularMinutes / 60).toFixed(1)}h
          </span>
          <span className="text-[10px] text-slate-400">Regular</span>
        </Card>

        <Card className="text-center p-3 bg-white">
          <span className="text-[11px] font-medium text-slate-500 block truncate">{t('worker.shift_overtime')}</span>
          <span className="text-lg sm:text-xl font-bold text-amber-600 mt-1 block">
            {(totalOvertimeMinutes / 60).toFixed(1)}h
          </span>
          <span className="text-[10px] text-amber-600 font-medium">1.5x Rate</span>
        </Card>

        <Card className="text-center p-3 bg-white cursor-pointer hover:border-slate-300" onClick={() => navigate('/worker/hazard')}>
          <span className="text-[11px] font-medium text-slate-500 block truncate">Active Hazards</span>
          <span className="text-lg sm:text-xl font-bold text-brand-600 mt-1 block">
            {activeHazardsCount}
          </span>
          <span className="text-[10px] text-slate-400">Tracked</span>
        </Card>
      </div>

      {/* Quick Action Grid (Large Touch Targets, WCAG AA) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Quick Actions</h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate('/worker/payslip')}
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-token text-left hover:border-brand-300 hover:shadow-sm transition-all min-h-[56px]"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Icons.FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 block">{t('worker.payslip')}</span>
              <span className="text-[11px] text-slate-500">Transparent pay & audio</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/worker/hazard')}
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-token text-left hover:border-brand-300 hover:shadow-sm transition-all min-h-[56px]"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Icons.AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 block">{t('worker.report_hazard')}</span>
              <span className="text-[11px] text-slate-500">Voice, photo, or text</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/worker/speak-up')}
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-token text-left hover:border-brand-300 hover:shadow-sm transition-all min-h-[56px]"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Icons.MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 block">{t('worker.speak_up')}</span>
              <span className="text-[11px] text-slate-500">100% Anonymous feedback</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/worker/hours')}
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-token text-left hover:border-brand-300 hover:shadow-sm transition-all min-h-[56px]"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Icons.Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 block">{t('worker.my_hours')}</span>
              <span className="text-[11px] text-slate-500">Shift log & overtime</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
