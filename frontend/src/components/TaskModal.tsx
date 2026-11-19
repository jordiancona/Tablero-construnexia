import React, { useState, useEffect, useRef } from 'react';
import { X, Check, UserCheck, Plus, Pencil, ChevronDown } from 'lucide-react';
import { Task, Priority, UserSummary } from '../types/kanban';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    priority: Priority;
    assignedToId?: string | null;
  }) => void;
  taskToEdit?: Task | null;
  users: UserSummary[];
}

const PRIORITY_OPTIONS: {
  value: Priority;
  label: string;
  textClass: string;
  dotClass: string;
}[] = [
  {
    value: 'LOW',
    label: 'Baja',
    textClass: 'text-green-400',
    dotClass: 'bg-green-400',
  },
  {
    value: 'MEDIUM',
    label: 'Media',
    textClass: 'text-amber-400',
    dotClass: 'bg-amber-400',
  },
  {
    value: 'HIGH',
    label: 'Alta',
    textClass: 'text-orange-400',
    dotClass: 'bg-orange-400',
  },
  {
    value: 'URGENT',
    label: 'Urgente',
    textClass: 'text-rose-400',
    dotClass: 'bg-rose-400',
  },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  users,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [assignedToId, setAssignedToId] = useState<string>('');
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setAssignedToId(taskToEdit.assignedToId || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setAssignedToId('');
    }
    setIsPriorityOpen(false);
  }, [taskToEdit, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPriorityOpen(false);
      }
    };

    if (isPriorityOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPriorityOpen]);

  if (!isOpen) return null;

  const selectedPriority =
    PRIORITY_OPTIONS.find((opt) => opt.value === priority) ?? PRIORITY_OPTIONS[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignedToId: assignedToId || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 border border-slate-700/80 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <h3 className="text-lg font-extrabold text-white">
            {taskToEdit ? (
              <>
                <Pencil className="w-5 h-5 inline me-2" />
                <span>Editar Tarea</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 inline me-2" />
                <span>Nueva Tarea</span>
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Título de la Tarea
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementar autenticación JWT"
              className="w-full bg-slate-950/90 text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Descripción / Notas
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre el requerimiento..."
              className="w-full bg-slate-950/90 text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Selector personalizado de Prioridad con colores */}
            <div ref={priorityDropdownRef} className="relative">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nivel de Prioridad
              </label>

              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isPriorityOpen}
                onClick={() => setIsPriorityOpen((prev) => !prev)}
                className="w-full bg-slate-950/90 text-sm rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner cursor-pointer flex items-center justify-between transition-all"
              >
                <span className={`flex items-center gap-2 font-semibold ${selectedPriority.textClass}`}>
                  <span className={`w-2 h-2 rounded-full ${selectedPriority.dotClass}`} />
                  {selectedPriority.label}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isPriorityOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isPriorityOpen && (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700/90 rounded-xl p-1.5 shadow-2xl z-30 space-y-0.5"
                >
                  {PRIORITY_OPTIONS.map((option) => {
                    const isSelected = option.value === priority;
                    return (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setPriority(option.value);
                          setIsPriorityOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                          option.textClass
                        } ${
                          isSelected
                            ? 'bg-slate-800/90 font-semibold'
                            : 'hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${option.dotClass}`} />
                          {option.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Persona Asignada
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full bg-slate-950/90 text-sm text-slate-100 rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner cursor-pointer"
              >
                <option value="">Sin Asignar</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Tarea</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};