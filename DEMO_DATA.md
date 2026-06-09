# Datos de demostración recomendados
## Android Market · Servicio Técnico Digital

> Los mejores ejemplos para usar durante la presentación. Todos los datos
> provienen del seed (reproducción fiel de la Excel del grupo). Para restaurarlos
> exactamente: `npm run db:reset`. / Beste Beispiele für die Präsentation; mit
> `npm run db:reset` exakt wiederherstellbar.

---

## Técnicos
| Nombre | Especialidad |
|---|---|
| **Carlos Paz Maita** | Software y hardware |
| **Efraín Mayta** | Software y hardware |

---

## Órdenes recomendadas para mostrar

Elige según lo que quieras destacar. Todos los valores son los que muestra el
sistema (mano de obra + repuestos − descuento = total).

| Código | Cliente | Equipo | Servicio | Estado | Total | Pago | Bueno para mostrar… |
|---|---|---|---|---|---|---|---|
| **REP-2026-0004** ⭐ | Mario Tipuni | Huawei P30 Lite | Cambio de pantalla | Entregado | **330 Bs** (150 + 180) | Efectivo · Pagado | **El ejemplo más completo**: repuesto + pago + entregado |
| **REP-2026-0006** | Nayeli Villegas | Huawei Y9 2019 | Cambio de pantalla | En reparación | **279 Bs** (160 + 150 − 10 %) | QR · Pendiente | Orden **en proceso** con **descuento** |
| **REP-2026-0001** | Martín Laura | Tecno Pova 5 | Flasheo de software | Entregado | **80 Bs** | Efectivo · Pagado | Servicio **sin repuesto** (solo mano de obra) |
| **REP-2026-0012** | Dayana Queteguari | Samsung Galaxy A11 | Cambio de pantalla | Recibido | **178 Bs** (30 + 180 − 15 %) | Efectivo · Pendiente | Recién **recibido**, con descuento |
| **REP-2026-0020** | Fernanda Mamani | Tecno Spark Go 2023 | Cambio de pantalla | Recibido | 170 Bs | Pendiente | Orden **reciente** |

⭐ = recomendado como ejemplo principal.

**Para "Consultar estado" (lado del cliente):** usa **REP-2026-0004** o
**REP-2026-0006** (tienen historial completo, total y, en 0006, descuento).

---

## Clientes con detalle interesante
| Cliente | Observación / detalle |
|---|---|
| **Martín Laura** | Cliente frecuente |
| **Andry Vargas** | *Tiene garantía* |
| **Nayeli Villegas** | Orden en reparación con descuento (REP-2026-0006) |
| **Dayana Queteguari** | Orden recién recibida con descuento (REP-2026-0012) |

**Búsquedas de ejemplo** (en Administración → Órdenes):
- `Vargas` → encuentra a **Andry Vargas**
- `REP-2026-0006` → busca por número de orden
- `Huawei` → busca por marca de equipo

---

## Repuestos / inventario para mostrar

**Repuestos por reabastecer** (stock ≤ mínimo, salen marcados en rojo en
`/admin/repuestos` y en `/admin/reportes`):

| Repuesto | Stock | Mínimo | Precio |
|---|---|---|---|
| Pantalla Huawei Y9 2019 | 1 | 2 | 150 Bs |
| Pantalla Huawei P30 Lite | 1 | 2 | 180 Bs |
| Pantalla Xiaomi Redmi A5 | 1 | 2 | 180 Bs |
| Batería Samsung A12 | 2 | 2 | 130 Bs |
| Batería Xiaomi Redmi Note 13 | 2 | 2 | 130 Bs |

> Hay **55 repuestos** en total (pantallas, baterías, tapas, módulos de carga).

---

## Crear una orden NUEVA en vivo (guion sugerido)

Datos listos para teclear rápido en **Nueva orden**:

| Campo | Valor sugerido |
|---|---|
| Cliente | *Nuevo cliente* → **Roberto Cadima** |
| C.I. | 8456321 |
| Teléfono | +591 71234567 |
| Tipo de equipo | Teléfono |
| Marca / Modelo | **Samsung / Galaxy A12** |
| Accesorios | Con cargador |
| Falla | Pantalla rota — cambio de pantalla |
| Prioridad | Alta |
| Estado inicial | Diagnóstico |
| Técnico | Carlos Paz Maita |
| Costo estimado | 200 |

Luego, en el detalle:
- **Agregar repuesto:** *Pantalla Samsung A12* (180 Bs) → el stock baja de 5 a 4.
- **Mano de obra:** 80 → **Total = 260 Bs**.
- **Registrar pago:** Efectivo · Pagado.
- **Generar comprobante** (PDF con QR).

> Esta es la secuencia exacta que se verificó en la auditoría final y funciona de
> principio a fin.

---

## Cifras del panel (datos originales del seed)
- **20** clientes · **20** equipos · **20** órdenes · **55** repuestos
- Por estado: **8** entregadas · **4** en reparación · **8** recibidas
- **12** reparaciones activas · **8** completadas · tiempo promedio **3,0 días**
- Ingresos cobrados: **1.130 Bs**

> Si creaste órdenes de prueba, ejecuta `npm run db:reset` para volver a estas
> cifras exactas.
