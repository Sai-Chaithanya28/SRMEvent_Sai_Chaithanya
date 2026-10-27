import React from 'react';
import { Icons } from './Icons';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  className = '',
}) => {
  const styles = {
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-amber-100 text-amber-800 border-amber-300',
    danger: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
    neutral: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const defaultIcon = {
    success: <Icons.CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />,
    warning: <Icons.AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />,
    danger: <Icons.XCircle className="w-3.5 h-3.5" aria-hidden="true" />,
    info: <Icons.Clock className="w-3.5 h-3.5" aria-hidden="true" />,
    neutral: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}
    >
      {icon !== undefined ? icon : defaultIcon[variant]}
      <span>{children}</span>
    </span>
  );
};
