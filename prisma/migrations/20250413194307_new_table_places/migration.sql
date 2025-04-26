-- CreateTable
CREATE TABLE "Place" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "locationUrl" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceTranslation" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "vrUrl" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,

    CONSTRAINT "PlaceTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaceTranslation_placeId_language_key" ON "PlaceTranslation"("placeId", "language");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceTranslation" ADD CONSTRAINT "PlaceTranslation_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
