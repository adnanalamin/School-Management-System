export type StatId = 'students' | 'teachers' | 'attendance' | 'fees';

export interface DashboardStat {
  id: StatId;
  label: string;
  value: number;
  format: 'integer' | 'percent';
  deltaPercent: number;
  comparison: string;
}

export interface AttendancePoint {
  label: string;
  rate: number;
}

export interface FeeCollectionGroup {
  group: string;
  collectedPercent: number;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  occurredAt: number;
}

export type EventCategory = 'exam' | 'holiday' | 'meeting' | 'event';

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  category: EventCategory;
}

export interface DashboardData {
  stats: DashboardStat[];
  attendance: { week: AttendancePoint[]; month: AttendancePoint[]; targetRate: number };
  feeCollection: FeeCollectionGroup[];
  activity: ActivityItem[];
  events: UpcomingEvent[];
}
