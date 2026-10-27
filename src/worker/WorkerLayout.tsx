import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { OfflineBanner } from '@/shared/ui/OfflineBanner';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { SectorToggle } from '@/shared/ui/SectorToggle';
import { Icons } from '@/shared/ui/Icons';

export const WorkerLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user, sectorId, setSector, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/worker', icon: <Icons.Home className="w-5 h-5" />, label: t('worker.home'), end: true },
    { to: '/worker/checkin', icon: <Icons.Clock className="w-5 h-5" />, label: t('worker.checkin') },
    { to: '/worker/hours', icon: <Icons.Calendar className="w-5 h-5" />, label: t('worker.my_hours') },
    { to: '/worker/payslip', icon: <Icons.FileText className="w-5 h-5" />, label: t('worker.payslip') },
    { to: '/worker/hazard', icon: <Icons.AlertTriangle className="w-5 h-5" />, label: t('worker.report_hazard') },
    { to: '/worker/speak-up', icon: <Icons.MessageSquare className="w-5 h-5" />, label: t('worker.speak_up') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 sm:pb-0">
      <OfflineBanner />

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-3 py-2 sm:px-6 sm:py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              F
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base leading-none block">FairShift</span>
              <span className="text-[11px] text-slate-500 hidden xs:inline">{user?.siteName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SectorToggle currentSector={sectorId} onSectorChange={setSector} />
            <LanguageSelector />
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (Sticky, 44px min targets) */}
      <nav
        aria-label="Worker Navigation"
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1 flex justify-around items-center sm:hidden shadow-lg safe-bottom"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-1.5 min-w-[50px] min-h-[48px] rounded-lg transition-colors ${
                isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] mt-0.5 leading-tight truncate max-w-[56px] text-center">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
