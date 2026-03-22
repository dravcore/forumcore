-- AlterTable
ALTER TABLE "users" ADD COLUMN "bannedUntil" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('BAN_USER', 'UNBAN_USER', 'DELETE_POST', 'DELETE_THREAD', 'PIN_THREAD', 'UNPIN_THREAD', 'LOCK_THREAD', 'UNLOCK_THREAD', 'CHANGE_ROLE', 'RESOLVE_REPORT', 'DELETE_TAG', 'MERGE_TAG');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
