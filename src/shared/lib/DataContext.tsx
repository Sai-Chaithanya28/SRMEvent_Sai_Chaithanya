import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/shared/db';
import { enqueueSync } from '@/shared/lib/sync';
import { getOrCreateDeviceAnonymousToken, hashToken } from '@/shared/lib/crypto';
import {
  Checkin,
  HazardReport,
  FeedbackThread,
  FeedbackMessage,
  Payslip,
  HazardStatus,
  HazardSeverity,
  FeedbackCategory,
  CheckinMethod,
} from '@/shared/types';
import {
  INITIAL_CHECKINS,
  INITIAL_HAZARDS,
  INITIAL_PAYSLIPS,
  SEED_ANONYMOUS_THREADS,
} from '@/shared/lib/mockData';
import { useAuth } from '@/features/auth/AuthContext';
import { getSectorConfig } from '@/config/sectors';

type HazardWithNotes = HazardReport & { notes?: Array<{ id: string; author: string; text: string; time: string }> };
type ThreadWithMessages = { thread: FeedbackThread; messages: FeedbackMessage[] };

interface DataContextType {
  checkins: Checkin[];
  activeCheckin: Checkin | null;
  hazards: HazardWithNotes[];
  feedbackThreads: ThreadWithMessages[];
  deviceTokenHash: string;
  payslips: Payslip[];
  isLoading: boolean;
  // Actions
  performCheckin: (method: CheckinMethod, lat?: number | null, lng?: number | null) => Promise<Checkin>;
  performCheckout: (checkinId?: string) => Promise<Checkin | null>;
  manualCheckinSupervisor: (workerId: string, siteId: string, teamId: string) => Promise<Checkin>;
  submitHazard: (
    description: string,
    severity: HazardSeverity,
    photoUrl?: string | null,
    audioUrl?: string | null
  ) => Promise<HazardReport>;
  updateHazardStatus: (hazardId: string, status: HazardStatus, note?: string) => Promise<void>;
  submitFeedback: (category: FeedbackCategory, rating: number, comment?: string) => Promise<string>;
  replyToFeedback: (threadId: string, body: string, fromSide?: 'worker' | 'employer') => Promise<void>;
  generatePayslip: (workerId: string, regularHours: number, overtimeHours: number, rate: number) => Promise<Payslip>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, sectorId } = useAuth();
  const sectorConfig = getSectorConfig(sectorId);

  const [checkins, setCheckins] = useState<Checkin[]>(() => {
    const saved = localStorage.getItem('fairshift_checkins');
    return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
  });

  const [hazards, setHazards] = useState<HazardWithNotes[]>(() => {
    const saved = localStorage.getItem('fairshift_hazards');
    return saved ? JSON.parse(saved) : INITIAL_HAZARDS;
  });

  const [feedbackThreads, setFeedbackThreads] = useState<ThreadWithMessages[]>(() => {
    const saved = localStorage.getItem('fairshift_feedbacks');
    return saved ? JSON.parse(saved) : SEED_ANONYMOUS_THREADS;
  });

  const [payslips, setPayslips] = useState<Payslip[]>(() => {
    const saved = localStorage.getItem('fairshift_payslips');
    return saved ? JSON.parse(saved) : INITIAL_PAYSLIPS;
  });

  const [deviceTokenHash, setDeviceTokenHash] = useState<string>('');
  const [isLoading] = useState(false);

  // Initialize device anonymous token hash
  useEffect(() => {
    const initHash = async () => {
      const raw = getOrCreateDeviceAnonymousToken();
      const hashed = await hashToken(raw);
      setDeviceTokenHash(hashed);
    };
    initHash();
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('fairshift_checkins', JSON.stringify(checkins));
  }, [checkins]);

  useEffect(() => {
    localStorage.setItem('fairshift_hazards', JSON.stringify(hazards));
  }, [hazards]);

  useEffect(() => {
    localStorage.setItem('fairshift_feedbacks', JSON.stringify(feedbackThreads));
  }, [feedbackThreads]);

  useEffect(() => {
    localStorage.setItem('fairshift_payslips', JSON.stringify(payslips));
  }, [payslips]);

  // Find active checkin for current worker (checkin without checkout)
  const activeCheckin =
    user && user.role === 'worker'
      ? checkins.find((c) => c.profileId === user.id && c.checkOut === null) || null
      : null;

  // Perform Check In
  const performCheckin = async (
    method: CheckinMethod,
    lat: number | null = null,
    lng: number | null = null
  ): Promise<Checkin> => {
    if (!user) throw new Error('Must be logged in to check in');

    const newCheckin: Checkin = {
      id: crypto.randomUUID(),
      profileId: user.id,
      siteId: user.siteId,
      teamId: user.teamId,
      checkIn: new Date().toISOString(),
      checkOut: null,
      method,
      lat,
      lng,
      isOvertime: false,
      overtimeMinutes: 0,
      syncStatus: navigator.onLine ? 'synced' : 'pending',
    };

    // 1. Write to local state & Dexie
    setCheckins((prev) => [newCheckin, ...prev]);
    try {
      await db.checkins.add(newCheckin);
      // 2. Queue into offline outbox for idempotent upsert
      await enqueueSync('checkins', newCheckin as unknown as Record<string, unknown>, newCheckin.id);
    } catch {
      // Dexie background save
    }

    return newCheckin;
  };

  // Perform Check Out (computes automatic overtime based on sector threshold)
  const performCheckout = async (checkinId?: string): Promise<Checkin | null> => {
    const targetId = checkinId || activeCheckin?.id;
    if (!targetId) return null;

    const existing = checkins.find((c) => c.id === targetId);
    if (!existing) return null;

    const checkOutTime = new Date();
    const checkInTime = new Date(existing.checkIn);
    const durationMinutes = Math.max(1, Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000));

    // Overtime rule: if shift duration exceeds configured threshold
    const threshold = sectorConfig.overtimeThresholdMinutes || 480;
    const isOvertime = durationMinutes > threshold;
    const overtimeMinutes = isOvertime ? durationMinutes - threshold : 0;

    const updated: Checkin = {
      ...existing,
      checkOut: checkOutTime.toISOString(),
      isOvertime,
      overtimeMinutes,
      syncStatus: navigator.onLine ? 'synced' : 'pending',
    };

    setCheckins((prev) => prev.map((c) => (c.id === targetId ? updated : c)));

    try {
      await db.checkins.put(updated);
      await enqueueSync('checkins', updated as unknown as Record<string, unknown>, updated.id);
    } catch {
      // Background Dexie
    }

    return updated;
  };

  // Supervisor manual fallback check-in
  const manualCheckinSupervisor = async (
    workerId: string,
    siteId: string,
    teamId: string
  ): Promise<Checkin> => {
    const newCheckin: Checkin = {
      id: crypto.randomUUID(),
      profileId: workerId,
      siteId,
      teamId,
      checkIn: new Date().toISOString(),
      checkOut: null,
      method: 'manual',
      lat: null,
      lng: null,
      isOvertime: false,
      overtimeMinutes: 0,
      syncStatus: navigator.onLine ? 'synced' : 'pending',
    };

    setCheckins((prev) => [newCheckin, ...prev]);
    try {
      await db.checkins.add(newCheckin);
      await enqueueSync('checkins', newCheckin as unknown as Record<string, unknown>, newCheckin.id);
    } catch {
      // Dexie
    }

    return newCheckin;
  };

  // Submit Safety Hazard
  const submitHazard = async (
    description: string,
    severity: HazardSeverity,
    photoUrl: string | null = null,
    audioUrl: string | null = null
  ): Promise<HazardReport> => {
    if (!user) throw new Error('Must be logged in');

    const newHazard: HazardReport & { notes?: Array<{ id: string; author: string; text: string; time: string }> } = {
      id: crypto.randomUUID(),
      profileId: user.id,
      siteId: user.siteId,
      teamId: user.teamId,
      description,
      severity,
      status: 'submitted',
      photoUrl,
      audioUrl,
      syncStatus: navigator.onLine ? 'synced' : 'pending',
      createdAt: new Date().toISOString(),
      notes: [],
    };

    setHazards((prev) => [newHazard, ...prev]);
    try {
      await db.hazardReports.add(newHazard);
      await enqueueSync('hazard_reports', newHazard as unknown as Record<string, unknown>, newHazard.id);
    } catch {
      // Dexie
    }

    return newHazard;
  };

  // Update Hazard Status & Closed-loop notes
  const updateHazardStatus = async (
    hazardId: string,
    status: HazardStatus,
    noteText?: string
  ): Promise<void> => {
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id !== hazardId) return h;
        const notes = h.notes || [];
        if (noteText && user) {
          notes.push({
            id: crypto.randomUUID(),
            author: `${user.fullName} (${user.role === 'employer' ? 'Management' : 'Staff'})`,
            text: noteText,
            time: new Date().toISOString(),
          });
        }
        return {
          ...h,
          status,
          notes,
          syncStatus: navigator.onLine ? 'synced' : 'pending',
        };
      })
    );

    try {
      const target = hazards.find((h) => h.id === hazardId);
      if (target) {
        await enqueueSync(
          'hazard_reports',
          { id: hazardId, status, updated_at: new Date().toISOString() },
          hazardId
        );
      }
    } catch {
      // Dexie
    }
  };

  // Submit Anonymous Feedback (REAL ANONYMITY: only token hash and teamId, NO user_id!)
  const submitFeedback = async (
    category: FeedbackCategory,
    rating: number,
    comment?: string
  ): Promise<string> => {
    const threadId = crypto.randomUUID();
    const rawToken = getOrCreateDeviceAnonymousToken();
    const tokenHash = await hashToken(rawToken);

    const teamId = user ? user.teamId : 'team-const-alpha';

    const newThread: FeedbackThread = {
      id: threadId,
      tokenHash,
      teamId,
      category,
      rating,
      createdAt: new Date().toISOString(),
    };

    const messages: FeedbackMessage[] = [];
    if (comment && comment.trim()) {
      messages.push({
        id: crypto.randomUUID(),
        threadId,
        fromSide: 'worker',
        body: comment.trim(),
        sentiment: rating >= 4 ? 0.8 : rating <= 2 ? -0.7 : 0.0,
        createdAt: new Date().toISOString(),
      });
    }

    setFeedbackThreads((prev) => [{ thread: newThread, messages }, ...prev]);

    try {
      await db.feedbackThreads.add(newThread);
      await enqueueSync('feedback_threads', newThread as unknown as Record<string, unknown>, threadId);
      if (messages.length > 0) {
        await db.feedbackMessages.add(messages[0]);
        await enqueueSync('feedback_messages', messages[0] as unknown as Record<string, unknown>, messages[0].id);
      }
    } catch {
      // Dexie
    }

    return threadId;
  };

  // Reply to Anonymous Feedback (two-way thread reply)
  const replyToFeedback = async (
    threadId: string,
    body: string,
    fromSide: 'worker' | 'employer' = user?.role === 'employer' ? 'employer' : 'worker'
  ): Promise<void> => {
    const newMsg: FeedbackMessage = {
      id: crypto.randomUUID(),
      threadId,
      fromSide,
      body: body.trim(),
      sentiment: null,
      createdAt: new Date().toISOString(),
    };

    setFeedbackThreads((prev) =>
      prev.map((item) => {
        if (item.thread.id === threadId) {
          return {
            ...item,
            messages: [...item.messages, newMsg],
          };
        }
        return item;
      })
    );

    try {
      await db.feedbackMessages.add(newMsg);
      await enqueueSync('feedback_messages', newMsg as unknown as Record<string, unknown>, newMsg.id);
    } catch {
      // Dexie
    }
  };

  // Generate Payslip
  const generatePayslip = async (
    workerId: string,
    regularHours: number,
    overtimeHours: number,
    rate: number
  ): Promise<Payslip> => {
    const overtimeRate = rate * sectorConfig.overtimeMultiplier;
    const grossPay = regularHours * rate + overtimeHours * overtimeRate;
    const pf = Math.round(grossPay * 0.12);
    const esi = Math.round(grossPay * 0.0075);
    const profTax = 200;
    const netPay = grossPay - (pf + esi + profTax);

    const newPayslip: Payslip = {
      id: crypto.randomUUID(),
      profileId: workerId,
      periodStart: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
      periodEnd: new Date().toISOString().slice(0, 10),
      regularHours,
      overtimeHours,
      hourlyRate: rate,
      overtimeRate,
      grossPay,
      currency: '₹',
      deductions: [
        { label: 'Provident Fund (PF - 12%)', amount: pf, descriptionKey: 'deductions.pf_desc' },
        { label: 'Employee State Insurance (ESI - 0.75%)', amount: esi, descriptionKey: 'deductions.esi_desc' },
        { label: 'Professional Tax', amount: profTax, descriptionKey: 'deductions.professional_tax_desc' },
      ],
      netPay,
      createdAt: new Date().toISOString(),
    };

    setPayslips((prev) => [newPayslip, ...prev]);
    return newPayslip;
  };

  return (
    <DataContext.Provider
      value={{
        checkins,
        activeCheckin,
        hazards,
        feedbackThreads,
        deviceTokenHash,
        payslips,
        isLoading,
        performCheckin,
        performCheckout,
        manualCheckinSupervisor,
        submitHazard,
        updateHazardStatus,
        submitFeedback,
        replyToFeedback,
        generatePayslip,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};
