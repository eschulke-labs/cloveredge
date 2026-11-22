-- Knowledge graph v1, part 1 of 2 ("expand"). Additive only, so the
-- previously deployed app keeps working while this is applied. The old
-- single-game columns on VideoEmbed (slotGameId, gameProviderId,
-- denomination, denominationExact) and the empty SlotGame table are removed
-- in part 2 ("contract") once code that no longer references them is live.
-- See DEVELOPMENT_PLAN.md "Knowledge graph v1".

-- CreateEnum
CREATE TYPE "FactSource" AS ENUM ('YOUTUBE_API', 'AI', 'HUMAN');

-- CreateEnum
CREATE TYPE "DatePrecision" AS ENUM ('DAY', 'MONTH', 'YEAR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "WinKind" AS ENUM ('BASE_GAME', 'BONUS', 'FREE_SPINS', 'HOLD_AND_SPIN', 'PROGRESSIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "WinSize" AS ENUM ('SMALL', 'NICE', 'BIG', 'HUGE', 'EPIC', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ExtractionInput" AS ENUM ('TEXT', 'THUMBNAILS', 'FRAMES');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "AliasEntity" AS ENUM ('GAME', 'PROVIDER', 'CREATOR', 'CASINO');

-- AlterTable
ALTER TABLE "Casino" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "VideoEmbed" ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "rawVenueName" TEXT,
ADD COLUMN     "recordedOn" TIMESTAMP(3),
ADD COLUMN     "recordedOnPrecision" "DatePrecision" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "recordedOnSource" "FactSource",
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "venueConfidence" DOUBLE PRECISION,
ADD COLUMN     "venueId" TEXT,
ADD COLUMN     "venueSource" "FactSource";

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "youtubeChannelId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "handle" TEXT,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "gameType" "VideoGameType" NOT NULL DEFAULT 'SLOTS',
    "providerId" TEXT,
    "rtp" DOUBLE PRECISION,
    "volatility" TEXT,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Play" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "gameId" TEXT,
    "providerId" TEXT,
    "rawGameName" TEXT,
    "startSec" INTEGER,
    "endSec" INTEGER,
    "betAmount" DECIMAL(12,2),
    "betCredits" INTEGER,
    "creditValue" DECIMAL(8,4),
    "denomination" "Denomination" NOT NULL DEFAULT 'UNKNOWN',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "source" "FactSource" NOT NULL DEFAULT 'AI',
    "confidence" DOUBLE PRECISION,
    "extractionRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Play_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Win" (
    "id" TEXT NOT NULL,
    "playId" TEXT NOT NULL,
    "atSec" INTEGER,
    "kind" "WinKind" NOT NULL DEFAULT 'OTHER',
    "isHandpay" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(14,2),
    "amountCredits" INTEGER,
    "betAtWin" DECIMAL(12,2),
    "multiplier" DOUBLE PRECISION,
    "size" "WinSize" NOT NULL DEFAULT 'UNKNOWN',
    "source" "FactSource" NOT NULL DEFAULT 'AI',
    "confidence" DOUBLE PRECISION,
    "extractionRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Win_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractionRun" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "inputs" "ExtractionInput"[],
    "output" JSONB,
    "status" "ExtractionStatus" NOT NULL DEFAULT 'SUCCEEDED',
    "error" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "costUsd" DECIMAL(10,4),
    "triggeredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtractionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alias" (
    "id" TEXT NOT NULL,
    "entityType" "AliasEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_youtubeChannelId_key" ON "Creator"("youtubeChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_slug_key" ON "Creator"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- CreateIndex
CREATE INDEX "Play_videoId_idx" ON "Play"("videoId");

-- CreateIndex
CREATE INDEX "Play_gameId_idx" ON "Play"("gameId");

-- CreateIndex
CREATE INDEX "Win_playId_idx" ON "Win"("playId");

-- CreateIndex
CREATE INDEX "Win_size_idx" ON "Win"("size");

-- CreateIndex
CREATE INDEX "ExtractionRun_videoId_idx" ON "ExtractionRun"("videoId");

-- CreateIndex
CREATE INDEX "Alias_entityType_entityId_idx" ON "Alias"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Alias_entityType_normalized_key" ON "Alias"("entityType", "normalized");

-- CreateIndex
CREATE INDEX "VideoEmbed_creatorId_idx" ON "VideoEmbed"("creatorId");

-- CreateIndex
CREATE INDEX "VideoEmbed_venueId_idx" ON "VideoEmbed"("venueId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "GameProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoEmbed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "GameProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_extractionRunId_fkey" FOREIGN KEY ("extractionRunId") REFERENCES "ExtractionRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Win" ADD CONSTRAINT "Win_playId_fkey" FOREIGN KEY ("playId") REFERENCES "Play"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Win" ADD CONSTRAINT "Win_extractionRunId_fkey" FOREIGN KEY ("extractionRunId") REFERENCES "ExtractionRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractionRun" ADD CONSTRAINT "ExtractionRun_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoEmbed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractionRun" ADD CONSTRAINT "ExtractionRun_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEmbed" ADD CONSTRAINT "VideoEmbed_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEmbed" ADD CONSTRAINT "VideoEmbed_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Casino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: one Creator per existing channel name, linked to its videos.
-- (The original seeded videos never stored a YouTube channel id, so
-- youtubeChannelId stays null for these until refreshed from the API.)
INSERT INTO "Creator" ("id", "name", "slug", "createdAt")
SELECT 'cr_' || substr(md5(t."channelTitle"), 1, 22),
       t."channelTitle",
       trim(both '-' from regexp_replace(lower(t."channelTitle"), '[^a-z0-9]+', '-', 'g')),
       CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "channelTitle" FROM "VideoEmbed") t
ON CONFLICT DO NOTHING;

UPDATE "VideoEmbed" v
SET "creatorId" = c."id"
FROM "Creator" c
WHERE c."name" = v."channelTitle" AND v."creatorId" IS NULL;
