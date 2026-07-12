-- CreateEnum
CREATE TYPE "VideoGameType" AS ENUM ('SLOTS', 'BLACKJACK', 'ROULETTE', 'POKER', 'SPORTS_BETTING', 'OTHER');

-- CreateEnum
CREATE TYPE "VenueType" AS ENUM ('ONLINE', 'LAND_BASED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "VideoSentiment" AS ENUM ('WIN', 'LOSS', 'MIXED', 'UNKNOWN');

-- AlterEnum
ALTER TYPE "ContentType" ADD VALUE 'GAMEPLAY_VIDEO';

-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "videoId" TEXT;

-- CreateTable
CREATE TABLE "VideoEmbed" (
    "id" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "gameType" "VideoGameType" NOT NULL,
    "venueType" "VenueType" NOT NULL DEFAULT 'UNKNOWN',
    "sentiment" "VideoSentiment" NOT NULL DEFAULT 'UNKNOWN',
    "viewCount" INTEGER,
    "youtubePublishedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoEmbed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoEmbed_youtubeVideoId_key" ON "VideoEmbed"("youtubeVideoId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentItem_videoId_key" ON "ContentItem"("videoId");

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoEmbed"("id") ON DELETE SET NULL ON UPDATE CASCADE;
