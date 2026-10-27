import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { getSectorConfig } from '@/config/sectors';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';

export const AttendancePage: React.FC = () => {
  const { t } = useTranslation();
  const { sectorId, user } = useAuth();
  const { checkins, manualCheckinSupervisor } = useData();
  const sectorConfig = getSectorConfig(sectorId);

  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(
    sectorId === 'construction' ? 'w-c-001' : 'w-col-001'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Filter checkins
  const filteredCheckins = checkins.filter((c) => {
    if (selectedMethod !== 'all' && c.method !== selectedMethod) return false;
    return true;
  });

  const handleManualCheckin = async () => {
    setIsSubmitting(true);
    try {
      await manualCheckinSupervisor(
        selectedWorkerId,
        user?.siteId || 'site-default',
        user?.teamId || 'team-default'
      );
      setToast('Supervisor manual fallback check-in logged! Shift time recorded.');
      setShowManualModal(false);
    } catch {
      setToast('Failed to record manual check-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('employer.attendance')}</h1>
          <p className="text-sm text-slate-500">
            Attendance roll, verification methods, and supervisor fallback for {sectorConfig.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Fallback button */}
          <Button
            variant="primary"
            size="md"
            leftIcon={<Icons.Shield className="w-4 h-4" />}
            onClick={() => setShowManualModal(true)}
          >
            Supervisor Manual Check-in
          </Button>
        </div>
      </div>

      {toast && (
        <div role="alert" className="p-3 bg-green-50 border border-green-200 text-green-900 rounded-lg text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Method:</span>
        {['all', 'qr', 'gps', 'manual'].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setSelectedMethod(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors min-h-[38px] ${
              selectedMethod === m
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Attendance Table */}
      <Card className="bg-white p-0 border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="py-3 px-4">Worker ID</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Check-Out Time</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Overtime</th>
                <th className="py-3 px-4">Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredCheckins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    {t('employer.no_attendance_data')}
                  </td>
                </tr>
              ) : (
                filteredCheckins.map((chk) => {
                  const checkIn = new Date(chk.checkIn);
                  const checkOut = chk.checkOut ? new Date(chk.checkOut) : null;
                  return (
                    <tr key={chk.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {chk.profileId}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-semibold block">
                            {checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {checkIn.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {checkOut ? (
                          <div>
                            <span className="font-semibold block">
                              {checkOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {checkOut.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="success">Currently On Shift</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral" className="uppercase font-mono text-[10px]">
                          {chk.method}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {chk.isOvertime && chk.overtimeMinutes > 0 ? (
                          <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            +{chk.overtimeMinutes} mins ({sectorConfig.overtimeMultiplier}x)
                          </span>
                        ) : (
                          <span className="text-slate-400">Regular</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={chk.syncStatus === 'synced' ? 'success' : 'warning'}>
                          {chk.syncStatus === 'synced' ? 'Synced' : 'Offline'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Checkin Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Icons.Shield className="w-5 h-5 text-amber-600" />
                Supervisor Manual Fallback
              </h2>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              When a worker's phone is damaged, battery is dead, or network has failed, log manual check-in here to ensure they never lose shift wages.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Select Worker</label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[44px]"
              >
                {sectorId === 'construction' ? (
                  <>
                    <option value="w-c-001">Ramesh Kumar (Mason - Crew Alpha)</option>
                    <option value="w-c-002">Suresh Patel (Electrician - Crew Beta)</option>
                    <option value="w-c-003">Manoj Tiwari (Carpenter - Crew Gamma)</option>
                  </>
                ) : (
                  <>
                    <option value="w-col-001">Ananya Sharma (Lab Assistant - Tech Unit)</option>
                    <option value="w-col-002">R. Murugan (Security Guard - Campus Gate)</option>
                    <option value="w-col-003">P. Deepa (Sanitation Lead - Hostel Block)</option>
                  </>
                )}
              </select>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border text-xs text-slate-600 space-y-1">
              <div>Supervisor: <strong>{user?.fullName}</strong></div>
              <div>Site: <strong>{user?.siteName}</strong></div>
              <div>Method: <strong className="uppercase">Manual Fallback</strong></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="md" onClick={() => setShowManualModal(false)}>
                {t('app.cancel')}
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleManualCheckin}
              >
                Confirm Check-in
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
