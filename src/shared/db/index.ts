/* ── Dexie offline database ─────────────────────────────────── */
import Dexie, { type EntityTable } from 'dexie';
import type { OutboxItem, Checkin, HazardReport, FeedbackThread, FeedbackMessage } from '@/shared/types';

class FairShiftDB extends Dexie {
  checkins!: EntityTable<Checkin, 'id'>;
  hazardReports!: EntityTable<HazardReport, 'id'>;
  feedbackThreads!: EntityTable<FeedbackThread, 'id'>;
  feedbackMessages!: EntityTable<FeedbackMessage, 'id'>;
  outbox!: EntityTable<OutboxItem, 'id'>;

  constructor() {
    super('fairshift');
    this.version(1).stores({
      checkins: 'id, profileId, siteId, syncStatus, checkIn',
      hazardReports: 'id, profileId, siteId, syncStatus, createdAt',
      feedbackThreads: 'id, tokenHash, teamId, createdAt',
      feedbackMessages: 'id, threadId, createdAt',
      outbox: '++id, table, clientId, createdAt',
    });
  }
}

export const db = new FairShiftDB();
