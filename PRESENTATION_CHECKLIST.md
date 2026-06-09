# Lista de verificación para la presentación
## Android Market · Servicio Técnico Digital

> Documento operativo para el día de la presentación (en español, para uso en
> vivo). / Operatives Dokument für den Präsentationstag (auf Spanisch, für den
> Live-Einsatz).

---

## 1. Instrucciones de arranque

**Antes de empezar (una sola vez por laptop):**
1. Instalar **Node.js 22.16.0** (ver `.nvmrc`).
2. En la carpeta del proyecto, abrir una terminal y ejecutar:
   ```bash
   npm install           # requiere internet (solo la primera vez)
   cp .env.example .env   # Windows: copy .env.example .env
   npm run db:reset       # crea y llena la base de datos
   ```

**El día de la presentación:**
1. Abrir una terminal en la carpeta del proyecto.
2. Ejecutar:
   ```bash
   npm run dev
   ```
3. Abrir el navegador en **http://localhost:3000**
   - Lado del cliente: `http://localhost:3000`
   - Administración: `http://localhost:3000/admin`
4. (Recomendado) Dejar 2 pestañas abiertas: **Inicio** (cliente) y **Panel** (admin).

**Para dejar los datos como al inicio** (recomendado justo antes de presentar):
```bash
npm run db:reset
```
> Restaura exactamente los datos de demostración (20 clientes, 20 órdenes, etc.).

**Tip — QR escaneable desde el celular:** en el archivo `.env`, poner
`APP_URL="http://IP-DE-LA-LAPTOP:3000"` (la IP del Wi-Fi de la laptop) y volver a
`npm run dev`. Así el QR abre la página de estado en el celular del público.

---

## 2. Guion de demostración (5 minutos)

| Tiempo | Acción | Qué decir |
|---|---|---|
| **0:00–0:30** | Abrir **Inicio** (`/`) | *"Esto ve el cliente: un taller de reparación de celulares en Rurrenabaque. Puede pedir una reparación o consultar el estado."* |
| **0:30–2:00** | **Administración → Nueva orden**. Registrar un cliente nuevo (p. ej. *Roberto Cadima*), equipo *Samsung Galaxy A12*, falla *Pantalla rota*, prioridad *Alta*, técnico *Carlos Paz*, estado *Diagnóstico*. Clic en **Registrar orden**. | *"El empleado registra al cliente y su equipo. El sistema asigna automáticamente el número REP-2026-00XX."* |
| **2:00–3:00** | Abrir la orden. **Agregar repuesto** (*Pantalla Samsung A12*, 180 Bs → descuenta del stock). Cambiar estado a **Listo para entrega**, poner **mano de obra** 80. **Registrar pago** (Efectivo, Pagado). | *"El técnico agrega el repuesto usado —se descuenta solo del inventario— y el sistema calcula el total: 80 + 180 = 260 Bs."* |
| **3:00–3:30** | Clic en **Generar comprobante** | *"El cliente se lleva este comprobante en PDF con un código QR."* |
| **3:30–4:30** | Ir al **lado del cliente → Consultar estado** y escribir el código. | *"El cliente escanea el QR o escribe su código y ve el estado, el historial y el total, sin llamar al taller."* |
| **4:30–5:00** | Volver a **Panel** y abrir **Reportes**. | *"El dueño ve los indicadores: ingresos, reparaciones activas, repuestos más usados y los que hay que reabastecer."* |

> Alternativa rápida: si no quieres crear una orden en vivo, usa una ya existente
> (ver `DEMO_DATA.md`): **REP-2026-0004** (entregada, con repuesto y pago).

---

## 3. Plan de respaldo (si algo falla)

- **La página muestra un error** → presiona **F5** (recarga). Las páginas leen los
  datos en vivo; casi siempre se arregla recargando.
- **El servidor se cayó / "This site can't be reached"** → en la terminal, `Ctrl+C`
  y volver a ejecutar `npm run dev`. Esperar a *"Ready"* y recargar.
- **Los datos se ven raros** (por una prueba previa) → ejecutar `npm run db:reset`
  para restaurar los datos originales, y reiniciar `npm run dev`.
- **Sin internet y el QR no abre en el celular** → explicar: *"El QR apunta a la
  dirección local del taller; en la laptop funciona."* y mostrar la página de
  estado en la laptop.
- **Falla la creación en vivo** → usar una orden ya existente:
  - **REP-2026-0004** — entregada, con repuesto y pago (total 330 Bs).
  - **REP-2026-0006** — en reparación, con descuento (total 279 Bs).
- **Respaldo total** → tener a mano: un **comprobante PDF ya generado** y
  **capturas de pantalla** del Inicio, una orden, el QR, Repuestos y Reportes.
  Con eso se puede contar toda la historia aunque la app no abra.

---

## 4. Beneficios clave para el negocio

- **Digitaliza todo el proceso** — del ingreso a la entrega, sin papel.
- **Trazabilidad completa** — cada cambio queda con fecha, hora y técnico.
- **Menos llamadas** — el cliente consulta el estado en línea con su código/QR.
- **Control de inventario** — stock de repuestos con alertas de *reabastecer*.
- **Cálculo automático** — total = mano de obra + repuestos − descuento.
- **Decisiones con datos** — ingresos, tiempo promedio, repuestos más usados.
- **Funciona 100 % sin internet**, en una sola laptop, sin costos mensuales.

---

## 5. Preguntas frecuentes

**¿Necesita internet?**
No. Solo la primera instalación (descarga de paquetes). Después funciona offline.

**¿Y si se daña o se pierde la laptop?**
Todos los datos están en un solo archivo (`prisma/dev.db`) que se puede copiar y
respaldar en una memoria USB.

**¿Cómo escanea el cliente el código QR?**
Con la cámara normal del celular; se abre la página de estado (en la misma red
Wi-Fi del taller).

**¿Se puede usar en varias sucursales?**
Hoy está pensado para una sucursal. La sincronización entre sucursales está
prevista como mejora futura.

**¿Las cifras son reales?**
Son datos de demostración basados en la información real del taller (la Excel del
grupo): 20 clientes, 20 equipos, 20 órdenes, 55 repuestos.

**¿Tiene inicio de sesión / usuarios?**
Todavía no. Hoy la administración está abierta en la laptop del taller; el login
es una mejora prevista (limitación conocida y documentada).

**¿Emite factura tributaria (SIN)?**
No por ahora; queda fuera del alcance de esta propuesta académica. El sistema sí
genera un **comprobante** de reparación en PDF.

**¿Con qué tecnología está hecho?**
Una aplicación web (Next.js + TypeScript) con una base de datos local (SQLite).
Sin servicios en la nube.
