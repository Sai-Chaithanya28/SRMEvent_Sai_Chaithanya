import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useData } from '@/shared/lib/DataContext';
import { getSectorConfig } from '@/config/sectors';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const FeedbackInsightsPage: React.FC = () => {
  const { t } = useTranslation();
  const { sectorId } = useAuth();
  const { feedbackThreads, replyToFeedback } = useData();
  const sectorConfig = getSectorConfig(sectorId);

  // Filter threads for current sector
  const sectorThreads = feedbackThreads.filter((item) => {
    return sectorId === 'construction'
      ? item.thread.teamId.includes('const')
      : item.thread.teamId.includes('col');
  });

  const responseCount = sectorThreads.length;
  const isThresholdMet = responseCount >= 5;

  // Two-way reply states
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [isReplying, setIsReplying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSendEmployerReply = async (threadId: string) => {
    const text = replyTextMap[threadId];
    if (!text || !text.trim()) return;

    setIsReplying(true);
    try {
      await replyToFeedback(threadId, text.trim(), 'employer');
      setToast('Anonymous reply sent! Worker will see it in their private thread.');
      setReplyTextMap((prev) => ({ ...prev, [threadId]: '' }));
    } catch {
      setToast('Failed to send reply.');
    } finally {
      setIsReplying(false);
    }
  };

  // Category aggregate counts (calculated only if threshold met)
  const categoryCounts: Record<string, number> = {};
  if (isThresholdMet) {
    sectorThreads.forEach((item) => {
      const cat = item.thread.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  }

  const categoryChartData = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat.toUpperCase(),
    responses: count,
  }));

  const avgScore = isThresholdMet && responseCount > 0
    ? (sectorThreads.reduce((acc, curr) => acc + curr.thread.rating, 0) / responseCount).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('employer.feedback_insights')}</h1>
          <p className="text-sm text-slate-500">
            Anonymous worker voice, climate sensing, and two-way case resolution for {sectorConfig.name}
          </p>
        </div>
        <Badge variant={isThresholdMet ? 'success' : 'warning'}>
          {isThresholdMet ? 'Anonymity Threshold Met (≥5)' : 'Privacy Shield Active (<5)'}
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

      {/* PRIVACY SHIELD CHECK (K-Anonymity rule: Min 5 responses required to view aggregate charts) */}
      {!isThresholdMet ? (
        <Card className="bg-amber-50 border border-amber-300 p-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <Icons.Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950">
                {t('employer.threshold_warning')}
              </h2>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                To prevent employers from isolating or identifying workers by triangulation in smaller teams, aggregated sentiment graphs and theme breakdowns are strictly locked until at least <strong>5 feedback submissions</strong> have been logged. Current count: <strong>{responseCount} / 5</strong>.
              </p>
            </div>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-amber-600 h-2.5 rounded-full transition-all"
              style={{ width: `${(responseCount / 5) * 100}%` }}
            />
          </div>
        </Card>
      ) : (
        /* If threshold met: Show aggregated theme analytics */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white p-5 border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">{t('employer.avg_satisfaction')}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-emerald-600">{avgScore}</span>
              <span className="text-sm text-slate-500">out of 5.0</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500 pt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icons.Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(Number(avgScore)) ? 'text-amber-500' : 'text-slate-200'}`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 block pt-1">
              Computed over {responseCount} anonymous worker submissions
            </span>
          </Card>

          <Card className="lg:col-span-2 bg-white p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Feedback by Category</h2>
              <Badge variant="neutral">Verified Aggregates</Badge>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="responses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* TWO-WAY ANONYMOUS FEEDBACK THREADS & REPLY COMPOSER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Anonymous Feedback Inbox & Two-Way Resolution
          </h2>
          <span className="text-xs text-slate-500">
            No profile or identity stored • Cryptographically keyed
          </span>
        </div>

        {sectorThreads.length === 0 ? (
          <Card className="text-center p-8 bg-white border border-slate-200">
            <Icons.MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600">{t('employer.no_feedback')}</p>
          </Card>
        ) : (
          sectorThreads.map(({ thread, messages }) => (
            <Card key={thread.id} className="bg-white p-5 border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" className="uppercase text-[10px]">
                    {thread.category}
                  </Badge>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: thread.rating }).map((_, i) => (
                      <Icons.Star key={i} className="w-3.5 h-3.5" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Thread #{thread.id.slice(0, 8)}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(thread.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Message thread history */}
              <div className="space-y-2.5">
                {messages.map((msg) => {
                  const isWorker = msg.fromSide === 'worker';
                  return (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg text-xs leading-relaxed max-w-[90%] ${
                        isWorker
                          ? 'bg-slate-100 text-slate-800 border border-slate-200 mr-auto'
                          : 'bg-brand-50 text-brand-950 border border-brand-200 ml-auto'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                        <span className={isWorker ? 'text-slate-700' : 'text-brand-800 font-bold'}>
                          {isWorker ? 'Anonymous Worker Voice' : 'Management Response (You)'}
                        </span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm font-normal">{msg.body}</p>
                    </div>
                  );
                })}
              </div>

              {/* Employer Reply Box */}
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={replyTextMap[thread.id] || ''}
                  onChange={(e) =>
                    setReplyTextMap((prev) => ({ ...prev, [thread.id]: e.target.value }))
                  }
                  placeholder={t('employer.reply_placeholder')}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                />
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isReplying}
                  leftIcon={<Icons.Send className="w-4 h-4" />}
                  onClick={() => handleSendEmployerReply(thread.id)}
                >
                  {t('employer.send_reply')}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
