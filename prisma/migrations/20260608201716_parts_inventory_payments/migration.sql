-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "ci" TEXT;
ALTER TABLE "Customer" ADD COLUMN "note" TEXT;

-- AlterTable
ALTER TABLE "Device" ADD COLUMN "accessories" TEXT;

-- AlterTable
ALTER TABLE "RepairOrder" ADD COLUMN "laborCost" REAL;

-- CreateTable
CREATE TABLE "SparePart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceBs" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMin" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "OrderPart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repairOrderId" TEXT NOT NULL,
    "sparePartId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceBs" REAL NOT NULL,
    CONSTRAINT "OrderPart_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderPart_sparePartId_fkey" FOREIGN KEY ("sparePartId") REFERENCES "SparePart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repairOrderId" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'CASH',
    "discountBs" REAL NOT NULL DEFAULT 0,
    "totalBs" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Technician" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "specialization" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Technician" ("id", "name", "specialization") SELECT "id", "name", "specialization" FROM "Technician";
DROP TABLE "Technician";
ALTER TABLE "new_Technician" RENAME TO "Technician";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SparePart_code_key" ON "SparePart"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_repairOrderId_key" ON "Payment"("repairOrderId");
