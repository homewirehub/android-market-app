// Seed script: realistic demo data for Android Market (Rurrenabaque, Beni).
// Run via `npm run db:seed` (or automatically by `npm run db:reset`).
// Scaled so the dashboard KPIs look like a real, busy shop.
import { PrismaClient, RepairStatus, Priority } from "@prisma/client";

const prisma = new PrismaClient();

// Small deterministic PRNG (mulberry32) so the demo data is stable across runs.
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

const STREETS = [
  "Calle Comercio",
  "Av. Aniceto Arce",
  "Calle Santa Cruz",
  "Calle Vaca Díez",
  "Av. 9 de Abril",
  "Calle Avaroa",
  "Calle Bolívar",
  "Av. Costanera",
];
const address = () => `${pick(STREETS)} #${randInt(10, 980)}, Rurrenabaque, Beni`;
const phone = () => `+591 ${pick(["7", "6"])}${randInt(1000000, 9999999)}`;

const CUSTOMERS: string[] = [
  "Juan Vargas",
  "María Limpias",
  "Carlos Suárez",
  "Rosa Mamani",
  "Pedro Justiniano",
  "Ana Roca",
  "Luis Moreno",
  "Gabriela Áñez",
  "Jorge Cuéllar",
  "Elena Saavedra",
  "Marco Chávez",
  "Lucía Parada",
  "Fernando Melgar",
  "Patricia Ribera",
  "Raúl Ortiz",
  "Silvia Nogales",
  "Daniel Vaca",
  "Verónica Salinas",
  "Hugo Camacho",
  "Teresa Flores",
  "Oscar Banegas",
  "Nadia Suárez",
  "Iván Mendoza",
  "Carla Téllez",
  "Ramiro Quispe",
  "Sofía Aguilar",
  // Businesses
  "Imprenta Don Pepe SRL",
  "Radio San Miguel",
  "Hotel Maya de la Amazonía",
  "Farmacia Bolívar",
  "Internet Café Amazonas",
  "Colegio San Lorenzo",
  "Restaurante El Tacuara",
  "Agencia de Turismo Madidi Travel",
  "Ferretería La Económica",
  "Pensión Beni",
  "Heladería Tropical",
  "Mercado Central Puesto 14",
];

const CATALOG: Record<string, { brand: string; models: string[] }[]> = {
  Laptop: [
    { brand: "HP", models: ["Pavilion 15", "ProBook 440", "240 G8"] },
    { brand: "Lenovo", models: ["IdeaPad 3", "ThinkPad E14"] },
    { brand: "Dell", models: ["Inspiron 14", "Latitude 3420"] },
    { brand: "Asus", models: ["VivoBook 15", "X415"] },
    { brand: "Acer", models: ["Aspire 5", "Aspire 3"] },
  ],
  Teléfono: [
    { brand: "Samsung", models: ["Galaxy A14", "Galaxy A54", "Galaxy S21"] },
    { brand: "Xiaomi", models: ["Redmi Note 12", "Redmi 12C"] },
    { brand: "Motorola", models: ["Moto G73", "Moto E13"] },
    { brand: "Apple", models: ["iPhone 11", "iPhone 12"] },
  ],
  Tablet: [
    { brand: "Samsung", models: ["Galaxy Tab A8", "Galaxy Tab A7"] },
    { brand: "Apple", models: ["iPad 9na gen"] },
    { brand: "Lenovo", models: ["Tab M10"] },
  ],
  Impresora: [
    { brand: "Epson", models: ["L3250", "L4260", "L5290"] },
    { brand: "HP", models: ["LaserJet M141w", "Ink Tank 415"] },
    { brand: "Canon", models: ["PIXMA G3110"] },
  ],
};
const TYPES = Object.keys(CATALOG);

const PROBLEMS: Record<string, string[]> = {
  Laptop: [
    "No enciende, posible falla de placa madre.",
    "Muy lenta, formateo y reinstalación de Windows.",
    "Sobrecalentamiento, cambio de pasta térmica.",
    "Teclado no responde, posible reemplazo.",
    "Pantalla con líneas, revisión de cable flex.",
    "No carga la batería, revisar pin de carga.",
  ],
  Teléfono: [
    "Pantalla rota, reemplazo de display.",
    "No carga, revisar puerto USB-C.",
    "Batería se descarga muy rápido, cambio de batería.",
    "Micrófono no funciona en llamadas.",
    "No da señal, revisar banda base.",
    "Mojado, limpieza y revisión general.",
  ],
  Tablet: [
    "Pantalla táctil no responde en una zona.",
    "No reconoce el cargador.",
    "Bloqueada por cuenta, revisión de software.",
    "Botón de encendido hundido.",
  ],
  Impresora: [
    "No reconoce el cartucho de tinta negra; limpieza de cabezales.",
    "Atasco de papel recurrente.",
    "Error E05, mantenimiento general.",
    "No imprime en color, revisión del sistema de tinta.",
  ],
};

const HISTORY_NOTE: Record<RepairStatus, string> = {
  NEW: "Equipo recibido en recepción.",
  DIAGNOSIS: "Equipo en diagnóstico técnico.",
  WAITING_FOR_PARTS: "A la espera de repuestos.",
  REPAIRING: "Reparación en curso.",
  COMPLETED: "Reparación finalizada, listo para entrega.",
  DELIVERED: "Equipo entregado al cliente.",
};

function costFor(type: string): number {
  const ranges: Record<string, [number, number]> = {
    Laptop: [200, 1200],
    Teléfono: [120, 500],
    Tablet: [150, 600],
    Impresora: [150, 700],
  };
  const [lo, hi] = ranges[type] ?? [120, 500];
  return round10(randInt(lo, hi));
}

async function main() {
  // Clean slate (children first) so `db:seed` is safely repeatable on its own.
  await prisma.repairStatusHistory.deleteMany();
  await prisma.repairOrder.deleteMany();
  await prisma.device.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.technician.deleteMany();

  // --- Technicians -------------------------------------------------------
  const technicians = await Promise.all(
    [
      { name: "Marco Antonio Quispe", specialization: "Laptops y placas base" },
      { name: "Daniela Mamani Choque", specialization: "Teléfonos y tablets" },
      { name: "Rodrigo Vargas Téllez", specialization: "Impresoras y periféricos" },
      { name: "Lucía Flores Apaza", specialization: "Diagnóstico y software" },
      { name: "Carlos Mendoza Roca", specialization: "Microsoldadura" },
    ].map((data) => prisma.technician.create({ data })),
  );

  // --- Customers ---------------------------------------------------------
  const customers = await Promise.all(
    CUSTOMERS.map((name) =>
      prisma.customer.create({
        data: {
          name,
          phone: phone(),
          email: rand() > 0.45 ? null : `${name.split(" ")[0].toLowerCase()}@gmail.com`,
          address: address(),
        },
      }),
    ),
  );

  // --- Devices (~72, round-robin across customers) -----------------------
  const DEVICE_COUNT = 72;
  const devices = [];
  for (let i = 0; i < DEVICE_COUNT; i++) {
    const customer = customers[i % customers.length];
    const type = pick(TYPES);
    const entry = pick(CATALOG[type]);
    const model = pick(entry.models);
    devices.push(
      await prisma.device.create({
        data: {
          customerId: customer.id,
          type,
          brand: entry.brand,
          model,
          serialNumber: rand() > 0.3 ? `${entry.brand.slice(0, 3).toUpperCase()}-${randInt(10000, 99999)}` : null,
        },
      }),
    );
  }

  // --- Order status distribution (one order per device) ------------------
  // 50 DELIVERED + 8 COMPLETED = 58 "completadas"; 14 active.
  const statusPlan: RepairStatus[] = [
    ...Array(50).fill("DELIVERED"),
    ...Array(8).fill("COMPLETED"),
    ...Array(3).fill("NEW"),
    ...Array(4).fill("DIAGNOSIS"),
    ...Array(3).fill("WAITING_FOR_PARTS"),
    ...Array(4).fill("REPAIRING"),
  ];
  const statuses = shuffle(statusPlan);

  // Durations (in days) for delivered orders -> average ~3.2 días.
  const DURATIONS = [1, 2, 2, 3, 3, 3, 4, 4, 5, 6];

  const now = Date.now();
  type Spec = {
    deviceIdx: number;
    status: RepairStatus;
    createdAt: Date;
    closedAt: Date | null;
    estimatedReadyAt: Date;
    estimatedCost: number;
    priority: Priority;
  };

  const specs: Spec[] = devices.map((device, i) => {
    const status = statuses[i];
    const active = !["COMPLETED", "DELIVERED"].includes(status);
    const daysAgo = active ? randInt(0, 18) : randInt(4, 120);
    const createdAt = new Date(now - daysAgo * DAY - randInt(0, 23) * 60 * 60 * 1000);
    const duration = pick(DURATIONS);
    const closedAt = status === "DELIVERED" ? new Date(createdAt.getTime() + duration * DAY) : null;
    const estimatedReadyAt = new Date(createdAt.getTime() + randInt(2, 6) * DAY);
    return {
      deviceIdx: i,
      status,
      createdAt,
      closedAt,
      estimatedReadyAt,
      estimatedCost: costFor(device.type),
      priority: pick<Priority>(["LOW", "MEDIUM", "MEDIUM", "HIGH", "URGENT"]),
    };
  });

  // Order by createdAt so order codes increase with time (realistic).
  specs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  let counter = 0;
  for (const spec of specs) {
    counter++;
    const device = devices[spec.deviceIdx];
    const orderCode = `REP-${spec.createdAt.getFullYear()}-${String(counter).padStart(4, "0")}`;
    const flowEnd = STATUS_FLOW.indexOf(spec.status);
    const steps = STATUS_FLOW.slice(0, flowEnd + 1);
    const end = (spec.closedAt ?? new Date()).getTime();
    const span = Math.max(DAY, end - spec.createdAt.getTime());

    await prisma.repairOrder.create({
      data: {
        orderCode,
        deviceId: device.id,
        description: pick(PROBLEMS[device.type] ?? ["Revisión general."]),
        priority: spec.priority,
        status: spec.status,
        estimatedCost: spec.estimatedCost,
        estimatedReadyAt: spec.estimatedReadyAt,
        createdAt: spec.createdAt,
        closedAt: spec.closedAt,
        history: {
          create: steps.map((status, idx) => ({
            status,
            note: HISTORY_NOTE[status],
            technicianId: technicians[(counter + idx) % technicians.length].id,
            changedAt: new Date(spec.createdAt.getTime() + Math.round((span * idx) / steps.length)),
          })),
        },
      },
    });
  }

  const counts = {
    technicians: await prisma.technician.count(),
    customers: await prisma.customer.count(),
    devices: await prisma.device.count(),
    repairOrders: await prisma.repairOrder.count(),
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
