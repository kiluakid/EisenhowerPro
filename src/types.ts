export type QuadrantType = 'do' | 'decide' | 'delegate' | 'delete';

export interface Task {
  id: string;
  title: string;
  notes: string;
  quadrant: QuadrantType;
  dueDate: string | null; // ISO string or null
  calendarId: string;
  createdAt: number;
}

export interface Calendar {
  id: string;
  name: string;
}

export interface AppData {
  tasks: Task[];
  calendars: Calendar[];
}
