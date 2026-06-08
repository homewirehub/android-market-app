# Android Market · Servicio Técnico Digital
## Guía de presentación + estado del proyecto / Präsentationsleitfaden + Projektstand

> Dieses Dokument ist **nicht technisch**. Man kann es ohne Programmierkenntnisse
> vorlesen und erklären. / Este documento **no es técnico**: se puede leer y
> explicar sin conocimientos de programación.

---

# 🇩🇪 Deutsch

## 1. Was ist das Projekt? (in einem Satz)
Ein einfaches Computerprogramm für die Werkstatt **Android Market** in
Rurrenabaque (Bolivien), mit dem Reparatur-Aufträge digital aufgenommen,
verfolgt und abgeschlossen werden – **komplett ohne Internet**, auf einem
einzigen Laptop.

## 2. Das Problem (Ausgangslage)
Heute schreiben viele kleine Werkstätten Reparaturen **auf Papier oder gar
nicht** auf. Folgen:
- Aufträge gehen verloren, niemand weiß, was mit einem Gerät passiert ist.
- Kunden rufen ständig an: „Ist mein Handy fertig? Was kostet es?“
- Keine Zahlen, keine Übersicht, keine Belege.

## 3. Unsere Lösung
Eine Web-Anwendung mit **zwei Bereichen**:

| Bereich | Wer benutzt es | Wofür |
|---|---|---|
| **Kundenseite** | Kunde (Handy/Browser) | Reparatur anmelden, Status abfragen |
| **Verwaltungsseite** | Mitarbeiter / Techniker | Aufträge aufnehmen, bearbeiten, abschließen |

**Großer Vorteil:** Das System läuft **offline** – ideal für Rurrenabaque, wo das
Internet nicht immer stabil ist.

## 4. Was ist bereits fertig? (Projektstand)
✅ = fertig und vorführbar

- ✅ **Auftrag aufnehmen** – Mitarbeiter erfasst Kunde, Gerät, Problem, Preis und
  voraussichtliches Abholdatum. Der Kunde kann den Antrag auch selbst im Browser
  stellen.
- ✅ **Automatische Auftragsnummer** – z. B. `REP-2026-0073`.
- ✅ **QR-Code** für jeden Auftrag – der Kunde scannt ihn und sieht sofort den
  Status.
- ✅ **Reparaturbeleg als PDF** – mit Logo-Bereich, allen Daten und QR-Code, zum
  Ausdrucken.
- ✅ **Statusverfolgung** – Recibido → Diagnóstico → Esperando repuestos → En
  reparación → Listo para entrega → Entregado (+ Cancelado).
- ✅ **Verlauf/Historie** – jeder Schritt wird mit Datum, Uhrzeit und Techniker
  gespeichert (Beweis, was passiert ist).
- ✅ **Detailseite je Auftrag** – die Seite, die ein Mitarbeiter den ganzen Tag
  offen hat.
- ✅ **Repuestos & Inventar** – Ersatzteillager mit Stock, Preis und Warnung
  „reabastecer" bei niedrigem Bestand.
- ✅ **Verbrauchte Teile pro Auftrag** – zieht automatisch vom Lager ab.
- ✅ **Pagos** – Zahlart, Rabatt und **Total** (Mano de obra + Repuestos − Descuento).
- ✅ **Reportes** – Einnahmen, meistgenutzte Teile, meistgefragte Services,
  Nachbestellungen, offene Aufträge.
- ✅ **Suchfunktion** – nach Kundenname oder Auftragsnummer.
- ✅ **Kennzahlen-Dashboard** – Kunden, Geräte, aktive/abgeschlossene
  Reparaturen, durchschnittliche Reparaturzeit, Einnahmen.
- ✅ **Kostenschätzung (Bs) + Abholdatum** – Kunde sieht den Preis online.
- ✅ **Heller & dunkler Modus**, spanische Bedienoberfläche.
- ✅ **Realistische Demo-Daten** (38 Kunden, 72 Geräte, 72 Aufträge) mit echten
  Namen aus Rurrenabaque (z. B. Imprenta Don Pepe, Radio San Miguel,
  Hotel Maya de la Amazonía).

## 5. Der digitalisierte Geschäftsprozess (das Herzstück)
```
1. Kunde kommt in den Laden
2. Mitarbeiter legt Auftrag an
3. System erzeugt Nummer + QR-Code
4. Beleg (PDF) wird gedruckt und mitgegeben
5. Techniker aktualisiert den Status
6. Kunde prüft den Status online (per QR)
7. Dashboard zeigt die Kennzahlen
```
👉 Aus BWL-Sicht ist das ein **vollständig digitalisierter Geschäftsprozess**.

## 6. Demo-Skript (ca. 3 Minuten, Klick für Klick)
> Vorher: Laptop an, Programm gestartet (siehe Abschnitt 9). Browser auf
> `http://localhost:3000`.

1. **Startseite zeigen.** Sagen: *„Das ist die Seite, die der Kunde sieht.“*
2. **Verwaltung öffnen** (oben rechts „Administración“) → **„Nueva orden“**.
   - Neuen Kunden eintragen (z. B. *María Limpias*), Gerät (z. B. *Samsung Galaxy
     A14*), Problem (*Pantalla rota*), **Kosten** (z. B. *250 Bs*),
     **Abholdatum** wählen, Techniker zuweisen.
   - Auf **„Registrar orden“** klicken.
   - Sagen: *„Das System vergibt automatisch die Nummer REP-2026-00XX.“*
3. **Auftrag öffnen** (auf die Nummer klicken). Hier sieht man **alle Daten,
   den Verlauf und den QR-Code**.
4. **„Generar comprobante“** klicken → das **PDF mit QR-Code** öffnet sich.
   - Sagen: *„Diesen Beleg bekommt der Kunde. Mit dem QR-Code kann er den Status
     jederzeit selbst abrufen.“*
5. **Repuesto + Zahlung** (auf der Detailseite): unter „Repuestos utilizados" ein
   Ersatzteil **hinzufügen** (zieht vom Lager ab), dann unter „Pago" das **Total**
   zeigen (Mano de obra + Repuestos − Descuento).
   - Sagen: *„Das System rechnet den Preis automatisch und führt das Lager nach.“*
6. **Status ändern** (rechts „Actualizar estado“): z. B. auf *En reparación*,
   Techniker bestätigen, **„Guardar cambio“**.
   - Sagen: *„Jeder Schritt wird mit Uhrzeit gespeichert.“*
7. **Kundenseite** öffnen → **„Consultar estado“** → die Auftragsnummer eingeben.
   - Sagen: *„Der Kunde sieht Status, Verlauf und den Preis – ohne anzurufen.“*
8. **„Panel“ + „Reportes“ zeigen.**
   - Sagen: *„Hier sieht der Besitzer Einnahmen, meistgenutzte Teile und Kennzahlen.“*

✅ Wenn dieser Ablauf durchläuft, ist die Präsentation gewonnen.

## 7. Stärkste Argumente (Talking Points)
- **Offline:** *„Das System funktioniert vollständig ohne Internet und läuft auf
  einem einzigen Laptop direkt im Laden in Rurrenabaque.“*
- **Nachvollziehbarkeit:** Jeder Auftrag hat einen lückenlosen Verlauf.
- **Kundenzufriedenheit:** Weniger Anrufe, weil Kunden den Status selbst sehen.
- **Professionelles Auftreten:** gedruckter Beleg mit QR-Code.
- **Wirtschaftlicher Nutzen:** Kennzahlen (z. B. durchschnittliche Reparaturzeit)
  helfen dem Besitzer, das Geschäft zu steuern.

## 8. Mögliche Fragen & Antworten
- **„Braucht man Internet?“** → Nein. Nur bei der allerersten Installation. Danach
  komplett offline.
- **„Was, wenn der Laptop kaputtgeht?“** → Alle Daten liegen in einer einzigen
  Datei, die man sichern/kopieren kann.
- **„Können mehrere Filialen das nutzen?“** → Heute eine Filiale; in einer
  späteren Version geplant (siehe Zukunftsvision).
- **„Wie scannt der Kunde den QR-Code?“** → Mit der normalen Handykamera; er
  öffnet die Statusseite. (Im selben WLAN.)
- **„Sind die Zahlen echt?“** → Es sind realistische Demo-Daten, damit man die
  Funktionen sieht.

## 9. App starten (für die Vorbereitung)
1. Laptop mit installiertem Programm.
2. Im Projektordner ein Terminal öffnen.
3. Befehl: `npm run dev`
4. Browser öffnen: `http://localhost:3000`
- Kundenseite: `http://localhost:3000`
- Verwaltung: `http://localhost:3000/admin`
> Tipp für echtes QR-Scannen vom Handy: in der Datei `.env` `APP_URL` auf die
> WLAN-Adresse des Laptops setzen (z. B. `http://192.168.1.50:3000`).

## 10. Zukunftsvision (eine Folie genügt)
- **Version 1 (heute):** Reparaciones · Clientes · Seguimiento
- **Version 2:** Inventario · Facturación · PDF
- **Version 3:** WhatsApp · Múltiples sucursales · Sincronización

## 11. Technische Basis – ganz einfach erklärt
- Eine **Web-Anwendung** (läuft im Browser), gebaut mit modernen Standard-
  Werkzeugen (Next.js / TypeScript).
- Die Daten liegen in einer **kleinen lokalen Datenbank** (eine Datei auf dem
  Laptop) – deshalb offline.
- Kein Cloud-Dienst, keine laufenden Kosten, kein Abo.

---

# 🇪🇸 Español

## 1. ¿Qué es el proyecto? (en una frase)
Un programa sencillo para el taller **Android Market** de Rurrenabaque (Bolivia)
que permite **registrar, seguir y cerrar** reparaciones de forma digital,
**totalmente sin internet**, en una sola laptop.

## 2. El problema
Hoy muchos talleres pequeños anotan las reparaciones **en papel o no las anotan**.
Consecuencias:
- Se pierden órdenes; nadie sabe qué pasó con un equipo.
- Los clientes llaman todo el tiempo: «¿Ya está mi teléfono? ¿Cuánto cuesta?».
- No hay cifras, ni control, ni comprobantes.

## 3. Nuestra solución
Una aplicación web con **dos lados**:

| Lado | Quién lo usa | Para qué |
|---|---|---|
| **Lado del cliente** | Cliente (celular/navegador) | Solicitar reparación, consultar estado |
| **Lado de administración** | Personal / técnicos | Registrar, gestionar y cerrar órdenes |

**Gran ventaja:** funciona **sin conexión** — ideal para Rurrenabaque, donde el
internet no siempre es estable.

## 4. ¿Qué ya está terminado? (estado del proyecto)
✅ = listo y se puede mostrar

- ✅ **Registrar orden** – el personal anota cliente, equipo, problema, costo y
  fecha estimada de entrega. El cliente también puede solicitarlo desde el
  navegador.
- ✅ **Código de orden automático** – p. ej. `REP-2026-0073`.
- ✅ **Código QR** para cada orden – el cliente lo escanea y ve el estado.
- ✅ **Comprobante en PDF** – con todos los datos y el código QR, para imprimir.
- ✅ **Seguimiento de estado** – Recibido → Diagnóstico → Esperando repuestos →
  En reparación → Listo para entrega → Entregado (+ Cancelado).
- ✅ **Historial** – cada paso se guarda con fecha, hora y técnico.
- ✅ **Página de detalle por orden** – la pantalla que el técnico tiene abierta
  todo el día.
- ✅ **Repuestos e inventario** – stock, precio y alerta de "reabastecer".
- ✅ **Repuestos usados por orden** – descuentan automáticamente del stock.
- ✅ **Pagos** – forma de pago, descuento y **total** (mano de obra + repuestos − descuento).
- ✅ **Reportes** – ingresos, repuestos más usados, servicios más solicitados,
  por reabastecer, órdenes pendientes.
- ✅ **Búsqueda** – por nombre del cliente o número de orden.
- ✅ **Tablero de indicadores** – clientes, equipos, reparaciones activas y
  completadas, tiempo promedio, ingresos.
- ✅ **Costo estimado (Bs) + fecha de entrega** – el cliente ve el precio en línea.
- ✅ **Modo claro y oscuro**, interfaz en español.
- ✅ **Datos de demostración realistas** (38 clientes, 72 equipos, 72 órdenes) con
  nombres de Rurrenabaque (p. ej. Imprenta Don Pepe, Radio San Miguel,
  Hotel Maya de la Amazonía).

## 5. El proceso de negocio digitalizado (lo central)
```
1. El cliente llega al taller
2. El personal crea la orden
3. El sistema genera número + código QR
4. Se imprime y entrega el comprobante (PDF)
5. El técnico actualiza el estado
6. El cliente consulta el estado en línea (con el QR)
7. El tablero muestra los indicadores
```
👉 Desde la administración de empresas, es un **proceso de negocio totalmente
digitalizado**.

## 6. Guion de la demostración (≈3 minutos, paso a paso)
> Antes: laptop encendida y programa iniciado (ver sección 9). Navegador en
> `http://localhost:3000`.

1. **Mostrar la página de inicio.** Decir: *«Esto es lo que ve el cliente.»*
2. **Abrir Administración** (arriba a la derecha) → **«Nueva orden»**.
   - Registrar un cliente nuevo (p. ej. *María Limpias*), equipo (*Samsung Galaxy
     A14*), problema (*Pantalla rota*), **costo** (p. ej. *250 Bs*), elegir
     **fecha de entrega**, asignar técnico.
   - Clic en **«Registrar orden»**.
   - Decir: *«El sistema asigna automáticamente el número REP-2026-00XX.»*
3. **Abrir la orden** (clic en el número). Se ven **todos los datos, el historial
   y el código QR**.
4. Clic en **«Generar comprobante»** → se abre el **PDF con el código QR**.
   - Decir: *«Este comprobante se le da al cliente. Con el QR puede consultar el
     estado cuando quiera.»*
5. **Repuesto + pago** (en el detalle): en «Repuestos utilizados» **agregar** un
   repuesto (descuenta del stock) y en «Pago» mostrar el **total** (mano de obra +
   repuestos − descuento).
   - Decir: *«El sistema calcula el precio y actualiza el inventario solo.»*
6. **Cambiar el estado** (derecha, «Actualizar estado»): p. ej. a *En reparación*,
   confirmar técnico, **«Guardar cambio»**.
   - Decir: *«Cada paso se guarda con la hora.»*
7. **Lado del cliente** → **«Consultar estado»** → escribir el número de orden.
   - Decir: *«El cliente ve el estado, el historial y el precio, sin llamar.»*
8. **«Panel» + «Reportes».**
   - Decir: *«Aquí el dueño ve ingresos, repuestos más usados e indicadores.»*

✅ Si este recorrido funciona, la presentación está ganada.

## 7. Argumentos más fuertes
- **Sin conexión:** *«El sistema funciona completamente sin internet y corre en
  una sola laptop, directamente en el taller en Rurrenabaque.»*
- **Trazabilidad:** cada orden tiene un historial completo.
- **Satisfacción del cliente:** menos llamadas, porque el cliente ve el estado.
- **Imagen profesional:** comprobante impreso con código QR.
- **Utilidad económica:** los indicadores (p. ej. tiempo promedio) ayudan al dueño
  a controlar el negocio.

## 8. Posibles preguntas y respuestas
- **«¿Necesita internet?»** → No. Solo en la primera instalación. Después,
  totalmente sin conexión.
- **«¿Y si la laptop falla?»** → Todos los datos están en un solo archivo que se
  puede respaldar/copiar.
- **«¿Pueden usarlo varias sucursales?»** → Hoy una sucursal; previsto para una
  versión futura (ver visión).
- **«¿Cómo escanea el cliente el QR?»** → Con la cámara normal del celular; abre
  la página de estado. (En la misma red Wi-Fi.)
- **«¿Las cifras son reales?»** → Son datos de demostración realistas, para
  mostrar las funciones.

## 9. Cómo iniciar la aplicación (preparación)
1. Laptop con el programa instalado.
2. Abrir una terminal en la carpeta del proyecto.
3. Comando: `npm run dev`
4. Abrir el navegador: `http://localhost:3000`
- Lado del cliente: `http://localhost:3000`
- Administración: `http://localhost:3000/admin`
> Para escanear el QR con el celular: en el archivo `.env`, poner `APP_URL` con la
> dirección Wi-Fi de la laptop (p. ej. `http://192.168.1.50:3000`).

## 10. Visión a futuro (una diapositiva basta)
- **Versión 1 (hoy):** Reparaciones · Clientes · Seguimiento
- **Versión 2:** Inventario · Facturación · PDF
- **Versión 3:** WhatsApp · Múltiples sucursales · Sincronización

## 11. Base técnica – explicada de forma simple
- Una **aplicación web** (funciona en el navegador), hecha con herramientas
  modernas y estándar (Next.js / TypeScript).
- Los datos están en una **pequeña base de datos local** (un archivo en la
  laptop) — por eso funciona sin conexión.
- Sin servicios en la nube, sin costos mensuales, sin suscripción.

---

## Resumen de pantallas / Übersicht der Seiten

| URL | Español | Deutsch |
|---|---|---|
| `/` | Inicio (cliente) | Startseite (Kunde) |
| `/solicitar` | Solicitar reparación | Reparatur anmelden |
| `/status` | Consultar estado (+ QR) | Status abfragen |
| `/admin` | Panel / indicadores | Dashboard / Kennzahlen |
| `/admin/ordenes` | Lista + búsqueda | Liste + Suche |
| `/admin/ordenes/nueva` | Registrar orden | Auftrag aufnehmen |
| `/admin/ordenes/<código>` | Detalle + QR + PDF | Detail + QR + PDF |
| `/admin/clientes` | Clientes | Kunden |
| `/admin/equipos` | Equipos | Geräte |
| `/admin/repuestos` | Repuestos / inventario | Ersatzteile / Lager |
| `/admin/reportes` | Reportes | Berichte / Kennzahlen |
