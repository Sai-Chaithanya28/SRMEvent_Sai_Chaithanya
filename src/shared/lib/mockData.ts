import { Checkin, HazardReport, FeedbackThread, FeedbackMessage, Payslip } from '@/shared/types';

export const INITIAL_CHECKINS: Checkin[] = [
  // Construction Worker (Ramesh Kumar - id: w-c-001)
  {
    id: 'chk-c-001',
    profileId: 'w-c-001',
    siteId: 'site-metro-01',
    teamId: 'team-const-alpha',
    checkIn: new Date(Date.now() - 6 * 86400000 + 8 * 3600000).toISOString(),
    checkOut: new Date(Date.now() - 6 * 86400000 + 17 * 3600000).toISOString(), // 9 hrs -> 1 hr OT
    method: 'qr',
    lat: 28.6139,
    lng: 77.209,
    isOvertime: true,
    overtimeMinutes: 60,
    syncStatus: 'synced',
  },
  {
    id: 'chk-c-002',
    profileId: 'w-c-001',
    siteId: 'site-metro-01',
    teamId: 'team-const-alpha',
    checkIn: new Date(Date.now() - 5 * 86400000 + 8 * 3600000).toISOString(),
    checkOut: new Date(Date.now() - 5 * 86400000 + 16 * 3600000).toISOString(), // 8 hrs
    method: 'gps',
    lat: 28.6141,
    lng: 77.2092,
    isOvertime: false,
    overtimeMinutes: 0,
    syncStatus: 'synced',
  },
  {
    id: 'chk-c-003',
    profileId: 'w-c-001',
    siteId: 'site-metro-01',
    teamId: 'team-const-alpha',
    checkIn: new Date(Date.now() - 4 * 86400000 + 8 * 3600000).toISOString(),
    checkOut: new Date(Date.now() - 4 * 86400000 + 18 * 3600000).toISOString(), // 10 hrs -> 2 hrs OT
    method: 'qr',
    lat: 28.6139,
    lng: 77.209,
    isOvertime: true,
    overtimeMinutes: 120,
    syncStatus: 'synced',
  },
  {
    id: 'chk-c-004',
    profileId: 'w-c-001',
    siteId: 'site-metro-01',
    teamId: 'team-const-alpha',
    checkIn: new Date(Date.now() - 3 * 86400000 + 8 * 3600000).toISOString(),
    checkOut: new Date(Date.now() - 3 * 86400000 + 16 * 3600000).toISOString(), // 8 hrs
    method: 'manual',
    lat: null,
    lng: null,
    isOvertime: false,
    overtimeMinutes: 0,
    syncStatus: 'synced',
  },
  {
    id: 'chk-c-005',
    profileId: 'w-c-001',
    siteId: 'site-metro-01',
    teamId: 'team-const-alpha',
    checkIn: new Date(Date.now() - 2 * 86400000 + 8 * 3600000).toISOString(),
    checkOut: new Date(Date.now() - 2 * 86400000 + 17 * 3600000 + 30 * 60000).toISOString(), // 9.5 hrs
    method: 'qr',
    lat: 28.6139,
    lng: 77.209,
    isOvertime: true,
    overtimeMinutes: 90,
    syncStatus: 'synced',
  },
  // College Worker (Ananya Sharma - id: w-col-001)
  {
    id: 'chk-col-001',
    profileId: 'w-col-001',
    siteId: 'site-univ-main',
    teamId: 'team-col-labs',
    checkIn: new Date(Date.now() - 3 * 86400000 + 9 * 3600000).toISOString(),
    checkOut: new Date(Date.now() - 3 * 86400000 + 17 * 3600000).toISOString(), // 8 hrs
    method: 'qr',
    lat: 12.823,
    lng: 80.045,
    isOvertime: false,
    overtimeMinutes: 0,
    syncStatus: 'synced',
  },
  {
    id: 'chk-col-002',
    profileId: 'w-col-001',
    siteId: 'site-univ-main',
    teamId: 'team-col-labs',
    checkIn: new Date(Date.now() - 2 * 86400000 + 9 * 3600000).toISOString(),
    checkOut: new Date(Date.now() - 2 * 86400000 + 18 * 3600000 + 30 * 60000).toISOString(), // 9.5 hrs -> 1.5 hrs OT
    method: 'gps',
    lat: 12.8231,
    lng: 80.0451,
    isOvertime: true,
    overtimeMinutes: 90,
    syncStatus: 'synced',
  },
];

export const INITIAL_PAYSLIPS: Payslip[] = [
  {
    id: 'pay-c-001',
    profileId: 'w-c-001',
    periodStart: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    periodEnd: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    regularHours: 192, // 24 days * 8 hrs
    overtimeHours: 28.5,
    hourlyRate: 150,
    overtimeRate: 225, // 1.5x
    grossPay: 192 * 150 + 28.5 * 225, // 28800 + 6412.5 = 35212.5
    currency: '₹',
    deductions: [
      { label: 'Provident Fund (PF - 12%)', amount: 3456, descriptionKey: 'deductions.pf_desc' },
      { label: 'Employee State Insurance (ESI - 0.75%)', amount: 264, descriptionKey: 'deductions.esi_desc' },
      { label: 'Professional Tax', amount: 200, descriptionKey: 'deductions.professional_tax_desc' },
    ],
    netPay: 35212.5 - (3456 + 264 + 200), // ₹31,292.5
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'pay-col-001',
    profileId: 'w-col-001',
    periodStart: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    periodEnd: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    regularHours: 176,
    overtimeHours: 14,
    hourlyRate: 180,
    overtimeRate: 270, // 1.5x
    grossPay: 176 * 180 + 14 * 270, // 31680 + 3780 = 35460
    currency: '₹',
    deductions: [
      { label: 'Provident Fund (PF - 12%)', amount: 3801, descriptionKey: 'deductions.pf_desc' },
      { label: 'Employee State Insurance (ESI - 0.75%)', amount: 265, descriptionKey: 'deductions.esi_desc' },
      { label: 'Professional Tax', amount: 200, descriptionKey: 'deductions.professional_tax_desc' },
    ],
    netPay: 35460 - (3801 + 265 + 200),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const INITIAL_HAZARDS: (HazardReport & { notes?: Array<{ id: string; author: string; text: string; time: string }> })[] = [
  {
    id: 'hz-c-001',
    profileId: 'w-c-001',
    siteId: 'site-metro-01',
    teamId: 'team-const-alpha',
    description: 'Scaffold planks on the 3rd floor north wing are missing safety locking pins. Immediate danger of slip and fall.',
    severity: 'critical',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    syncStatus: 'synced',
    notes: [
      {
        id: 'note-1',
        author: 'Vikram Singh (Supervisor)',
        text: 'Inspected this morning. Red safety tape cordoned off the area. Scaffolding vendor summoned to install pins today.',
        time: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 'hz-c-002',
    profileId: 'w-c-001',
    siteId: 'site-metro-01',
    teamId: 'team-const-alpha',
    description: 'Submersible water pump cable insulation is frayed near waterlogged trench near Pillar 14.',
    severity: 'high',
    status: 'resolved',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    syncStatus: 'synced',
    notes: [
      {
        id: 'note-2',
        author: 'Vikram Singh (Supervisor)',
        text: 'Electrical crew replaced the faulty wiring with industrial weatherproof armoured cable.',
        time: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 'hz-col-001',
    profileId: 'w-col-001',
    siteId: 'site-univ-main',
    teamId: 'team-col-labs',
    description: 'Fume hood exhaust motor in Organic Chemistry Lab 204 is making grinding noise and suction velocity has dropped below safe threshold.',
    severity: 'high',
    status: 'acknowledged',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    syncStatus: 'synced',
    notes: [
      {
        id: 'note-3',
        author: 'Dr. K. Narayanan (Facility Director)',
        text: 'Maintenance request #CHEM-884 dispatched to ventilation technician. Lab warned not to use volatile reagents until cleared.',
        time: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
    ],
  },
];

// Seed anonymous feedback threads (keyed by device token hash - NO user_id!)
export const SEED_ANONYMOUS_THREADS: {
  thread: FeedbackThread;
  messages: FeedbackMessage[];
}[] = [
  // Construction team threads (5 responses to reach the threshold!)
  {
    thread: {
      id: 'fb-th-c-1',
      tokenHash: 'tok-hash-demo-device-01',
      teamId: 'team-const-alpha',
      category: 'safety',
      rating: 4,
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    messages: [
      {
        id: 'fb-msg-c-1a',
        threadId: 'fb-th-c-1',
        fromSide: 'worker',
        body: 'Drinking water dispenser near Gate 2 is often empty by 2 PM in this heat.',
        sentiment: -0.4,
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
      {
        id: 'fb-msg-c-1b',
        threadId: 'fb-th-c-1',
        fromSide: 'employer',
        body: 'Thank you for speaking up. We have doubled the water refill schedule to 11 AM and 2 PM daily starting today.',
        sentiment: 0.8,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ],
  },
  {
    thread: {
      id: 'fb-th-c-2',
      tokenHash: 'tok-hash-anon-random-02',
      teamId: 'team-const-alpha',
      category: 'manager',
      rating: 4,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    messages: [
      {
        id: 'fb-msg-c-2a',
        threadId: 'fb-th-c-2',
        fromSide: 'worker',
        body: 'Supervisor Vikram explains the safety protocols clearly during morning briefing.',
        sentiment: 0.7,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ],
  },
  {
    thread: {
      id: 'fb-th-c-3',
      tokenHash: 'tok-hash-anon-random-03',
      teamId: 'team-const-alpha',
      category: 'pay',
      rating: 4,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    messages: [
      {
        id: 'fb-msg-c-3a',
        threadId: 'fb-th-c-3',
        fromSide: 'worker',
        body: 'Overtime hours were accurately shown in this month slip. Much clearer than our old paper cards.',
        sentiment: 0.9,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ],
  },
  {
    thread: {
      id: 'fb-th-c-4',
      tokenHash: 'tok-hash-anon-random-04',
      teamId: 'team-const-alpha',
      category: 'conditions',
      rating: 3,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    messages: [
      {
        id: 'fb-msg-c-4a',
        threadId: 'fb-th-c-4',
        fromSide: 'worker',
        body: 'Break shelter has very few benches for the afternoon rest hour.',
        sentiment: -0.2,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
  },
  {
    thread: {
      id: 'fb-th-c-5',
      tokenHash: 'tok-hash-anon-random-05',
      teamId: 'team-const-alpha',
      category: 'safety',
      rating: 4,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    messages: [
      {
        id: 'fb-msg-c-5a',
        threadId: 'fb-th-c-5',
        fromSide: 'worker',
        body: 'New safety boots provided are good quality and fit well.',
        sentiment: 0.8,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
  },
  // College Campus feedback (only 2 responses so far -> less than 5 -> triggers threshold protection rule!)
  {
    thread: {
      id: 'fb-th-col-1',
      tokenHash: 'tok-hash-demo-device-01',
      teamId: 'team-col-labs',
      category: 'conditions',
      rating: 4,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    messages: [
      {
        id: 'fb-msg-col-1a',
        threadId: 'fb-th-col-1',
        fromSide: 'worker',
        body: 'AC filter in the central preparation room needs periodic cleaning.',
        sentiment: 0.0,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'fb-msg-col-1b',
        threadId: 'fb-th-col-1',
        fromSide: 'employer',
        body: 'Noted. Scheduled with facilities maintenance for every first Saturday of the month.',
        sentiment: 0.6,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
  },
  {
    thread: {
      id: 'fb-th-col-2',
      tokenHash: 'tok-hash-anon-random-07',
      teamId: 'team-col-labs',
      category: 'manager',
      rating: 5,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    messages: [
      {
        id: 'fb-msg-col-2a',
        threadId: 'fb-th-col-2',
        fromSide: 'worker',
        body: 'Department head is supportive of flexible shift arrangements during exam weeks.',
        sentiment: 0.9,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
  },
];
