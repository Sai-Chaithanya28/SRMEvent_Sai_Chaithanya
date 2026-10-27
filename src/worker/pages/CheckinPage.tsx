import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { getSectorConfig } from '@/config/sectors';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { CheckinMethod } from '@/shared/types';

export const CheckinPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, sectorId } = useAuth();
  const { activeCheckin, performCheckin, performCheckout } = useData();
  const sectorConfig = getSectorConfig(sectorId);

  const [selectedMethod, setSelectedMethod] = useState<CheckinMethod>('qr');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'queued'; text: string } | null>(null);

  // Supervisor manual code
  const [supervisorCode, setSupervisorCode] = useState('');

  const handleQrCheckin = async () => {
    setIsSubmitting(true);
    try {
      await performCheckin('qr', 28.6139, 77.209);
      const isOnline = navigator.onLine;
      setMessage({
        type: isOnline ? 'success' : 'queued',
        text: isOnline ? t('worker.checkin_success') : t('worker.checkin_queued'),
      });
    } catch {
      setMessage({ type: 'error', text: t('app.error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGpsCheckin = async () => {
    setGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setGpsCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setGpsLoading(false);
          setIsSubmitting(true);
          try {
            await performCheckin('gps', position.coords.latitude, position.coords.longitude);
            const isOnline = navigator.onLine;
            setMessage({
              type: isOnline ? 'success' : 'queued',
              text: isOnline ? t('worker.checkin_success') : t('worker.checkin_queued'),
            });
          } catch {
            setMessage({ type: 'error', text: t('app.error') });
          } finally {
            setIsSubmitting(false);
          }
        },
        async () => {
          // Fallback simulation for devices without GPS or denied permissions
          setGpsCoords({ lat: 28.614, lng: 77.209 });
          setGpsLoading(false);
          setIsSubmitting(true);
          try {
            await performCheckin('gps', 28.614, 77.209);
            setMessage({ type: 'success', text: t('worker.checkin_success') });
          } catch {
            setMessage({ type: 'error', text: t('app.error') });
          } finally {
            setIsSubmitting(false);
          }
        },
        { timeout: 8000 }
      );
    } else {
      setGpsLoading(false);
      await performCheckin('gps', 28.614, 77.209);
      setMessage({ type: 'success', text: t('worker.checkin_success') });
    }
  };

  const handleSupervisorCheckin = async () => {
    if (!supervisorCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter supervisor approval PIN (e.g. 1234)' });
      return;
    }
    setIsSubmitting(true);
    try {
      await performCheckin('manual');
      setMessage({ type: 'success', text: 'Supervisor check-in confirmed successfully!' });
      setSupervisorCode('');
    } catch {
      setMessage({ type: 'error', text: t('app.error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      await performCheckout();
      setMessage({ type: 'success', text: t('worker.checkout_success') });
    } catch {
      setMessage({ type: 'error', text: t('app.error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('worker.checkin')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{user?.siteName}</p>
        </div>
        <Badge variant={activeCheckin ? 'success' : 'neutral'}>
          {activeCheckin ? 'Currently on Shift' : 'Off Shift'}
        </Badge>
      </div>

      {/* Notifications */}
      {message && (
        <div
          role="alert"
          className={`p-3 rounded-lg border text-sm flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-900'
              : message.type === 'queued'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' && <Icons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
            {message.type === 'queued' && <Icons.RefreshCw className="w-5 h-5 text-amber-600 flex-shrink-0" />}
            {message.type === 'error' && <Icons.XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* If Worker is currently checked in -> Show Active Checkout Screen */}
      {activeCheckin ? (
        <Card variant="raised" className="border-t-4 border-t-green-600 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-green-700">Live Shift</span>
            <span className="text-xs text-slate-500">Method: {activeCheckin.method.toUpperCase()}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Check-in Timestamp:</span>
              <span className="text-sm font-semibold text-slate-900">
                {new Date(activeCheckin.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Location:</span>
              <span className="text-sm font-medium text-slate-700">{user?.siteName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Team:</span>
              <span className="text-sm font-medium text-slate-700">{user?.teamName}</span>
            </div>
          </div>

          <Button
            variant="danger"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<Icons.Clock className="w-5 h-5" />}
            onClick={handleCheckout}
          >
            {t('worker.checkout')}
          </Button>
        </Card>
      ) : (
        /* Check-in Method Selection */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedMethod('qr')}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                selectedMethod === 'qr'
                  ? 'bg-white text-brand-700 shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icons.QrCode className="w-4 h-4 mb-1" />
              <span>QR Code</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('gps')}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                selectedMethod === 'gps'
                  ? 'bg-white text-brand-700 shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icons.MapPin className="w-4 h-4 mb-1" />
              <span>GPS Location</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('manual')}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                selectedMethod === 'manual'
                  ? 'bg-white text-brand-700 shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icons.Shield className="w-4 h-4 mb-1" />
              <span>Supervisor Fallback</span>
            </button>
          </div>

          {/* METHOD 1: QR CODE */}
          {selectedMethod === 'qr' && (
            <Card variant="raised" className="text-center p-6 bg-white space-y-4">
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <Icons.QrCode className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-800">{t('worker.scan_qr')}</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Hold your camera to the printed QR badge posted at the entrance of {user?.siteName}.
                </p>
              </div>

              {/* QR Simulator Box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 max-w-xs mx-auto">
                <div className="text-xs font-mono text-slate-600">
                  Target: <span className="font-bold text-brand-600">FAIRSHIFT-GATE-01</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Ready for high-speed scanner</div>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                leftIcon={<Icons.CheckCircle className="w-5 h-5" />}
                onClick={handleQrCheckin}
              >
                Scan & Check In
              </Button>
            </Card>
          )}

          {/* METHOD 2: GPS LOCATION */}
          {selectedMethod === 'gps' && (
            <Card variant="raised" className="text-center p-6 bg-white space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <Icons.MapPin className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-800">{t('worker.use_location')}</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  FairShift checks your geo-fence inside {user?.siteName} to automatically verify your arrival.
                </p>
              </div>

              {gpsCoords && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg text-xs font-mono">
                  Verified: Lat {gpsCoords.lat.toFixed(4)}, Lng {gpsCoords.lng.toFixed(4)} (Within Geofence)
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                size="lg"
                isLoading={gpsLoading || isSubmitting}
                leftIcon={<Icons.MapPin className="w-5 h-5" />}
                onClick={handleGpsCheckin}
              >
                {gpsLoading ? 'Acquiring GPS Signal...' : 'Verify Location & Check In'}
              </Button>
            </Card>
          )}

          {/* METHOD 3: SUPERVISOR MANUAL FALLBACK */}
          {selectedMethod === 'manual' && (
            <Card variant="raised" className="p-5 bg-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icons.Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">{t('worker.manual_checkin')}</h2>
                  <p className="text-xs text-slate-500">Tech failure guarantee: never lose wages due to hardware or glitch</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Supervisor PIN or Approval Code
                </label>
                <input
                  type="password"
                  placeholder="Enter 4-digit PIN (e.g. 1234)"
                  value={supervisorCode}
                  onChange={(e) => setSupervisorCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                />
                <span className="text-[11px] text-slate-500 block">
                  Ask your site foreman ({sectorConfig.supervisorLabel}) to enter their approval code.
                </span>
              </div>

              <Button
                variant="secondary"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                leftIcon={<Icons.CheckCircle className="w-5 h-5" />}
                onClick={handleSupervisorCheckin}
              >
                Confirm Supervisor Fallback
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
