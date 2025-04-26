/*
  Warnings:

  - You are about to drop the column `infthirdInfo` on the `RestaurantTranslation` table. All the data in the column will be lost.
  - Added the required column `thirdInfo` to the `RestaurantTranslation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RestaurantTranslation" DROP COLUMN "infthirdInfo",
ADD COLUMN     "thirdInfo" TEXT NOT NULL;
