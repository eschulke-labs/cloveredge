-- CreateEnum
CREATE TYPE "Denomination" AS ENUM ('PENNY', 'LOW', 'MID', 'HIGH_LIMIT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "VideoReviewState" AS ENUM ('UNREVIEWED', 'VERIFIED', 'NEEDS_FIXING');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isContentReviewer" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VideoEmbed" ADD COLUMN     "confidenceScore" DOUBLE PRECISION,
ADD COLUMN     "denomination" "Denomination" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "denominationExact" DOUBLE PRECISION,
ADD COLUMN     "gameProviderId" TEXT,
ADD COLUMN     "reviewState" "VideoReviewState" NOT NULL DEFAULT 'UNREVIEWED',
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "slotGameId" TEXT,
ADD COLUMN     "staffNotes" TEXT;

-- CreateTable
CREATE TABLE "GameProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "GameProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotGame" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "providerId" TEXT,
    "rtp" DOUBLE PRECISION,
    "volatility" TEXT,

    CONSTRAINT "SlotGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLogEntry" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameProvider_name_key" ON "GameProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GameProvider_slug_key" ON "GameProvider"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SlotGame_slug_key" ON "SlotGame"("slug");

-- AddForeignKey
ALTER TABLE "SlotGame" ADD CONSTRAINT "SlotGame_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "GameProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogEntry" ADD CONSTRAINT "AuditLogEntry_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEmbed" ADD CONSTRAINT "VideoEmbed_slotGameId_fkey" FOREIGN KEY ("slotGameId") REFERENCES "SlotGame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEmbed" ADD CONSTRAINT "VideoEmbed_gameProviderId_fkey" FOREIGN KEY ("gameProviderId") REFERENCES "GameProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEmbed" ADD CONSTRAINT "VideoEmbed_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
