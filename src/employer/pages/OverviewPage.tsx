import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { getSectorConfig } from '@/config/sectors';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { sectorId } = useAuth();
  const { checkins, hazards, feedbackThreads } = useData();
  const sectorConfig = getSectorConfig(sectorId);
  const navigate = useNavigate();

  // Active checkins today
  const today = new Date().toISOString().slice(0, 10);
  const todayCheckins = checkins.filter((c) => c.checkIn.slice(0, 10) === today);
  const activeNow = checkins.filter((c) => c.checkOut === null).length;

  // Unresolved hazards
  const activeHazards = hazards.filter((h) => h.status !== 'resolved' && h.status !== 'dismissed');

  // Filter feedback for current sector teams
  const sectorThreads = feedbackThreads.filter((item) => {
    return sectorId === 'construction'
      ? item.thread.teamId.includes('const')
      : item.thread.teamId.includes('col');
  });

  const totalFeedbackCount = sectorThreads.length;
  const hasMinResponses = totalFeedbackCount >= 5;
  const avgRating =
    hasMinResponses && totalFeedbackCount > 0
      ? (sectorThreads.reduce((acc, curr) => acc + curr.thread.rating, 0) / totalFeedbackCount).toFixed(1)
      : null;

  // 7-day attendance & overtime mock trend
  const chartData = [
    { day: 'Mon', attendance: 34, overtimeHours: 12.5 },
    { day: 'Tue', attendance: 38, overtimeHours: 15.0 },
    { day: 'Wed', attendance: 36, overtimeHours: 9.5 },
    { day: 'Thu', attendance: 41, overtimeHours: 18.0 },
    { day: 'Fri', attendance: 39, overtimeHours: 14.0 },
    { day: 'Sat', attendance: 28, overtimeHours: 6.5 },
    { day: 'Sun', attendance: todayCheckins.length > 0 ? 30 + todayCheckins.length : 22, overtimeHours: 8.0 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('employer.overview')}</h1>
          <p className="text-sm text-slate-500">
            Real-time operations, attendance, safety, and anonymous sentiment for {sectorConfig.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">Live Feed Active</Badge>
          <span className="text-xs text-slate-400 font-mono">
            {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">{t('employer.checked_in_today')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
              <Icons.Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {todayCheckins.length > 0 ? 35 + todayCheckins.length : 38}
            </span>
            <span className="text-xs font-medium text-emerald-600">
              {activeNow} on shift now
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">96% on-time check-in</span>
        </Card>

        <Card className="bg-white p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">{t('employer.overtime')} This Week</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Icons.Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">83.5h</span>
            <span className="text-xs font-medium text-slate-500">{sectorConfig.overtimeMultiplier}x pay rate</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Automated threshold enforcement</span>
        </Card>

        <Card
          className="bg-white p-4 border border-slate-200 cursor-pointer hover:border-slate-300 transition-all"
          onClick={() => navigate('/employer/hazards')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">{t('employer.active_hazards')}</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Icons.AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600">{activeHazards.length}</span>
            <span className="text-xs font-medium text-amber-600">
              {activeHazards.filter((h) => h.severity === 'critical').length} critical
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Click to open Hazard Inbox</span>
        </Card>

        <Card
          className="bg-white p-4 border border-slate-200 cursor-pointer hover:border-slate-300 transition-all"
          onClick={() => navigate('/employer/feedback')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">{t('employer.avg_satisfaction')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Icons.Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {hasMinResponses ? (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{avgRating}/5</span>
                <span className="text-xs text-slate-500">({totalFeedbackCount} responses)</span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-slate-400">Protected</span>
                <span className="text-xs text-amber-600">(&lt; 5 responses)</span>
              </>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {hasMinResponses ? 'Anonymity threshold met' : 'Details hidden for anonymity'}
          </span>
        </Card>
      </div>

      {/* Charts Grid (Attendance & Overtime) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">{t('employer.attendance_trend')}</h2>
            <Badge variant="neutral">Daily Workers</Badge>
          </div>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 50]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="attendance" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-white p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">{t('employer.overtime_trend')}</h2>
            <Badge variant="warning">Hours (1.5x Multiplier)</Badge>
          </div>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="overtimeHours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Unresolved Hazards Table */}
      <Card className="bg-white p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">{t('employer.top_hazards')}</h2>
            <p className="text-xs text-slate-500">Immediate attention required across active sites</p>
          </div>
          <button
            onClick={() => navigate('/employer/hazards')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View all in Hazard Inbox</span>
            <Icons.ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {activeHazards.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">{t('employer.no_hazards')}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeHazards.slice(0, 3).map((hz) => (
              <div key={hz.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={hz.severity === 'critical' ? 'danger' : 'warning'}>
                      {hz.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(hz.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{hz.description}</p>
                </div>
                <Badge variant={hz.status === 'in_progress' ? 'warning' : 'neutral'}>
                  {hz.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
