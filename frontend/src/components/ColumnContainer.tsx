import React, { useMemo } from 'react';
import { useSortable, SortableContext } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { Column, Task } from '../types/kanban';
import { TaskCard } from './TaskCard';

interface ColumnContainerProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  isOverlay?: boolean;
}

export const ColumnContainer: React.FC<ColumnContainerProps> = ({
  column,
  tasks,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
  isOverlay,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-80 min-w-[20rem] max-w-[20rem] h-[650px] rounded-2xl bg-indigo-950/20 border-2 border-dashed border-indigo-500/40 opacity-40"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-80 min-w-[20rem] max-w-[20rem] flex flex-col max-h-[calc(100vh-12rem)] rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/90 shadow-2xl overflow-hidden transition-all duration-200 ${
        isOverlay ? 'shadow-indigo-500/20 border-indigo-500/50 scale-105 rotate-1 z-40' : ''
      }`}
    >
      {/* Column Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="p-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing rounded"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <h3 className="text-sm font-extrabold text-slate-100 truncate tracking-tight">
            {column.title}
          </h3>

          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-indigo-400 border border-slate-700/60">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEditColumn(column)}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            title="Editar Nombre de Columna"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            title="Eliminar Columna"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px]">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs font-medium text-slate-500">Sin tareas en esta columna</p>
            <p className="text-[11px] text-slate-600">Arrastra una tarea aquí o crea una nueva</p>
          </div>
        )}
      </div>

      {/* Column Footer: Add Task Button */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90">
        <button
          onClick={() => onAddTask(column.id)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-700/50 hover:border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Tarea</span>
        </button>
      </div>
    </div>
  );
};
