import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '@/shared/db';
import { Icons } from './Icons';

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkPending = async () => {
      try {
        const count = await db.outbox.count();
        setPendingCount(count);
      } catch {
        // Dexie might not be ready
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-600 text-white text-xs sm:text-sm font-medium px-3 py-1.5 flex items-center justify-between shadow-sm sticky top-0 z-50 transition-all"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <Icons.RefreshCw className={`w-4 h-4 flex-shrink-0 ${!isOnline ? '' : 'animate-spin'}`} aria-hidden="true" />
        <span>
          {!isOnline
            ? t('app.offline_chip')
            : `${t('app.syncing')} (${pendingCount} item${pendingCount > 1 ? 's' : ''} queued)`}
        </span>
      </div>
    </div>
  );
};
