# STATUS / ESTADO

## English

### ✅ Done — KPIs, search, cost & pickup date, realistic data
- **Dashboard KPIs**: clientes registrados, equipos recibidos, reparaciones
  activas, reparaciones completadas, and average turnaround (tiempo promedio, in
  días) computed live from the data.
- **Search** on the orders list: by customer name, order code, or device
  brand/model (e.g. "Vargas" or "REP-2026-0020").
- **Estimated cost (Bs)** and **estimated pickup date** on every order — captured
  in the intake form, editable from the detail page, and shown on the detail page,
  the public status page, and the PDF receipt.
- **Realistic Rurrenabaque demo data**: 38 customers (incl. Imprenta Don Pepe,
  Radio San Miguel, Hotel Maya de la Amazonía…), 72 devices, 72 orders
  (~58 completed, ~14 active) with costs, dates, and full history.

### ✅ Done — Order detail, QR codes, PDF receipt
- **Order detail page** (`/admin/ordenes/[id]`): customer, phone, device, serial,
  problem, priority, status, assigned technician, and a **history timeline with
  timestamps**. Linked from the orders table (click the order code).
- **Status control** on the detail page: change status + **assign technician** +
  note; each change is written to the history.
- **QR code** for every order (encodes `APP_URL/status?code=…`), shown on the
  detail page so the customer can scan and track online.
- **Printable PDF receipt** ("Generar comprobante"): A4 PDF with the shop header,
  order code, customer/device/problem/status, date, and the **embedded QR code**.
  Generated server-side with pdf-lib + qrcode (pure JS, offline). `APP_URL` in
  `.env` controls the URL baked into QR/receipt (set to the laptop LAN IP for live
  phone scanning).

### ✅ Done — In-shop intake form + modern redesign
- **Technician intake form** (`/admin/ordenes/nueva`): staff register a walk-in
  repair, choosing an **existing customer** or creating a **new one inline**, with
  device details, problem, priority, initial status, and **technician assignment**.
  Same DB path as the public client form. New orders show on the admin list with a
  success banner.
- **Design overhaul** toward a clean dashboard aesthetic: neutral **zinc** palette
  + single **emerald** accent, inline SVG icon set, refined cards/tables/forms/
  buttons. Client side has a **hero landing**; admin has a **sidebar shell**
  (collapses to a top nav on small screens) with a sticky topbar. Reusable UI kit
  in `src/components/ui.tsx`.

### ✅ Done — Client/Admin split, dark mode, rebrand
- Renamed to **Android Market Reparación** throughout the app.
- **Client side** (public): landing page, **repair-request form** (`/solicitar`)
  that creates customer + device + order in one transaction and returns a tracking
  code, success page, and **order tracking** (`/status`).
- **Admin side** (`/admin/*`): dashboard, orders list with **inline status
  change** (writes history, sets `closedAt` on DELIVERED), customers, devices.
  Client-submitted orders appear here automatically.
- **Dark mode**: class-based toggle in the header, persisted in localStorage, with
  an anti-flash inline script. All components have light + dark variants.
- Order codes auto-generated (`REP-YYYY-####`) via `src/lib/orderCode.ts`.
- Verified end-to-end in the browser: client creates order → admin changes status
  → client sees the new status + history.

### ✅ Done — Foundation
- Portable project scaffold: **Next.js 16 (App Router) + TypeScript + Tailwind v4**.
- **Prisma 6 + SQLite** data layer, wired end-to-end (pages read real data).
- Prisma client **singleton** (`src/lib/prisma.ts`) — hot-reload safe.
- Full **data model**: Customer, Device, RepairOrder, RepairStatusHistory,
  Technician, with `RepairStatus` and `Priority` enums.
- Initial **migration** committed; one-command reset via `npm run db:reset`.
- **Seed** with realistic Bolivian demo data: 9 customers, 16 devices,
  18 repair orders across **all** statuses, 4 technicians, 63 history entries.
- **Skeleton pages** that prove the DB works: Dashboard (live counts),
  Customers, Devices, Repair Orders lists, and public `/status` lookup.
- **Spanish UI** (labels, buttons, table headers); status enum stays English in
  code but displays in Spanish (Nuevo, Diagnóstico, Esperando repuestos,
  En reparación, Completado, Entregado).
- Portability: `.nvmrc`, `engines`, committed `package-lock.json`,
  cross-platform scripts, gitignored DB/`.env`, `.env.example`, no absolute paths,
  no web-font fetch.
- Git initialized.

### 🔜 Next — Features (not built yet)
- **Full CRUD** for Customers, Devices, Repair Orders, Technicians.
- **Status workflow**: change an order's status with a note + technician, writing
  to `RepairStatusHistory`; auto-set `closedAt` on DELIVERED.
- **QR codes** on repair orders linking to the public `/status?code=…` page.
- **Dashboard stats**: turnaround time, open vs. closed, workload per technician.
- Order detail pages, search/filtering, printable repair tickets.
- (Later) authentication, roles, backup/export of the SQLite file.

### Notes
- **Prisma 6**, not 7, was chosen on purpose: Prisma 7 requires a new generator +
  `prisma.config.ts` + ESM client changes that add setup friction. For a foundation
  that gets copied to another (possibly Windows) laptop, Prisma 6's classic
  `@prisma/client` import is the lower-risk, better-documented choice.

---

## Español

### ✅ Hecho — Indicadores, búsqueda, costo y fecha de entrega, datos reales
- **Indicadores del panel**: clientes registrados, equipos recibidos,
  reparaciones activas, reparaciones completadas y tiempo promedio (en días),
  calculados en vivo a partir de los datos.
- **Búsqueda** en la lista de órdenes: por nombre del cliente, código de orden o
  marca/modelo del equipo (p. ej. "Vargas" o "REP-2026-0020").
- **Costo estimado (Bs)** y **fecha estimada de entrega** en cada orden:
  capturados en el formulario de recepción, editables desde el detalle, y
  mostrados en el detalle, la página pública de estado y el comprobante PDF.
- **Datos de demostración realistas de Rurrenabaque**: 38 clientes (incl.
  Imprenta Don Pepe, Radio San Miguel, Hotel Maya de la Amazonía…), 72 equipos,
  72 órdenes (~58 completadas, ~14 activas) con costos, fechas e historial.

### ✅ Hecho — Detalle de orden, códigos QR, comprobante PDF
- **Página de detalle de orden** (`/admin/ordenes/[id]`): cliente, teléfono,
  equipo, n.º de serie, problema, prioridad, estado, técnico asignado e
  **historial con fecha y hora**. Enlazada desde la tabla de órdenes (clic en el
  código).
- **Control de estado** en el detalle: cambiar estado + **asignar técnico** +
  nota; cada cambio se registra en el historial.
- **Código QR** para cada orden (codifica `APP_URL/status?code=…`), mostrado en el
  detalle para que el cliente lo escanee y siga su reparación.
- **Comprobante PDF imprimible** ("Generar comprobante"): PDF A4 con el
  encabezado del taller, código de orden, datos de cliente/equipo/problema/estado,
  fecha y el **código QR incrustado**. Generado en el servidor con pdf-lib +
  qrcode (JS puro, sin conexión). `APP_URL` en `.env` define la URL incrustada en
  el QR/comprobante (use la IP LAN del laptop para escaneo real desde el teléfono).

### ✅ Hecho — Formulario de recepción en taller + rediseño moderno
- **Formulario de recepción del técnico** (`/admin/ordenes/nueva`): el personal
  registra una reparación que llega al taller, eligiendo un **cliente existente** o
  creando uno **nuevo en línea**, con datos del equipo, problema, prioridad, estado
  inicial y **asignación de técnico**. Usa el mismo flujo de BD que el formulario
  público. Las nuevas órdenes aparecen en la lista del administrador con un aviso
  de éxito.
- **Rediseño** hacia una estética de panel limpia: paleta neutra **zinc** + un
  único acento **esmeralda**, set de íconos SVG, tarjetas/tablas/formularios/
  botones refinados. El lado cliente tiene una **portada tipo hero**; el
  administrador tiene una **barra lateral** (que se colapsa a navegación superior
  en pantallas pequeñas) con barra superior fija. Kit de UI reutilizable en
  `src/components/ui.tsx`.

### ✅ Hecho — División cliente/administrador, modo oscuro, cambio de nombre
- Renombrado a **Android Market Reparación** en toda la aplicación.
- **Lado cliente** (público): página de inicio, **formulario de solicitud**
  (`/solicitar`) que crea cliente + equipo + orden en una sola transacción y
  devuelve un código de seguimiento, página de éxito y **seguimiento de la orden**
  (`/status`).
- **Lado administrador** (`/admin/*`): panel, lista de órdenes con **cambio de
  estado en línea** (registra historial, fija `closedAt` al ENTREGAR), clientes y
  equipos. Las órdenes enviadas por clientes aparecen aquí automáticamente.
- **Modo oscuro**: botón en el encabezado (basado en clases), guardado en
  localStorage, con script anti-parpadeo. Todos los componentes tienen variantes
  clara y oscura.
- Códigos de orden generados automáticamente (`REP-AAAA-####`) en
  `src/lib/orderCode.ts`.
- Verificado de extremo a extremo en el navegador: el cliente crea una orden → el
  administrador cambia el estado → el cliente ve el nuevo estado + historial.

### ✅ Hecho — Base
- Estructura de proyecto portátil: **Next.js 16 (App Router) + TypeScript + Tailwind v4**.
- Capa de datos **Prisma 6 + SQLite**, conectada de extremo a extremo (las páginas
  leen datos reales).
- Cliente Prisma **singleton** (`src/lib/prisma.ts`) — seguro para hot-reload.
- **Modelo de datos** completo: Customer, Device, RepairOrder, RepairStatusHistory,
  Technician, con los enums `RepairStatus` y `Priority`.
- **Migración** inicial versionada; reinicio en un solo comando con `npm run db:reset`.
- **Datos de demostración** realistas y bolivianos: 9 clientes, 16 equipos,
  18 órdenes de reparación en **todos** los estados, 4 técnicos, 63 entradas de historial.
- **Páginas base** que prueban que la BD funciona: Panel (conteos en vivo),
  listas de Clientes, Equipos y Órdenes, y consulta pública `/status`.
- **Interfaz en español** (etiquetas, botones, encabezados de tabla); el enum de
  estado se mantiene en inglés en el código pero se muestra en español (Nuevo,
  Diagnóstico, Esperando repuestos, En reparación, Completado, Entregado).
- Portabilidad: `.nvmrc`, `engines`, `package-lock.json` versionado, scripts
  multiplataforma, BD y `.env` ignorados por git, `.env.example`, sin rutas
  absolutas, sin descarga de fuentes web.
- Git inicializado.

### 🔜 Siguiente — Funcionalidades (aún no construidas)
- **CRUD completo** para Clientes, Equipos, Órdenes de reparación y Técnicos.
- **Flujo de estados**: cambiar el estado de una orden con una nota + técnico,
  registrando en `RepairStatusHistory`; fijar `closedAt` automáticamente al ENTREGAR.
- **Códigos QR** en las órdenes que enlazan a la página pública `/status?code=…`.
- **Estadísticas del panel**: tiempo de reparación, abiertas vs. cerradas, carga por técnico.
- Páginas de detalle de orden, búsqueda/filtros, comprobantes de reparación imprimibles.
- (Más adelante) autenticación, roles, respaldo/exportación del archivo SQLite.

### Notas
- Se eligió **Prisma 6**, no la 7, a propósito: Prisma 7 requiere un nuevo generador +
  `prisma.config.ts` + cambios a un cliente ESM que agregan fricción en la
  configuración. Para una base que se copia a otra laptop (posiblemente Windows), el
  import clásico `@prisma/client` de Prisma 6 es la opción de menor riesgo y mejor
  documentada.
```
