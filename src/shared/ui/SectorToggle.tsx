import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectorId } from '@/shared/types';
import { Icons } from './Icons';

export interface SectorToggleProps {
  currentSector: SectorId;
  onSectorChange: (sector: SectorId) => void;
  className?: string;
}

export const SectorToggle: React.FC<SectorToggleProps> = ({
  currentSector,
  onSectorChange,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div
      role="group"
      aria-label="Sector Selection"
      className={`inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 ${className}`}
    >
      <button
        type="button"
        onClick={() => onSectorChange('construction')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all min-h-[38px] ${
          currentSector === 'construction'
            ? 'bg-white text-brand-700 shadow-sm font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Icons.Building className="w-4 h-4 text-amber-600" aria-hidden="true" />
        <span>{t('sector.construction')}</span>
      </button>

      <button
        type="button"
        onClick={() => onSectorChange('college')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all min-h-[38px] ${
          currentSector === 'college'
            ? 'bg-white text-brand-700 shadow-sm font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Icons.GraduationCap className="w-4 h-4 text-indigo-600" aria-hidden="true" />
        <span>{t('sector.college')}</span>
      </button>
    </div>
  );
};
