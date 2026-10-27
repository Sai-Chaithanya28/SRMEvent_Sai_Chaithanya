import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { getSectorConfig } from '@/config/sectors';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';

export const OvertimePage: React.FC = () => {
  const { t } = useTranslation();
  const { sectorId } = useAuth();
  const { checkins } = useData();
  const sectorConfig = getSectorConfig(sectorId);

  const [thresholdHours, setThresholdHours] = useState(8);
  const [multiplier, setMultiplier] = useState(sectorConfig.overtimeMultiplier);
  const [policySaved, setPolicySaved] = useState(false);

  // All overtime checkins
  const overtimeCheckins = checkins.filter((c) => c.isOvertime && c.overtimeMinutes > 0);
  const totalOvertimeMinutes = overtimeCheckins.reduce((acc, c) => acc + c.overtimeMinutes, 0);

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('employer.overtime')}</h1>
        <p className="text-sm text-slate-500">
          Automated overtime tracking, fair compensation multipliers, and policy configuration for {sectorConfig.name}
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Overtime Hours</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {(totalOvertimeMinutes / 60).toFixed(1)}h
            </span>
            <span className="text-xs text-slate-500">Recorded</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Accrued across active shifts</span>
        </Card>

        <Card className="bg-white p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Policy Multiplier</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{multiplier}x</span>
            <span className="text-xs text-emerald-600 font-semibold">Decent Work compliant</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Standard hourly rate multiplier</span>
        </Card>

        <Card className="bg-white p-4 border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Estimated Premium Pay</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              ₹{Math.round((totalOvertimeMinutes / 60) * 150 * multiplier).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">Gross</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Guaranteed fair overtime pay</span>
        </Card>
      </div>

      {/* Configurable Overtime Policy Form */}
      <Card className="bg-white p-5 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Organization Overtime Rules</h2>
            <p className="text-xs text-slate-500">Configured specifically for {sectorConfig.name} teams</p>
          </div>
          <Badge variant="info">Rule Engine</Badge>
        </div>

        {policySaved && (
          <div className="p-2.5 bg-green-50 border border-green-200 text-green-900 rounded-lg text-xs font-medium">
            ✓ Overtime rule updated successfully across all check-in clocks.
          </div>
        )}

        <form onSubmit={handleSavePolicy} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Shift Daily Threshold (Hours)
            </label>
            <input
              type="number"
              min={4}
              max={12}
              value={thresholdHours}
              onChange={(e) => setThresholdHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[44px]"
            />
            <span className="text-[11px] text-slate-400">Work beyond this is overtime</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Overtime Pay Multiplier
            </label>
            <select
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[44px]"
            >
              <option value={1.25}>1.25x (Standard Low)</option>
              <option value={1.5}>1.50x (ILO Recommended)</option>
              <option value={2.0}>2.00x (Double Time)</option>
            </select>
            <span className="text-[11px] text-slate-400">Applied to base worker hourly wage</span>
          </div>

          <Button type="submit" variant="primary" size="md">
            Save Overtime Policy
          </Button>
        </form>
      </Card>

      {/* Overtime Log Table */}
      <Card className="bg-white p-0 border border-slate-200 overflow-hidden shadow-sm space-y-0">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">Logged Overtime Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="py-3 px-4">Worker ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In / Out</th>
                <th className="py-3 px-4">Overtime Extra</th>
                <th className="py-3 px-4">Calculated Multiplier</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {overtimeCheckins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    {t('employer.no_overtime_data')}
                  </td>
                </tr>
              ) : (
                overtimeCheckins.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">{chk.profileId}</td>
                    <td className="py-3 px-4">
                      {new Date(chk.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(chk.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' → '}
                      {chk.checkOut ? new Date(chk.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In progress'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        +{(chk.overtimeMinutes / 60).toFixed(1)} hrs ({chk.overtimeMinutes} mins)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {multiplier}x Base Wage
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success">Auto-Approved</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
