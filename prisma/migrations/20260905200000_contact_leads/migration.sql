CREATE TABLE "ContactLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'SITE_POPUP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactLead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactLeadRateLimit" (
    "identifierHash" TEXT NOT NULL,
    "bucketStart" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactLeadRateLimit_pkey" PRIMARY KEY ("identifierHash", "bucketStart")
);

CREATE UNIQUE INDEX "ContactLead_email_key" ON "ContactLead"("email");
CREATE INDEX "ContactLead_consentedAt_idx" ON "ContactLead"("consentedAt");
CREATE INDEX "ContactLeadRateLimit_bucketStart_idx" ON "ContactLeadRateLimit"("bucketStart");
