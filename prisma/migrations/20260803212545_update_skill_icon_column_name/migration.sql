/*
  Warnings:

  - You are about to drop the column `iconUrl` on the `Skill` table. All the data in the column will be lost.

*/

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "iconUrl",
ADD COLUMN     "icon" TEXT;
