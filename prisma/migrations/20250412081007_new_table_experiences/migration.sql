/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `audioUrl` on the `Experience` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "City" DROP COLUMN "audioUrl";

-- AlterTable
ALTER TABLE "CityTranslation" ADD COLUMN     "audioUrl" TEXT;

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "audioUrl";

-- AlterTable
ALTER TABLE "ExperienceTranslation" ADD COLUMN     "audioUrl" TEXT;
