-- CreateTable
CREATE TABLE "Experience" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "audioUrl" TEXT,
    "link" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "googleMapsUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceTranslation" (
    "id" SERIAL NOT NULL,
    "experienceId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "adapted" TEXT NOT NULL,
    "info" TEXT,

    CONSTRAINT "ExperienceTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExperienceTranslation_experienceId_language_key" ON "ExperienceTranslation"("experienceId", "language");

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceTranslation" ADD CONSTRAINT "ExperienceTranslation_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
