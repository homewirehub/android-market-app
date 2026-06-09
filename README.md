# Android Market · Sistema de Gestión de Reparaciones

Local-first repair shop management system for a small electronics repair shop
(**Android Market**, Bolivia). Browser-based web app that runs **completely
offline** on a single laptop after the initial install. It has a **client side**
(customers submit and track repair requests) and an **admin side** (staff view
and manage all orders), plus a **dark mode**.

Sistema local de gestión para un taller de reparación de electrónicos
(**Android Market**, Bolivia). Aplicación web que funciona en el navegador y
**opera totalmente sin conexión** en una sola laptop después de la instalación
inicial. Tiene un **lado cliente** (los clientes registran y consultan sus
solicitudes) y un **lado administrador** (el personal ve y gestiona todas las
órdenes), además de **modo oscuro**.

---

## 📚 Documentación del proyecto / Project documentation
| Archivo | Contenido |
| --- | --- |
| [`README.md`](README.md) | Setup, scripts, portabilidad (este archivo) |
| [`STATUS.md`](STATUS.md) | Estado/progreso + revisión + mejoras posibles |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Blueprint de arquitectura y best practices (Lastenheft) |
| [`GUIA_PRESENTACION.md`](GUIA_PRESENTACION.md) | Guía de presentación (no técnica) |
| [`PRESENTATION_CHECKLIST.md`](PRESENTATION_CHECKLIST.md) | Checklist + guion de demo (5 min) |
| [`DEMO_DATA.md`](DEMO_DATA.md) | Datos de ejemplo recomendados para la demo |
| [`PRESENTACION_Android_Market.pptx`](PRESENTACION_Android_Market.pptx) | Presentación (PowerPoint, 16 diapositivas, español) |
| [`presentacion.html`](presentacion.html) | Misma presentación en HTML — se abre en cualquier navegador, sin Office, sin internet (← → o clic para navegar, **F** pantalla completa) |

---

## English

### Tech stack
- **Next.js 16** (App Router) + **TypeScript**
- **TailwindCSS v4**
- **Prisma ORM** with **SQLite** (a single local file, `prisma/dev.db`)
- No external services, no authentication yet, no Docker

### Requirements
- **Node.js 22.16.0** (pinned in [`.nvmrc`](.nvmrc); see `engines` in
  [`package.json`](package.json)). Any Node `>=20.9 <23` works, but 22.16.0 is
  the tested version.
- npm (ships with Node).

### Setup on a new machine
> ⚠️ The **first** install needs **internet** (npm downloads packages and the
> Prisma query engine). **After that, the app runs fully offline.**

Run these steps **in order** from the project root:

1. **Install the right Node version.** If you use `nvm`:
   ```bash
   nvm install   # reads .nvmrc → 22.16.0
   nvm use
   ```
   Otherwise install Node 22.16.0 from <https://nodejs.org> and check:
   ```bash
   node --version   # should print v22.16.0
   ```
2. **Install dependencies** (do NOT copy `node_modules` between machines):
   ```bash
   npm install
   ```
3. **Create your local env file** from the example:
   ```bash
   # macOS / Linux
   cp .env.example .env
   # Windows (PowerShell)
   copy .env.example .env
   ```
4. **Create and seed the database** (migrations + demo data, from scratch):
   ```bash
   npm run db:reset
   ```
5. **Start the app:**
   ```bash
   npm run dev
   ```
6. Open <http://localhost:3000> in your browser.

### Available npm scripts
| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server at <http://localhost:3000> |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run db:reset` | **Reset the DB from scratch**: drop, migrate, then seed |
| `npm run db:migrate` | Apply / create migrations (dev) |
| `npm run db:seed` | Insert demo data only |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run lint` | Run ESLint |

### Portability notes
- The SQLite file (`prisma/dev.db`) is **gitignored and never committed** — it is
  regenerated with `npm run db:reset`.
- `package-lock.json` **is committed** for reproducible installs.
- All scripts are **cross-platform** (macOS, Windows, Linux) — no bash-only syntax.
- No absolute paths anywhere; everything is relative to the project root.
- `.env` is local-only and gitignored; `.env.example` is committed as a template.
- Fonts are system fonts (no web-font download), so there is no hidden network call.

### Project structure
```
prisma/
  schema.prisma        # data model + enums
  migrations/          # committed migration history
  seed.ts              # demo data (Bolivian names, real devices)
src/
  app/                 # App Router routes
    layout.tsx         # Root layout: brand header, dark-mode toggle
    (client)/          # CLIENT side (public)
      page.tsx         #   Landing
      solicitar/       #   Repair-request form (+ success page)
      status/          #   Track an order by code
    admin/             # ADMIN side (staff)
      page.tsx         #   Dashboard + live counts
      ordenes/         #   Orders list + inline status management
      clientes/        #   Customers list
      equipos/         #   Devices list
  lib/
    prisma.ts          # Prisma client singleton (hot-reload safe)
    labels.ts          # Spanish display labels for enums/dates
    orderCode.ts       # Generates REP-YEAR-#### codes
  components/
    ui.tsx             # Small shared UI components
    ThemeToggle.tsx    # Dark-mode toggle (client component)
```

---

## Español

### Tecnologías
- **Next.js 16** (App Router) + **TypeScript**
- **TailwindCSS v4**
- **Prisma ORM** con **SQLite** (un solo archivo local, `prisma/dev.db`)
- Sin servicios externos, sin autenticación todavía, sin Docker

### Requisitos
- **Node.js 22.16.0** (fijado en [`.nvmrc`](.nvmrc); ver `engines` en
  [`package.json`](package.json)). Funciona cualquier Node `>=20.9 <23`, pero la
  versión probada es 22.16.0.
- npm (viene incluido con Node).

### Instalación en una máquina nueva
> ⚠️ La **primera** instalación necesita **internet** (npm descarga los paquetes
> y el motor de consultas de Prisma). **Después de eso, la app funciona totalmente
> sin conexión.**

Ejecute estos pasos **en orden** desde la carpeta raíz del proyecto:

1. **Instale la versión correcta de Node.** Si usa `nvm`:
   ```bash
   nvm install   # lee .nvmrc → 22.16.0
   nvm use
   ```
   Si no, instale Node 22.16.0 desde <https://nodejs.org> y verifique:
   ```bash
   node --version   # debe mostrar v22.16.0
   ```
2. **Instale las dependencias** (NO copie `node_modules` entre máquinas):
   ```bash
   npm install
   ```
3. **Cree su archivo de entorno local** a partir del ejemplo:
   ```bash
   # macOS / Linux
   cp .env.example .env
   # Windows (PowerShell)
   copy .env.example .env
   ```
4. **Cree y llene la base de datos** (migraciones + datos de demostración, desde cero):
   ```bash
   npm run db:reset
   ```
5. **Inicie la aplicación:**
   ```bash
   npm run dev
   ```
6. Abra <http://localhost:3000> en su navegador.

### Scripts de npm disponibles
| Script | Qué hace |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo en <http://localhost:3000> |
| `npm run build` | Compilación de producción |
| `npm run start` | Ejecuta la compilación de producción |
| `npm run db:reset` | **Reinicia la BD desde cero**: borra, migra y luego siembra datos |
| `npm run db:migrate` | Aplica / crea migraciones (desarrollo) |
| `npm run db:seed` | Inserta solo los datos de demostración |
| `npm run db:studio` | Abre Prisma Studio (explorador visual de la BD) |
| `npm run lint` | Ejecuta ESLint |

### Notas de portabilidad
- El archivo SQLite (`prisma/dev.db`) está **ignorado por git y nunca se sube** —
  se regenera con `npm run db:reset`.
- `package-lock.json` **sí se sube** para instalaciones reproducibles.
- Todos los scripts son **multiplataforma** (macOS, Windows, Linux) — sin sintaxis
  exclusiva de bash.
- No hay rutas absolutas; todo es relativo a la raíz del proyecto.
- `.env` es solo local y está ignorado por git; `.env.example` se sube como plantilla.
- Las fuentes son del sistema (sin descarga de fuentes web), así que no hay ninguna
  llamada de red oculta.

### Estructura del proyecto
```
prisma/
  schema.prisma        # modelo de datos + enums
  migrations/          # historial de migraciones (versionado)
  seed.ts              # datos de demostración (nombres bolivianos, equipos reales)
src/
  app/                 # rutas del App Router
    layout.tsx         # Layout raíz: encabezado + botón de modo oscuro
    (client)/          # Lado CLIENTE (público)
      page.tsx         #   Inicio
      solicitar/       #   Formulario de solicitud (+ página de éxito)
      status/          #   Consulta de una orden por código
    admin/             # Lado ADMINISTRADOR (personal)
      page.tsx         #   Panel + conteos en vivo
      ordenes/         #   Lista de órdenes + cambio de estado en línea
      clientes/        #   Lista de clientes
      equipos/         #   Lista de equipos
  lib/
    prisma.ts          # Cliente Prisma singleton (seguro para hot-reload)
    labels.ts          # Etiquetas en español para enums/fechas
    orderCode.ts       # Genera códigos REP-AÑO-####
  components/
    ui.tsx             # Componentes de UI compartidos
    ThemeToggle.tsx    # Botón de modo oscuro (componente de cliente)
```
