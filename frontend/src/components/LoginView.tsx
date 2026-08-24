import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { LayoutGrid, ShieldCheck, Zap, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginView: React.FC = () => {
  const { loginWithGoogleToken, loginWithDemo } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        setErrorMsg(null);
        await loginWithGoogleToken(credentialResponse.credential);
      } catch (err) {
        setErrorMsg('Error al verificar la cuenta de Google con el backend.');
      }
    }
  };

  const handleDemoLogin = async () => {
    try {
      setErrorMsg(null);
      await loginWithDemo(
        'usuario.demo@construnexia.com',
        'Juan Ancona (Demo)',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=JuanAncona'
      );
    } catch (err) {
      setErrorMsg('Error al conectar con la cuenta demo.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Dynamic Ambient Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="w-full max-w-xl glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800/80 shadow-2xl relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/30 ring-1 ring-white/20 mb-2">
            <LayoutGrid className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Tablero <span className="text-indigo-400">ConstruNexia</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Plataforma de gestión de proyectos Kanban en tiempo real con React, Fastify y Socket.io.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center space-y-1">
            <Zap className="w-4 h-4 text-indigo-400 mx-auto" />
            <p className="text-[11px] font-bold text-slate-200">Tiempo Real</p>
            <p className="text-[10px] text-slate-500">Socket.io</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center space-y-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
            <p className="text-[11px] font-bold text-slate-200">Autenticación</p>
            <p className="text-[10px] text-slate-500">Google OAuth</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center space-y-1">
            <Users className="w-4 h-4 text-sky-400 mx-auto" />
            <p className="text-[11px] font-bold text-slate-200">Persistencia</p>
            <p className="text-[10px] text-slate-500">PostgreSQL</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Auth Buttons */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Error al conectar con el popup de Google.')}
              useOneTap
              theme="filled_black"
              shape="pill"
              text="continue_with"
              locale="es"
            />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-950 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest absolute">
              o prueba rápida
            </span>
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <span>Iniciar como Usuario Demo (Sin credenciales)</span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Protegido con JWT & OAuth 2.0. Conexión segura y cifrada.
        </p>
      </div>
    </div>
  );
};
