-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT 'ForumCore',
    "siteDescription" TEXT NOT NULL DEFAULT 'Self-hosted forum platformu',
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- Seed default settings
INSERT INTO "site_settings" ("id", "siteName", "siteDescription", "registrationOpen", "updatedAt")
VALUES ('default', 'ForumCore', 'Self-hosted forum platformu', true, NOW())
ON CONFLICT ("id") DO NOTHING;
