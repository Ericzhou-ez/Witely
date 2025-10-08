DO $$ BEGIN
 CREATE TYPE "public"."user_type_enum" AS ENUM('plus', 'pro', 'ultra', 'dev', 'free');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "type" "user_type_enum" DEFAULT 'free' NOT NULL;