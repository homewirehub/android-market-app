# Cómo descargar y usar el proyecto en Windows 11

> Repositorio: **https://github.com/homewirehub/android-market-app**

Hay **dos cosas distintas** que pueden hacer. Lean primero cuál necesitan.

---

## A) Solo ver la presentación y la guía (la mayoría)

No necesitan instalar nada. Solo descargar y abrir los archivos.

1. Abran el enlace del repositorio en el navegador (Edge o Chrome).
2. Botón verde **“Code”** → **“Download ZIP”**.
3. Vayan a la carpeta **Descargas**, clic derecho en el ZIP → **“Extraer todo…”** → **Extraer**.
4. Entren a la carpeta extraída y abran lo que necesiten:
   - **Presentación:** `defensa\Presentacion_Android_Market.pptx` (se abre en PowerPoint)
   - **Guía de defensa:** `defensa\Guia_Defensa_Android_Market.docx` (se abre en Word)
   - **Presentación en navegador (sin Office):** doble clic en `presentacion.html`
     (se abre en Edge/Chrome; usen **←  →** o clic para avanzar, **F** = pantalla completa)

> Si Windows muestra un aviso de seguridad al abrir un archivo descargado, es normal: pueden abrirlo igual.

---

## B) Ejecutar la aplicación en vivo (solo la laptop de la demo)

Esto es **solo para quien va a mostrar la app funcionando** en la defensa. Una sola laptop.

### Paso 1 — Instalar Node.js (una sola vez)
1. Entren a **https://nodejs.org** y descarguen la versión **LTS** (botón izquierdo), el instalador **.msi** para Windows.
2. Ejecuten el instalador → **Next → Next → Install** (dejen todo por defecto).
   - Si aparece **SmartScreen** (“Windows protegió tu PC”): **Más información → Ejecutar de todas formas**.
3. Listo. Para comprobar, abran una terminal (Paso 2) y escriban `node --version` — debe mostrar un número (v20 o superior).

### Paso 2 — Abrir una terminal en la carpeta del proyecto
1. Abran la carpeta del proyecto extraído en el **Explorador de archivos**.
2. Clic derecho dentro de la carpeta → **“Abrir en Terminal”**.
   - (Alternativa: en la barra de direcciones del Explorador escriban `powershell` y Enter.)

### Paso 3 — Instalar y arrancar (escriban los comandos uno por uno)
```powershell
npm install
copy .env.example .env
npm run db:reset
npm run dev
```
> La **primera vez** necesita internet (descarga paquetes). Después funciona **sin internet**.

### Paso 4 — Abrir la aplicación
- Abran el navegador en **http://localhost:3000**
  - Lado cliente: `http://localhost:3000`
  - Administración: `http://localhost:3000/admin`
- Para **detener** la app: en la terminal presionen **Ctrl + C**.
- Para volver a abrirla otro día: terminal en la carpeta → `npm run dev`.
- Para **reiniciar los datos de demostración** a su estado original: `npm run db:reset`.

---

## Problemas comunes (Windows)

| Problema | Solución |
|---|---|
| `npm` o `node` “no se reconoce…” | Cierren y vuelvan a abrir la terminal después de instalar Node. Si sigue, reinstalen Node y reinicien la PC. |
| SmartScreen bloquea el instalador de Node | **Más información → Ejecutar de todas formas**. |
| El ZIP no abre los archivos | Clic derecho en el ZIP → **Extraer todo** (no abran “dentro” del ZIP). |
| “No se puede acceder a este sitio” en localhost | Esperen a que la terminal diga **Ready** y recarguen con **F5**. |
| Quieren que el **QR** abra en el celular del público | En el archivo `.env` pongan `APP_URL="http://IP-DE-LA-LAPTOP:3000"` (la IP del Wi-Fi de la laptop) y vuelvan a `npm run dev`. |

---

## Resumen rápido
- **Todos:** Download ZIP → Extraer → abrir la presentación.
- **La laptop de la demo:** instalar Node → `npm install` → `copy .env.example .env` → `npm run db:reset` → `npm run dev` → `http://localhost:3000`.
