// Seed script: realistic demo data for Android Market (Rurrenabaque, Beni).
// Phone-focused repair shop. Includes spare-parts inventory, parts used per
// order, and payments — matching the academic proposal + Excel data model.
// Run via `npm run db:seed` (or automatically by `npm run db:reset`).
import {
  PrismaClient,
  RepairStatus,
  Priority,
  PaymentMethod,
} from "@prisma/client";

const prisma = new PrismaClient();

// Deterministic PRNG (mulberry32) so the demo data is stable across runs.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260608);
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const round10 = (n: number) => Math.round(n / 10) * 10;
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DAY = 24 * 60 * 60 * 1000;
const STATUS_FLOW: RepairStatus[] = [
  "NEW",
  "DIAGNOSIS",
  "WAITING_FOR_PARTS",
  "REPAIRING",
  "COMPLETED",
  "DELIVERED",
];

const ZONES = [
  "Los Sauces",
  "Los Cedros",
  "Centro",
  "3 de Mayo",
  "16 de Julio",
  "Puerto Motor",
  "Villa Lourdes",
  "Isla Grande",
  "Penocos",
  "Ambaibos",
  "Siringal",
];
const NOTES = ["Cliente frecuente", "Solo por WhatsApp", "Tiene garantía", null, null];
const phone = () => `+591 ${pick(["7", "6"])}${randInt(1000000, 9999999)}`;

const CUSTOMERS = [
  "Juan Vargas", "María Limpias", "Carlos Suárez", "Rosa Mamani", "Pedro Justiniano",
  "Martín Laura", "Sebastián Loza", "Edmar Gonzales", "Mario Tipuni", "Luz Puro",
  "Nayeli Villegas", "Jorge Ququi", "Andry Vargas", "Marianela Vaca", "Dina Chao",
  "Dayana Queteguari", "Milton Flores", "Marianela Gómez", "Cecilio Vásquez",
  "Vladimir Palomeque", "Claritza Suárez", "Deimer Velázquez", "Edson Guzmán",
  "Fernanda Mamani", "Ana Roca", "Luis Moreno", "Gabriela Áñez", "Teresa Flores",
  // Businesses
  "Imprenta Don Pepe SRL", "Radio San Miguel", "Hotel Maya de la Amazonía",
  "Farmacia Bolívar", "Internet Café Amazonas", "Colegio San Lorenzo",
  "Restaurante El Tacuara", "Madidi Travel", "Ferretería La Económica", "Pensión Beni",
];

// Phone catalog (brand -> models), aligned with the shop's real devices.
const PHONES: { brand: string; models: string[] }[] = [
  { brand: "Samsung", models: ["Galaxy A10", "Galaxy A11", "Galaxy A12", "Galaxy A13", "Galaxy A20", "Galaxy A30", "Galaxy A50", "Galaxy A14", "Galaxy S21"] },
  { brand: "Xiaomi", models: ["Redmi 9", "Redmi Note 9 Pro", "Redmi Note 10 Pro", "Redmi Note 13", "Redmi A5"] },
  { brand: "Tecno", models: ["Pova 5", "Spark Go 2024", "Spark Go 2023"] },
  { brand: "Huawei", models: ["P30 Lite", "Y9 2019"] },
  { brand: "Infinix", models: ["Note 30"] },
  { brand: "Motorola", models: ["Moto G73"] },
  { brand: "Apple", models: ["iPhone 11", "iPhone 12"] },
];
const ACCESSORIES = ["Solo equipo", "Con cargador", "Con funda", "Con cargador y funda"];

// Services: labor range (Bs) + spare-part category needed (null = software).
type Service = { falla: string; trabajo: string; cat: string | null; labor: [number, number] };
const SERVICES: Service[] = [
  { falla: "Pantalla rota", trabajo: "Cambio de pantalla", cat: "Pantalla", labor: [30, 80] },
  { falla: "No carga la batería", trabajo: "Cambio de batería", cat: "Batería", labor: [30, 60] },
  { falla: "Carcasa dañada", trabajo: "Cambio de tapa", cat: "Tapa", labor: [20, 50] },
  { falla: "No carga / pin dañado", trabajo: "Cambio de pin de carga", cat: "Módulo de carga", labor: [30, 60] },
  { falla: "Equipo bloqueado / lento", trabajo: "Flasheo de software", cat: null, labor: [60, 100] },
  { falla: "Bloqueo por operador", trabajo: "Liberación de operador", cat: null, labor: [100, 150] },
  { falla: "Equipo con humedad", trabajo: "Limpieza interna", cat: null, labor: [30, 50] },
];

// Spare parts taken from the shop's real list (Excel).
const SPARE_PARTS: { name: string; category: string; priceBs: number; base: number; min: number }[] = [
  // Pantallas
  { name: "Pantalla Tecno Spark Go 2023", category: "Pantalla", priceBs: 140, base: 5, min: 2 },
  { name: "Pantalla Tecno Spark Go 2024", category: "Pantalla", priceBs: 150, base: 4, min: 2 },
  { name: "Pantalla Samsung A50", category: "Pantalla", priceBs: 170, base: 5, min: 2 },
  { name: "Pantalla Samsung A12", category: "Pantalla", priceBs: 180, base: 5, min: 2 },
  { name: "Pantalla Samsung A10", category: "Pantalla", priceBs: 150, base: 3, min: 2 },
  { name: "Pantalla Samsung A30", category: "Pantalla", priceBs: 180, base: 4, min: 2 },
  { name: "Pantalla Samsung A11", category: "Pantalla", priceBs: 180, base: 4, min: 2 },
  { name: "Pantalla Samsung A13", category: "Pantalla", priceBs: 160, base: 3, min: 2 },
  { name: "Pantalla Xiaomi Redmi Note 10 Pro", category: "Pantalla", priceBs: 220, base: 3, min: 2 },
  { name: "Pantalla Xiaomi Redmi Note 9 Pro", category: "Pantalla", priceBs: 180, base: 3, min: 2 },
  { name: "Pantalla Xiaomi Redmi 9", category: "Pantalla", priceBs: 160, base: 3, min: 2 },
  { name: "Pantalla Huawei Y9 2019", category: "Pantalla", priceBs: 150, base: 2, min: 2 },
  { name: "Pantalla Huawei P30 Lite", category: "Pantalla", priceBs: 180, base: 2, min: 2 },
  { name: "Pantalla Infinix Note 30", category: "Pantalla", priceBs: 190, base: 4, min: 2 },
  { name: "Pantalla Xiaomi Redmi A5", category: "Pantalla", priceBs: 180, base: 2, min: 2 },
  // Baterías
  { name: "Batería Samsung A02", category: "Batería", priceBs: 120, base: 3, min: 2 },
  { name: "Batería Samsung A12", category: "Batería", priceBs: 130, base: 4, min: 2 },
  { name: "Batería Tecno Spark Go 2024", category: "Batería", priceBs: 130, base: 3, min: 2 },
  { name: "Batería Tecno Pova 5", category: "Batería", priceBs: 160, base: 3, min: 2 },
  { name: "Batería Xiaomi Redmi Note 13", category: "Batería", priceBs: 130, base: 3, min: 2 },
  { name: "Batería Infinix Note 30", category: "Batería", priceBs: 180, base: 3, min: 2 },
  // Tapas
  { name: "Tapa Samsung A10", category: "Tapa", priceBs: 70, base: 10, min: 3 },
  { name: "Tapa Samsung A12", category: "Tapa", priceBs: 70, base: 10, min: 3 },
  { name: "Tapa Samsung A11", category: "Tapa", priceBs: 60, base: 10, min: 3 },
  { name: "Tapa Huawei P30 Lite", category: "Tapa", priceBs: 60, base: 8, min: 3 },
  { name: "Tapa Xiaomi Redmi Note 10 Pro", category: "Tapa", priceBs: 60, base: 8, min: 3 },
  { name: "Tapa Samsung A30", category: "Tapa", priceBs: 50, base: 10, min: 3 },
  { name: "Tapa Tecno Spark Go 2024", category: "Tapa", priceBs: 40, base: 10, min: 3 },
  // Módulos de carga
  { name: "Módulo de carga Samsung A50", category: "Módulo de carga", priceBs: 35, base: 5, min: 2 },
  { name: "Módulo de carga Samsung A10", category: "Módulo de carga", priceBs: 25, base: 5, min: 2 },
  { name: "Módulo de carga Tecno Spark Go 2024", category: "Módulo de carga", priceBs: 35, base: 5, min: 2 },
  { name: "Módulo de carga Samsung A11", category: "Módulo de carga", priceBs: 25, base: 5, min: 2 },
  { name: "Módulo de carga Huawei Y9 2019", category: "Módulo de carga", priceBs: 30, base: 5, min: 2 },
  { name: "Módulo de carga Infinix Note 30", category: "Módulo de carga", priceBs: 45, base: 4, min: 2 },
];

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
  // Clean slate (children first) so `db:seed` is safely repeatable on its own.
  await prisma.payment.deleteMany();
  await prisma.orderPart.deleteMany();
  await prisma.repairStatusHistory.deleteMany();
  await prisma.repairOrder.deleteMany();
  await prisma.device.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.sparePart.deleteMany();

  // --- Technicians -------------------------------------------------------
  const technicians = await Promise.all(
    [
      { name: "Carlos Paz Maita", specialization: "Software y hardware", phone: phone() },
      { name: "Efraín Mayta", specialization: "Software y hardware", phone: phone() },
      { name: "Daniela Mamani Choque", specialization: "Microsoldadura", phone: phone() },
    ].map((data) => prisma.technician.create({ data })),
  );

  // --- Spare parts (inventory) ------------------------------------------
  const spareParts = await Promise.all(
    SPARE_PARTS.map((p, i) =>
      prisma.sparePart.create({
        data: {
          code: `REPS-${String(i + 1).padStart(3, "0")}`,
          name: p.name,
          category: p.category,
          priceBs: p.priceBs,
          stock: p.base,
          stockMin: p.min,
        },
      }),
    ),
  );
  const partsByCategory = new Map<string, typeof spareParts>();
  for (const sp of spareParts) {
    const list = partsByCategory.get(sp.category) ?? [];
    list.push(sp);
    partsByCategory.set(sp.category, list);
  }
  const usedCount = new Map<string, number>(); // sparePartId -> units used

  // --- Customers ---------------------------------------------------------
  const customers = await Promise.all(
    CUSTOMERS.map((name) =>
      prisma.customer.create({
        data: {
          name,
          ci: rand() > 0.5 ? String(randInt(3000000, 9999999)) : null,
          phone: phone(),
          email: rand() > 0.7 ? `${name.split(" ")[0].toLowerCase()}@gmail.com` : null,
          address: `${pick(ZONES)}, Rurrenabaque, Beni`,
          note: pick(NOTES),
        },
      }),
    ),
  );

  // --- Devices (~72 phones) ---------------------------------------------
  const DEVICE_COUNT = 72;
  const devices = [];
  for (let i = 0; i < DEVICE_COUNT; i++) {
    const customer = customers[i % customers.length];
    const entry = pick(PHONES);
    devices.push(
      await prisma.device.create({
        data: {
          customerId: customer.id,
          type: "Teléfono",
          brand: entry.brand,
          model: pick(entry.models),
          serialNumber: rand() > 0.4 ? String(randInt(100000000000000, 999999999999999)) : null,
          accessories: pick(ACCESSORIES),
        },
      }),
    );
  }

  // --- Order status distribution (one order per device) ------------------
  // 46 DELIVERED + 8 COMPLETED = 54 "completadas"; 16 active; 2 cancelled.
  const statusPlan: RepairStatus[] = [
    ...Array(46).fill("DELIVERED"),
    ...Array(8).fill("COMPLETED"),
    ...Array(4).fill("NEW"),
    ...Array(4).fill("DIAGNOSIS"),
    ...Array(4).fill("WAITING_FOR_PARTS"),
    ...Array(4).fill("REPAIRING"),
    ...Array(2).fill("CANCELLED"),
  ];
  const statuses = shuffle(statusPlan);
  const DURATIONS = [1, 2, 2, 3, 3, 3, 4, 4, 5, 6];
  const now = Date.now();

  type Spec = {
    deviceIdx: number;
    status: RepairStatus;
    service: Service;
    createdAt: Date;
    closedAt: Date | null;
    estimatedReadyAt: Date;
    priority: Priority;
  };
  const specs: Spec[] = devices.map((_, i) => {
    const status = statuses[i];
    const closed = status === "DELIVERED" || status === "CANCELLED";
    const active = !["COMPLETED", "DELIVERED", "CANCELLED"].includes(status);
    const daysAgo = active ? randInt(0, 18) : randInt(4, 120);
    const createdAt = new Date(now - daysAgo * DAY - randInt(0, 23) * 3600 * 1000);
    const duration = pick(DURATIONS);
    return {
      deviceIdx: i,
      status,
      service: pick(SERVICES),
      createdAt,
      closedAt: closed ? new Date(createdAt.getTime() + duration * DAY) : null,
      estimatedReadyAt: new Date(createdAt.getTime() + randInt(2, 6) * DAY),
      priority: pick<Priority>(["LOW", "MEDIUM", "MEDIUM", "HIGH", "URGENT"]),
    };
  });
  specs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  let counter = 0;
  for (const spec of specs) {
    counter++;
    const device = devices[spec.deviceIdx];
    const { service, status } = spec;
    const orderCode = `REP-${spec.createdAt.getFullYear()}-${String(counter).padStart(4, "0")}`;

    // History steps.
    let steps: RepairStatus[];
    if (status === "CANCELLED") steps = ["NEW", "DIAGNOSIS", "CANCELLED"];
    else steps = STATUS_FLOW.slice(0, STATUS_FLOW.indexOf(status) + 1);

    // Labor cost set once the order has been diagnosed.
    const hasLabor = status !== "NEW";
    const laborCost = hasLabor ? round10(randInt(service.labor[0], service.labor[1])) : null;

    // A part is consumed once the order is at/over "En reparación".
    const consumesPart =
      service.cat != null && ["REPAIRING", "COMPLETED", "DELIVERED"].includes(status);
    let part: (typeof spareParts)[number] | null = null;
    if (consumesPart) {
      const pool = partsByCategory.get(service.cat!) ?? [];
      if (pool.length) {
        part = pick(pool);
        usedCount.set(part.id, (usedCount.get(part.id) ?? 0) + 1);
      }
    }
    const partsTotal = part ? part.priceBs : 0;
    const estimatedCost = round10((laborCost ?? 40) + partsTotal);

    const order = await prisma.repairOrder.create({
      data: {
        orderCode,
        deviceId: device.id,
        description: `${service.falla} — ${service.trabajo}`,
        priority: spec.priority,
        status,
        estimatedCost,
        laborCost,
        estimatedReadyAt: spec.estimatedReadyAt,
        createdAt: spec.createdAt,
        closedAt: spec.closedAt,
        history: {
          create: steps.map((st, idx) => ({
            status: st,
            note: HISTORY_NOTE[st],
            technicianId: technicians[(counter + idx) % technicians.length].id,
            changedAt: new Date(
              spec.createdAt.getTime() +
                Math.round(
                  (Math.max(DAY, (spec.closedAt ?? new Date()).getTime() - spec.createdAt.getTime()) *
                    idx) /
                    steps.length,
                ),
            ),
          })),
        },
        ...(part
          ? {
              parts: {
                create: { sparePartId: part.id, quantity: 1, unitPriceBs: part.priceBs },
              },
            }
          : {}),
      },
    });

    // Payment for completed/delivered orders.
    if (status === "DELIVERED" || status === "COMPLETED") {
      const discountBs = rand() > 0.8 ? round10(randInt(10, 30)) : 0;
      const total = Math.max(0, (laborCost ?? 0) + partsTotal - discountBs);
      const paid = status === "DELIVERED" || rand() > 0.5;
      await prisma.payment.create({
        data: {
          repairOrderId: order.id,
          method: pick<PaymentMethod>(["CASH", "CASH", "QR", "TRANSFER"]),
          discountBs,
          totalBs: total,
          status: paid ? "PAID" : "PENDING",
          paidAt: spec.closedAt ?? new Date(),
        },
      });
    }
  }

  // Apply stock consumption (entrada − salida).
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
