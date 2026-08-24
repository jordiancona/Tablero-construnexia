import React from 'react';
import { LayoutGrid, Plus, Activity, Wifi, WifiOff, FolderKanban, LogOut, User } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Board } from '../types/kanban';

interface NavbarProps {
  boards: Board[];
  currentBoard: Board | null;
  onSelectBoard: (board: Board) => void;
  onCreateBoardClick: () => void;
  onToggleActivity: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  boards,
  currentBoard,
  onSelectBoard,
  onCreateBoardClick,
  onToggleActivity,
}) => {
  const { isConnected } = useSocket();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <LayoutGrid className="w-5 h-5 text-white" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Constru<span className="text-indigo-400">Nexia</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-medium border border-indigo-500/20">
                Kanban Real-Time
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Tablero de Control y Gestión</p>
          </div>
        </div>

        {/* Board Selector */}
        <div className="flex items-center gap-2">
          {boards.length > 0 && (
            <div className="relative">
              <select
                value={currentBoard?.id || ''}
                onChange={(e) => {
                  const b = boards.find((x) => x.id === e.target.value);
                  if (b) onSelectBoard(b);
                }}
                className="bg-slate-900/90 text-slate-200 text-sm font-semibold rounded-lg px-3 py-2 border border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none pr-8 cursor-pointer shadow-inner"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                    📋 {b.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
          )}

          <button
            onClick={onCreateBoardClick}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Tablero</span>
          </button>
        </div>

        {/* Status Badge & User Info */}
        <div className="flex items-center gap-3">
          <div
            title={isConnected ? 'Conectado al servidor en tiempo real' : 'Reconectando con el servidor...'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {isConnected ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5 animate-bounce" />}
            <span className="hidden md:inline">{isConnected ? 'En vivo' : 'Desconectado'}</span>
          </div>

          <button
            onClick={onToggleActivity}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 rounded-lg border border-slate-800 transition-all cursor-pointer"
            title="Ver Historial de Actividad"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-indigo-500/40 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
              <span className="text-xs font-bold text-slate-200 hidden lg:inline max-w-[120px] truncate">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
