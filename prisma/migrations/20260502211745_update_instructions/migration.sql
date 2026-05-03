/*
  Warnings:

  - You are about to drop the column `iconName` on the `InstructionCategory` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `InstructionCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InstructionStep" ADD COLUMN "imageAlt" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InstructionCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_InstructionCategory" ("createdAt", "description", "id", "slug", "sortOrder", "title", "updatedAt") SELECT "createdAt", "description", "id", "slug", "sortOrder", "title", "updatedAt" FROM "InstructionCategory";
DROP TABLE "InstructionCategory";
ALTER TABLE "new_InstructionCategory" RENAME TO "InstructionCategory";
CREATE UNIQUE INDEX "InstructionCategory_slug_key" ON "InstructionCategory"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
