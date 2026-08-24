import React from 'react';
import { X, Activity, Clock } from 'lucide-react';
import { ActivityLog } from '../types/kanban';

interface ActivitySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityLog[];
}

export const ActivitySidebar: React.FC<ActivitySidebarProps> = ({
  isOpen,
  onClose,
  activities,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm glass-panel border-l border-slate-800 shadow-2xl p-6 flex flex-col space-y-6 animate-slideLeft">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-extrabold text-white">Historial de Actividad</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">Sin registros de actividad aún</p>
        ) : (
          activities.map((act) => {
            const timeStr = new Date(act.createdAt).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                    {act.action}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    {timeStr}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">{act.details}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
