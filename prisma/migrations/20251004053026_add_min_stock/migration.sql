-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Piece" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Piece" ("description", "id", "location", "name", "stock") SELECT "description", "id", "location", "name", "stock" FROM "Piece";
DROP TABLE "Piece";
ALTER TABLE "new_Piece" RENAME TO "Piece";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
