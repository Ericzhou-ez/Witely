CREATE TABLE IF NOT EXISTS "PersonalInformation" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "information" json,
    "bio" varchar(500)
);
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "PersonalInformation" ADD CONSTRAINT "PersonalInformation_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;