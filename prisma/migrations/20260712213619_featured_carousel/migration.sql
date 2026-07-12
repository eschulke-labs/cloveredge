-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredOrder" INTEGER;
