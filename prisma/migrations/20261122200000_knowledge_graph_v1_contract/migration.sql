-- DropForeignKey
ALTER TABLE "SlotGame" DROP CONSTRAINT "SlotGame_providerId_fkey";

-- DropForeignKey
ALTER TABLE "VideoEmbed" DROP CONSTRAINT "VideoEmbed_gameProviderId_fkey";

-- DropForeignKey
ALTER TABLE "VideoEmbed" DROP CONSTRAINT "VideoEmbed_slotGameId_fkey";

-- AlterTable
ALTER TABLE "VideoEmbed" DROP COLUMN "denomination",
DROP COLUMN "denominationExact",
DROP COLUMN "gameProviderId",
DROP COLUMN "slotGameId";

-- DropTable
DROP TABLE "SlotGame";

