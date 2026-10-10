export interface AttendeeRole {
  id: string;
  name: string;
  hourlyRate: number;
  count: number;
  color?: string;
  isCustom?: boolean;
}

export interface MeetingPreset {
  id: string;
  name: string;
  description: string;
  roles: { roleId: string; count: number }[];
}

export interface OpportunityCost {
  id: string;
  name: string;
  unitCost: number;
  unitLabel: string;
  emoji: string;
  category: 'office' | 'infra' | 'hardware' | 'wellness' | 'perks';
}

export interface ChartPoint {
  timeSec: number;
  cost: number;
  burnRatePerHour: number;
}

export interface MeetingAuditRecord {
  id: string;
  title: string;
  date: string;
  durationSeconds: number;
  totalCost: number;
  avgCostPerMinute: number;
  totalAttendees: number;
  combinedHourlyRate: number;
  attendeesSnapshot: { name: string; count: number; hourlyRate: number }[];
  topOpportunityCost: string;
}
