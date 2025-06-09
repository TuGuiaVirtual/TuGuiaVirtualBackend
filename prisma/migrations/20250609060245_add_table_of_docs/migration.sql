-- CreateTable
CREATE TABLE "StaticDocument" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaticDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaticDocument_key_language_key" ON "StaticDocument"("key", "language");
