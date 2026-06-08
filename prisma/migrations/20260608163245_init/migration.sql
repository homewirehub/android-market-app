-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT,
    CONSTRAINT "Device_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RepairOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderCode" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    CONSTRAINT "RepairOrder_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RepairStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repairOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "technicianId" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RepairStatusHistory_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RepairStatusHistory_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Technician" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "specialization" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "RepairOrder_orderCode_key" ON "RepairOrder"("orderCode");
