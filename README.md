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

---

## ⚙️ Configuración del Entorno de Desarrollo

### 1. Variables de Entorno

#### Backend (`backend/.env`)
Crea un archivo `.env` dentro de la carpeta `backend/` basándote en `backend/.env.example`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tablero_db?schema=public"
PORT=3001
HOST=0.0.0.0
JWT_SECRET="construnexia_super_secret_jwt_key_2026_tablero"
GOOGLE_CLIENT_ID="TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
```

#### Frontend (`frontend/.env`)
Crea un archivo `.env` dentro de la carpeta `frontend/` basándote en `frontend/.env.example`:
```env
VITE_GOOGLE_CLIENT_ID="TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
```

---

## 🚀 Cómo Ejecutar en Local

### Paso 1: Iniciar el Backend
```bash
cd backend
npm install
npx prisma generate
npm run dev
```
El servidor backend estará escuchando en `http://localhost:3001`.

### Paso 2: Iniciar el Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
El cliente frontend estará disponible en `http://localhost:5173`.

---

## 🌐 Despliegue en la Nube (100% Gratuito)

1. **Base de Datos PostgreSQL**: Crear una instancia gratuita permanente en [Neon.tech](https://neon.tech) o [Supabase.com](https://supabase.com) y copiar el `DATABASE_URL` a las variables de entorno de producción.
2. **Backend**: Desplegar la carpeta `backend` en [Render.com](https://render.com) como *Free Web Service*.
3. **Frontend**: Desplegar la carpeta `frontend` en [Vercel.com](https://vercel.com) o [Render.com](https://render.com) como *Static Site*.

---

## 🔒 Seguridad y Privacidad

- Los archivos `.env` conteniendo credenciales privadas están incluidos en el `.gitignore` y **no** serán subidos al repositorio de GitHub.
- Todas las comunicaciones en tiempo real vía WebSockets requieren firma JWT válida.
