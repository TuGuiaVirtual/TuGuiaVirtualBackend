-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('FREE', 'SUBSCRIPTION', 'PAID');

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'FREE';
