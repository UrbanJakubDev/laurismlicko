/*
  Warnings:

  - You are about to alter the column `dailyMilkAmount` on the `BabyMeasurement` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `weight` on the `BabyMeasurement` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `amount` on the `Feed` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `amount` on the `Poop` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BabyMeasurement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "babyId" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "height" REAL NOT NULL,
    "dailyMilkAmount" INTEGER NOT NULL,
    "feedsPerDay" INTEGER NOT NULL DEFAULT 8,
    "averageFeedAmount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BabyMeasurement_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BabyMeasurement" ("babyId", "createdAt", "dailyMilkAmount", "height", "id", "updatedAt", "weight") SELECT "babyId", "createdAt", "dailyMilkAmount", "height", "id", "updatedAt", "weight" FROM "BabyMeasurement";
DROP TABLE "BabyMeasurement";
ALTER TABLE "new_BabyMeasurement" RENAME TO "BabyMeasurement";
CREATE TABLE "new_Feed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "babyId" INTEGER NOT NULL,
    "feedTime" DATETIME NOT NULL,
    "amount" INTEGER NOT NULL,
    CONSTRAINT "Feed_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Feed" ("amount", "babyId", "createdAt", "feedTime", "id", "updatedAt") SELECT "amount", "babyId", "createdAt", "feedTime", "id", "updatedAt" FROM "Feed";
DROP TABLE "Feed";
ALTER TABLE "new_Feed" RENAME TO "Feed";
CREATE TABLE "new_Poop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "babyId" INTEGER NOT NULL,
    "poopTime" DATETIME NOT NULL,
    "color" TEXT NOT NULL,
    "consistency" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    CONSTRAINT "Poop_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Poop" ("amount", "babyId", "color", "consistency", "createdAt", "id", "poopTime", "updatedAt") SELECT "amount", "babyId", "color", "consistency", "createdAt", "id", "poopTime", "updatedAt" FROM "Poop";
DROP TABLE "Poop";
ALTER TABLE "new_Poop" RENAME TO "Poop";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
