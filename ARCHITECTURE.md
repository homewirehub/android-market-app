# Android Market – Servicio Técnico Digital
## Software Architecture & Best-Practices Blueprint · Version 1.0

> **Zweck:** Dieses Dokument ist das **Lastenheft** für die langfristige
> Weiterentwicklung. Es beschreibt Vision, Prinzipien, Datenmodell, Skalierung,
> Sicherheit und Betrieb – und verhindert typische Fehler kleiner
> Verwaltungssoftware. Es ergänzt die operativen Dokumente
> (`README.md`, `STATUS.md`, `GUIA_PRESENTACION.md`).

**Legende für den Ist-Stand:**
`✅ umgesetzt` · `🟡 teilweise` · `🔭 geplant`

---

## 1. Projektvision

### Aktuelles Problem
Android Market verwaltet Reparaturen heute über **Papier, WhatsApp, Gedächtnis
und Excel**. Daraus entstehen:

- **Operativ:** verlorene Aufträge, unklare Zustände, Doppelarbeit, fehlende
  Transparenz, keine Statistiken.
- **Finanziell:** nicht erfasste Reparaturen, falsch berechnete Preise, keine
  Inventarkontrolle, unklare Einnahmen.
- **Kunde:** kennt den Status nicht, viele Nachfragen, schlechte Nachverfolgbarkeit.

### Zielbild
Das System wird zur **zentralen Plattform des gesamten Reparaturprozesses** –
alle Informationen an einer Stelle:

```
Kunde → Geräteannahme → Diagnose → Reparatur → Inventar → Zahlung → Abholung → Reporting
```

---

## 2. Grundprinzipien

### Prinzip 1 – Offline First  `✅`
Rurrenabaque hat keine garantierte Internetverbindung. Der Grundbetrieb läuft
ausschließlich lokal:
```
Laptop → Browser → Next.js → SQLite
```
**Niemals erforderlich** für den Grundbetrieb: Cloud, Internet, Google, AWS.
*(Heute: keine externen Aufrufe; sogar Schriftarten sind System-Fonts, QR/PDF
werden lokal erzeugt.)*

### Prinzip 2 – Local First  `✅`
Die Daten gehören dem Unternehmen – nicht Google Sheets, nicht einem Dritt-SaaS.
**Android Market besitzt alle Daten selbst** (eine SQLite-Datei).

### Prinzip 3 – Single Source of Truth  `✅`
Jede Information existiert nur **einmal**. Eine Reparatur verweist über
`customerId`/`deviceId` auf den Kunden bzw. das Gerät, statt Namen zu kopieren →
**keine Inkonsistenzen**.

### Prinzip 4 – Event History  `✅`
Wichtige Informationen gehen nie verloren. Statt nur `status = Entregado` wird der
**ganze Verlauf** gespeichert (`RepairStatusHistory`):
```
08:15 Recibido · 08:30 Diagnóstico · 10:20 Reparación · 12:05 Entregado
```
→ Audit-Trail, Nachvollziehbarkeit, Qualitätssicherung.

---

## 3. Fachliche Architektur (Datenmodell)

Aktueller Stand der Kern-Entitäten (Prisma / SQLite):

| Entität | Zweck | Status |
|---|---|---|
| `Customer` | Name, C.I., Telefon, Adresse, Notiz · `1:n Device` | ✅ |
| `Device` | Marke, Modell, Seriennummer/IMEI, Zubehör · gehört einem Kunden | ✅ |
| `RepairOrder` | **Herzstück**: Kunde→Gerät, Fehler, Priorität, Status, Kosten, Fristen | ✅ |
| `RepairStatusHistory` | Event-Log je Statuswechsel (Status, Notiz, Techniker, Zeit) | ✅ |
| `Technician` | Name, Spezialisierung, Telefon, aktiv/inaktiv | ✅ |
| `SparePart` | Repuesto: Code, Kategorie, Preis, Bestand, Mindestbestand | ✅ |
| `OrderPart` | Verbrauchte Teile pro Auftrag (Menge, Einzelpreis) | ✅ |
| `Payment` | Zahlung: Methode, Rabatt, **berechnetes Total**, Status | ✅ |

**Beziehungen:** `Customer 1:n Device 1:n RepairOrder`; `RepairOrder 1:n
RepairStatusHistory`, `1:n OrderPart`, `1:1 Payment`; `OrderPart n:1 SparePart`;
`RepairStatusHistory n:1 Technician`.

🔭 **Später:** `Technician` um Produktivität/Auslastung erweitern (aus dem
History-Log ableitbar, keine neue Speicherung nötig).

---

## 4. Inventar – Best Practice  `🟡`

**Falsch:** nur `Stock = 5 → 4` ohne Grund.
**Richtig:** **Bewegungen** speichern und Bestand berechnen.

- **Heute (`🟡`):** `SparePart.stock` wird beim Verbrauch (`OrderPart`) reduziert
  und beim Entfernen zurückgebucht; Nachbestellung über „+ Stock". Der Bestand
  stimmt (Stock = Eingang − Ausgang), aber es gibt **kein vollständiges
  Bewegungsjournal**.
- **Zielbild (`🔭`):** eigenes Bewegungs-Log – Bestand wird nur noch *berechnet*:

```prisma
model InventoryMovement {
  id          String   @id @default(cuid())
  sparePartId String
  type        MovementType   // PURCHASE | REPAIR_USE | ADJUSTMENT | RETURN
  quantity    Int            // +Eingang / −Ausgang
  reason      String?
  repairOrderId String?      // bei REPAIR_USE
  createdAt   DateTime @default(now())
}
```
→ vollständige Historie, Nachvollziehbarkeit, echte Inventur.

---

## 5. Statusmodell  `✅`

Status sind **niemals Freitext**, sondern ein Enum (Berichte/Statistiken
funktionieren, keine Schreibfehler).

**Heute (`RepairStatus`):**
```
NEW · DIAGNOSIS · WAITING_FOR_PARTS · REPAIRING · COMPLETED · DELIVERED · CANCELLED
```
Anzeige in Spanisch: *Recibido · Diagnóstico · Esperando repuestos · En reparación
· Listo para entrega · Entregado · Cancelado.*

🔭 **Vorschlag laut Blueprint:** zusätzlichen Schritt **`TESTING`** (Pruebas)
zwischen `REPAIRING` und `COMPLETED` einführen, falls die Qualitätsprüfung als
eigener Schritt sichtbar sein soll. (Begriffs-Mapping: Blueprint `RECEIVED ≙ NEW`,
`READY ≙ COMPLETED`.)

---

## 6. Zahlungsmodell  `✅`

Nicht nur `Total = 350` speichern, sondern die **Bestandteile**:
```
Mano de obra = 200
Repuestos    = 150   (Summe der OrderParts)
Descuento    =   0
→ Total = 350   (serverseitig berechnet)
```
- **Heute:** `RepairOrder.laborCost` + `OrderPart[]` + `Payment.discountBs`;
  `Payment.totalBs` wird **serverseitig** berechnet und **automatisch
  nachgeführt**, wenn Teile/Mano de obra sich ändern (`syncPaymentTotal`).
→ Transparenz, Korrekturen möglich, exaktes Reporting.

---

## 7. Benutzeroberfläche

### Admin – Sidebar  `🟡`
Menschen lernen **Prozesse**, nicht Datenbanken. Heute vorhanden:
```
Panel · Órdenes · Clientes · Equipos · Repuestos · Reportes
```
🔭 **Geplant:** eigener Punkt **`Pagos`** (heute im Auftragsdetail enthalten) und
**`Configuración`** (z. B. Werkstattdaten, Standard-Mindestbestände, Nutzer).

### Kunde – minimal  `✅`
Bewusst schlank: Inicio · **Solicitar reparación** · **Consultar estado**. Der
Kunde braucht keine 20 Menüpunkte.

---

## 8. Suche  `✅`

Best Practice: **eine** globale Suchleiste über mehrere Felder gleichzeitig.

- **Heute:** globale Suche in der Admin-Topbar (`/admin/buscar`) über
  **Auftragscode, Kundenname, Telefon, Seriennummer/IMEI, Marke/Modell** –
  Ergebnisse getrennt nach *Clientes* und *Órdenes*.
- 🔭 **Offen:** akzent-unempfindlich (heute ignoriert SQLite-`LIKE` nur ASCII-
  Groß-/Kleinschreibung, „vasquez" ≠ „Vásquez").

---

## 9. QR-Code-Strategie  `✅`

Jede Reparatur hat einen Code (`REP-2026-0020`) und einen QR-Code. Der Kunde
scannt → Browser → Status, **ohne Login**.

- **Heute:** QR verweist auf `…/status?code=REP-2026-0020`.
- 🔭 **Optionale Verfeinerung:** sprechende Route `…/status/REP-2026-0020` (reines
  Routing-Detail, gleiche Funktion).

---

## 10. Reporting  `🟡`

- **Heute (`/admin/reportes` + Panel):** offene/abgeschlossene Aufträge, Einnahmen
  (kassiert/ausstehend), **repuestos más utilizados**, **servicios más
  solicitados**, **por reabastecer**, tiempo promedio.
- **Zielbild (`🔭`):** Umsatz **heute/Monat** mit Datumsfiltern, Umsatz **pro
  Techniker**, beliebteste **Geräte**, Diagramme über Zeit → damit Android Market
  **Lager, Einkäufe und Preise planen** kann.

---

## 11. Backup-Konzept  `🟡`

Alle Daten liegen in **einer Datei**: `prisma/dev.db`.

- **Heute (`✅`):** **Export-Knopf** im Admin („Respaldar datos" → `/admin/respaldo`)
  lädt die SQLite-Datei als datiertes `.db` herunter (mit WAL-Checkpoint). Datei
  ist gitignoriert; per `npm run db:reset` aus dem Seed reproduzierbar.
- **Betriebliche Routine (empfohlen):** das exportierte `.db` jeden Abend auf
  **USB-Stick** sichern. Später NAS oder verschlüsseltes Cloud-Backup.
- 🔭 **Offen:** **Restore/Import** eines `.db` über die Oberfläche.

---

## 12. Sicherheitsmodell  `🔭`

- **Version 1 (heute):** **ohne Login** – bewusst für Demo/Einzel-Laptop.
  ⚠️ Bekannte Grenze: jeder mit Zugriff auf den Laptop kann `/admin` öffnen.
- **Version 2:** Rollen **Administrador · Técnico · Recepción**.
- **Version 3:** granulare Berechtigungen.

---

## 13. Skalierungsstrategie

```
Heute:  1 Laptop · 1 Geschäft        (✅)
Morgen: mehrere Geräte               (🔭)
Später: mehrere Filialen             (🔭)
```
Deshalb schon **jetzt** sauber: stabile IDs (`cuid`), normalisiertes Datenmodell,
Migrationen. Das Fundament trägt die spätere Synchronisation/Mehrmandantenfähigkeit.

---

## 14. Code Best Practices  `✅`

- **Build muss grün sein:** `npm run build`
- **Lint muss grün sein:** `npm run lint`
- **Datenbank:** immer **Migrationen** (`prisma migrate`), nie manuell Tabellen ändern.
- **Dokumentation:** nach jeder größeren Änderung `README.md` und `STATUS.md`
  aktualisieren.
- **Hinweis (gelernt):** nach einer Migration den laufenden `next dev` **neu
  starten** – sonst nutzt er den alten, gecachten Prisma-Client.

---

## 15. Definition of Done

Eine Funktion ist erst fertig, wenn:

- ✅ funktioniert
- ✅ getestet
- ✅ mobil getestet (responsive)
- ✅ Build erfolgreich
- ✅ Lint erfolgreich
- ✅ Datenbank konsistent
- ✅ dokumentiert
- ✅ in Demo-Daten enthalten
- ✅ Fehlerfälle getestet

---

## 16. Roadmap nach der Präsentation

| Phase | Inhalt | Status |
|---|---|---|
| **Phase 1** | Auftragsdetails · Kundenhistorie · QR-Codes · PDF-Servicebeleg | ✅ **weitgehend erledigt** |
| **Phase 2** | Inventarhistorie (Bewegungsjournal) · erweiterte Reports · Backup-System | 🟡 in Arbeit / geplant |
| **Phase 3** | Login · Rollen · mehrere Benutzer | 🔭 geplant |
| **Phase 4** | WhatsApp · Cloud-Synchronisation · mehrere Filialen | 🔭 Vision |

> **Konkrete nächste Schritte** (priorisiert, siehe auch `STATUS.md`):
> 1. Bewegungsbasiertes Inventar (`InventoryMovement`) statt nur `stock`-Feld.
> 2. Bearbeiten/Löschen (volles CRUD) für alle Entitäten.
> 3. Login + Rollen (Sicherheitsmodell V2).
> 4. Globale Suche um Telefon/Seriennummer erweitern + Backup-Export-Knopf.

---

## Anhang – Technischer Stack (heute)

| Schicht | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| UI | TailwindCSS v4 · System-Fonts (offline) · Hell/Dunkel |
| Datenhaltung | Prisma 6 ORM · **SQLite** (eine lokale Datei) |
| PDF / QR | `pdf-lib` · `qrcode` (beide reines JS, offline) |
| Laufzeit | Node 22 (per `.nvmrc` + `engines` gepinnt) |

**Architektur in einem Satz:** Eine portable, offline-first Web-App auf einem
einzelnen Laptop, bei der eine lokale SQLite-Datei die *Single Source of Truth*
für den gesamten Reparaturprozess ist – mit vollständigem Event-Verlauf,
berechneten Geldbeträgen und QR-Selbstauskunft für Kunden.
