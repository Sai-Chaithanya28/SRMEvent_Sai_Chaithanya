import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, DEMO_USERS } from '@/features/auth/AuthContext';
import { UserRole } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { SectorToggle } from '@/shared/ui/SectorToggle';
import { Icons } from '@/shared/ui/Icons';
import { getSectorConfig } from '@/config/sectors';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { loginDemo, loginAs, sectorId, setSector } = useAuth();
  const navigate = useNavigate();
  const sectorConfig = getSectorConfig(sectorId);

  const [role, setRole] = useState<UserRole>('worker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleDemoSelect = (key: keyof typeof DEMO_USERS) => {
    loginDemo(key);
    const selected = DEMO_USERS[key];
    navigate(selected.role === 'worker' ? '/worker' : '/employer');
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(role, sectorId, fullName || undefined);
    navigate(role === 'worker' ? '/worker' : '/employer');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Top Header Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <SectorToggle currentSector={sectorId} onSectorChange={setSector} />
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl mx-auto flex items-center justify-center font-extrabold text-3xl shadow-lg mb-2">
            F
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            FairShift
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {t('app.tagline')} • UN SDG 8 Decent Work Platform
          </p>
        </div>

        {/* 1-Click Demo Profiles (Both Sectors & Roles) */}
        <Card variant="raised" className="bg-white p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t('app.demo_login')}
            </span>
            <span className="text-[11px] text-brand-600 font-semibold">{sectorConfig.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {sectorId === 'construction' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleDemoSelect('worker-construction')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 text-left transition-all min-h-[52px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-brand-700 flex items-center justify-center font-bold">
                      <Icons.Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Ramesh Kumar (Worker)</span>
                      <span className="text-xs text-slate-500">Construction Mason • Crew Alpha</span>
                    </div>
                  </div>
                  <Icons.ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('employer-construction')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-left transition-all min-h-[52px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
                      <Icons.BarChart className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Vikram Singh (Employer)</span>
                      <span className="text-xs text-slate-500">Site Foreman / Management</span>
                    </div>
                  </div>
                  <Icons.ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleDemoSelect('worker-college')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 text-left transition-all min-h-[52px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <Icons.GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Ananya Sharma (Worker)</span>
                      <span className="text-xs text-slate-500">Campus Lab Assistant • Tech Unit</span>
                    </div>
                  </div>
                  <Icons.ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('employer-college')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-left transition-all min-h-[52px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
                      <Icons.BarChart className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Dr. K. Narayanan (Employer)</span>
                      <span className="text-xs text-slate-500">Campus Facility & Safety Director</span>
                    </div>
                  </div>
                  <Icons.ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </>
            )}
          </div>
        </Card>

        {/* Custom Login Form */}
        <Card variant="raised" className="bg-white p-5 border border-slate-200 space-y-4">
          <form onSubmit={handleManualLogin} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('app.select_role')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all min-h-[44px] ${
                    role === 'worker'
                      ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t('app.worker')}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all min-h-[44px] ${
                    role === 'employer'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t('app.employer')}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Your Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sai Chaithanya"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[44px] focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">{t('app.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[44px] focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">{t('app.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[44px] focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg">
              {t('app.login')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
