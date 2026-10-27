import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { getSectorConfig } from '@/config/sectors';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';

export const WorkersPage: React.FC = () => {
  const { t } = useTranslation();
  const { sectorId } = useAuth();
  const { generatePayslip } = useData();
  const sectorConfig = getSectorConfig(sectorId);

  const [toast, setToast] = useState<string | null>(null);

  const workersList =
    sectorId === 'construction'
      ? [
          { id: 'w-c-001', name: 'Ramesh Kumar', role: 'Mason', team: 'Crew Alpha (Concrete)', rate: 150, hoursWeek: 42.5, status: 'active' },
          { id: 'w-c-002', name: 'Suresh Patel', role: 'Electrician', team: 'Crew Beta (Steel)', rate: 170, hoursWeek: 40.0, status: 'off' },
          { id: 'w-c-003', name: 'Manoj Tiwari', role: 'Carpenter', team: 'Crew Gamma (Finishing)', rate: 160, hoursWeek: 38.0, status: 'off' },
          { id: 'w-c-004', name: 'Devendra Yadav', role: 'Rebar Tier', team: 'Crew Alpha (Concrete)', rate: 150, hoursWeek: 45.0, status: 'active' },
        ]
      : [
          { id: 'w-col-001', name: 'Ananya Sharma', role: 'Lab Assistant', team: 'Lab Support & Tech', rate: 180, hoursWeek: 39.5, status: 'active' },
          { id: 'w-col-002', name: 'R. Murugan', role: 'Security Guard', team: 'Campus Security', rate: 160, hoursWeek: 48.0, status: 'active' },
          { id: 'w-col-003', name: 'P. Deepa', role: 'Sanitation Lead', team: 'Facilities & Sanitation', rate: 150, hoursWeek: 36.0, status: 'off' },
          { id: 'w-col-004', name: 'K. Venkatesh', role: 'Maintenance Tech', team: 'Facilities & Sanitation', rate: 175, hoursWeek: 41.0, status: 'off' },
        ];

  const handleGenerateSlip = async (worker: typeof workersList[0]) => {
    try {
      const regHours = Math.min(worker.hoursWeek, 40);
      const otHours = Math.max(0, worker.hoursWeek - 40);
      await generatePayslip(worker.id, regHours, otHours, worker.rate);
      setToast(`Generated monthly payslip for ${worker.name}! Available immediately in worker portal.`);
    } catch {
      setToast('Failed to generate payslip.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('employer.workers')}</h1>
          <p className="text-sm text-slate-500">
            Workforce directory, assignments, and transparent payroll generation for {sectorConfig.name}
          </p>
        </div>
        <Badge variant="neutral">{workersList.length} Registered Workers</Badge>
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

      {/* Workers Directory Table */}
      <Card className="bg-white p-0 border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="py-3 px-4">{t('employer.worker_name')}</th>
                <th className="py-3 px-4">Role & Team</th>
                <th className="py-3 px-4">Base Rate</th>
                <th className="py-3 px-4">{t('employer.worker_hours')}</th>
                <th className="py-3 px-4">{t('employer.worker_status')}</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {workersList.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{worker.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{worker.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 block">{worker.role}</span>
                    <span className="text-xs text-slate-500">{worker.team}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    ₹{worker.rate}/hr
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">{worker.hoursWeek}h</span>
                    {worker.hoursWeek > 40 && (
                      <span className="text-[11px] text-amber-600 block">
                        +{(worker.hoursWeek - 40).toFixed(1)}h OT
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={worker.status === 'active' ? 'success' : 'neutral'}>
                      {worker.status === 'active' ? t('employer.status_active') : t('employer.status_off')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSlip(worker)}
                    >
                      Generate Payslip
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
