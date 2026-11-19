# Tablero de Tickets - Kanban Real-Time

Sistema completo de gestión de tareas y tablero Kanban interactivo en tiempo real con autenticación protegida de **Google OAuth 2.0**.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, Vite, Tailwind CSS v4, `@dnd-kit` (drag and drop), `socket.io-client`, Lucide Icons.
- **Backend**: Node.js, Fastify, `@fastify/jwt`, `socket.io` (WebSockets), `google-auth-library`.
- **Base de Datos & ORM**: PostgreSQL, Prisma ORM.

---

## 📂 Estructura del Proyecto

```text
Tablero_construnexia/
├── backend/                  # Servidor API Fastify, WebSockets y Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma     # Esquema de modelos PostgreSQL (Board, Column, Task, User)
│   │   └── seed.ts           # Datos de prueba iniciales
│   ├── src/
│   │   ├── server.ts         # Inicialización de Fastify, CORS y JWT
│   │   ├── socket.ts         # Manejador de eventos Socket.io
│   │   └── routes/           # Endpoints de la API REST (auth, boards, columns, tasks)
│   ├── .env.example
│   └── package.json
├── frontend/                 # Aplicación Cliente React + Vite
│   ├── src/
│   │   ├── App.tsx           # Orquestador principal y estado del tablero
│   │   ├── components/       # Componentes visuales (KanbanBoard, TaskCard, TaskModal, LoginView)
│   │   ├── context/          # AuthContext y SocketContext
│   │   └── services/         # Cliente API Axios
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Despliegue del frontend en Cloudflare Pages

El frontend está preparado para desplegarse en Cloudflare Pages con la configuración
de [frontend/wrangler.toml](frontend/wrangler.toml).

- **Directorio raíz:** `frontend`
- **Comando de build:** `npm run build`
- **Directorio de salida:** `dist`
- **Variable requerida:** `VITE_GOOGLE_CLIENT_ID`
- **Variable requerida para producción:** `VITE_API_URL`, con la URL pública del backend sin `/api`

La URL de Vercel puede mantenerse activa durante la migración. Cloudflare Pages
solo aloja los archivos estáticos del frontend; la API y Socket.io deben seguir
disponibles desde un backend público.
