export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  order: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  boardId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  boardId: string;
  createdAt: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string | null;
  columns: Column[];
  activities?: ActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export type DndId = string | number;
