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

### Paso 1 — Instalar los dos programas necesarios (una sola vez)

#### Opción A — Rápida con winget (recomendada, Windows 11 ya lo trae)
1. Menú Inicio → escribir **PowerShell** → abrir.
2. Pegar estos dos comandos (uno por uno):
   ```powershell
   winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
   winget install Git.Git --accept-source-agreements --accept-package-agreements
   ```
3. **Cerrar y volver a abrir PowerShell** (para que tome los programas).
   - *(Si `winget` no se reconoce, instalen “App Installer” desde la Microsoft Store, o usen la Opción B.)*

#### Opción B — Manual (si no quieren usar winget)

**1.1 Node.js** (hace que funcione `npm`)
1. Entren a **https://nodejs.org** y descarguen la versión **LTS** (botón izquierdo), el instalador **.msi** para Windows.
2. Ejecuten el instalador → **Next → Next → Install** (dejen todo por defecto).
   - Si aparece **SmartScreen** (“Windows protegió tu PC”): **Más información → Ejecutar de todas formas**.

**1.2 Git** (sirve para descargar y actualizar el proyecto)
1. Entren a **https://git-scm.com/download/win** (la descarga inicia sola).
2. Ejecuten el instalador → **Next** a todo (los valores por defecto están bien) → **Install**.

**Reinicien la PC** después de instalar (recomendado).

**Comprobar que quedó todo instalado:** abran el menú Inicio, escriban **PowerShell**, ábranlo y escriban:
```powershell
node --version
npm --version
git --version
```
Cada uno debe mostrar un número. Si alguno dice “no se reconoce”, reinstálenlo y reinicien la PC.

### Paso 2 — Descargar el proyecto

**Opción recomendada (con Git):** en PowerShell escriban:
```powershell
cd Desktop
git clone https://github.com/homewirehub/android-market-app.git
cd android-market-app
```
(Quedará en el Escritorio, dentro de la carpeta `android-market-app`, y ya estarán adentro.)

**Opción sin Git (ZIP):** descarguen el ZIP (ver sección A), extráiganlo, abran la carpeta y hagan clic derecho dentro → **“Abrir en Terminal”**.

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
