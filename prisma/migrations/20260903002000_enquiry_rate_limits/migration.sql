CREATE TABLE "EnquiryRateLimit" (
    "identifierHash" TEXT NOT NULL,
    "bucketStart" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnquiryRateLimit_pkey" PRIMARY KEY ("identifierHash", "bucketStart")
);

CREATE INDEX "EnquiryRateLimit_bucketStart_idx" ON "EnquiryRateLimit"("bucketStart");
