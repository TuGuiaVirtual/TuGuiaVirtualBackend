/*
  Warnings:

  - You are about to drop the column `infoCity` on the `City` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "City" DROP COLUMN "infoCity";

-- AlterTable
ALTER TABLE "CityTranslation" ADD COLUMN     "infoCity" TEXT;
