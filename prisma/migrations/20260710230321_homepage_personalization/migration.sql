-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('HERO', 'RAIL', 'TRENDING');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "HomepageModule" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ModuleType" NOT NULL DEFAULT 'RAIL',
    "topicSlug" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HomepageModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestSignal" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomepageModule_key_key" ON "HomepageModule"("key");

-- CreateIndex
CREATE UNIQUE INDEX "GuestSignal_guestId_topicSlug_key" ON "GuestSignal"("guestId", "topicSlug");
