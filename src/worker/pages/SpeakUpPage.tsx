import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/shared/lib/DataContext';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { FeedbackCategory } from '@/shared/types';

export const SpeakUpPage: React.FC = () => {
  const { t } = useTranslation();
  const { feedbackThreads, deviceTokenHash, submitFeedback, replyToFeedback } = useData();

  const [activeTab, setActiveTab] = useState<'speak' | 'threads'>('speak');
  const [category, setCategory] = useState<FeedbackCategory>('manager');
  const [rating, setRating] = useState<number>(4);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Replying in an existing thread
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [isReplying, setIsReplying] = useState(false);

  // Filter threads that belong to this device's token hash
  const myDeviceThreads = feedbackThreads.filter(
    (item) => item.thread.tokenHash === deviceTokenHash
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitFeedback(category, rating, comment);
      setToast(t('feedback.feedback_submitted'));
      setComment('');
      setActiveTab('threads');
    } catch {
      setToast(t('app.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWorkerReply = async (threadId: string) => {
    const text = replyTextMap[threadId];
    if (!text || !text.trim()) return;

    setIsReplying(true);
    try {
      await replyToFeedback(threadId, text.trim(), 'worker');
      setReplyTextMap((prev) => ({ ...prev, [threadId]: '' }));
    } catch {
      setToast(t('app.error'));
    } finally {
      setIsReplying(false);
    }
  };

  const categories: Array<{ id: FeedbackCategory; labelKey: string }> = [
    { id: 'manager', labelKey: 'feedback.cat_manager' },
    { id: 'conditions', labelKey: 'feedback.cat_conditions' },
    { id: 'pay', labelKey: 'feedback.cat_pay' },
    { id: 'safety', labelKey: 'feedback.cat_safety' },
    { id: 'general', labelKey: 'feedback.cat_general' },
  ];

  const ratingDescriptions: Record<number, string> = {
    1: 'feedback.rating_1',
    2: 'feedback.rating_2',
    3: 'feedback.rating_3',
    4: 'feedback.rating_4',
    5: 'feedback.rating_5',
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('speak')}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
            activeTab === 'speak' ? 'bg-white text-brand-700 shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Icons.MessageSquare className="w-4 h-4 text-brand-600" />
          <span>{t('feedback.title')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('threads')}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
            activeTab === 'threads' ? 'bg-white text-brand-700 shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Icons.Shield className="w-4 h-4 text-emerald-600" />
          <span>{t('feedback.my_threads_title')} ({myDeviceThreads.length})</span>
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

      {/* TAB 1: SUBMIT FEEDBACK */}
      {activeTab === 'speak' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Privacy Guarantee Card */}
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-token text-xs text-emerald-900 flex items-start gap-2.5">
            <Icons.Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-emerald-950">
                100% Device-Level Anonymity Guarantee
              </strong>
              <span>
                {t('feedback.subtitle')}. Your feedback is stored only with a randomized cryptographic token hash on this device. No user ID or identity is ever linked.
              </span>
            </div>
          </div>

          <Card variant="raised" className="bg-white p-4 sm:p-5 space-y-4">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                {t('feedback.category')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all min-h-[44px] ${
                      category === cat.id
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {t(cat.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Star / Rating Selector (1 to 5) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                {t('feedback.rating')}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} star`}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
                      rating >= star
                        ? 'bg-amber-100 text-amber-500 scale-105'
                        : 'bg-slate-100 text-slate-300 hover:text-amber-300'
                    }`}
                  >
                    <Icons.Star className="w-6 h-6" />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-amber-800 block mt-1">
                {t(ratingDescriptions[rating])} ({rating}/5)
              </span>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label htmlFor="fb-comment" className="text-xs font-semibold text-slate-700 block">
                {t('feedback.comment')}
              </label>
              <textarea
                id="fb-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('feedback.comment_placeholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 min-h-[80px]"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<Icons.Send className="w-5 h-5" />}
            >
              {t('feedback.submit_feedback')}
            </Button>
          </Card>
        </form>
      ) : (
        /* TAB 2: MY ANONYMOUS THREADS & REPLIES */
        <div className="space-y-3">
          <p className="text-xs text-slate-500 italic px-1">
            {t('feedback.anonymous_note')}
          </p>

          {myDeviceThreads.length === 0 ? (
            <Card className="text-center p-8 bg-white">
              <Icons.MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{t('feedback.no_threads')}</p>
            </Card>
          ) : (
            myDeviceThreads.map(({ thread, messages }) => (
              <Card key={thread.id} className="bg-white p-4 space-y-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" className="uppercase text-[10px]">
                      {thread.category}
                    </Badge>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: thread.rating }).map((_, i) => (
                        <Icons.Star key={i} className="w-3.5 h-3.5" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Messages in thread */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {messages.map((msg) => {
                    const isWorker = msg.fromSide === 'worker';
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg text-xs leading-relaxed max-w-[90%] ${
                          isWorker
                            ? 'bg-slate-100 text-slate-800 ml-auto'
                            : 'bg-brand-50 border border-brand-200 text-brand-950 mr-auto'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                          <span>{isWorker ? t('feedback.you_wrote') : t('feedback.employer_replied')}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{msg.body}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Worker follow-up reply box */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyTextMap[thread.id] || ''}
                    onChange={(e) =>
                      setReplyTextMap((prev) => ({ ...prev, [thread.id]: e.target.value }))
                    }
                    placeholder={t('feedback.reply_placeholder')}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg min-h-[40px] focus:ring-2 focus:ring-brand-500"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={isReplying}
                    onClick={() => handleSendWorkerReply(thread.id)}
                  >
                    {t('feedback.send_reply')}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
