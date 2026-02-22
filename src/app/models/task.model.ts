export type TaskState = 'new' | 'active' | 'resolved' | 'closed';

export interface StateHistoryEntry {
  state: TaskState;
  date: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  stateHistory: StateHistoryEntry[];
  notes: string[];
}
