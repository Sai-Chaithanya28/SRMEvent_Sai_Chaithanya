/* ── FairShift – shared types ────────────────────────────────── */
import { z } from 'zod';

/* ── Enums ─────────────────────────────────────────────────── */
export type UserRole = 'worker' | 'employer' | 'admin';
export type SectorId = 'construction' | 'college';
export type CheckinMethod = 'qr' | 'gps' | 'manual';
export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical';
export type HazardStatus = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
export type FeedbackCategory = 'manager' | 'conditions' | 'pay' | 'safety' | 'general';
export type FeedbackSide = 'worker' | 'employer';
export type SyncStatus = 'pending' | 'synced' | 'failed';

/* ── Zod schemas ───────────────────────────────────────────── */
export const checkinSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  siteId: z.string().uuid(),
  teamId: z.string().uuid(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime().nullable(),
  method: z.enum(['qr', 'gps', 'manual']),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  isOvertime: z.boolean().default(false),
  overtimeMinutes: z.number().int().default(0),
  syncStatus: z.enum(['pending', 'synced', 'failed']).default('pending'),
});
export type Checkin = z.infer<typeof checkinSchema>;

export const hazardReportSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  siteId: z.string().uuid(),
  teamId: z.string().uuid(),
  description: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['submitted', 'acknowledged', 'in_progress', 'resolved', 'dismissed']).default('submitted'),
  audioUrl: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  syncStatus: z.enum(['pending', 'synced', 'failed']).default('pending'),
  createdAt: z.string().datetime(),
});
export type HazardReport = z.infer<typeof hazardReportSchema>;

export const feedbackThreadSchema = z.object({
  id: z.string().uuid(),
  tokenHash: z.string(),
  teamId: z.string().uuid(),
  category: z.enum(['manager', 'conditions', 'pay', 'safety', 'general']),
  rating: z.number().int().min(1).max(5),
  createdAt: z.string().datetime(),
});
export type FeedbackThread = z.infer<typeof feedbackThreadSchema>;

export const feedbackMessageSchema = z.object({
  id: z.string().uuid(),
  threadId: z.string().uuid(),
  fromSide: z.enum(['worker', 'employer']),
  body: z.string().min(1),
  sentiment: z.number().min(-1).max(1).nullable().optional(),
  createdAt: z.string().datetime(),
});
export type FeedbackMessage = z.infer<typeof feedbackMessageSchema>;

/* ── Domain interfaces ─────────────────────────────────────── */
export interface Organization {
  id: string;
  name: string;
  sectorId: SectorId;
  overtimeThresholdMinutes: number;
  overtimeMultiplier: number;
  createdAt: string;
}

export interface Site {
  id: string;
  orgId: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  qrCode: string;
  createdAt: string;
}

export interface Team {
  id: string;
  siteId: string;
  orgId: string;
  name: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  authId: string;
  orgId: string;
  siteId: string;
  teamId: string;
  role: UserRole;
  fullName: string;
  preferredLang: string;
  hourlyRate: number;
  createdAt: string;
}

export interface Payslip {
  id: string;
  profileId: string;
  periodStart: string;
  periodEnd: string;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  overtimeRate: number;
  grossPay: number;
  deductions: PayslipDeduction[];
  netPay: number;
  currency: string;
  createdAt: string;
}

export interface PayslipDeduction {
  label: string;
  amount: number;
  descriptionKey: string;
}

export interface ReportEvent {
  id: string;
  reportId: string;
  status: HazardStatus;
  note: string;
  createdAt: string;
}

/* ── Outbox for offline sync ───────────────────────────────── */
export interface OutboxItem {
  id?: number;
  table: string;
  payload: Record<string, unknown>;
  clientId: string;
  retries: number;
  lastAttempt: string | null;
  createdAt: string;
}
