-- AuditLog table: records every report deletion for legal compliance
-- Run this in the Supabase SQL Editor before deploying the audit log feature

CREATE TABLE "AuditLog" (
    "id"          TEXT NOT NULL,
    "action"      TEXT NOT NULL,
    "entityType"  TEXT NOT NULL,
    "entityId"    TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "reason"      TEXT,
    "snapshot"    JSONB,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_entityId_idx"    ON "AuditLog"("entityId");
CREATE INDEX "AuditLog_performedBy_idx" ON "AuditLog"("performedBy");
CREATE INDEX "AuditLog_createdAt_idx"   ON "AuditLog"("createdAt");
