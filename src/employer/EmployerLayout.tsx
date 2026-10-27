import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { OfflineBanner } from '@/shared/ui/OfflineBanner';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { SectorToggle } from '@/shared/ui/SectorToggle';
import { Icons } from '@/shared/ui/Icons';
import { getSectorConfig } from '@/config/sectors';

export const EmployerLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user, sectorId, setSector, logout } = useAuth();
  const sectorConfig = getSectorConfig(sectorId);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/employer', icon: <Icons.BarChart className="w-5 h-5" />, label: t('employer.overview'), end: true },
    { to: '/employer/attendance', icon: <Icons.Clock className="w-5 h-5" />, label: t('employer.attendance') },
    { to: '/employer/overtime', icon: <Icons.Calendar className="w-5 h-5" />, label: t('employer.overtime') },
    { to: '/employer/hazards', icon: <Icons.AlertTriangle className="w-5 h-5" />, label: t('employer.hazard_inbox') },
    { to: '/employer/feedback', icon: <Icons.MessageSquare className="w-5 h-5" />, label: t('employer.feedback_insights') },
    { to: '/employer/workers', icon: <Icons.Users className="w-5 h-5" />, label: t('employer.workers') },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <OfflineBanner />

      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-2.5 sm:px-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg leading-none">FairShift</span>
                <span className="text-[11px] font-semibold uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  Employer Console
                </span>
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                {user?.orgName} • {sectorConfig.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SectorToggle currentSector={sectorId} onSectorChange={setSector} />
            <LanguageSelector />
            <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block">{user?.fullName}</span>
                <span className="text-[10px] text-slate-500 block">{sectorConfig.supervisorLabel}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 min-h-[38px] min-w-[38px] flex items-center justify-center"
              title={t('app.logout')}
              aria-label={t('app.logout')}
            >
              <Icons.LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar (1024px+ calm and dense) */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-1 hidden md:block">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
            Navigation
          </span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Sector Info Card */}
          <div className="pt-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 block">Current Configuration</span>
              <div className="text-slate-600 space-y-1">
                <div>Site: <strong>{user?.siteName}</strong></div>
                <div>Overtime: <strong>{sectorConfig.overtimeMultiplier}x past 8h</strong></div>
                <div>Feedback privacy: <strong>&ge; 5 responses</strong></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile/Tablet Horizontal Tab Bar */}
        <div className="md:hidden bg-white border-b border-slate-200 px-2 py-1 flex overflow-x-auto gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[40px] ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
