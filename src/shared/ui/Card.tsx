import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'raised' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-surface border border-slate-200 shadow-sm',
    raised: 'bg-surface shadow-md border border-slate-100',
    bordered: 'bg-surface border-2 border-slate-200',
  };

  return (
    <div
      className={`rounded-token p-4 transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
