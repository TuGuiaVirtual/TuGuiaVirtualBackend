/*
  Warnings:

  - You are about to drop the column `buttonText` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `City` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "City_name_key";

-- AlterTable
ALTER TABLE "City" DROP COLUMN "buttonText",
DROP COLUMN "description",
DROP COLUMN "name";

-- CreateTable
CREATE TABLE "CityTranslation" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,

    CONSTRAINT "CityTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CityTranslation_cityId_language_key" ON "CityTranslation"("cityId", "language");

-- AddForeignKey
ALTER TABLE "CityTranslation" ADD CONSTRAINT "CityTranslation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
