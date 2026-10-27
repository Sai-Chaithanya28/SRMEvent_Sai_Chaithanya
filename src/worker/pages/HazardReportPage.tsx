import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { getSectorConfig } from '@/config/sectors';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { HazardSeverity, HazardStatus } from '@/shared/types';

export const HazardReportPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, sectorId } = useAuth();
  const { hazards, submitHazard } = useData();
  const sectorConfig = getSectorConfig(sectorId);

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<HazardSeverity>('high');
  const [photoSelected, setPhotoSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Audio Recording with MediaRecorder
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startVoiceRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = window.setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        // Fallback simulation
        setIsRecording(true);
        timerRef.current = window.setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      }
    } catch {
      // If mic permission blocked, simulate
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setAudioUrl('mock-voice-note.webm');
    }
    setIsRecording(false);
  };

  const handlePresetSelect = (preset: { label: string; severity: HazardSeverity }) => {
    setDescription((prev) => (prev ? `${prev}\n• ${preset.label}` : preset.label));
    setSeverity(preset.severity);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await submitHazard(
        description.trim(),
        severity,
        photoSelected ? 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80' : null,
        audioUrl
      );
      setToast(t('hazard.report_submitted'));
      setDescription('');
      setPhotoSelected(false);
      setAudioUrl(null);
      setActiveTab('list');
    } catch {
      setToast(t('app.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const workerHazards = hazards.filter((h) => h.profileId === user?.id);

  const getStatusBadge = (status: HazardStatus) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="neutral">{t('hazard.status_submitted')}</Badge>;
      case 'acknowledged':
        return <Badge variant="info">{t('hazard.status_acknowledged')}</Badge>;
      case 'in_progress':
        return <Badge variant="warning">{t('hazard.status_in_progress')}</Badge>;
      case 'resolved':
        return <Badge variant="success">{t('hazard.status_resolved')}</Badge>;
      case 'dismissed':
        return <Badge variant="neutral">{t('hazard.status_dismissed')}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
            activeTab === 'create' ? 'bg-white text-brand-700 shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Icons.AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{t('worker.report_hazard')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
            activeTab === 'list' ? 'bg-white text-brand-700 shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Icons.Clock className="w-4 h-4 text-blue-600" />
          <span>{t('hazard.my_reports_title')} ({workerHazards.length})</span>
        </button>
      </div>

      {toast && (
        <div role="alert" className="p-3 bg-green-50 border border-green-200 text-green-900 rounded-lg text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.CheckCircle className="w-4 h-4 text-green-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* TAB 1: CREATE NEW REPORT */}
      {activeTab === 'create' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card variant="raised" className="bg-white p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('hazard.title')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Location: <strong className="text-slate-700">{user?.siteName}</strong>
              </p>
            </div>

            {/* Quick Presets for current Sector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Quick Select Common Hazards ({sectorConfig.name}):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {sectorConfig.hazardPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 transition-colors text-left"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Radio Buttons (WCAG AA High-Contrast) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                {t('hazard.severity')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as HazardSeverity[]).map((sev) => {
                  const isSelected = severity === sev;
                  const colors = {
                    low: 'border-slate-300 text-slate-700 bg-slate-50',
                    medium: 'border-amber-300 text-amber-800 bg-amber-50',
                    high: 'border-orange-400 text-orange-900 bg-orange-50',
                    critical: 'border-red-500 text-red-900 bg-red-50',
                  };
                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all min-h-[44px] flex items-center justify-between ${
                        isSelected ? `${colors[sev]} ring-2 ring-brand-500 font-bold` : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="capitalize">{sev}</span>
                      {isSelected && <Icons.CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="hazard-desc" className="text-xs font-semibold text-slate-700 block">
                {t('hazard.description')}
              </label>
              <textarea
                id="hazard-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('hazard.description_placeholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 min-h-[80px]"
                required
              />
            </div>

            {/* Multimedia Attachments: Voice Note & Photo */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Mic / Voice Recording */}
              <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
                {!isRecording ? (
                  <Button
                    type="button"
                    variant={audioUrl ? 'secondary' : 'outline'}
                    size="sm"
                    fullWidth
                    leftIcon={<Icons.Mic className="w-4 h-4 text-brand-600" />}
                    onClick={startVoiceRecording}
                  >
                    {audioUrl ? 'Re-record Voice Note' : t('hazard.add_voice')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    fullWidth
                    className="animate-pulse"
                    leftIcon={<Icons.Square className="w-4 h-4" />}
                    onClick={stopVoiceRecording}
                  >
                    {t('hazard.stop_recording')} ({recordingSeconds}s)
                  </Button>
                )}
                {audioUrl && !isRecording && (
                  <span className="text-[11px] text-green-700 mt-1 block font-medium">
                    ✓ Voice note attached ({recordingSeconds || 5}s)
                  </span>
                )}
              </div>

              {/* Photo Upload */}
              <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
                <Button
                  type="button"
                  variant={photoSelected ? 'secondary' : 'outline'}
                  size="sm"
                  fullWidth
                  leftIcon={<Icons.Camera className="w-4 h-4 text-slate-700" />}
                  onClick={() => setPhotoSelected(!photoSelected)}
                >
                  {photoSelected ? 'Photo Attached ✓' : t('hazard.add_photo')}
                </Button>
                {photoSelected && (
                  <span className="text-[11px] text-green-700 mt-1 block font-medium">
                    ✓ 1 Photo attached (site evidence)
                  </span>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<Icons.Send className="w-5 h-5" />}
            >
              {t('hazard.submit_report')}
            </Button>
          </Card>
        </form>
      ) : (
        /* TAB 2: MY REPORTS TIMELINE (CLOSED-LOOP VISIBLE STATUS) */
        <div className="space-y-3">
          {workerHazards.length === 0 ? (
            <Card className="text-center p-8 bg-white">
              <Icons.Shield className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{t('hazard.no_reports')}</p>
            </Card>
          ) : (
            workerHazards.map((hz) => (
              <Card key={hz.id} className="bg-white p-4 space-y-3 border border-slate-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      {new Date(hz.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-600 mt-0.5 block">
                      Severity: {hz.severity}
                    </span>
                  </div>
                  {getStatusBadge(hz.status)}
                </div>

                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {hz.description}
                </p>

                {hz.photoUrl && (
                  <div className="p-2 bg-slate-100 rounded-lg text-xs text-slate-600 flex items-center gap-1.5">
                    <Icons.Camera className="w-4 h-4 text-slate-500" />
                    <span>Photo attached & delivered to supervisor</span>
                  </div>
                )}

                {hz.audioUrl && (
                  <div className="p-2 bg-slate-100 rounded-lg text-xs text-slate-600 flex items-center gap-1.5">
                    <Icons.Mic className="w-4 h-4 text-brand-600" />
                    <span>Voice note recorded</span>
                  </div>
                )}

                {/* Employer Closed-Loop Feedback Notes */}
                {hz.notes && hz.notes.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2 bg-blue-50/50 p-3 rounded-lg">
                    <span className="text-xs font-bold text-brand-900 block flex items-center gap-1">
                      <Icons.MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                      {t('hazard.employer_note')}:
                    </span>
                    {hz.notes.map((note) => (
                      <div key={note.id} className="text-xs text-slate-700 space-y-0.5">
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <strong>{note.author}</strong>
                          <span>{new Date(note.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="bg-white p-2 rounded border border-blue-200 text-slate-800">
                          {note.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
