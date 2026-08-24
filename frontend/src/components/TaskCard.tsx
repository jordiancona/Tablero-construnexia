import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit3, Trash2, Calendar, AlertCircle, User } from 'lucide-react';
import { Task, Priority } from '../types/kanban';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isOverlay?: boolean;
}

const priorityConfig: Record<Priority, { label: string; bg: string; text: string; border: string }> = {
  LOW: {
    label: 'Baja',
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
  },
  MEDIUM: {
    label: 'Media',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
  },
  HIGH: {
    label: 'Alta',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  URGENT: {
    label: 'Urgente',
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/40',
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityInfo = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  const formattedDate = new Date(task.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-full h-28 rounded-xl bg-indigo-950/40 border-2 border-dashed border-indigo-500/50 opacity-60"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative glass-card rounded-xl p-4 transition-all duration-200 cursor-default select-none ${
        isOverlay ? 'shadow-2xl shadow-indigo-500/30 border-indigo-500/60 rotate-2 scale-105 z-50 bg-slate-900' : ''
      }`}
    >
      {/* Top row: Priority badge + Drag handle + Actions */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
        >
          {task.priority === 'URGENT' && <AlertCircle className="w-3 h-3 animate-pulse" />}
          {priorityInfo.label}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
            title="Editar Tarea"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
            title="Eliminar Tarea"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div
            {...attributes}
            {...listeners}
            className="p-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing rounded"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Task Content */}
      <h4 className="text-sm font-bold text-slate-100 mb-1 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer info: Date & Assigned user */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 mt-2">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          {formattedDate}
        </span>

        {task.assignedToUser ? (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300"
            title={`Asignado a: ${task.assignedToUser.name} (${task.assignedToUser.email})`}
          >
            {task.assignedToUser.avatar ? (
              <img
                src={task.assignedToUser.avatar}
                alt={task.assignedToUser.name}
                className="w-4 h-4 rounded-full"
              />
            ) : (
              <User className="w-3 h-3 text-indigo-400" />
            )}
            <span className="text-[10px] font-bold max-w-[80px] truncate">
              {task.assignedToUser.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-slate-600">Sin asignar</span>
        )}
      </div>
    </div>
  );
};
