import { SectorId } from '@/shared/types';

export interface SectorConfig {
  id: SectorId;
  name: string;
  workerLabel: string;
  supervisorLabel: string;
  siteLabel: string;
  teamLabel: string;
  defaultShiftMinutes: number;
  overtimeThresholdMinutes: number;
  overtimeMultiplier: number;
  hazardPresets: Array<{ id: string; label: string; severity: 'low' | 'medium' | 'high' | 'critical' }>;
  sampleTeams: string[];
  sampleRoles: string[];
}

export const SECTOR_CONFIGS: Record<SectorId, SectorConfig> = {
  construction: {
    id: 'construction',
    name: 'Construction Site',
    workerLabel: 'Tradesperson / Laborer',
    supervisorLabel: 'Site Foreman / Supervisor',
    siteLabel: 'Project Site',
    teamLabel: 'Trade Crew',
    defaultShiftMinutes: 480, // 8 hours
    overtimeThresholdMinutes: 480,
    overtimeMultiplier: 1.5,
    hazardPresets: [
      { id: 'scaffold', label: 'Unstable Scaffolding / Fall Risk', severity: 'critical' },
      { id: 'ppe', label: 'Missing Safety Helmets or Boots', severity: 'high' },
      { id: 'electrical', label: 'Exposed High-Voltage Cable', severity: 'critical' },
      { id: 'excavation', label: 'Unshored Trench / Cave-in Risk', severity: 'critical' },
      { id: 'heat', label: 'Inadequate Drinking Water / Heat Stress', severity: 'medium' },
      { id: 'noise', label: 'Extreme Dust or Noise Without Protection', severity: 'low' },
    ],
    sampleTeams: ['Crew Alpha (Concrete & Foundation)', 'Crew Beta (Steel & Structure)', 'Crew Gamma (Finishing & Masonry)'],
    sampleRoles: ['Mason', 'Carpenter', 'Rebar Tier', 'General Laborer', 'Equipment Operator'],
  },
  college: {
    id: 'college',
    name: 'College Campus',
    workerLabel: 'Campus Staff / Technician',
    supervisorLabel: 'Facility Manager / Head of Dept',
    siteLabel: 'Campus / Building',
    teamLabel: 'Department Unit',
    defaultShiftMinutes: 480, // 8 hours
    overtimeThresholdMinutes: 480,
    overtimeMultiplier: 1.5,
    hazardPresets: [
      { id: 'wet_floor', label: 'Slippery Hallway / Unmarked Spill', severity: 'medium' },
      { id: 'lab_chemical', label: 'Chemical Fume / Acid Leak in Lab', severity: 'critical' },
      { id: 'fire_exit', label: 'Blocked Fire Exit Door', severity: 'high' },
      { id: 'wiring', label: 'Damaged Classroom Wiring / Switch', severity: 'high' },
      { id: 'lighting', label: 'Poor Night Pathway Lighting', severity: 'medium' },
      { id: 'ventilation', label: 'Basement Ventilation Failure', severity: 'low' },
    ],
    sampleTeams: ['Facilities & Sanitation', 'Lab Support & Tech', 'Campus Security & Gate', 'Cafeteria & Dining Services'],
    sampleRoles: ['Lab Assistant', 'Sanitation Staff', 'Security Guard', 'Maintenance Electrician', 'Gardener'],
  },
};

export function getSectorConfig(sectorId: SectorId = 'construction'): SectorConfig {
  return SECTOR_CONFIGS[sectorId] || SECTOR_CONFIGS.construction;
}
