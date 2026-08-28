# Prisma — Frontend

Interfaz del gestor de proyectos y módulos del área de Desarrollo de **Asiste Ing**.

Backend: <https://github.com/davidzaratecamp/prismabackend>

## Stack

React + Vite + TypeScript · **shadcn/ui + Tailwind CSS** · React Query · React Router ·
Recharts · dnd-kit · date-fns

## Puesta en marcha

```bash
npm install
npm run dev            # http://localhost:5173
```

El backend debe estar corriendo en `http://localhost:4000` (Vite hace proxy de `/api`).
Ver <https://github.com/davidzaratecamp/prismabackend>.

Para apuntar a otro backend, ajusta el `target` del proxy en `vite.config.ts`.

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`dist/`) |
| `npm run preview` | Sirve el build |
| `npm run lint` | oxlint |

## Estructura

```
src/
├── components/{ui,common,layout,dashboard,projects,kanban,roadmap,team}
├── hooks/queries.ts    React Query — todas las llamadas a la API
├── lib/                api (axios) · status (colores/labels) · types
├── pages/              Login · Dashboard · AreaDashboard · Projects ·
│                       ProjectDetail · Kanban · Roadmap · Team · AreasAdmin · Settings
├── routes/             ProtectedRoute · AdminRoute
└── stores/             auth · ui (tema + sidebar)
```

## Características

- Dashboard global y por área con KPIs, avance por área y carga por desarrollador
- Proyectos con lista filtrable y detalle por pestañas (módulos/tareas, equipo, hitos, actividad)
- Tablero Kanban con arrastrar y soltar
- Roadmap tipo Gantt con hitos y línea de "hoy"
- Tema claro/oscuro, command palette (⌘K), 3 roles (admin / developer / viewer)
