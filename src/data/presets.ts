import { AttendeeRole, MeetingPreset, OpportunityCost } from '../types';

export const DEFAULT_ROLES: AttendeeRole[] = [
  { id: 'jr-eng', name: 'Junior Engineer', hourlyRate: 50, count: 1, color: '#38BDF8' },
  { id: 'sr-eng', name: 'Senior Engineer', hourlyRate: 110, count: 2, color: '#10B981' },
  { id: 'eng-mgr', name: 'Engineering Manager', hourlyRate: 140, count: 1, color: '#A855F7' },
  { id: 'prod-mgr', name: 'Product Manager', hourlyRate: 95, count: 1, color: '#F59E0B' },
  { id: 'exec', name: 'Executive', hourlyRate: 220, count: 0, color: '#EC4899' },
];

export const MEETING_TEMPLATES: MeetingPreset[] = [
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    description: '1 EM, 1 PM, 3 Senior Engineers, 2 Junior Engineers',
    roles: [
      { roleId: 'jr-eng', count: 2 },
      { roleId: 'sr-eng', count: 3 },
      { roleId: 'eng-mgr', count: 1 },
      { roleId: 'prod-mgr', count: 1 },
      { roleId: 'exec', count: 0 },
    ],
  },
  {
    id: 'all-hands',
    name: 'Department All-Hands',
    description: '2 Execs, 3 EMs, 10 Senior Engineers, 6 Junior Engineers, 2 PMs',
    roles: [
      { roleId: 'jr-eng', count: 6 },
      { roleId: 'sr-eng', count: 10 },
      { roleId: 'eng-mgr', count: 3 },
      { roleId: 'prod-mgr', count: 2 },
      { roleId: 'exec', count: 2 },
    ],
  },
  {
    id: '1on1-sync',
    name: '1-on-1 Sync',
    description: '1 EM + 1 Senior Engineer',
    roles: [
      { roleId: 'jr-eng', count: 0 },
      { roleId: 'sr-eng', count: 1 },
      { roleId: 'eng-mgr', count: 1 },
      { roleId: 'prod-mgr', count: 0 },
      { roleId: 'exec', count: 0 },
    ],
  },
  {
    id: 'exec-review',
    name: 'Leadership & Architecture Review',
    description: '2 Executives, 2 Engineering Managers, 2 Senior Engineers',
    roles: [
      { roleId: 'jr-eng', count: 0 },
      { roleId: 'sr-eng', count: 2 },
      { roleId: 'eng-mgr', count: 2 },
      { roleId: 'prod-mgr', count: 1 },
      { roleId: 'exec', count: 2 },
    ],
  },
  {
    id: 'quick-standup',
    name: 'Standup (Fast)',
    description: '1 PM, 2 Senior Engineers, 1 Junior Engineer',
    roles: [
      { roleId: 'jr-eng', count: 1 },
      { roleId: 'sr-eng', count: 2 },
      { roleId: 'eng-mgr', count: 0 },
      { roleId: 'prod-mgr', count: 1 },
      { roleId: 'exec', count: 0 },
    ],
  },
];

export const OPPORTUNITY_COSTS: OpportunityCost[] = [
  {
    id: 'specialty-coffee',
    name: 'Specialty Pour-Over Coffees',
    unitCost: 6.50,
    unitLabel: 'cups',
    emoji: '☕',
    category: 'perks',
  },
  {
    id: 'aws-hosting',
    name: 'Months of AWS Cloud Hosting',
    unitCost: 120.00,
    unitLabel: 'months',
    emoji: '☁️',
    category: 'infra',
  },
  {
    id: 'pizza-lunch',
    name: 'Artisan Team Pizza Orders',
    unitCost: 45.00,
    unitLabel: 'pies',
    emoji: '🍕',
    category: 'perks',
  },
  {
    id: 'claude-sub',
    name: 'Months of Claude / AI Pro Subs',
    unitCost: 20.00,
    unitLabel: 'licenses',
    emoji: '⚡',
    category: 'infra',
  },
  {
    id: 'airpods-max',
    name: 'Noise-Canceling AirPods Max',
    unitCost: 549.00,
    unitLabel: 'headphones',
    emoji: '🎧',
    category: 'hardware',
  },
  {
    id: 'macbook-pro',
    name: 'M3 Pro 16" MacBook Pros',
    unitCost: 2499.00,
    unitLabel: 'laptops',
    emoji: '💻',
    category: 'hardware',
  },
  {
    id: 'tech-books',
    name: "Hardcover O'Reilly Tech Books",
    unitCost: 59.00,
    unitLabel: 'volumes',
    emoji: '📚',
    category: 'office',
  },
  {
    id: 'aeron-chair',
    name: 'Herman Miller Ergonomic Chairs',
    unitCost: 1450.00,
    unitLabel: 'chairs',
    emoji: '🪑',
    category: 'office',
  },
  {
    id: 'flight-conf',
    name: 'Round-trip Tech Conference Flights',
    unitCost: 650.00,
    unitLabel: 'flights',
    emoji: '✈️',
    category: 'wellness',
  },
];
