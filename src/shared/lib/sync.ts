/* ── Offline outbox sync engine ─────────────────────────────── */
import { db } from '@/shared/db';
import { supabase } from '@/shared/lib/supabase';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

/** Queue a record for offline-first upsert. */
export async function enqueueSync(
  table: string,
  payload: Record<string, unknown>,
  clientId: string
): Promise<void> {
  await db.outbox.add({
    table,
    payload,
    clientId,
    retries: 0,
    lastAttempt: null,
    createdAt: new Date().toISOString(),
  });
  // Fire-and-forget attempt
  processOutbox().catch(() => {});
}

/** Process all pending outbox items with exponential backoff. */
export async function processOutbox(): Promise<void> {
  const items = await db.outbox.toArray();
  for (const item of items) {
    if (item.retries >= MAX_RETRIES) continue;

    try {
      const { error } = await supabase
        .from(item.table)
        .upsert(item.payload, { onConflict: 'id' });

      if (error) throw error;

      // Success – remove from outbox
      if (item.id != null) {
        await db.outbox.delete(item.id);
      }
    } catch {
      // Increment retry count with backoff
      if (item.id != null) {
        await db.outbox.update(item.id, {
          retries: item.retries + 1,
          lastAttempt: new Date().toISOString(),
        });
      }
      // Exponential backoff: wait before next item
      const delay = BASE_DELAY_MS * Math.pow(2, item.retries);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/** Get count of pending outbox items. */
export async function getOutboxCount(): Promise<number> {
  return db.outbox.count();
}

/** Register a periodic sync (call once at app start). */
export function startPeriodicSync(intervalMs = 30000): () => void {
  const id = setInterval(() => {
    processOutbox().catch(() => {});
  }, intervalMs);
  return () => clearInterval(id);
}

/** Listen for online events and trigger sync. */
export function setupConnectivitySync(): () => void {
  const handler = () => processOutbox().catch(() => {});
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
