// Seed script: realistic demo data so the app never looks empty.
// Run via `npm run db:seed` (or automatically by `npm run db:reset`).
// Bolivian customer/technician names and realistic devices.
import { PrismaClient, RepairStatus, Priority } from "@prisma/client";

const prisma = new PrismaClient();

// Deterministic per-year counter for human-readable order codes.
const codeCounters: Record<number, number> = {};
function nextOrderCode(year: number): string {
  codeCounters[year] = (codeCounters[year] ?? 0) + 1;
  return `REP-${year}-${String(codeCounters[year]).padStart(4, "0")}`;
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
    ].map((data) => prisma.technician.create({ data })),
  );

  // --- Customers ---------------------------------------------------------
  const customerData = [
    { name: "Juan Carlos Rojas", phone: "+591 70011223", email: "jc.rojas@gmail.com", address: "Av. Ballivián #245, Cochabamba" },
    { name: "María Fernanda Gutiérrez", phone: "+591 71234567", email: "mf.gutierrez@hotmail.com", address: "Calle Bolívar #112, Cochabamba" },
    { name: "Pedro Pablo Mamani", phone: "+591 68855112", email: null, address: "Zona Sur, Calle 21 #30, La Paz" },
    { name: "Ana Lucía Vargas", phone: "+591 72998877", email: "analu.vargas@gmail.com", address: "Av. América #1450, Cochabamba" },
    { name: "Carlos Eduardo Fernández", phone: "+591 70566778", email: "ce.fernandez@yahoo.com", address: "Barrio Las Cuadras, Santa Cruz" },
    { name: "Roxana Choque Condori", phone: "+591 69912345", email: "roxana.choque@gmail.com", address: "Av. Heroínas #890, Cochabamba" },
    { name: "Luis Alberto Téllez", phone: "+591 71100992", email: null, address: "Calle Sucre #67, Cochabamba" },
    { name: "Gabriela Sánchez Ríos", phone: "+591 70788654", email: "gaby.sanchez@gmail.com", address: "Av. Pando #234, Cochabamba" },
    { name: "Jorge Luis Apaza", phone: "+591 68877001", email: "jl.apaza@outlook.com", address: "Zona Norte, Calle 9 #14, Cochabamba" },
  ];
  const customers = await Promise.all(
    customerData.map((data) => prisma.customer.create({ data })),
  );

  // --- Devices -----------------------------------------------------------
  // Each entry references a customer by index.
  const deviceData: {
    c: number;
    type: string;
    brand: string;
    model: string;
    serialNumber: string | null;
  }[] = [
    { c: 0, type: "Laptop", brand: "HP", model: "Pavilion 15", serialNumber: "HP5X88231" },
    { c: 0, type: "Teléfono", brand: "Samsung", model: "Galaxy A54", serialNumber: "SMA54-99201" },
    { c: 1, type: "Laptop", brand: "Lenovo", model: "IdeaPad 3", serialNumber: "LNV-IP3-4521" },
    { c: 1, type: "Tablet", brand: "Samsung", model: "Galaxy Tab A8", serialNumber: "TABA8-7741" },
    { c: 2, type: "Impresora", brand: "Epson", model: "L3250", serialNumber: "EPL3250-1180" },
    { c: 2, type: "Teléfono", brand: "Xiaomi", model: "Redmi Note 12", serialNumber: "RN12-55320" },
    { c: 3, type: "Laptop", brand: "Dell", model: "Inspiron 14", serialNumber: "DL14-30012" },
    { c: 3, type: "Teléfono", brand: "iPhone", model: "iPhone 12", serialNumber: "IP12-88991" },
    { c: 4, type: "Impresora", brand: "HP", model: "LaserJet M141w", serialNumber: "HPM141-2003" },
    { c: 4, type: "Laptop", brand: "Asus", model: "VivoBook 15", serialNumber: "ASVB15-7782" },
    { c: 5, type: "Tablet", brand: "Apple", model: "iPad 9na gen", serialNumber: "IPAD9-11203" },
    { c: 5, type: "Teléfono", brand: "Motorola", model: "Moto G73", serialNumber: "MG73-44120" },
    { c: 6, type: "Laptop", brand: "Acer", model: "Aspire 5", serialNumber: "ACA5-66210" },
    { c: 7, type: "Teléfono", brand: "Samsung", model: "Galaxy S21", serialNumber: "SGS21-33001" },
    { c: 7, type: "Impresora", brand: "Canon", model: "PIXMA G3110", serialNumber: "CG3110-9087" },
    { c: 8, type: "Laptop", brand: "HP", model: "ProBook 440", serialNumber: "HPPB440-1290" },
  ];
  const devices = await Promise.all(
    deviceData.map(({ c, ...rest }) =>
      prisma.device.create({ data: { customerId: customers[c].id, ...rest } }),
    ),
  );

  // --- Repair orders + matching status history ---------------------------
  // The status progression for each order; the LAST status is the current one.
  // For DELIVERED orders we also set closedAt.
  const STATUS_FLOW: RepairStatus[] = [
    "NEW",
    "DIAGNOSIS",
    "WAITING_FOR_PARTS",
    "REPAIRING",
    "COMPLETED",
    "DELIVERED",
  ];

  type OrderSpec = {
    device: number;
    description: string;
    priority: Priority;
    current: RepairStatus;
    daysAgo: number;
  };

  const orderSpecs: OrderSpec[] = [
    { device: 0, description: "No enciende, posible falla de placa madre.", priority: "HIGH", current: "DIAGNOSIS", daysAgo: 3 },
    { device: 1, description: "Pantalla rota, reemplazo de display.", priority: "MEDIUM", current: "WAITING_FOR_PARTS", daysAgo: 8 },
    { device: 2, description: "Muy lenta, formateo y reinstalación de Windows.", priority: "LOW", current: "REPAIRING", daysAgo: 5 },
    { device: 3, description: "No carga la batería, revisar puerto USB-C.", priority: "MEDIUM", current: "NEW", daysAgo: 1 },
    { device: 4, description: "Atasco de papel recurrente y manchas en impresión.", priority: "LOW", current: "COMPLETED", daysAgo: 12 },
    { device: 5, description: "Cambio de batería, se descarga muy rápido.", priority: "MEDIUM", current: "DELIVERED", daysAgo: 20 },
    { device: 6, description: "Teclado no responde, posible reemplazo.", priority: "HIGH", current: "WAITING_FOR_PARTS", daysAgo: 6 },
    { device: 7, description: "Cara frontal rota, cambio de pantalla y cristal.", priority: "URGENT", current: "REPAIRING", daysAgo: 4 },
    { device: 8, description: "No imprime en negro, limpieza de cabezales.", priority: "MEDIUM", current: "COMPLETED", daysAgo: 10 },
    { device: 9, description: "Sobrecalentamiento, cambio de pasta térmica.", priority: "MEDIUM", current: "DELIVERED", daysAgo: 25 },
    { device: 10, description: "No reconoce el cargador, revisión de conector.", priority: "LOW", current: "DIAGNOSIS", daysAgo: 2 },
    { device: 11, description: "Micrófono no funciona en llamadas.", priority: "LOW", current: "NEW", daysAgo: 1 },
    { device: 12, description: "Bisagra de pantalla rota, reparación estructural.", priority: "HIGH", current: "REPAIRING", daysAgo: 7 },
    { device: 13, description: "No da señal, revisar banda base.", priority: "HIGH", current: "DIAGNOSIS", daysAgo: 3 },
    { device: 14, description: "Error E05, mantenimiento general de impresora.", priority: "MEDIUM", current: "WAITING_FOR_PARTS", daysAgo: 9 },
    { device: 15, description: "Actualización de SSD y limpieza interna.", priority: "LOW", current: "DELIVERED", daysAgo: 30 },
    { device: 6, description: "Mantenimiento preventivo y limpieza de ventiladores.", priority: "LOW", current: "COMPLETED", daysAgo: 14 },
    { device: 0, description: "Reinstalación del sistema operativo tras virus.", priority: "MEDIUM", current: "NEW", daysAgo: 0 },
  ];

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (const spec of orderSpecs) {
    const createdAt = new Date(now - spec.daysAgo * dayMs);
    const year = createdAt.getFullYear();
    const flowEndIndex = STATUS_FLOW.indexOf(spec.current);
    const isDelivered = spec.current === "DELIVERED";

    const order = await prisma.repairOrder.create({
      data: {
        orderCode: nextOrderCode(year),
        deviceId: devices[spec.device].id,
        description: spec.description,
        priority: spec.priority,
        status: spec.current,
        createdAt,
        closedAt: isDelivered ? new Date(now - Math.max(0, spec.daysAgo - 2) * dayMs) : null,
      },
    });

    // Build a plausible history walking from NEW up to the current status.
    const steps = STATUS_FLOW.slice(0, flowEndIndex + 1);
    const span = Math.max(1, spec.daysAgo);
    for (let i = 0; i < steps.length; i++) {
      const changedAt = new Date(
        createdAt.getTime() + Math.round((span * dayMs * i) / steps.length),
      );
      await prisma.repairStatusHistory.create({
        data: {
          repairOrderId: order.id,
          status: steps[i],
          note: historyNote(steps[i]),
          technicianId: technicians[i % technicians.length].id,
          changedAt,
        },
      });
    }
  }

  // --- Summary -----------------------------------------------------------
  const counts = {
    technicians: await prisma.technician.count(),
    customers: await prisma.customer.count(),
    devices: await prisma.device.count(),
    repairOrders: await prisma.repairOrder.count(),
    history: await prisma.repairStatusHistory.count(),
  };
  console.log("Seed completado / Seed complete:", counts);
}

function historyNote(status: RepairStatus): string {
  switch (status) {
    case "NEW":
      return "Orden registrada en recepción.";
    case "DIAGNOSIS":
      return "Equipo en diagnóstico técnico.";
    case "WAITING_FOR_PARTS":
      return "A la espera de repuestos.";
    case "REPAIRING":
      return "Reparación en curso.";
    case "COMPLETED":
      return "Reparación finalizada, listo para entrega.";
    case "DELIVERED":
      return "Equipo entregado al cliente.";
    default:
      return "";
  }
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
