/*
  Warnings:

  - You are about to drop the column `infthirdInfo` on the `ExperienceTranslation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExperienceTranslation" DROP COLUMN "infthirdInfo",
ADD COLUMN     "thirdInfo" TEXT;
