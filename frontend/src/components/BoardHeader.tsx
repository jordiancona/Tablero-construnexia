import React from 'react';
import { Search, Plus, Trash2, Columns, Layers, UserCheck, Users } from 'lucide-react';
import { Board, UserSummary } from '../types/kanban';

interface BoardHeaderProps {
  board: Board;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddColumnClick: () => void;
  onDeleteBoardClick: () => void;
  users: UserSummary[];
  selectedAssigneeFilter: string;
  onAssigneeFilterChange: (assigneeId: string) => void;
  currentUserId?: string;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  searchQuery,
  onSearchChange,
  onAddColumnClick,
  onDeleteBoardClick,
  users,
  selectedAssigneeFilter,
  onAssigneeFilterChange,
  currentUserId,
}) => {
  const totalTasks = board.columns.reduce((acc, col) => acc + col.tasks.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 shadow-xl">
        {/* Title and stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">{board.title}</h2>
            <button
              onClick={onDeleteBoardClick}
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
              title="Eliminar este tablero"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">{board.description || 'Sin descripción'}</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400 pt-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50">
              <Columns className="w-3.5 h-3.5 text-indigo-400" />
              {board.columns.length} Columnas
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              {totalTasks} Tareas
            </span>
          </div>
        </div>

        {/* Search, Assignee Filter & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Filter: Mis Tareas vs Todas */}
          {currentUserId && (
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onAssigneeFilterChange('ALL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedAssigneeFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Todas</span>
              </button>
              <button
                onClick={() => onAssigneeFilterChange(currentUserId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedAssigneeFilter === currentUserId
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mis Tareas</span>
              </button>
            </div>
          )}

          {/* Selector de responsable específico */}
          <div className="relative">
            <select
              value={selectedAssigneeFilter}
              onChange={(e) => onAssigneeFilterChange(e.target.value)}
              className="bg-slate-950/80 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-inner pr-8"
            >
              <option value="ALL">👥 Todos los Responsables</option>
              <option value="UNASSIGNED">👤 Sin Asignar</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  👤 {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar tarea..."
              className="w-full bg-slate-950/80 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500 shadow-inner"
            />
          </div>

          <button
            onClick={onAddColumnClick}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 transition-all hover:border-slate-600 shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Agregar Columna</span>
          </button>
        </div>
      </div>
    </div>
  );
};
