-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('NEWS', 'BONUS_PROMO', 'CASINO_REVIEW', 'ODDS_UPDATE', 'REGULATORY', 'RESPONSIBLE_GAMBLING');

-- CreateEnum
CREATE TYPE "ContentSource" AS ENUM ('MANUAL', 'FEED');

-- CreateEnum
CREATE TYPE "CasinoType" AS ENUM ('ONLINE', 'LAND_BASED', 'HYBRID');

-- CreateEnum
CREATE TYPE "DigestFrequency" AS ENUM ('DAILY', 'WEEKLY', 'INSTANT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "AccessTier" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "TopicKind" AS ENUM ('TOPIC', 'REGION', 'CASINO_TYPE');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ageVerifiedAt" TIMESTAMP(3),
    "jurisdiction" TEXT,
    "digestFrequency" "DigestFrequency" NOT NULL DEFAULT 'WEEKLY',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "tier" "AccessTier" NOT NULL DEFAULT 'FREE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreferenceTopic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "TopicKind" NOT NULL DEFAULT 'TOPIC',

    CONSTRAINT "PreferenceTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Casino" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "CasinoType" NOT NULL,
    "jurisdiction" TEXT,
    "website" TEXT,
    "ratingAvg" DOUBLE PRECISION,

    CONSTRAINT "Casino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bonus" (
    "id" TEXT NOT NULL,
    "casinoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "terms" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "source" "ContentSource" NOT NULL DEFAULT 'MANUAL',
    "sourceUrl" TEXT,
    "tier" "AccessTier" NOT NULL DEFAULT 'FREE',
    "casinoId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterIssue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "contentIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "casinoId" TEXT,
    "body" TEXT NOT NULL,
    "rating" INTEGER,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserPreferences" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserPreferences_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ContentTopics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContentTopics_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PreferenceTopic_slug_key" ON "PreferenceTopic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Casino_slug_key" ON "Casino"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ContentItem_slug_key" ON "ContentItem"("slug");

-- CreateIndex
CREATE INDEX "_UserPreferences_B_index" ON "_UserPreferences"("B");

-- CreateIndex
CREATE INDEX "_ContentTopics_B_index" ON "_ContentTopics"("B");

-- AddForeignKey
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterIssue" ADD CONSTRAINT "NewsletterIssue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPreferences" ADD CONSTRAINT "_UserPreferences_A_fkey" FOREIGN KEY ("A") REFERENCES "PreferenceTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPreferences" ADD CONSTRAINT "_UserPreferences_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentTopics" ADD CONSTRAINT "_ContentTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentTopics" ADD CONSTRAINT "_ContentTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "PreferenceTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
