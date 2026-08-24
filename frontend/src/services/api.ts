import axios from 'axios';
import { Board, Column, Task, ActivityLog, Priority } from '../types/kanban';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL || '') + '/api';

export const api = {
  // Tableros
  getBoards: async (): Promise<Board[]> => {
    const res = await axios.get(`${API_BASE_URL}/boards`);
    return res.data;
  },

  getBoard: async (id: string): Promise<Board> => {
    const res = await axios.get(`${API_BASE_URL}/boards/${id}`);
    return res.data;
  },

  createBoard: async (title: string, description?: string): Promise<Board> => {
    const res = await axios.post(`${API_BASE_URL}/boards`, { title, description });
    return res.data;
  },

  deleteBoard: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/boards/${id}`);
  },

  // Columnas
  createColumn: async (boardId: string, title: string): Promise<Column> => {
    const res = await axios.post(`${API_BASE_URL}/columns`, { boardId, title });
    return res.data;
  },

  updateColumn: async (id: string, title: string): Promise<Column> => {
    const res = await axios.put(`${API_BASE_URL}/columns/${id}`, { title });
    return res.data;
  },

  reorderColumns: async (boardId: string, columnOrders: { id: string; order: number }[]): Promise<void> => {
    await axios.put(`${API_BASE_URL}/columns/reorder`, { boardId, columnOrders });
  },

  deleteColumn: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/columns/${id}`);
  },

  // Tareas
  createTask: async (data: {
    title: string;
    description?: string;
    priority?: Priority;
    columnId: string;
    boardId: string;
  }): Promise<Task> => {
    const res = await axios.post(`${API_BASE_URL}/tasks`, data);
    return res.data;
  },

  updateTask: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      priority?: Priority;
      columnId?: string;
      boardId: string;
    }
  ): Promise<Task> => {
    const res = await axios.put(`${API_BASE_URL}/tasks/${id}`, data);
    return res.data;
  },

  reorderTasks: async (
    boardId: string,
    tasks: { id: string; columnId: string; order: number }[]
  ): Promise<void> => {
    await axios.put(`${API_BASE_URL}/tasks/reorder`, { boardId, tasks });
  },

  deleteTask: async (id: string, boardId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/tasks/${id}`, { params: { boardId } });
  },

  // Actividades
  getActivityLogs: async (boardId: string): Promise<ActivityLog[]> => {
    const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/activity`);
    return res.data;
  },
};
