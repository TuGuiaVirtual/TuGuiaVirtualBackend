/*
  Warnings:

  - You are about to drop the column `schedule` on the `RestaurantTranslation` table. All the data in the column will be lost.
  - Added the required column `info` to the `RestaurantTranslation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RestaurantTranslation" DROP COLUMN "schedule",
ADD COLUMN     "info" TEXT NOT NULL;
