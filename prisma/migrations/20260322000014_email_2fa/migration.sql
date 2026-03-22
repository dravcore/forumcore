-- Email notification preferences and 2FA fields
ALTER TABLE "users" ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "digestFrequency"    TEXT NOT NULL DEFAULT 'daily';
ALTER TABLE "users" ADD COLUMN "twoFactorEnabled"   BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "twoFactorSecret"    TEXT;
