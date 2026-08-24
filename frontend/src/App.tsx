import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { BoardHeader } from './components/BoardHeader';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskModal } from './components/TaskModal';
import { ColumnModal } from './components/ColumnModal';
import { BoardModal } from './components/BoardModal';
import { ActivitySidebar } from './components/ActivitySidebar';
import { LoginView } from './components/LoginView';
import { useSocket } from './context/SocketContext';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Board, Column, Task, ActivityLog, Priority, UserSummary } from './types/kanban';

const sampleBoard: Board = {
  id: 'board-demo-1',
  title: '🚀 Proyecto ConstruNexia Demo',
  description: 'Tablero Kanban interactivo protegido con autenticación de Google y asignación de tareas.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  columns: [
    {
      id: 'col-1',
      title: '📌 Por Hacer',
      order: 0,
      boardId: 'board-demo-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        {
          id: 'task-1',
          title: 'Configurar alertas de monitoreo',
          description: 'Webhook de integraciones con servidor de producción.',
          priority: 'LOW',
          order: 0,
          columnId: 'col-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: 'Diseñar arquitectura multitenant',
          description: 'Evaluar estrategias de aislamiento en PostgreSQL.',
          priority: 'HIGH',
          order: 1,
          columnId: 'col-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'col-2',
      title: '⚡ En Proceso',
      order: 1,
      boardId: 'board-demo-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        {
          id: 'task-3',
          title: 'Integración WebSockets Socket.io',
          description: 'Sincronización en vivo entre clientes.',
          priority: 'URGENT',
          order: 0,
          columnId: 'col-2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'col-3',
      title: '✅ Completado',
      order: 2,
      boardId: 'board-demo-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        {
          id: 'task-4',
          title: 'Autenticación con Cuentas de Google',
          description: 'OAuth 2.0 + JWT + Prisma ORM.',
          priority: 'MEDIUM',
          order: 0,
          columnId: 'col-3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ],
};

export const AppContent: React.FC = () => {
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const [boards, setBoards] = useState<Board[]>([sampleBoard]);
  const [currentBoard, setCurrentBoard] = useState<Board>(sampleBoard);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>('ALL');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);

  // Modales state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnToEdit, setColumnToEdit] = useState<Column | null>(null);

  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  const { socket, joinBoard, leaveBoard } = useSocket();

  // Cargar lista de miembros del equipo
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const uList = await api.getUsers();
      if (uList) setUsers(uList);
    } catch (err) {
      console.warn('⚠️ No se pudo obtener la lista de usuarios:', err);
    }
  }, [isAuthenticated]);

  // Cargar tableros desde la API REST
  const loadBoards = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const bList = await api.getBoards();
      if (bList && bList.length > 0) {
        setBoards(bList);
        const full = await api.getBoard(bList[0].id);
        setCurrentBoard(full);
      }
    } catch (err) {
      console.warn('⚠️ Usando estado local de demostración para el tablero.', err);
    }
  }, [isAuthenticated]);

  const fetchBoardDetails = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    try {
      const full = await api.getBoard(id);
      setCurrentBoard(full);
      const acts = await api.getActivityLogs(id);
      setActivities(acts);
    } catch (err) {
      console.warn('Error al cargar detalle de tablero:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBoards();
      fetchUsers();
    }
  }, [isAuthenticated, loadBoards, fetchUsers]);

  // Escuchar salas de Socket.io
  useEffect(() => {
    if (!currentBoard?.id || !isAuthenticated) return;
    joinBoard(currentBoard.id);

    return () => {
      leaveBoard(currentBoard.id);
    };
  }, [currentBoard?.id, isAuthenticated, joinBoard, leaveBoard]);

  // Escuchar eventos en tiempo real enviadas por Socket.io
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleTaskCreated = () => fetchBoardDetails(currentBoard.id);
    const handleTaskUpdated = () => fetchBoardDetails(currentBoard.id);
    const handleTaskDeleted = () => fetchBoardDetails(currentBoard.id);
    const handleTasksReordered = () => fetchBoardDetails(currentBoard.id);

    const handleColumnCreated = () => fetchBoardDetails(currentBoard.id);
    const handleColumnUpdated = () => fetchBoardDetails(currentBoard.id);
    const handleColumnDeleted = () => fetchBoardDetails(currentBoard.id);
    const handleColumnsReordered = () => fetchBoardDetails(currentBoard.id);

    socket.on('task_created', handleTaskCreated);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_deleted', handleTaskDeleted);
    socket.on('tasks_reordered', handleTasksReordered);

    socket.on('column_created', handleColumnCreated);
    socket.on('column_updated', handleColumnUpdated);
    socket.on('column_deleted', handleColumnDeleted);
    socket.on('columns_reordered', handleColumnsReordered);

    return () => {
      socket.off('task_created', handleTaskCreated);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_deleted', handleTaskDeleted);
      socket.off('tasks_reordered', handleTasksReordered);
      socket.off('column_created', handleColumnCreated);
      socket.off('column_updated', handleColumnUpdated);
      socket.off('column_deleted', handleColumnDeleted);
      socket.off('columns_reordered', handleColumnsReordered);
    };
  }, [socket, isAuthenticated, currentBoard.id, fetchBoardDetails]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Handlers para Tareas
  const handleOpenAddTask = (columnId: string) => {
    setTargetColumnId(columnId);
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (data: {
    title: string;
    description: string;
    priority: Priority;
    assignedToId?: string | null;
  }) => {
    const selectedUser = users.find((u) => u.id === data.assignedToId);

    if (taskToEdit) {
      try {
        await api.updateTask(taskToEdit.id, {
          title: data.title,
          description: data.description,
          priority: data.priority,
          assignedToId: data.assignedToId,
          boardId: currentBoard.id,
        });
        await fetchBoardDetails(currentBoard.id);
      } catch {
        setCurrentBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((t) =>
              t.id === taskToEdit.id
                ? {
                    ...t,
                    title: data.title,
                    description: data.description,
                    priority: data.priority,
                    assignedToId: data.assignedToId,
                    assignedToUser: selectedUser || null,
                  }
                : t
            ),
          })),
        }));
      }
    } else if (targetColumnId) {
      try {
        await api.createTask({
          title: data.title,
          description: data.description,
          priority: data.priority,
          assignedToId: data.assignedToId,
          columnId: targetColumnId,
          boardId: currentBoard.id,
        });
        await fetchBoardDetails(currentBoard.id);
      } catch {
        const newTask: Task = {
          id: `task-local-${Date.now()}`,
          title: data.title,
          description: data.description,
          priority: data.priority,
          order: 99,
          columnId: targetColumnId,
          assignedToId: data.assignedToId,
          assignedToUser: selectedUser || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCurrentBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === targetColumnId ? { ...col, tasks: [...col.tasks, newTask] } : col
          ),
        }));
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId, currentBoard.id);
      await fetchBoardDetails(currentBoard.id);
    } catch {
      setCurrentBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        })),
      }));
    }
  };

  // Handlers para Columnas
  const handleOpenAddColumn = () => {
    setColumnToEdit(null);
    setIsColumnModalOpen(true);
  };

  const handleOpenEditColumn = (column: Column) => {
    setColumnToEdit(column);
    setIsColumnModalOpen(true);
  };

  const handleSaveColumn = async (title: string) => {
    if (columnToEdit) {
      try {
        await api.updateColumn(columnToEdit.id, title);
        await fetchBoardDetails(currentBoard.id);
      } catch {
        setCurrentBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((c) => (c.id === columnToEdit.id ? { ...c, title } : c)),
        }));
      }
    } else {
      try {
        await api.createColumn(currentBoard.id, title);
        await fetchBoardDetails(currentBoard.id);
      } catch {
        const newCol: Column = {
          id: `col-local-${Date.now()}`,
          title,
          order: currentBoard.columns.length,
          boardId: currentBoard.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tasks: [],
        };
        setCurrentBoard((prev) => ({ ...prev, columns: [...prev.columns, newCol] }));
      }
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await api.deleteColumn(columnId);
      await fetchBoardDetails(currentBoard.id);
    } catch {
      setCurrentBoard((prev) => ({
        ...prev,
        columns: prev.columns.filter((c) => c.id !== columnId),
      }));
    }
  };

  const handleReorderColumns = (newColumns: Column[]) => {
    setCurrentBoard((prev) => ({ ...prev, columns: newColumns }));
    const orders = newColumns.map((col, idx) => ({ id: col.id, order: idx }));
    api.reorderColumns(currentBoard.id, orders).catch(() => {});
  };

  const handleMoveTasks = (
    boardId: string,
    taskList: { id: string; columnId: string; order: number }[]
  ) => {
    api.reorderTasks(boardId, taskList).catch(() => {});
  };

  // Tableros
  const handleSaveBoard = async (title: string, description: string) => {
    try {
      const newB = await api.createBoard(title, description);
      setBoards((prev) => [newB, ...prev]);
      setCurrentBoard(newB);
    } catch {
      const localB: Board = {
        id: `board-local-${Date.now()}`,
        title,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        columns: [
          { id: `col-1-${Date.now()}`, title: 'Por Hacer', order: 0, boardId: '', tasks: [], createdAt: '', updatedAt: '' },
          { id: `col-2-${Date.now()}`, title: 'En Proceso', order: 1, boardId: '', tasks: [], createdAt: '', updatedAt: '' },
          { id: `col-3-${Date.now()}`, title: 'Completado', order: 2, boardId: '', tasks: [], createdAt: '', updatedAt: '' },
        ],
      };
      setBoards((prev) => [localB, ...prev]);
      setCurrentBoard(localB);
    }
  };

  const handleDeleteBoard = async () => {
    if (confirm(`¿Seguro que deseas eliminar el tablero "${currentBoard.title}"?`)) {
      try {
        await api.deleteBoard(currentBoard.id);
        const updated = boards.filter((b) => b.id !== currentBoard.id);
        setBoards(updated);
        if (updated.length > 0) {
          fetchBoardDetails(updated[0].id);
        }
      } catch {
        const updated = boards.filter((b) => b.id !== currentBoard.id);
        setBoards(updated);
        if (updated.length > 0) setCurrentBoard(updated[0]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        boards={boards}
        currentBoard={currentBoard}
        onSelectBoard={(b) => {
          setCurrentBoard(b);
          fetchBoardDetails(b.id);
        }}
        onCreateBoardClick={() => setIsBoardModalOpen(true)}
        onToggleActivity={() => setIsActivityOpen((prev) => !prev)}
      />

      <BoardHeader
        board={currentBoard}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddColumnClick={handleOpenAddColumn}
        onDeleteBoardClick={handleDeleteBoard}
        users={users}
        selectedAssigneeFilter={selectedAssigneeFilter}
        onAssigneeFilterChange={setSelectedAssigneeFilter}
        currentUserId={currentUser?.id}
      />

      <main className="flex-1">
        <KanbanBoard
          board={currentBoard}
          searchQuery={searchQuery}
          selectedAssigneeFilter={selectedAssigneeFilter}
          onAddTask={handleOpenAddTask}
          onEditColumn={handleOpenEditColumn}
          onDeleteColumn={handleDeleteColumn}
          onEditTask={handleOpenEditTask}
          onDeleteTask={handleDeleteTask}
          onReorderColumns={handleReorderColumns}
          onMoveTasks={handleMoveTasks}
        />
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        users={users}
      />

      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onSave={handleSaveColumn}
        columnToEdit={columnToEdit}
      />

      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onSave={handleSaveBoard}
      />

      <ActivitySidebar
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        activities={activities}
      />
    </div>
  );
};
