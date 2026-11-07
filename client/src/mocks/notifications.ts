/** SAMPLE DATA: replaced by the notifications API in a later phase. */
export type NotificationKind = 'attendance' | 'fees' | 'exam' | 'system';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

const MINUTE = 60_000;

export function getSampleNotifications(now: number = Date.now()): AppNotification[] {
  return [
    { id: 'n1', kind: 'attendance', title: 'Attendance not submitted', body: 'Grade 8 B has no attendance recorded for this morning.', createdAt: now - 12 * MINUTE, read: false },
    { id: 'n2', kind: 'fees', title: 'Fee reminders sent', body: '42 reminders were delivered to guardians for the term balance.', createdAt: now - 95 * MINUTE, read: false },
    { id: 'n3', kind: 'exam', title: 'Mid-term timetable published', body: 'The schedule is now visible to students and teachers.', createdAt: now - 5 * 60 * MINUTE, read: false },
    { id: 'n4', kind: 'system', title: 'Scheduled maintenance', body: 'Brief downtime is planned on Saturday at 02:00.', createdAt: now - 26 * 60 * MINUTE, read: true },
    { id: 'n5', kind: 'fees', title: 'Payment reconciled', body: 'Yesterday’s collections were matched to student accounts.', createdAt: now - 2 * 24 * 60 * MINUTE, read: true },
  ];
}
