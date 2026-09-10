-- CreateEnum
CREATE TYPE "MediaProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "MediaAsset"
    ADD COLUMN "posterStorageKey" TEXT,
    ADD COLUMN "posterUrl" TEXT,
    ADD COLUMN "processingStatus" "MediaProcessingStatus",
    ADD COLUMN "processingError" TEXT;

-- Existing video records have no retained source or durable processing job, so
-- keep them private and show the owner why they must be uploaded again.
-- Existing image records are left untouched.
UPDATE "MediaAsset"
SET
    "status" = 'DRAFT',
    "processingStatus" = 'FAILED',
    "processingError" = 'This older video must be uploaded again before it can be processed.'
WHERE "kind" = 'VIDEO';

-- CreateTable
CREATE TABLE "MediaProcessingJob" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "status" "MediaProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "sourceKey" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaProcessingJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_posterStorageKey_key" ON "MediaAsset"("posterStorageKey");
CREATE UNIQUE INDEX "MediaProcessingJob_mediaId_key" ON "MediaProcessingJob"("mediaId");
CREATE UNIQUE INDEX "MediaProcessingJob_sourceKey_key" ON "MediaProcessingJob"("sourceKey");
CREATE INDEX "MediaProcessingJob_status_createdAt_idx" ON "MediaProcessingJob"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "MediaProcessingJob"
    ADD CONSTRAINT "MediaProcessingJob_mediaId_fkey"
    FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
