-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('OWNER_BOOTSTRAPPED', 'LOGIN_SUCCEEDED', 'LOGIN_FAILED', 'TWO_FACTOR_ENABLED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'SESSION_REVOKED');

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "type" "SecurityEventType" NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerSecurityPolicy" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "requiresTwoFactorSetup" BOOLEAN NOT NULL DEFAULT true,
    "lastSessionSweepAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerSecurityPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_userId_createdAt_idx" ON "SecurityEvent"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetChallenge_tokenHash_key" ON "PasswordResetChallenge"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetChallenge_userId_expiresAt_idx" ON "PasswordResetChallenge"("userId", "expiresAt");
