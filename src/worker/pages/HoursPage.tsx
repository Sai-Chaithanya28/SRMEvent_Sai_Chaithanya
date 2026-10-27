import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { getSectorConfig } from '@/config/sectors';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';

export const HoursPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, sectorId } = useAuth();
  const { checkins } = useData();
  const sectorConfig = getSectorConfig(sectorId);

  const workerShifts = checkins.filter((c) => c.profileId === user?.id);

  // Totals
  const totalOvertimeMinutes = workerShifts.reduce((acc, c) => acc + (c.overtimeMinutes || 0), 0);
  const totalRegularMinutes = workerShifts.reduce((acc, c) => {
    if (!c.checkOut) return acc;
    const dur = Math.round((new Date(c.checkOut).getTime() - new Date(c.checkIn).getTime()) / 60000);
    return acc + Math.min(dur, sectorConfig.overtimeThresholdMinutes);
  }, 0);

  const hourlyRate = user?.hourlyRate || 150;
  const overtimeRate = hourlyRate * sectorConfig.overtimeMultiplier;
  const estimatedEarned =
    (totalRegularMinutes / 60) * hourlyRate + (totalOvertimeMinutes / 60) * overtimeRate;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('worker.my_hours')}</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Worker-owned shift log • Automatically calculates overtime
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="bg-white p-3 text-center">
          <span className="text-[11px] text-slate-500 block truncate">{t('worker.total_regular')}</span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 mt-1 block">
            {(totalRegularMinutes / 60).toFixed(1)}h
          </span>
          <span className="text-[10px] text-slate-400">₹{hourlyRate}/hr</span>
        </Card>

        <Card className="bg-white p-3 text-center border-amber-200">
          <span className="text-[11px] text-amber-700 block truncate">{t('worker.total_overtime')}</span>
          <span className="text-lg sm:text-xl font-bold text-amber-600 mt-1 block">
            {(totalOvertimeMinutes / 60).toFixed(1)}h
          </span>
          <span className="text-[10px] text-amber-600 font-semibold">₹{overtimeRate}/hr</span>
        </Card>

        <Card className="bg-white p-3 text-center">
          <span className="text-[11px] text-slate-500 block truncate">Estimated Gross</span>
          <span className="text-lg sm:text-xl font-bold text-emerald-600 mt-1 block">
            ₹{Math.round(estimatedEarned).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">Total</span>
        </Card>
      </div>

      {/* Shifts List */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Recorded Shifts</h2>

        {workerShifts.length === 0 ? (
          <Card className="text-center p-8 bg-white">
            <Icons.Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600">{t('worker.no_shifts')}</p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {workerShifts.map((shift) => {
              const start = new Date(shift.checkIn);
              const end = shift.checkOut ? new Date(shift.checkOut) : null;
              const durationMinutes = end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0;
              const hrs = Math.floor(durationMinutes / 60);
              const mins = durationMinutes % 60;

              return (
                <Card key={shift.id} className="bg-white p-3.5 hover:border-slate-300 transition-all space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">
                        {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-slate-500">
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' → '}
                        {end
                          ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'In progress'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant={shift.syncStatus === 'synced' ? 'success' : 'warning'}>
                        {shift.syncStatus === 'synced' ? 'Synced' : 'Offline'}
                      </Badge>
                      <Badge variant="neutral" className="uppercase font-mono text-[10px]">
                        {shift.method}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-600">
                      Duration: <strong className="text-slate-900">{end ? `${hrs}h ${mins}m` : 'Active'}</strong>
                    </span>

                    {shift.isOvertime && shift.overtimeMinutes > 0 && (
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        +{Math.round(shift.overtimeMinutes / 60 * 10) / 10}h Overtime ({sectorConfig.overtimeMultiplier}x)
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
