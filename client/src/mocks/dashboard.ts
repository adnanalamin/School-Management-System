import type { DashboardData } from '@/features/dashboard/types';

/** SAMPLE DATA: illustrative figures. Dates are relative to now so the demo never looks stale. */
export function getDashboardSample(now: number = Date.now()): DashboardData {
  const minute = 60_000;
  const day = 86_400_000;
  const isoDay = (offset: number) => new Date(now + offset * day).toISOString();

  return {
    stats: [
      { id: 'students', label: 'Enrolled students', value: 1248, format: 'integer', deltaPercent: 3.2, comparison: 'vs last term' },
      { id: 'teachers', label: 'Teaching staff', value: 86, format: 'integer', deltaPercent: 1.2, comparison: 'vs last term' },
      { id: 'attendance', label: 'Attendance today', value: 94.2, format: 'percent', deltaPercent: -0.8, comparison: 'vs yesterday' },
      { id: 'fees', label: 'Fees collected', value: 87.5, format: 'percent', deltaPercent: 4.6, comparison: 'of term total' },
    ],
    attendance: {
      targetRate: 92,
      week: [
        { label: 'Mon', rate: 95.1 },
        { label: 'Tue', rate: 94.6 },
        { label: 'Wed', rate: 93.2 },
        { label: 'Thu', rate: 95.4 },
        { label: 'Fri', rate: 91.8 },
      ],
      month: [
        { label: 'Week 1', rate: 93.9 },
        { label: 'Week 2', rate: 94.8 },
        { label: 'Week 3', rate: 92.4 },
        { label: 'Week 4', rate: 94.2 },
      ],
    },
    feeCollection: [
      { group: 'Grade 6', collectedPercent: 92 },
      { group: 'Grade 7', collectedPercent: 89 },
      { group: 'Grade 8', collectedPercent: 85 },
      { group: 'Grade 9', collectedPercent: 81 },
      { group: 'Grade 10', collectedPercent: 76 },
    ],
    activity: [
      { id: 'a1', actor: 'Ms. Karim', action: 'submitted attendance for', target: 'Grade 7 A', occurredAt: now - 8 * minute },
      { id: 'a2', actor: 'Accounts office', action: 'recorded 14 payments in', target: 'Term 2 fees', occurredAt: now - 47 * minute },
      { id: 'a3', actor: 'Mr. Hossain', action: 'uploaded marks for', target: 'Grade 9 Mathematics', occurredAt: now - 3 * 60 * minute },
      { id: 'a4', actor: 'Admissions', action: 'approved', target: '3 new applications', occurredAt: now - 6 * 60 * minute },
      { id: 'a5', actor: 'Ms. Akter', action: 'published notice', target: 'Science fair schedule', occurredAt: now - 27 * 60 * minute },
    ],
    events: [
      { id: 'e1', title: 'Mid-term examinations begin', date: isoDay(3), category: 'exam' },
      { id: 'e2', title: 'Parent–teacher meeting', date: isoDay(6), category: 'meeting' },
      { id: 'e3', title: 'Science fair', date: isoDay(11), category: 'event' },
      { id: 'e4', title: 'National holiday: school closed', date: isoDay(14), category: 'holiday' },
    ],
  };
}
