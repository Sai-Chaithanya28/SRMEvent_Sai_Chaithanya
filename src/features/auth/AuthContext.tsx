import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, SectorId } from '@/shared/types';
import { getSectorConfig } from '@/config/sectors';

export interface UserSession {
  id: string;
  authId: string;
  role: UserRole;
  sectorId: SectorId;
  fullName: string;
  email: string;
  teamId: string;
  teamName: string;
  siteId: string;
  siteName: string;
  orgId: string;
  orgName: string;
  hourlyRate: number;
}

export const DEMO_USERS: Record<string, UserSession> = {
  'worker-construction': {
    id: 'w-c-001',
    authId: 'auth-w-c-001',
    role: 'worker',
    sectorId: 'construction',
    fullName: 'Ramesh Kumar',
    email: 'ramesh.worker@fairshift.demo',
    teamId: 'team-const-alpha',
    teamName: 'Crew Alpha (Concrete & Foundation)',
    siteId: 'site-metro-01',
    siteName: 'Metro Phase 4 - Station North',
    orgId: 'org-infra-ltd',
    orgName: 'National Infrastructure Ltd',
    hourlyRate: 150, // ₹150/hr
  },
  'employer-construction': {
    id: 'e-c-001',
    authId: 'auth-e-c-001',
    role: 'employer',
    sectorId: 'construction',
    fullName: 'Vikram Singh',
    email: 'vikram.supervisor@fairshift.demo',
    teamId: 'team-const-alpha',
    teamName: 'Site Supervisory Team',
    siteId: 'site-metro-01',
    siteName: 'Metro Phase 4 - Station North',
    orgId: 'org-infra-ltd',
    orgName: 'National Infrastructure Ltd',
    hourlyRate: 350,
  },
  'worker-college': {
    id: 'w-col-001',
    authId: 'auth-w-col-001',
    role: 'worker',
    sectorId: 'college',
    fullName: 'Ananya Sharma',
    email: 'ananya.staff@fairshift.demo',
    teamId: 'team-col-labs',
    teamName: 'Lab Support & Tech Unit',
    siteId: 'site-univ-main',
    siteName: 'SRM Tech Campus - Main Block',
    orgId: 'org-srm-edu',
    orgName: 'SRM Institute of Science & Tech',
    hourlyRate: 180, // ₹180/hr
  },
  'employer-college': {
    id: 'e-col-001',
    authId: 'auth-e-col-001',
    role: 'employer',
    sectorId: 'college',
    fullName: 'Dr. K. Narayanan',
    email: 'narayanan.admin@fairshift.demo',
    teamId: 'team-col-admin',
    teamName: 'Campus Operations & Safety Board',
    siteId: 'site-univ-main',
    siteName: 'SRM Tech Campus - Main Block',
    orgId: 'org-srm-edu',
    orgName: 'SRM Institute of Science & Tech',
    hourlyRate: 450,
  },
};

interface AuthContextType {
  user: UserSession | null;
  sectorId: SectorId;
  loginDemo: (key: keyof typeof DEMO_USERS) => void;
  loginAs: (role: UserRole, sector: SectorId, name?: string) => void;
  setSector: (sector: SectorId) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'fairshift_active_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to worker construction for immediate mobile prototype testing
    return DEMO_USERS['worker-construction'];
  });

  const [sectorId, setSectorState] = useState<SectorId>(() => {
    return user ? user.sectorId : 'construction';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setSectorState(user.sectorId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const loginDemo = (key: keyof typeof DEMO_USERS) => {
    const selected = DEMO_USERS[key];
    if (selected) {
      setUser(selected);
      setSectorState(selected.sectorId);
    }
  };

  const loginAs = (role: UserRole, sector: SectorId, name?: string) => {
    const key = `${role}-${sector}` as keyof typeof DEMO_USERS;
    if (DEMO_USERS[key]) {
      const base = DEMO_USERS[key];
      setUser(name ? { ...base, fullName: name } : base);
      setSectorState(sector);
    } else {
      const config = getSectorConfig(sector);
      const newUser: UserSession = {
        id: `user-${Date.now()}`,
        authId: `auth-${Date.now()}`,
        role,
        sectorId: sector,
        fullName: name || (role === 'worker' ? 'Demo Worker' : 'Demo Employer'),
        email: `${role}.${sector}@fairshift.demo`,
        teamId: `team-${sector}-1`,
        teamName: config.sampleTeams[0],
        siteId: `site-${sector}-1`,
        siteName: `${config.name} Primary Site`,
        orgId: `org-${sector}-1`,
        orgName: `Organization (${config.name})`,
        hourlyRate: role === 'worker' ? 150 : 350,
      };
      setUser(newUser);
      setSectorState(sector);
    }
  };

  const setSector = (sector: SectorId) => {
    setSectorState(sector);
    if (user) {
      // switch role to matching sector
      const key = `${user.role}-${sector}` as keyof typeof DEMO_USERS;
      if (DEMO_USERS[key]) {
        setUser(DEMO_USERS[key]);
      } else {
        setUser((prev) => (prev ? { ...prev, sectorId: sector } : null));
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, sectorId, loginDemo, loginAs, setSector, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
