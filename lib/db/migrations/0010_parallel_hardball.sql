-- Add updatedAt column, nullable first to allow updates
ALTER TABLE "Chat" ADD COLUMN "updatedAt" timestamp;

-- Set updatedAt to createdAt for all existing chats
UPDATE "Chat" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "Chat" ALTER COLUMN "updatedAt" SET NOT NULL;