/*
  Warnings:

  - You are about to drop the column `adapted` on the `ExperienceTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `ExperienceTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `ExperienceTranslation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExperienceTranslation" DROP COLUMN "adapted",
DROP COLUMN "age",
DROP COLUMN "time",
ADD COLUMN     "firstInfo" TEXT,
ADD COLUMN     "infthirdInfo" TEXT,
ADD COLUMN     "secondInfo" TEXT;

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "link" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "googleMapsUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantTranslation" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "firstInfo" TEXT NOT NULL,
    "secondInfo" TEXT NOT NULL,
    "infthirdInfo" TEXT NOT NULL,
    "audioUrl" TEXT,

    CONSTRAINT "RestaurantTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantTranslation_restaurantId_language_key" ON "RestaurantTranslation"("restaurantId", "language");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantTranslation" ADD CONSTRAINT "RestaurantTranslation_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
