-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('CITY', 'PLACE', 'BUNDLE', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('WEB', 'ANDROID', 'IOS');

-- AlterTable
ALTER TABLE "CityTranslation" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ExperienceTranslation" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PlaceTranslation" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "reading" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RestaurantTranslation" ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Purchase" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "PurchaseType" NOT NULL,
    "status" "PurchaseStatus" NOT NULL,
    "platform" "Platform" NOT NULL,
    "paymentMethod" TEXT,
    "externalId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "bundleName" TEXT,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseCity" (
    "id" SERIAL NOT NULL,
    "purchaseId" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,

    CONSTRAINT "PurchaseCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchasePlace" (
    "id" SERIAL NOT NULL,
    "purchaseId" INTEGER NOT NULL,
    "placeId" INTEGER NOT NULL,

    CONSTRAINT "PurchasePlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseCity_purchaseId_cityId_key" ON "PurchaseCity"("purchaseId", "cityId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchasePlace_purchaseId_placeId_key" ON "PurchasePlace"("purchaseId", "placeId");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCity" ADD CONSTRAINT "PurchaseCity_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCity" ADD CONSTRAINT "PurchaseCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasePlace" ADD CONSTRAINT "PurchasePlace_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasePlace" ADD CONSTRAINT "PurchasePlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
