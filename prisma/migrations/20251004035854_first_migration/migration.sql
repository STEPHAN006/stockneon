/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Post";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Piece" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Technician" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "reference" TEXT,
    "pieceId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "priceUnit" REAL NOT NULL,
    "total" REAL NOT NULL,
    CONSTRAINT "Entry_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "pieceId" INTEGER NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "observation" TEXT,
    CONSTRAINT "Exit_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exit_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '',
    "name" TEXT
);
INSERT INTO "new_User" ("email", "id", "name") SELECT "email", "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");
