// Seed script: a faithful reproduction of the shop's real data
// (Excel "TRABAJO GRUPAL"): 20 clientes, 20 equipos, 2 técnicos, 20 órdenes,
// 55 repuestos with inventory, parts used per order, and payments.
// Run via `npm run db:seed` (or automatically by `npm run db:reset`).
import { PrismaClient, RepairStatus, PaymentMethod } from "@prisma/client";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

// --- Técnicos (Excel: TEC_01 Carlos Paz, TEC_02 Efraín Mayta) ------------
const TECS = [
  { name: "Carlos Paz Maita", specialization: "Software y hardware", phone: "+591 72500001" },
  { name: "Efraín Mayta", specialization: "Software y hardware", phone: "+591 72500002" },
];

// --- Repuestos + inventario (Excel: REPUESTO + INVENTARIO_REPUESTO) -------
// [name, category, priceBs, stock (= entrada), stockMin]
const SPARE: [string, string, number, number, number][] = [
  ["Pantalla Tecno Spark Go 2023", "Pantalla", 140, 5, 2], // REPS-001
  ["Pantalla Tecno Spark Go 2024", "Pantalla", 150, 5, 2],
  ["Pantalla Samsung A50", "Pantalla", 170, 5, 2],
  ["Pantalla Samsung A12", "Pantalla", 180, 5, 2],
  ["Pantalla Samsung A10", "Pantalla", 150, 5, 2],
  ["Pantalla Samsung A30", "Pantalla", 180, 5, 2],
  ["Pantalla Samsung A11", "Pantalla", 180, 5, 2],
  ["Pantalla Xiaomi Redmi Note 10 Pro", "Pantalla", 220, 5, 2],
  ["Pantalla Samsung A13", "Pantalla", 160, 3, 2],
  ["Pantalla Xiaomi Redmi Note 9 Pro", "Pantalla", 180, 3, 2],
  ["Pantalla Xiaomi Redmi 9", "Pantalla", 160, 3, 2],
  ["Pantalla Xiaomi Redmi Note 10 Pro (v2)", "Pantalla", 190, 3, 2],
  ["Pantalla Huawei Y5", "Pantalla", 120, 3, 2],
  ["Pantalla Huawei Y6", "Pantalla", 140, 3, 2],
  ["Pantalla Huawei Y7", "Pantalla", 160, 3, 2],
  ["Pantalla Huawei Y9 2019", "Pantalla", 150, 2, 2],
  ["Pantalla Huawei P30 Lite", "Pantalla", 180, 2, 2],
  ["Pantalla Infinix Note 30", "Pantalla", 190, 4, 2],
  ["Pantalla Infinix Note 30 Pro", "Pantalla", 250, 4, 2],
  ["Pantalla Infinix Note 40 Pro", "Pantalla", 380, 4, 2],
  ["Batería Samsung A02", "Batería", 120, 3, 2],
  ["Batería Samsung A12", "Batería", 130, 3, 2],
  ["Batería Tecno Spark Go 2024", "Batería", 130, 3, 2],
  ["Batería Tecno Pova 5", "Batería", 160, 3, 2],
  ["Batería Tecno Pova 2", "Batería", 150, 3, 2],
  ["Batería Samsung J5", "Batería", 50, 3, 2],
  ["Batería Samsung J7", "Batería", 70, 3, 2],
  ["Batería Xiaomi Redmi Note 13", "Batería", 130, 3, 2],
  ["Batería Infinix Note 50 Pro", "Batería", 180, 3, 2],
  ["Tapa Samsung A10", "Tapa", 70, 10, 3],
  ["Tapa Samsung A12", "Tapa", 70, 10, 3],
  ["Tapa Samsung A11", "Tapa", 60, 10, 3],
  ["Tapa Huawei P20 Lite", "Tapa", 50, 10, 3],
  ["Tapa Huawei P30 Lite", "Tapa", 60, 10, 3],
  ["Tapa Xiaomi Redmi Note 10 Pro", "Tapa", 60, 10, 3],
  ["Tapa Samsung A30", "Tapa", 50, 10, 3],
  ["Tapa Samsung A50", "Tapa", 50, 10, 3],
  ["Tapa Samsung A20s", "Tapa", 50, 10, 3],
  ["Tapa Tecno Spark Go 2024", "Tapa", 40, 10, 3],
  ["Tapa Samsung A56", "Tapa", 60, 10, 3],
  ["Tapa Samsung A10s", "Tapa", 50, 10, 3],
  ["Tapa Huawei Y9 Prime", "Tapa", 60, 10, 3],
  ["Tapa Huawei P40 Lite", "Tapa", 60, 10, 3],
  ["Módulo de carga Samsung A50", "Módulo de carga", 35, 5, 2],
  ["Módulo de carga Samsung A10", "Módulo de carga", 25, 5, 2],
  ["Módulo de carga Tecno Spark Go 2023", "Módulo de carga", 35, 5, 2],
  ["Módulo de carga Tecno Spark Go 2024", "Módulo de carga", 35, 5, 2],
  ["Módulo de carga Samsung A11", "Módulo de carga", 25, 5, 2],
  ["Módulo de carga Samsung A13", "Módulo de carga", 30, 5, 2],
  ["Módulo de carga Huawei Y5", "Módulo de carga", 25, 5, 2],
  ["Módulo de carga Huawei Y6", "Módulo de carga", 30, 5, 2],
  ["Módulo de carga Huawei Y7", "Módulo de carga", 35, 5, 2],
  ["Módulo de carga Infinix Note 30 Pro", "Módulo de carga", 45, 5, 2],
  ["Módulo de carga Infinix Note 40 Pro", "Módulo de carga", 50, 5, 2],
  ["Pantalla Xiaomi Redmi A5", "Pantalla", 180, 2, 2], // REPS-055
];

// --- Clientes + equipos (Excel: CLIENTES + EQUIPOS) ----------------------
// [name, phone, zone, note, brand, model]
const CLIENTS: [string, string, string, string, string, string][] = [
  ["Martín Laura", "72565282", "Los Sauces", "Cliente frecuente", "Tecno", "Pova 5"],
  ["Sebastián Loza", "72540528", "Los Sauces", "Solo por WhatsApp", "Samsung", "Galaxy A50"],
  ["Edmar Gonzales", "69564663", "Los Cedros", "Cliente frecuente", "Infinix", "Note 30"],
  ["Mario Tipuni", "60406633", "Centro", "Cliente frecuente", "Huawei", "P30 Lite"],
  ["Luz Puro", "67363377", "3 de Mayo", "Cliente frecuente", "Tecno", "Spark Go 2024"],
  ["Nayeli Villegas", "67443020", "16 de Julio", "Cliente frecuente", "Huawei", "Y9 2019"],
  ["Jorge Ququi", "67994420", "Puerto Motor", "Solo por WhatsApp", "Samsung", "Galaxy A20"],
  ["Andry Vargas", "72549234", "Los Sauces", "Tiene garantía", "Samsung", "Galaxy A30"],
  ["Ashley", "69206998", "Centro", "Solo por WhatsApp", "Samsung", "Galaxy A10"],
  ["Marianela Vaca", "67894353", "Villa Lourdes", "Solo por WhatsApp", "Samsung", "Galaxy A30s"],
  ["Dina Chao", "67854354", "3 de Mayo", "Cliente frecuente", "Samsung", "Galaxy A12"],
  ["Dayana Queteguari", "67543467", "3 de Mayo", "Cliente frecuente", "Samsung", "Galaxy A11"],
  ["Milton Flores", "68453244", "Isla Grande", "Solo por WhatsApp", "Samsung", "Galaxy A13"],
  ["Marianela Gómez", "77754532", "Isla Grande", "Cliente frecuente", "Xiaomi", "Redmi Note 9 Pro"],
  ["Cecilio Vásquez", "69697743", "Los Sauces", "Solo por WhatsApp", "Xiaomi", "Redmi Note 10 Pro"],
  ["Vladimir Palomeque", "73964041", "Penocos", "Cliente frecuente", "Xiaomi", "Redmi Note 13"],
  ["Claritza Suárez", "63273350", "Penocos", "Cliente frecuente", "Xiaomi", "Redmi 9"],
  ["Deimer Velázquez", "73920586", "Penocos", "Cliente frecuente", "Xiaomi", "Redmi Note 10 Pro"],
  ["Edson Guzmán", "69454083", "Ambaibos", "Cliente frecuente", "Xiaomi", "Redmi A5"],
  ["Fernanda Mamani", "73922751", "Siringal", "Cliente frecuente", "Tecno", "Spark Go 2023"],
];

// --- Órdenes (Excel: ORDEN_SERVICIO + DIAGNOSTICO + DETALLE + PAGOS) ------
// tec: 0=Carlos, 1=Efraín · estado · falla · costo(mano de obra) · part(REPS# or 0)
// · forma · descuento(fracción)
type O = {
  tec: 0 | 1;
  estado: "Terminado" | "En reparacion" | "Recibido";
  falla: string;
  costo: number;
  part: number; // 1-based REPS index, 0 = none
  forma: "Efectivo" | "QR";
  desc: number;
};
const ORDERS: O[] = [
  { tec: 1, estado: "Terminado", falla: "Equipo lento — flasheo de software", costo: 80, part: 0, forma: "Efectivo", desc: 0 },
  { tec: 0, estado: "Terminado", falla: "Equipo lento — flasheo de software", costo: 60, part: 0, forma: "Efectivo", desc: 0 },
  { tec: 0, estado: "Terminado", falla: "Bloqueo de operador — liberación", costo: 150, part: 0, forma: "Efectivo", desc: 0 },
  { tec: 0, estado: "Terminado", falla: "Pantalla rota — cambio de pantalla", costo: 150, part: 17, forma: "Efectivo", desc: 0 },
  { tec: 0, estado: "Terminado", falla: "Carcasa dañada — cambio de tapa", costo: 50, part: 39, forma: "QR", desc: 0 },
  { tec: 0, estado: "En reparacion", falla: "Pantalla rota — cambio de pantalla", costo: 160, part: 16, forma: "QR", desc: 0.1 },
  { tec: 0, estado: "En reparacion", falla: "Equipo lento — flasheo de software", costo: 80, part: 0, forma: "Efectivo", desc: 0 },
  { tec: 1, estado: "Terminado", falla: "Pantalla rota — cambio de pantalla", costo: 30, part: 6, forma: "Efectivo", desc: 0 },
  { tec: 1, estado: "Terminado", falla: "Pantalla rota — cambio de pantalla", costo: 30, part: 5, forma: "Efectivo", desc: 0 },
  { tec: 1, estado: "Terminado", falla: "Liberación de país", costo: 30, part: 0, forma: "QR", desc: 0 },
  { tec: 1, estado: "En reparacion", falla: "Batería defectuosa — cambio de batería", costo: 30, part: 22, forma: "Efectivo", desc: 0 },
  { tec: 0, estado: "Recibido", falla: "Pantalla rota — cambio de pantalla", costo: 30, part: 7, forma: "Efectivo", desc: 0.15 },
  { tec: 1, estado: "En reparacion", falla: "Pantalla rota — cambio de pantalla", costo: 30, part: 9, forma: "Efectivo", desc: 0 },
  { tec: 1, estado: "Recibido", falla: "Bloqueo de cuenta — cambio de email", costo: 30, part: 0, forma: "QR", desc: 0 },
  { tec: 1, estado: "Recibido", falla: "Pantalla rota — cambio de pantalla", costo: 30, part: 12, forma: "QR", desc: 0 },
  { tec: 1, estado: "Recibido", falla: "Batería defectuosa — cambio de batería", costo: 30, part: 28, forma: "QR", desc: 0 },
  { tec: 0, estado: "Recibido", falla: "Pantalla rota — cambio de pantalla", costo: 30, part: 11, forma: "Efectivo", desc: 0 },
  { tec: 1, estado: "Recibido", falla: "Carcasa dañada — cambio de tapa", costo: 30, part: 35, forma: "Efectivo", desc: 0 },
  { tec: 1, estado: "Recibido", falla: "Pantalla rota — cambio de pantalla", costo: 30, part: 55, forma: "Efectivo", desc: 0 },
  { tec: 0, estado: "Recibido", falla: "Pantalla rota — cambio de pantalla", costo: 30, part: 1, forma: "Efectivo", desc: 0 },
];

const STATUS_MAP: Record<O["estado"], RepairStatus> = {
  Terminado: "DELIVERED",
  "En reparacion": "REPAIRING",
  Recibido: "NEW",
};
const HISTORY_NOTE: Record<RepairStatus, string> = {
  NEW: "Equipo recibido en recepción.",
  DIAGNOSIS: "Equipo en diagnóstico técnico.",
  WAITING_FOR_PARTS: "A la espera de repuestos.",
  REPAIRING: "Reparación en curso.",
  COMPLETED: "Reparación finalizada, listo para entrega.",
  DELIVERED: "Equipo entregado al cliente.",
  CANCELLED: "Orden cancelada.",
};

async function main() {
  await prisma.payment.deleteMany();
  await prisma.orderPart.deleteMany();
  await prisma.repairStatusHistory.deleteMany();
  await prisma.repairOrder.deleteMany();
  await prisma.device.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.sparePart.deleteMany();

  const technicians = await Promise.all(TECS.map((data) => prisma.technician.create({ data })));

  const spareParts = await Promise.all(
    SPARE.map(([name, category, priceBs, stock, stockMin], i) =>
      prisma.sparePart.create({
        data: { code: `REPS-${String(i + 1).padStart(3, "0")}`, name, category, priceBs, stock, stockMin },
      }),
    ),
  );

  // Customers + their single device.
  const devices = [];
  for (const [name, phone, zone, note, brand, model] of CLIENTS) {
    const customer = await prisma.customer.create({
      data: { name, phone: `+591 ${phone}`, address: `${zone}, Rurrenabaque, Beni`, note },
    });
    devices.push(
      await prisma.device.create({
        data: { customerId: customer.id, type: "Teléfono", brand, model, accessories: "Solo equipo" },
      }),
    );
  }

  const now = Date.now();
  const usedCount = new Map<string, number>();

  for (let i = 0; i < ORDERS.length; i++) {
    const o = ORDERS[i];
    const status = STATUS_MAP[o.estado];
    const tech = technicians[o.tec];
    const part = o.part ? spareParts[o.part - 1] : null;
    const partPrice = part ? part.priceBs : 0;
    const subtotal = o.costo + partPrice;
    const discountBs = Math.round(subtotal * o.desc);

    // Dates: delivered older, repairing mid, received recent.
    const daysAgo = status === "DELIVERED" ? 40 - i : status === "REPAIRING" ? 9 : i % 5;
    const createdAt = new Date(now - daysAgo * DAY - (i % 8) * 3600 * 1000);
    const closedAt = status === "DELIVERED" ? new Date(createdAt.getTime() + 3 * DAY) : null;

    // History path.
    let steps: RepairStatus[];
    if (status === "DELIVERED") steps = ["NEW", "DIAGNOSIS", "REPAIRING", "COMPLETED", "DELIVERED"];
    else if (status === "REPAIRING") steps = ["NEW", "DIAGNOSIS", "REPAIRING"];
    else steps = ["NEW"];
    const end = (closedAt ?? new Date()).getTime();
    const span = Math.max(DAY, end - createdAt.getTime());

    if (part) usedCount.set(part.id, (usedCount.get(part.id) ?? 0) + 1);

    const order = await prisma.repairOrder.create({
      data: {
        orderCode: `REP-2026-${String(i + 1).padStart(4, "0")}`,
        deviceId: devices[i].id,
        description: o.falla,
        priority: "MEDIUM",
        status,
        estimatedCost: subtotal,
        laborCost: o.costo,
        estimatedReadyAt: new Date(createdAt.getTime() + 3 * DAY),
        createdAt,
        closedAt,
        history: {
          create: steps.map((st, idx) => ({
            status: st,
            note: HISTORY_NOTE[st],
            technicianId: tech.id,
            changedAt: new Date(createdAt.getTime() + Math.round((span * idx) / steps.length)),
          })),
        },
        ...(part ? { parts: { create: { sparePartId: part.id, quantity: 1, unitPriceBs: part.priceBs } } } : {}),
      },
    });

    // Payment for every order (Excel PAGOS): paid if delivered, else pending.
    await prisma.payment.create({
      data: {
        repairOrderId: order.id,
        method: o.forma === "QR" ? "QR" : ("CASH" as PaymentMethod),
        discountBs,
        totalBs: Math.max(0, subtotal - discountBs),
        status: status === "DELIVERED" ? "PAID" : "PENDING",
        paidAt: closedAt ?? createdAt,
      },
    });
  }

  // Apply stock consumption (entrada − salida = stock actual).
  for (const [sparePartId, used] of usedCount) {
    const sp = spareParts.find((s) => s.id === sparePartId)!;
    await prisma.sparePart.update({
      where: { id: sparePartId },
      data: { stock: Math.max(0, sp.stock - used) },
    });
  }

  const counts = {
    technicians: await prisma.technician.count(),
    customers: await prisma.customer.count(),
    devices: await prisma.device.count(),
    repairOrders: await prisma.repairOrder.count(),
    spareParts: await prisma.sparePart.count(),
    orderParts: await prisma.orderPart.count(),
    payments: await prisma.payment.count(),
    history: await prisma.repairStatusHistory.count(),
  };
  console.log("Seed completado / Seed complete:", counts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
