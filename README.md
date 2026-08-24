# 🚀 Tablero ConstruNexia - Kanban Real-Time

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
