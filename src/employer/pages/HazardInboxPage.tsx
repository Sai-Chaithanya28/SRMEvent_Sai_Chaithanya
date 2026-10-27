import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { getSectorConfig } from '@/config/sectors';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { HazardSeverity, HazardStatus } from '@/shared/types';

export const HazardInboxPage: React.FC = () => {
  const { t } = useTranslation();
  const { sectorId } = useAuth();
  const { hazards, updateHazardStatus } = useData();
  const sectorConfig = getSectorConfig(sectorId);

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState<HazardStatus>('in_progress');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filteredHazards = hazards.filter((h) => {
    if (severityFilter !== 'all' && h.severity !== severityFilter) return false;
    return true;
  });

  const handleUpdate = async (hazardId: string) => {
    setIsUpdating(true);
    try {
      await updateHazardStatus(hazardId, newStatus, replyText.trim() || undefined);
      setToast('Hazard status updated and closed-loop reply posted to worker!');
      setReplyText('');
      setSelectedHazardId(null);
    } catch {
      setToast('Failed to update hazard.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSeverityBadge = (sev: HazardSeverity) => {
    switch (sev) {
      case 'critical':
        return <Badge variant="danger">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="warning">HIGH</Badge>;
      case 'medium':
        return <Badge variant="warning">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="neutral">LOW</Badge>;
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('employer.hazard_inbox')}</h1>
          <p className="text-sm text-slate-500">
            Safety incident triage, remediation tracking, and closed-loop worker replies for {sectorConfig.name}
          </p>
        </div>
        <Badge variant="warning" className="text-xs">
          {hazards.filter((h) => h.status !== 'resolved').length} Open Reports
        </Badge>
      </div>

      {toast && (
        <div role="alert" className="p-3 bg-green-50 border border-green-200 text-green-900 rounded-lg text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Severity Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Severity:</span>
        {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSeverityFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors min-h-[38px] ${
              severityFilter === s
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Hazards List */}
      <div className="space-y-4">
        {filteredHazards.length === 0 ? (
          <Card className="text-center p-8 bg-white border border-slate-200">
            <Icons.Shield className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600">{t('employer.no_hazards')}</p>
          </Card>
        ) : (
          filteredHazards.map((hz) => (
            <Card key={hz.id} className="bg-white p-5 border border-slate-200 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(hz.severity)}
                  <span className="text-xs text-slate-500 font-mono">ID: {hz.id.slice(0, 8)}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    {new Date(hz.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {getStatusBadge(hz.status)}
              </div>

              <p className="text-sm text-slate-900 leading-relaxed font-medium">
                {hz.description}
              </p>

              {/* Attachments */}
              <div className="flex flex-wrap gap-2 text-xs">
                {hz.photoUrl && (
                  <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200">
                    <Icons.Camera className="w-4 h-4 text-slate-500" />
                    <span>Photo evidence attached</span>
                  </div>
                )}
                {hz.audioUrl && (
                  <div className="bg-blue-50 text-brand-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-blue-200">
                    <Icons.Mic className="w-4 h-4 text-brand-600" />
                    <span>Worker voice recording (available for playback)</span>
                  </div>
                )}
              </div>

              {/* Remediation Timeline Notes */}
              {hz.notes && hz.notes.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Remediation Log & Worker Communications:</span>
                  {hz.notes.map((note) => (
                    <div key={note.id} className="text-xs bg-white p-2.5 rounded border border-slate-200 space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <strong className="text-brand-900">{note.author}</strong>
                        <span>{new Date(note.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-800">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Area */}
              {selectedHazardId === hz.id ? (
                <div className="pt-3 border-t border-slate-200 space-y-3 bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Update Status & Reply to Worker</span>
                    <button
                      type="button"
                      onClick={() => setSelectedHazardId(null)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Status Transition</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as HazardStatus)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs min-h-[40px]"
                      >
                        <option value="acknowledged">Acknowledged (Reviewing)</option>
                        <option value="in_progress">In Progress (Dispatching crew)</option>
                        <option value="resolved">Resolved (Fix verified)</option>
                        <option value="dismissed">Dismissed (No hazard found)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Worker Reply Note</label>
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="e.g. Scaffolding crew summoned, cordoned off..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs min-h-[40px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isUpdating}
                      onClick={() => handleUpdate(hz.id)}
                    >
                      Save Status & Notify Worker
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedHazardId(hz.id);
                      setNewStatus(hz.status);
                    }}
                  >
                    Update Status & Reply
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
