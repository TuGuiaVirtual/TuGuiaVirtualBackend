-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowLocation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoPlayAudio" BOOLEAN NOT NULL DEFAULT true;
